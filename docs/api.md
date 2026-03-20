# REST API

- **Base URL (local):** `http://localhost:3000`
- **Base URL (production):** `https://yourdomain.com`

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/items/analyze` | API Key | Send a photo → LLM generates item fields (draft) |
| `POST` | `/api/items/confirm` | API Key | Confirm (or edit) the draft → item saved to DB |
| `POST` | `/api/items` | API Key | Create an item directly from JSON |
| `POST` | `/api/items/:id/images` | API Key | Upload images to an existing item |

---

## AI-assisted flow (analyze → confirm)

The recommended flow for a mobile app:

```
Mobile app
   │
   │  POST /api/items/analyze  (image, multipart)
   ▼
API uploads image to Storage → sends to Claude → returns suggested fields
   │
   │  ← { draft_id, image_url, suggestion: { title, price, … } }
   │
User reviews / edits fields in the app
   │
   │  POST /api/items/confirm  (draft_id + edited fields)
   ▼
API creates item in DB, links image → returns published item
```

---

## Manual flow (direct JSON)

For bulk import or scripting without a photo:

- **Base URL (local):** `http://localhost:3000`
- **Base URL (production):** `https://yourdomain.com`

---

## Authentication

All endpoints require an `Authorization` header with a Bearer token.

```
Authorization: Bearer <API_SECRET_KEY>
```

Generate a key (min 32 characters) and add it to your environment:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# .env.local
API_SECRET_KEY=your-generated-key-here
```

If `API_SECRET_KEY` is not set on the server, all requests return `503 Service Unavailable`.

---

## Rate Limiting

Both endpoints share a limit of **20 requests / 60 seconds per IP address**.

Every response includes these headers:

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Max requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `Retry-After` | Seconds to wait (only present on `429` responses) |

When the limit is exceeded the server returns `429 Too Many Requests`.

> **Note:** The rate limiter is in-memory and per serverless instance. For high-traffic production deployments, replace `src/lib/api-rate-limit.ts` with [Upstash Redis + @upstash/ratelimit](https://github.com/upstash/ratelimit-js).

---

## Error format

All error responses share the same shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description.",
    "fields": { "fieldName": ["error detail"] }
  }
}
```

`fields` is only present on `422 Validation Error` responses.

### Error codes

| HTTP | Code | Meaning |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 404 | `NOT_FOUND` | Item ID does not exist |
| 400 | `BAD_REQUEST` | Malformed JSON or missing form fields |
| 413 | `PAYLOAD_TOO_LARGE` | File exceeds 10 MB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | File type is not jpeg, png, or webp |
| 422 | `VALIDATION_ERROR` | Schema validation failed |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Database or storage failure |
| 503 | `SERVICE_UNAVAILABLE` | `API_SECRET_KEY` not configured |

---

## POST /api/items

Creates a new item with status `available`.

### Request

```
POST /api/items
Authorization: Bearer <key>
Content-Type: application/json
```

#### Body

```json
{
  "title": "IKEA KALLAX shelf unit",
  "description": "White, 4x4 cubes. Minor scuffs on the side.",
  "price": 45,
  "category": "furniture",
  "condition": "good",
  "pickup_area": "Downtown"
}
```

#### Fields

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | Yes | Non-empty |
| `price` | number | Yes | `>= 0`. Use `0` for free items |
| `category` | string | Yes | See valid values below |
| `condition` | string | Yes | See valid values below |
| `pickup_area` | string | Yes | Non-empty |
| `description` | string | No | Optional, up to ~2000 chars |

**Valid `category` values:**
`furniture` · `kitchen` · `living_room` · `bedroom` · `books` · `electronics` · `clothing` · `outdoor` · `tools` · `decor` · `other`

**Valid `condition` values:**
`new` · `like_new` · `good` · `fair` · `parts`

### Response `201 Created`

```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "title": "IKEA KALLAX shelf unit",
    "description": "White, 4x4 cubes. Minor scuffs on the side.",
    "price": 45,
    "category": "furniture",
    "condition": "good",
    "pickup_area": "Downtown",
    "status": "available",
    "created_at": "2026-03-15T12:00:00.000Z"
  }
}
```

### Response `422 Validation Error`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "fields": {
      "category": ["category must be one of: furniture, kitchen, ..."],
      "price": ["price must be a number"]
    }
  }
}
```

### curl example

```bash
curl -X POST https://yourdomain.com/api/items \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Standing desk lamp",
    "price": 15,
    "category": "decor",
    "condition": "like_new",
    "pickup_area": "North Side"
  }'
```

---

## POST /api/items/:id/images

Uploads one or more images to an existing item. Images are added after any existing ones, in the order they are sent.

### Request

```
POST /api/items/:id/images
Authorization: Bearer <key>
Content-Type: multipart/form-data
```

| Constraint | Value |
|---|---|
| Field name | `images` (repeat for multiple files) |
| Max files per request | 10 |
| Max file size | 10 MB each |
| Allowed types | `image/jpeg`, `image/png`, `image/webp` |

### Response `201 Created` (all files uploaded)

```json
{
  "data": [
    { "id": "uuid-1", "image_url": "https://<project>.supabase.co/storage/v1/object/public/item-images/items/<itemId>/...", "sort_order": 1 },
    { "id": "uuid-2", "image_url": "https://...", "sort_order": 2 }
  ],
  "meta": { "total": 2, "uploaded": 2, "failed": 0 }
}
```

### Response `207 Multi-Status` (partial success)

Returned when some files uploaded but others failed (e.g. storage error mid-batch).

```json
{
  "data": [
    { "id": "uuid-1", "image_url": "https://...", "sort_order": 1 }
  ],
  "meta": { "total": 2, "uploaded": 1, "failed": 1 },
  "errors": [
    { "file": "photo2.jpg", "success": false, "error": "Storage upload failed." }
  ]
}
```

### curl example — single file

```bash
curl -X POST https://yourdomain.com/api/items/a1b2c3d4-.../images \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -F "images=@/path/to/photo.jpg"
```

### curl example — multiple files

```bash
curl -X POST https://yourdomain.com/api/items/a1b2c3d4-.../images \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.png" \
  -F "images=@photo3.webp"
```

---

## POST /api/items/analyze

Uploads a photo, sends it to the configured LLM, and returns structured item fields as a draft for the user to review before saving.

### LLM provider configuration

Select the provider with `LLM_PROVIDER` (default: `gemini`), then set the matching key:

| `LLM_PROVIDER` | Key required | Free tier | Model used |
|---|---|---|---|
| `gemini` _(default)_ | `GEMINI_API_KEY` | Yes — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `gemini-2.0-flash` |
| `anthropic` | `ANTHROPIC_API_KEY` | No | `claude-haiku-4-5` |

```bash
# Gemini (free tier, default)
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIza...

# Anthropic
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

> To add a new provider, implement the `LLMProvider` interface in `src/lib/llm.ts` and register it in the `PROVIDERS` map.

If the active provider key is not set, the endpoint returns `503 Service Unavailable`.

### Rate limit

**10 requests / 60 seconds per IP** (stricter than other endpoints — each call invokes the LLM).

### Request

```
POST /api/items/analyze
Authorization: Bearer <key>
Content-Type: multipart/form-data
```

| Constraint | Value |
|---|---|
| Field name | `image` (single file) |
| Max file size | **100 KB** |
| Allowed types | `image/jpeg`, `image/png`, `image/webp` |

### Response `200 OK`

```json
{
  "draft_id": "550e8400-e29b-41d4-a716-446655440000",
  "image_url": "https://<project>.supabase.co/storage/v1/object/public/item-images/items/drafts/<draft_id>/original.jpg",
  "suggestion": {
    "title": "Lodge cast iron skillet 12\"",
    "description": "Black cast iron skillet, 12 inch. Well seasoned with no rust or cracks. Handle shows normal wear.",
    "price": 20,
    "category": "kitchen",
    "condition": "good",
    "pickup_area": ""
  }
}
```

> `pickup_area` is always returned empty — the LLM cannot determine it from a photo. The user must fill it in before confirming.

### curl example

```bash
curl -X POST https://yourdomain.com/api/items/analyze \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -F "image=@skillet.jpg"
```

---

## POST /api/items/confirm

Saves an analyzed draft to the database. Pass the `draft_id` and `image_url` from `/analyze`, with any user edits applied to the suggestion fields.

### Request

```
POST /api/items/confirm
Authorization: Bearer <key>
Content-Type: application/json
```

#### Body

```json
{
  "draft_id": "550e8400-e29b-41d4-a716-446655440000",
  "image_url": "https://.../items/drafts/550e8400-.../original.jpg",
  "title": "Lodge cast iron skillet 12\"",
  "description": "Black cast iron skillet, 12 inch. Well seasoned.",
  "price": 20,
  "category": "kitchen",
  "condition": "good",
  "pickup_area": "Downtown"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `draft_id` | string (UUID) | Yes | From `/analyze` response |
| `image_url` | string (URL) | Yes | From `/analyze` response |
| `title` | string | Yes | User can edit the LLM suggestion |
| `price` | number | Yes | `>= 0` |
| `category` | string | Yes | Valid category value |
| `condition` | string | Yes | Valid condition value |
| `pickup_area` | string | Yes | Must be filled by user |
| `description` | string | No | Optional |

### Response `201 Created`

```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "title": "Lodge cast iron skillet 12\"",
    "description": "Black cast iron skillet, 12 inch. Well seasoned.",
    "price": 20,
    "category": "kitchen",
    "condition": "good",
    "pickup_area": "Downtown",
    "status": "available",
    "created_at": "2026-03-15T12:00:00.000Z",
    "images": [
      { "id": "uuid", "image_url": "https://...", "sort_order": 1 }
    ]
  }
}
```

### curl example

```bash
curl -X POST https://yourdomain.com/api/items/confirm \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_id": "550e8400-e29b-41d4-a716-446655440000",
    "image_url": "https://.../items/drafts/550e8400-.../original.jpg",
    "title": "Lodge cast iron skillet 12\"",
    "price": 20,
    "category": "kitchen",
    "condition": "good",
    "pickup_area": "Downtown"
  }'
```

---

## Full workflow — AI-assisted (mobile app)

```bash
# 1. Analyze photo → get draft + LLM suggestion
ANALYZE=$(curl -s -X POST https://yourdomain.com/api/items/analyze \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -F "image=@skillet.jpg")

DRAFT_ID=$(echo $ANALYZE | jq -r '.draft_id')
IMAGE_URL=$(echo $ANALYZE | jq -r '.image_url')

# 2. (User reviews / edits fields in the app)

# 3. Confirm → item published
curl -X POST https://yourdomain.com/api/items/confirm \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"draft_id\": \"$DRAFT_ID\",
    \"image_url\": \"$IMAGE_URL\",
    \"title\": \"Cast iron skillet\",
    \"price\": 20,
    \"category\": \"kitchen\",
    \"condition\": \"good\",
    \"pickup_area\": \"Downtown\"
  }"
```

---

## Full workflow — manual (JSON only)

```bash
# 1. Create the item
ITEM=$(curl -s -X POST https://yourdomain.com/api/items \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Cast iron skillet","price":20,"category":"kitchen","condition":"good","pickup_area":"Downtown"}')

ITEM_ID=$(echo $ITEM | jq -r '.data.id')

# 2. Upload images
curl -X POST "https://yourdomain.com/api/items/$ITEM_ID/images" \
  -H "Authorization: Bearer $API_SECRET_KEY" \
  -F "images=@skillet-front.jpg" \
  -F "images=@skillet-side.jpg"
```

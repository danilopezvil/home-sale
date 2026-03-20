/**
 * LLM provider abstraction for image analysis.
 *
 * To add a new provider:
 *   1. Implement the `LLMProvider` interface below.
 *   2. Register it in `getProvider()`.
 *   3. Add its API key to env.ts and .env.local.example.
 *
 * Active provider is selected via LLM_PROVIDER env var (default: "gemini").
 */

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "@/lib/env";
import { categoryValues } from "@/lib/category-meta";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemSuggestion = {
  title: string;
  description: string;
  price: number;
  category: (typeof categoryValues)[number];
  condition: "new" | "like_new" | "good" | "fair" | "parts";
  pickup_area: "Casa o domicilio";
};

type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";

// ─── Provider interface ───────────────────────────────────────────────────────

interface LLMProvider {
  /** Human-readable name used in error messages and logs. */
  readonly name: string;
  /** Returns true if the required API key is present in env. */
  isConfigured(): boolean;
  /** Analyse a base64-encoded image and return structured item fields. */
  analyzeImage(base64: string, mediaType: ImageMediaType): Promise<ItemSuggestion>;
}

// ─── Shared prompt & sanitiser ────────────────────────────────────────────────

// const SYSTEM_PROMPT = `You are an assistant that analyzes product photos for a home sale listing app.

// Given an image, return ONLY a valid JSON object — no markdown, no explanation, no code fences.

// Required fields:
// - title: string — concise product name, max 80 characters. Text should be in Spanish.
// - description: string — visible details (color, material, dimensions if estimable, any defects), max 500 characters. If the item is a book, include year and author adn sinapsis no phisical description. Text should be in Spanish.
// - price: number — estimated USD resale value in Ecuadorian currency; use 0 if you cannot determine it
// - category: one of exactly: ${categoryValues.join(", ")}
// - condition: one of exactly: new, like_new, good, fair, parts



// Example output:
// {"title":"Lodge cast iron skillet 12\\"","description":"Black cast iron skillet, 12 inch, well seasoned with no rust or cracks. Handle shows normal wear.","price":20,"category":"kitchen","condition":"good"}`;

const SYSTEM_PROMPT = `You analyze product photos for a home sale app.

Return ONLY valid JSON. No text, no markdown.

Required fields (all mandatory):

title: string (≤80 chars, Spanish)

description: string (≤500 chars, Spanish; if book: author + year if possible + short synopsis)

price: number (USD, second-hand in Ecuador; books ≈3–8; use 0 if unknown)

category: one of [furniture,kitchen,living_room,bedroom,books,electronics,clothing,outdoor,tools,decor,other]

condition: one of [new,like_new,good,fair,parts]

pickup_area: "Casa o domicilio"

Rules:

No missing fields

Exact enum values

price numeric only

JSON must be valid

Example:
{"title":"Libro Rayuela de Julio Cortázar","description":"Novela de Julio Cortázar (1963) de estructura no lineal sobre amor y búsqueda existencial.","price":6,"category":"books","condition":"good","pickup_area":"Casa o domicilio"}`;

const USER_PROMPT = "Analyze this item and return the JSON.";



function sanitise(parsed: Record<string, unknown>): ItemSuggestion {
  const validCategories = new Set<string>(categoryValues);
  const validConditions = new Set(["new", "like_new", "good", "fair", "parts"]);

  return {
    title:
      typeof parsed.title === "string" ? parsed.title.trim().slice(0, 80) : "Untitled item",
    description:
      typeof parsed.description === "string" ? parsed.description.trim().slice(0, 500) : "",
    price:
      typeof parsed.price === "number" && isFinite(parsed.price) && parsed.price >= 0
        ? Math.round(parsed.price * 100) / 100
        : 0,
    category: validCategories.has(String(parsed.category))
      ? (parsed.category as ItemSuggestion["category"])
      : "other",
    condition: validConditions.has(String(parsed.condition))
      ? (parsed.condition as ItemSuggestion["condition"])
      : "good",
    pickup_area: "Casa o domicilio",
  };
}

function parseJson(raw: string): Record<string, unknown> {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM returned non-JSON response: ${raw.slice(0, 200)}`);
  }
}

// ─── Gemini provider ──────────────────────────────────────────────────────────

class GeminiProvider implements LLMProvider {
  readonly name = "Gemini";

  isConfigured() {
    return Boolean(env.GEMINI_API_KEY);
  }

  async analyzeImage(base64: string, mediaType: ImageMediaType): Promise<ItemSuggestion> {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");

    const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      USER_PROMPT,
      { inlineData: { mimeType: mediaType, data: base64 } },
    ]);

    const raw = result.response.text();
    return sanitise(parseJson(raw));
  }
}

// ─── Anthropic provider ───────────────────────────────────────────────────────

class AnthropicProvider implements LLMProvider {
  readonly name = "Anthropic";

  isConfigured() {
    return Boolean(env.ANTHROPIC_API_KEY);
  }

  async analyzeImage(base64: string, mediaType: ImageMediaType): Promise<ItemSuggestion> {
    if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured.");

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    return sanitise(parseJson(raw));
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

const PROVIDERS: Record<string, LLMProvider> = {
  gemini: new GeminiProvider(),
  anthropic: new AnthropicProvider(),
};

function getProvider(): LLMProvider {
  const key = env.LLM_PROVIDER ?? "gemini";
  const provider = PROVIDERS[key];
  if (!provider) throw new Error(`Unknown LLM_PROVIDER: "${key}"`);
  return provider;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** True if the configured provider has its API key set. */
export function isLLMConfigured(): boolean {
  return getProvider().isConfigured();
}

/** Returns the name of the active provider (for logs / error messages). */
export function getLLMProviderName(): string {
  return getProvider().name;
}

/**
 * Analyse a base64-encoded image and return structured item fields.
 * Provider is selected by the LLM_PROVIDER env var (default: "gemini").
 */
export async function analyzeImage(
  base64: string,
  mediaType: ImageMediaType,
): Promise<ItemSuggestion> {
  return getProvider().analyzeImage(base64, mediaType);
}

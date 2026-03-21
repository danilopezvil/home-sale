const en = {
  nav: {
    home: "Home Sale",
    items: "Items",
    admin: "Admin",
  },
  meta: {
    title: "Home Sale 🏠",
    description: "Furniture, books, gadgets & more — all must go!",
  },
  footer: "Moving sale inventory, updated as items leave. 📦",
  home: {
    kicker: "Pickup-ready inventory",
    heading: "We're moving and selling the house.",
    subtitle:
      "Browse the actual inventory, compare condition and reserve quickly before pickup slots fill up. This is a real moving sale, not a showroom catalogue.",
    primaryAction: "Reserve an item",
    secondaryAction: "See latest additions",
    inventoryLabel: "items available",
    categoriesLabel: "Browse by category",
    viewAllCategories: "View all",
    recentHeading: "Recent arrivals",
    recentSubtitle: "Newest listings published to the sale.",
    viewLatest: "Newest",
    inventorySectionTitle: "Available now",
    inventorySectionSubtitle: "A compact first pass through what is still available so buyers can scan fast and act quickly.",
    rowAction: "Open details",
    categories: [
      { emoji: "🛋️", label: "Furniture", key: "furniture" },
      { emoji: "📚", label: "Books", key: "books" },
      { emoji: "💻", label: "Electronics", key: "electronics" },
      { emoji: "🍳", label: "Kitchenware", key: "kitchen" },
      { emoji: "✨", label: "Decor", key: "decor" },
      { emoji: "📦", label: "Everything else", key: "" },
    ],
  },
  items: {
    pageTitle: "Available items",
    empty: {
      heading: "Nothing here yet",
      subtitle: "There are no published items yet. Check again once more inventory is added.",
    },
    error: {
      heading: "Something went wrong",
      subtitle: "The inventory could not be loaded right now. Please try again in a moment.",
    },
    condition: {
      new: "New",
      like_new: "Like New",
      good: "Good",
      fair: "Fair",
      parts: "For Parts",
    },
    free: "Free!",
    filterAll: "All",
    newBadge: "New",
    sort: {
      newest: "Newest",
      priceAsc: "Price ↑",
      priceDesc: "Price ↓",
    },
    sortLabel: "Sort",
    searchPlaceholder: "Search by title or category",
    activeFilters: "Active filters:",
    clearFilters: "Clear filters",
    filtersLabel: "Filters",
    gridLabel: "Grid",
    listLabel: "List",
    emptyFiltered: {
      heading: "No results for current filters",
      subtitle: "Try removing or adjusting your search and filters.",
    },
  },
  itemDetail: {
    back: "Back to items",
    status: {
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
    },
    noPhotos: "No photos yet",
    free: "Free! 🎉",
    reservedMessage:
      "This item is currently on hold for another buyer. Check back later in case the pickup is cancelled.",
    soldMessage: "This item has already left the sale. Browse the remaining available inventory.",
    error: {
      load: "Couldn't load this item",
      general: "Something went wrong",
    },
    reserveHeading: "Reserve this item",
    reservationHeading: "Reservation",
  },
  reserveForm: {
    name: {
      label: "Name",
      placeholder: "Your full name",
    },
    email: {
      label: "Email",
      placeholder: "you@example.com",
      hint: "Used only to confirm the reservation and coordinate pickup.",
    },
    phone: {
      label: "Phone",
      placeholder: "+1 555 000 0000",
    },
    pickup: {
      label: "Preferred pickup",
      hint: "Optional, but helpful for scheduling handoff quickly.",
    },
    message: {
      label: "Message",
      placeholder: "Use this for timing, building access, or any question that affects pickup.",
      hint: "Up to 1,000 characters.",
    },
    optional: "(optional)",
    required: "Fields marked * are required.",
    submit: "Request reservation",
    submitting: "Submitting\u2026",
    success: {
      heading: "You're on the list!",
    },
  },
  admin: {
    heading: "Admin \u2699\ufe0f",
    subtitle: "Run the moving sale: publish inventory, manage reservations and keep statuses accurate.",
    signIn: {
      heading: "Sign in to continue",
      subtitle: "Use the admin email to receive a sign-in link for the operations panel.",
    },
    notAdmin: "— but this email isn't in ADMIN_EMAILS.",
    signedInAs: "Signed in as",
    menu: {
      items: {
        label: "Items",
        subtitle: "Create, edit & manage listings",
      },
      reservations: {
        label: "Reservations",
        subtitle: "Confirm, cancel & mark sold",
      },
    },
    signOut: "Sign out",
    errors: {
      notSignedIn: "Sign in first to access",
      notAllowed: "is not listed in ADMIN_EMAILS.",
      notAllowedGeneral: "Your account is not listed in ADMIN_EMAILS.",
    },
  },
  loginForm: {
    label: "Admin email",
    placeholder: "admin@example.com",
    submit: "Send magic link",
    submitting: "Sending\u2026",
    help: "If the address is allowed, a sign-in link will arrive in the inbox for this admin account.",
    success: {
      heading: "Check your inbox!",
    },
  },
  adminItems: {
    heading: "Items",
    subtitle: "Create listings, update item details and keep visible stock accurate.",
    importJson: "Import JSON",
    filter: {
      status: "Status",
      search: "Search by title, notes or category\u2026",
      apply: "Apply",
    },
    table: {
      item: "Item",
      price: "Price",
      category: "Category",
      condition: "Condition",
      pickupArea: "Pickup Area",
      status: "Status",
      actions: "Actions",
    },
    actions: {
      edit: "Edit",
      markSold: "Mark Sold",
      makeAvailable: "\u21a9 Available",
      doneEditing: "\u2713 Done editing",
      deleteSelected: "Delete selected",
    },
    imageOrder: "Image Order",
    noImages: "No images uploaded for this item yet.",
    empty: "No items found for this filter.",
    status: {
      all: "All",
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
    },
  },
  itemForm: {
    new: "New Item",
    edit: "Edit Item",
    required: "Required",
    fields: {
      title: {
        label: "Title",
        placeholder: "e.g., IKEA KALLAX shelf unit",
      },
      price: {
        label: "Price",
        placeholder: "0.00",
        hint: "Amount in USD. Use 0 for free items.",
      },
      category: {
        label: "Category",
        placeholder: "Select a category",
      },
      condition: {
        label: "Condition",
      },
      pickupArea: {
        label: "Pickup Area",
        placeholder: "e.g., Downtown, North Side, ZIP 90210",
        hint: "Where buyers can pick this item up.",
      },
      description: {
        label: "Description",
        placeholder: "Dimensions, colour, any defects, reason for selling\u2026",
        hint: "Up to 2,000 characters.",
      },
    },
    conditions: {
      new: "\u2728 New",
      like_new: "\u2b50 Like New",
      good: "\ud83d\udc4d Good",
      fair: "\ud83d\udfe1 Fair",
      parts: "\ud83d\udd27 For Parts",
    },
    submit: {
      create: "Create Item",
      save: "Save Changes",
      saving: "Saving\u2026",
    },
    messages: {
      fixFields: "Please fix the highlighted fields.",
    },
  },
  uploadForm: {
    heading: "Upload Images",
    label: "Images",
    help: "JPG, PNG, WebP \u2014 max 10\u00a0MB each. Select multiple at once.",
    submit: "Upload Images",
    uploading: "Uploading\u2026",
  },
  adminReservations: {
    heading: "Reservations",
    subtitle: "Review incoming requests, confirm pickups and close out sold items.",
    filter: {
      label: "Filter",
      apply: "Apply",
    },
    status: {
      all: "All statuses",
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
    },
    actions: {
      confirm: "Confirm",
      cancel: "Cancel",
      markSold: "Mark sold",
    },
    labels: {
      submitted: "Submitted",
      pickup: "Pickup",
      deletedItem: "Deleted item",
    },
    empty: "No reservations found.",
    error: "Failed to load reservations:",
  },
  importItems: {
    heading: "Import Items via JSON",
    subtitle: "Paste one item or a batch of items to publish inventory faster.",
    jsonLabel: "JSON",
    jsonPlaceholder:
      '{ "title": "...", "price": 0, "category": "furniture", "condition": "good", "pickup_area": "..." }',
    submit: "Import",
    importing: "Importing\u2026",
    results: {
      title: "Results",
      success: "\u2713",
      error: "\u2717",
    },
    errors: {
      invalidJson: "Invalid JSON \u2014 please check your input.",
      noItems: "No items were imported.",
    },
    back: "\u2190 Back to Items",
  },
  magic: {
    signingIn: "Signing in\u2026",
  },
  categories: {
    furniture: "Furniture",
    kitchen: "Kitchen",
    living_room: "Living Room",
    bedroom: "Bedroom",
    books: "Books",
    electronics: "Electronics",
    clothing: "Clothing",
    outdoor: "Outdoor",
    tools: "Tools",
    decor: "Decor",
    other: "Other",
  },
};

export default en;
export type Dictionary = typeof en;

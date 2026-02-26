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
  footer: "Everything must go. 📦",
  home: {
    heading: "Big move. Must sell!",
    subtitle:
      "Furniture, books, kitchen stuff, gadgets and more — all priced to go fast. Come grab a deal before it's gone.",
    browse: "Browse items",
    whatsNew: "What's new",
    categories: [
      { emoji: "🛋️", label: "Furniture" },
      { emoji: "📚", label: "Books" },
      { emoji: "💻", label: "Electronics" },
      { emoji: "🍳", label: "Kitchen" },
      { emoji: "✨", label: "Decor" },
      { emoji: "📦", label: "And more" },
    ],
  },
  items: {
    pageTitle: "Available items",
    empty: {
      heading: "Nothing here yet",
      subtitle: "Check back soon — more items are on the way!",
    },
    error: {
      heading: "Something went wrong",
      subtitle: "Couldn't load items right now. Please try again later.",
    },
    condition: {
      new: "New",
      like_new: "Like New",
      good: "Good",
      fair: "Fair",
      parts: "For Parts",
    },
    free: "Free!",
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
      "This item has already been reserved. Check back in case the reservation falls through!",
    soldMessage: "This item has been sold. Browse other available items!",
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
      hint: "We'll use this to confirm your reservation.",
    },
    phone: {
      label: "Phone",
      placeholder: "+1 555 000 0000",
    },
    pickup: {
      label: "Preferred pickup",
      hint: "Let us know when works best.",
    },
    message: {
      label: "Message",
      placeholder: "Any questions, special requests, or details about your pickup\u2026",
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
    subtitle: "Manage your sale from here.",
    signIn: {
      heading: "Sign in to continue",
      subtitle: "Enter your admin email to receive a magic link.",
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
    help: "If your email is registered, a sign-in link will arrive in your inbox.",
    success: {
      heading: "Check your inbox!",
    },
  },
  adminItems: {
    heading: "Items",
    subtitle: "Create, edit, and manage listings.",
    importJson: "Import JSON",
    filter: {
      status: "Status",
      search: "Search title, description, category\u2026",
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
    subtitle: "Confirm, cancel, or mark items sold.",
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
    subtitle: "Paste a single item object or an array of items.",
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

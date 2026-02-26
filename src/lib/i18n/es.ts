import type { Dictionary } from "./en";

const es = {
  nav: {
    home: "Venta de Casa",
    items: "Art\u00edculos",
    admin: "Admin",
  },
  meta: {
    title: "Venta de Casa \ud83c\udfe0",
    description: "Muebles, libros, gadgets y m\u00e1s \u2014 \u00a1todo debe irse!",
  },
  footer: "Todo debe irse. \ud83d\udce6",
  home: {
    heading: "\u00a1Gran mudanza. \u00a1Hay que vender!",
    subtitle:
      "Muebles, libros, cosas de cocina, gadgets y m\u00e1s \u2014 todo a precios de oferta. \u00a1Ven a encontrar tu ganga!",
    browse: "Ver art\u00edculos",
    whatsNew: "Novedades",
    categories: [
      { emoji: "\ud83d\udecf\ufe0f", label: "Muebles" },
      { emoji: "\ud83d\udcda", label: "Libros" },
      { emoji: "\ud83d\udcbb", label: "Electr\u00f3nica" },
      { emoji: "\ud83c\udf73", label: "Cocina" },
      { emoji: "\u2728", label: "Decoraci\u00f3n" },
      { emoji: "\ud83d\udce6", label: "Y m\u00e1s" },
    ],
  },
  items: {
    pageTitle: "Art\u00edculos disponibles",
    empty: {
      heading: "Nada aqu\u00ed todav\u00eda",
      subtitle: "\u00a1Vuelve pronto \u2014 m\u00e1s art\u00edculos en camino!",
    },
    error: {
      heading: "Algo sali\u00f3 mal",
      subtitle:
        "No se pudieron cargar los art\u00edculos. Por favor, int\u00e9ntalo de nuevo.",
    },
    condition: {
      new: "Nuevo",
      like_new: "Como nuevo",
      good: "Bueno",
      fair: "Regular",
      parts: "Para piezas",
    },
    free: "\u00a1Gratis!",
  },
  itemDetail: {
    back: "Volver a art\u00edculos",
    status: {
      available: "Disponible",
      reserved: "Reservado",
      sold: "Vendido",
    },
    noPhotos: "Sin fotos a\u00fan",
    free: "\u00a1Gratis! \ud83c\udf89",
    reservedMessage:
      "Este art\u00edculo ya fue reservado. \u00a1Vuelve a revisar por si la reserva se cancela!",
    soldMessage:
      "Este art\u00edculo fue vendido. \u00a1Explora otros art\u00edculos disponibles!",
    error: {
      load: "No se pudo cargar este art\u00edculo",
      general: "Algo sali\u00f3 mal",
    },
    reserveHeading: "Reservar este art\u00edculo",
    reservationHeading: "Reserva",
  },
  reserveForm: {
    name: {
      label: "Nombre",
      placeholder: "Tu nombre completo",
    },
    email: {
      label: "Correo electr\u00f3nico",
      placeholder: "tu@ejemplo.com",
      hint: "Lo usaremos para confirmar tu reserva.",
    },
    phone: {
      label: "Tel\u00e9fono",
      placeholder: "+1 555 000 0000",
    },
    pickup: {
      label: "Recogida preferida",
      hint: "D\u00ednos cu\u00e1ndo te viene mejor.",
    },
    message: {
      label: "Mensaje",
      placeholder:
        "Preguntas, solicitudes especiales o detalles sobre la recogida\u2026",
      hint: "Hasta 1.000 caracteres.",
    },
    optional: "(opcional)",
    required: "Los campos marcados con * son obligatorios.",
    submit: "Solicitar reserva",
    submitting: "Enviando\u2026",
    success: {
      heading: "\u00a1Est\u00e1s en la lista!",
    },
  },
  admin: {
    heading: "Admin \u2699\ufe0f",
    subtitle: "Administra tu venta desde aqu\u00ed.",
    signIn: {
      heading: "Inicia sesi\u00f3n para continuar",
      subtitle:
        "Ingresa tu correo de administrador para recibir un enlace m\u00e1gico.",
    },
    notAdmin: "\u2014 pero este correo no est\u00e1 en ADMIN_EMAILS.",
    signedInAs: "Sesi\u00f3n iniciada como",
    menu: {
      items: {
        label: "Art\u00edculos",
        subtitle: "Crear, editar y gestionar publicaciones",
      },
      reservations: {
        label: "Reservas",
        subtitle: "Confirmar, cancelar y marcar como vendido",
      },
    },
    signOut: "Cerrar sesi\u00f3n",
    errors: {
      notSignedIn: "Inicia sesi\u00f3n primero para acceder a",
      notAllowed: "no est\u00e1 en ADMIN_EMAILS.",
      notAllowedGeneral: "Tu cuenta no est\u00e1 en ADMIN_EMAILS.",
    },
  },
  loginForm: {
    label: "Correo de administrador",
    placeholder: "admin@ejemplo.com",
    submit: "Enviar enlace m\u00e1gico",
    submitting: "Enviando\u2026",
    help: "Si tu correo est\u00e1 registrado, recibir\u00e1s un enlace de acceso en tu bandeja de entrada.",
    success: {
      heading: "\u00a1Revisa tu bandeja de entrada!",
    },
  },
  adminItems: {
    heading: "Art\u00edculos",
    subtitle: "Crear, editar y gestionar publicaciones.",
    importJson: "Importar JSON",
    filter: {
      status: "Estado",
      search: "Buscar t\u00edtulo, descripci\u00f3n, categor\u00eda\u2026",
      apply: "Aplicar",
    },
    table: {
      item: "Art\u00edculo",
      price: "Precio",
      category: "Categor\u00eda",
      condition: "Condici\u00f3n",
      pickupArea: "Zona de recogida",
      status: "Estado",
      actions: "Acciones",
    },
    actions: {
      edit: "Editar",
      markSold: "Marcar vendido",
      makeAvailable: "\u21a9 Disponible",
      doneEditing: "\u2713 Listo",
    },
    imageOrder: "Orden de im\u00e1genes",
    noImages: "No se han subido im\u00e1genes para este art\u00edculo.",
    empty: "No se encontraron art\u00edculos con este filtro.",
    status: {
      all: "Todos",
      available: "Disponible",
      reserved: "Reservado",
      sold: "Vendido",
    },
  },
  itemForm: {
    new: "Nuevo art\u00edculo",
    edit: "Editar art\u00edculo",
    required: "Obligatorio",
    fields: {
      title: {
        label: "T\u00edtulo",
        placeholder: "p. ej., Estanter\u00eda IKEA KALLAX",
      },
      price: {
        label: "Precio",
        placeholder: "0.00",
        hint: "En USD. Usa 0 para art\u00edculos gratis.",
      },
      category: {
        label: "Categor\u00eda",
        placeholder: "Selecciona una categor\u00eda",
      },
      condition: {
        label: "Condici\u00f3n",
      },
      pickupArea: {
        label: "Zona de recogida",
        placeholder: "p. ej., Centro, Zona Norte, CP 90210",
        hint: "D\u00f3nde pueden recoger este art\u00edculo.",
      },
      description: {
        label: "Descripci\u00f3n",
        placeholder: "Medidas, color, defectos, raz\u00f3n para vender\u2026",
        hint: "Hasta 2.000 caracteres.",
      },
    },
    conditions: {
      new: "\u2728 Nuevo",
      like_new: "\u2b50 Como nuevo",
      good: "\ud83d\udc4d Bueno",
      fair: "\ud83d\udfe1 Regular",
      parts: "\ud83d\udd27 Para piezas",
    },
    submit: {
      create: "Crear art\u00edculo",
      save: "Guardar cambios",
      saving: "Guardando\u2026",
    },
    messages: {
      fixFields: "Por favor, corrige los campos marcados.",
    },
  },
  uploadForm: {
    heading: "Subir im\u00e1genes",
    label: "Im\u00e1genes",
    help: "JPG, PNG, WebP \u2014 m\u00e1x.\u00a010\u00a0MB cada una. Selecciona varias a la vez.",
    submit: "Subir im\u00e1genes",
    uploading: "Subiendo\u2026",
  },
  adminReservations: {
    heading: "Reservas",
    subtitle: "Confirmar, cancelar o marcar art\u00edculos como vendidos.",
    filter: {
      label: "Filtrar",
      apply: "Aplicar",
    },
    status: {
      all: "Todos los estados",
      pending: "Pendiente",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
    },
    actions: {
      confirm: "Confirmar",
      cancel: "Cancelar",
      markSold: "Marcar vendido",
    },
    labels: {
      submitted: "Enviada",
      pickup: "Recogida",
      deletedItem: "Art\u00edculo eliminado",
    },
    empty: "No se encontraron reservas.",
    error: "Error al cargar reservas:",
  },
  importItems: {
    heading: "Importar art\u00edculos via JSON",
    subtitle: "Pega un objeto o un array de art\u00edculos.",
    jsonLabel: "JSON",
    jsonPlaceholder:
      '{ "title": "...", "price": 0, "category": "furniture", "condition": "good", "pickup_area": "..." }',
    submit: "Importar",
    importing: "Importando\u2026",
    results: {
      title: "Resultados",
      success: "\u2713",
      error: "\u2717",
    },
    errors: {
      invalidJson: "JSON inv\u00e1lido \u2014 revisa el contenido.",
      noItems: "No se import\u00f3 ning\u00fan art\u00edculo.",
    },
    back: "\u2190 Volver a art\u00edculos",
  },
  magic: {
    signingIn: "Iniciando sesi\u00f3n\u2026",
  },
  categories: {
    furniture: "Muebles",
    kitchen: "Cocina",
    living_room: "Sala de estar",
    bedroom: "Dormitorio",
    books: "Libros",
    electronics: "Electr\u00f3nica",
    clothing: "Ropa",
    outdoor: "Exterior",
    tools: "Herramientas",
    decor: "Decoraci\u00f3n",
    other: "Otros",
  },
} satisfies Dictionary;

export default es;

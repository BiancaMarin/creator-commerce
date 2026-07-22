export const strings = {
  common: {
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    submit: "Submit",
    back: "Back",
  },

  login: {
    title: "Welcome back",
    subtitle: "Sign in to your Creator Commerce workspace.",
    paragraph: "Enter your email and password to continue.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
    signIn: "Sign In",
    submit: "Sign in",
    submitting: "Signing in…",
    continueWith: "or continue with",
    google: "Google",
    github: "GitHub",
    forgotPassword: "Forgot password?",
    footerPrompt: "Don't have an account?",
    footerLink: "Sign up",
  },

  signup: {
    title: "Create your account",
    subtitle: "Start selling digital products in minutes.",
    paragraph: "Enter your details to get started.",
    signUp: "Sign Up",
    name: "Name",
    email: "Email",
    password: "Password",
    namePlaceholder: "Jane Creator",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
    submit: "Create account",
    submitting: "Creating account…",
    continueWith: "or continue with",
    google: "Google",
    github: "GitHub",
    footerPrompt: "Already have an account?",
    footerLink: "Sign in",
  },

  dashboard: {
    // {name} is replaced with the signed-in user's first name.
    greeting: "Welcome, {name}!",
    subtitle: "Here's how your storefront is performing this month.",
    tabs: {
      overview: "Overview",
      account: "Account",
      settings: "Settings",
    },
    accountPanel: {
      title: "Account",
      description: "The details tied to your Creator Commerce login.",
      name: "Name",
      email: "Email",
      handle: "Storefront handle",
      handleNote:
        "Renaming your handle changes your storefront URL. The old one stops working right away, so any links you've shared will break.",
      handlePlaceholder: "your-handle",
      handleSave: "Save handle",
      handleSaving: "Saving…",
      handleSaved: "Handle updated.",
      viewStore: "View store",
    },
    settingsPanel: {
      title: "Settings",
      description: "Store preferences, payouts, and notifications.",
      comingSoon: "Settings aren't wired up yet — check back soon.",
    },
  },

  products: {
    title: "Products",
    subtitle: "Manage your catalog of digital products.",
    newProduct: "New product",
    empty: "No products yet — add your first one to fill your storefront.",
    createTitle: "New product",
    createSubtitle: "Add a digital product to your storefront.",
    editTitle: "Edit product",
    editSubtitle: "Update the details buyers see on your storefront.",
    name: "Name",
    namePlaceholder: "Studio Preset Pack",
    tag: "Type",
    tagPlaceholder: "Lightroom presets",
    description: "Description",
    descriptionPlaceholder:
      "What the buyer gets, who it's for, and what they can do with it.",
    price: "Price",
    pricePlaceholder: "48.00",
    files: "Files",
    filesPlaceholder: "12 files · .xmp, .dng · 84 MB",
    filesHint: "Shown on the product page. Optional.",
    // {url} is replaced with the storefront path the product will live at.
    slugPreview: "Storefront URL: {url}",
    slugPending: "The URL is generated from the name.",
    create: "Create product",
    creating: "Creating…",
    save: "Save changes",
    saving: "Saving…",
    saved: "Product saved.",
    viewInStore: "View in store",
    backToProducts: "Back to products",
    columnProduct: "Product",
    columnType: "Type",
    columnPrice: "Price",
    columnUrl: "URL",
    edit: "Edit",
  },

  account: {
    signOut: "Sign out",
    signingOut: "Signing out…",
    fallbackName: "Your account",
    socialComingSoon: "Social sign-in is coming soon.",
  },

  store: {
    brand: "Creator Commerce",
    shop: "Shop",
    about: "About",
    signIn: "Sign in",
    cart: "Cart",
    products: "Products",
    // {count} is replaced with the number of products in the store.
    itemCount: "{count} items",
    noProducts: "This creator hasn't published any products yet.",
    buy: "Buy",
    backToShop: "Back to shop",
    poweredBy: "Powered by",
    // {name} is replaced with the creator's name.
    tagline: "Digital products by {name}.",
  },

  marketing: {
    meta: {
      title: "Creator Commerce — Sell your digital products",
    },
    nav: {
      features: "Features",
      how: "How it works",
      pricing: "Pricing",
      docs: "Docs",
      signIn: "Sign in",
      getStarted: "Get started",
    },
    hero: {
      badge: "Now with AI product pages",
      title: "The storefront built for creators.",
      subtitle:
        "Publish digital products, take payments through Stripe, and deliver protected downloads — track revenue, orders, and customers all in one place.",
      ctaPrimary: "Start selling free",
      ctaSecondary: "Watch demo",
      trustNoCard: "No credit card required",
      trustFee: "2% flat fee",
      previewLabel: "Dashboard",
      previewChart: "Sales this month",
    },
    // Headline numbers under the hero.
    trust: [
      { value: "12,000+", label: "creators selling" },
      { value: "$40M+", label: "paid out to date" },
      { value: "180+", label: "countries" },
      { value: "4.9/5", label: "average rating" },
    ],
    features: {
      badge: "Everything included",
      title: "One platform to sell what you make",
      subtitle:
        "From your first upload to your ten-thousandth sale — the tools stay out of your way.",
      // Keyed rather than a list: the page pairs each entry with an icon by
      // name, so reordering the cards can't silently mismatch the two.
      items: {
        storefront: {
          title: "Public storefront",
          desc: "Every creator gets a clean storefront at /@handle — no site builder, no theme wrangling.",
        },
        checkout: {
          title: "Stripe checkout",
          desc: "Take card payments worldwide with buyer, seller and product tracked on every order.",
        },
        downloads: {
          title: "Protected downloads",
          desc: "Files stay locked to the buyer. Secure links, instant delivery, re-download anytime.",
        },
        aiPages: {
          title: "AI product pages",
          desc: "Generate a polished product page and teaser straight from the file you upload.",
        },
        analytics: {
          title: "Revenue analytics",
          desc: "See revenue, top products and conversion at a glance — updated in real time.",
        },
        customers: {
          title: "Customer profiles",
          desc: "Segments, lifetime value and order history for every buyer, built in.",
        },
      },
    },
    how: {
      title: "Live in three steps",
      subtitle: "Most creators publish their first product in under ten minutes.",
      steps: {
        upload: {
          title: "Upload your file",
          desc: "Drop in a PDF, video, preset pack or ZIP. We handle storage and delivery.",
        },
        publish: {
          title: "Publish in a click",
          desc: "AI drafts the product page. Set a price, hit publish, share your link.",
        },
        getPaid: {
          title: "Get paid",
          desc: "Buyers check out with Stripe. Money lands in your account — you keep 98%.",
        },
      },
    },
    pricing: {
      title: "Simple pricing that scales",
      subtitle: "Start free. Upgrade when you grow. Cancel anytime.",
      monthly: "Monthly",
      yearly: "Yearly",
      save: "−20%",
      mostPopular: "Most popular",
      perMonth: "/mo",
    },
    cta: {
      title: "Start selling your work today",
      subtitle: "Join 12,000+ creators running their business on Creator Commerce.",
      button: "Start selling free",
    },
    footer: {
      tagline: "The storefront built for creators. Sell what you make.",
      privacy: "Privacy",
      terms: "Terms",
      copyright: "© 2026 Creator Commerce",
    },
  },

  validation: {
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    passwordMin: "Password must contain at least 8 characters.",
    handleLength: "Handles must be between 3 and 30 characters.",
    handleFormat:
      "Use lowercase letters, numbers and single hyphens between them.",
    productName: "Give the product a name between 3 and 255 characters.",
    productTag: "Add a short type, like “Video course”.",
    productDescription:
      "Describe the product in at least 10 characters (2000 max).",
    productPrice: "Enter a price like 48 or 48.00.",
    productFiles: "Keep the file summary under 160 characters.",
  },

  errors: {
    generic: "Something went wrong.",
    unauthorized: "Invalid email or password.",
    emailTaken: "An account with that email already exists.",
    handleTaken: "That handle is already taken.",
    productNotFound: "That product no longer exists.",
  },
} as const;

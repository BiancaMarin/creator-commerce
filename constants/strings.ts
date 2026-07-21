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
    buy: "Buy",
    backToShop: "Back to shop",
    poweredBy: "Powered by",
    // {name} is replaced with the creator's name.
    tagline: "Digital products by {name}.",
  },

  marketing: {
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
    features: {
      badge: "Everything included",
      title: "One platform to sell what you make",
      subtitle:
        "From your first upload to your ten-thousandth sale — the tools stay out of your way.",
    },
    how: {
      title: "Live in three steps",
      subtitle: "Most creators publish their first product in under ten minutes.",
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
  },

  errors: {
    generic: "Something went wrong.",
    unauthorized: "Invalid email or password.",
    emailTaken: "An account with that email already exists.",
    handleTaken: "That handle is already taken.",
  },
} as const;

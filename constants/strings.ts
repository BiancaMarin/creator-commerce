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

  forgotPassword: {
    title: "Reset your password",
    subtitle: "We'll email you a link to choose a new one.",
    paragraph: "Enter the address you signed up with.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Send reset link",
    submitting: "Sending…",
    // Shown whether or not an account exists. Saying "no such account" would
    // turn this form into a way to test which addresses are registered, so the
    // wording has to be true in both cases — and it is: nothing was sent if
    // there was nobody to send to.
    sentTitle: "Check your email",
    sent: "If that address has an account, a reset link is on its way. The link is good for one hour.",
    footerPrompt: "Remembered it?",
    footerLink: "Back to sign in",
  },

  resetPassword: {
    title: "Choose a new password",
    subtitle: "This link works once, and only for the next hour.",
    password: "New password",
    confirmPassword: "Confirm new password",
    passwordPlaceholder: "••••••••",
    submit: "Update password",
    submitting: "Updating…",
    // The link was missing, already used, or older than an hour. All three are
    // one message on purpose — the reader's next step is identical.
    invalidTitle: "This link has expired",
    invalid:
      "Reset links work once and last an hour. Request a fresh one to continue.",
    invalidCta: "Request a new link",
    doneTitle: "Password updated",
    done: "You can sign in with your new password now.",
    doneCta: "Go to sign in",
  },

  nav: {
    // Every account is both a seller and a buyer, so the sidebar splits by
    // activity rather than by account type. The labels name what you're doing —
    // "Selling" / "Buying" — not who you are, since the same person is both.
    workspace: "Workspace",
    dashboard: "Dashboard",
    selling: "Selling",
    buying: "Buying",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    analytics: "Analytics",
    explore: "Explore",
    wishlist: "Wishlist",
    downloads: "Downloads",
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
    // Section headings of the product form, in the order a creator fills it.
    sectionProduct: "Your product",
    sectionProductHint:
      "Upload what buyers get. Once the file is in, AI drafts the details below for you to review.",
    sectionDetails: "Details",
    sectionDetailsHint: "How the product appears on your storefront.",
    sectionPrice: "Price",
    sectionPriceHint: "What buyers pay, in US dollars.",
    // Only optional fields are marked; the note says the rest are required.
    optional: "Optional",
    requiredNote: "Every field is required unless it's marked optional.",
    // {amount} is the formatted payout, {percent} the platform fee.
    payout: "You receive {amount} per sale after the {percent}% platform fee.",
    // Shown after an AI draft has filled fields the creator left empty.
    aiFilled: "Drafted with AI from your upload — review it before saving.",
    // Replaces the Save label while an image or the product file is uploading.
    waitingForUpload: "Uploading…",
    description: "Description",
    descriptionPlaceholder:
      "What the buyer gets, who it's for, and what they can do with it.",
    descriptionGenerate: "Fill in with AI",
    descriptionRegenerate: "Rewrite with AI",
    descriptionGenerating: "Writing…",
    // Under the button. Says what the draft is built from and that it
    // replaces what's in the box, so a click is never a surprise.
    descriptionGenerateHint:
      "Uses the product file, cover image, name and type. Fills in an empty name and type, and replaces the description — edit it before saving.",
    price: "Price",
    pricePlaceholder: "48.00",
    file: "Product file",
    // Mirrors MAX_PRODUCT_FILE_BYTES in lib/schemas/product.ts and the
    // productFile route in app/api/uploadthing/core.ts — change them together.
    fileHint: "Any file type, up to 100 MB. This is what the buyer downloads.",
    fileUpload: "Choose file",
    fileReplace: "Replace",
    fileUploading: "Uploading…",
    fileDrop: "Drop to upload",
    // Prefixes the hint above, so it has to read as a complete sentence
    // followed by another.
    fileDropHint: "Drag the file here, or use the button.",
    // {name} is the filename.
    fileRemoveAria: "Remove {name}",
    // A drop carrying more than one file: the product is a single download.
    fileDropMultiple: "One file only — the product is a single download.",
    fileTooLarge: "That file is over 100 MB. Zip it down or host it elsewhere.",
    fileError: "That file couldn't be uploaded. Try again.",
    // Same failure as imageNoCallback below, for the product file.
    fileNoCallback:
      "The upload finished but didn't come back. If you're running locally, use `npm run dev` rather than `npm run start`.",
    fileMissing: "No file attached",
    images: "Images",
    imageUpload: "Add images",
    imageUploading: "Uploading…",
    // {index} is the image's 1-based position, {name} the product.
    imageRemoveAria: "Remove image {index}",
    // Mirrors the limits on the productImage route in
    // app/api/uploadthing/core.ts and MAX_PRODUCT_IMAGES — change them together.
    // {count} is the maximum number of images.
    imageHint:
      "PNG or JPG, up to 4 MB each — {count} max. The first is the cover.",
    imageEmptyHint: "Optional — without one, a generated gradient is used.",
    imageDrop: "Drop to upload",
    // Prefixes the hint below, so it has to read as a complete sentence
    // followed by another.
    imageDropHint: "Drag images here, or use the button.",
    // Shown when a drag carries something that isn't an image, and when files
    // are dropped after the cap is reached. {count} is the maximum.
    imageDropRejected: "Only image files can be uploaded.",
    imageDropFull: "You already have {count} images — remove one first.",
    imageAlt: "Image {index} of {name}",
    imageCover: "Cover",
    imageError: "That image couldn't be uploaded. Try again.",
    // The file reached storage but the upload callback never came back, so
    // there's no URL to attach. Locally this means the app is being served by
    // `next start` — UploadThing can't call back into localhost.
    imageNoCallback:
      "The upload finished but didn't come back with a URL. If you're running locally, use `npm run dev` rather than `npm run start`.",
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
    // Tooltip copy is deliberately more explicit than the button labels — the
    // delete trigger in the table is icon-only, so this is the only visible
    // hint at what it does.
    editTooltip: "Edit product",
    deleteTooltip: "Delete product",
    delete: "Delete",
    // {name} is the product being removed — used for the icon button's label
    // and inside the confirmation, so the dialog never says "this item".
    deleteAria: "Delete {name}",
    deleteTitle: "Delete this product?",
    // Soft delete: the row is retained, so this deliberately doesn't promise
    // permanence. It also doesn't promise recovery — there's no restore UI yet.
    deleteDescription:
      "“{name}” will be removed from your storefront and buyers will no longer be able to reach it.",
    deleteConfirm: "Delete product",
    deleting: "Deleting…",
  },

  explore: {
    title: "Explore",
    subtitle: "Find digital products from creators across the platform.",
    searchLabel: "Search products",
    searchPlaceholder: "Search products…",
    sortLabel: "Sort",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    // "Type" is the product form's label for the `tag` field — the two have to
    // stay in step or the filter names something the creator never filled in.
    typeLabel: "Filter by type",
    typeAll: "All types",
    priceLabel: "Price",
    priceMin: "Min",
    priceMax: "Max",
    priceMinAria: "Minimum price",
    priceMaxAria: "Maximum price",
    clearFilters: "Clear filters",
    // Shown while browsing, before anyone has typed a real search. {count} is
    // the number of products on the page.
    browsing: "Showing the {count} most recently added products.",
    // Filters applied with no search term behind them. Deliberately generic:
    // with three filter dimensions (type, min, max) naming each active one
    // needs a combination matrix, and they're all visible in the controls
    // directly above this line. {count} is the number of products.
    browsingFiltered: "{count} products match these filters.",
    browsingFilteredOne: "1 product matches these filters.",
    // {count} is the number of matches, {query} the term that found them.
    resultCount: "{count} products matching “{query}”.",
    resultCountOne: "1 product matching “{query}”.",
    // {query} is the term that found nothing.
    noResults: "No products match “{query}”.",
    // Filters, but no search term — see the note on browsingFiltered.
    noResultsFiltered: "No products match these filters.",
    noResultsHint: "Try a shorter or more general term.",
    noResultsHintFilters: "Try widening the price range or clearing a filter.",
    // The platform has nothing to show at all — not a failed search.
    empty: "There's nothing to explore yet.",
    // {count} is MIN_SEARCH_LENGTH from lib/schemas/search.ts.
    minLengthHint: "Type at least {count} characters to search.",
    // {name} is the creator's display handle, prefixed with @ in the markup.
    byCreator: "by @{handle}",
  },

  account: {
    signOut: "Sign out",
    signingOut: "Signing out…",
    // The sign-out request was rejected, so the session is still live. Says the
    // session is intact rather than just "something went wrong" — the click
    // otherwise looks like it worked until the next page proves it didn't.
    signOutError: "Couldn't sign out — you're still signed in. Try again.",
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
    // Shown in place of "Buy" on a product the viewer sells.
    yourProduct: "Your product",
    // Shown in place of "Buy" on a product the viewer has already bought.
    // Distinct from `yourProduct`: one is the seller, this is the buyer.
    owned: "Owned",
    goToDownloads: "Download",
    editProduct: "Edit product",
    // Replaces "Sign in" in the storefront nav for a signed-in visitor.
    dashboard: "Dashboard",
    backToShop: "Back to shop",
    poweredBy: "Powered by",
    // {name} is replaced with the creator's name.
    tagline: "Digital products by {name}.",
    gallery: {
      previousImage: "Previous image",
      nextImage: "Next image",
      // {index} is replaced with the 1-based position of the image.
      goToImage: "Go to image {index}",
      // {current} / {total} are replaced with 1-based positions.
      imageCount: "{current} / {total}",
    },
  },

  cart: {
    title: "Your cart",
    // The sidebar row label — just the noun, since the count sits beside it.
    navTitle: "Cart",
    // {count} is replaced with the number of products in the cart. The cart
    // holds no quantities, so an item and a product are the same thing here.
    itemCount: "{count} items",
    oneItem: "1 item",
    // {count} is replaced with the number of products in the cart. This is the
    // accessible name of the nav's cart button, so it has to say what the badge
    // beside it only shows.
    navLabel: "Cart, {count} items",
    navLabelEmpty: "Cart, empty",
    empty: "Your cart is empty.",
    emptyAction: "Browse creators",
    // {name} is replaced with the product's name.
    remove: "Remove {name}",
    addToCart: "Add to cart",
    adding: "Adding…",
    inCart: "In cart",
    checkout: "Checkout",
    // Shown instead of `checkout` to a signed-out visitor — buying needs an
    // account, and saying so up front beats a payment form that then refuses.
    signInToCheckout: "Sign in to checkout",
    // The same requirement on the single-product "Buy now" path.
    signInToBuy: "Sign in to buy",
    goToDashboard: "Go to dashboard",
    orderSummary: "Order summary",
    subtotal: "Subtotal",
    platformFee: "Platform fee (2%)",
    total: "Total",
    payingWith: "Payment details",
    // {total} is replaced with the formatted order total.
    pay: "Pay {total}",
    paying: "Processing…",
    securedBy: "Payments secured by Stripe",
    // Shown in place of the card fields. Card details are entered on Stripe's
    // hosted page, so the buyer is told they're about to leave the site.
    redirectNotice:
      "You'll be taken to Stripe to pay securely, then brought straight back to your download.",
    instantDownload: "Instant download after payment",
    email: "Email",
    cardNumber: "Card number",
    expiry: "Expiry",
    cvc: "CVC",
    nameOnCard: "Name on card",
  },

  // CECE, the in-app assistant (components/cece/). The name is always written
  // in capitals — it's a name, not an acronym anyone expands.
  cece: {
    name: "CECE",
    navLabel: "Ask CECE",
    title: "Ask CECE",
    description:
      "Your Creator Commerce assistant. Ask how something works, or about your products and sales.",
    // Shown in place of the conversation until the first message.
    emptyTitle: "How can I help?",
    emptyHint: "CECE can look up your store and explain how the platform works.",
    // Starter questions, sent as-is when clicked. Each exercises a different
    // tool, so the empty state doubles as a tour of what CECE can do.
    suggestions: [
      "How do I add my first product?",
      "How are my sales this month?",
      "Is anything missing from my products?",
      "Where can I download what I bought?",
    ],
    inputPlaceholder: "Ask anything about Creator Commerce…",
    inputLabel: "Message CECE",
    send: "Send",
    stop: "Stop",
    newChat: "New chat",
    thinking: "Thinking…",
    retry: "Try again",
    // The request itself failed (network, 401, 413). Errors *inside* a reply
    // arrive as text from the server — see lib/server/cece/chat.ts.
    error: "Something went wrong. Please try again.",
    // Labels for the lookups CECE makes, keyed by tool name, shown as a chip
    // while the tool runs and after. Mirrors CECE_TOOLS in
    // lib/server/cece/tools.ts; a tool missing here falls back to `toolFallback`.
    tools: {
      get_help: "Checked the help guide",
      get_account_overview: "Looked at your account",
      list_my_products: "Looked at your products",
      get_my_product: "Opened a product",
      get_sales_summary: "Checked your sales",
      list_recent_orders: "Checked recent orders",
      list_top_customers: "Checked your customers",
      list_my_purchases: "Checked your purchases",
      search_marketplace: "Searched the marketplace",
    },
    toolFallback: "Looked something up",
    toolFailed: "Couldn't load this",
    disclaimer: "CECE can make mistakes. It can look things up but can't change anything.",
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
    passwordMismatch: "Both passwords must match.",
    handleLength: "Handles must be between 3 and 30 characters.",
    handleFormat:
      "Use lowercase letters, numbers and single hyphens between them.",
    productName: "Give the product a name between 3 and 255 characters.",
    productTag: "Add a short type, like “Video course”.",
    productDescription:
      "Describe the product in at least 10 characters (2000 max).",
    productPrice: "Enter a price like 48 or 48.00.",
    productPricePositive: "Price must be greater than 0.",
    productFileRequired: "Upload the file buyers will download.",
    productFile: "That file couldn't be attached. Upload it again.",
    productFileSize: "The product file must be 100 MB or smaller.",
    productImage: "That doesn't look like a valid image URL.",
    // {count} is replaced with MAX_PRODUCT_IMAGES from lib/schemas/product.ts.
    productImageCount: "You can add up to {count} images.",
    // Asking AI for a description with nothing to go on.
    productDescriptionSource:
      "Add a name, an image or the product file first, so there's something to describe.",
  },

  errors: {
    generic: "Something went wrong.",
    unauthorized: "Invalid email or password.",
    emailTaken: "An account with that email already exists.",
    handleTaken: "That handle is already taken.",
    productNotFound: "That product no longer exists.",
    // Surfaced by the UploadThing file router's middleware, so it reads as an
    // upload failure rather than a sign-in prompt.
    uploadUnauthorized: "Sign in again to upload images.",
    // Returned by checkoutCart to a signed-out caller. The UI normally sends
    // people to sign in before they ever see this, so it surfaces only when the
    // session expired mid-checkout.
    signInToCheckout: "Please sign in to complete your purchase.",
    cartEmpty: "Your cart is empty.",
    // A creator buying from their own storefront. Enforced in addToCart,
    // checkoutProduct and checkoutCart; the UI hides the buttons first.
    cannotBuyOwnProduct: "You can't buy your own product.",
    cartHasOwnProducts:
      "Your cart contains your own products. Remove them to check out.",
    // A digital product is bought once — there is nothing a second copy would
    // give the buyer. Enforced in addToCart, checkoutProduct and checkoutCart;
    // the UI swaps the buy button for a download link first.
    alreadyPurchased: "You already own this — find it in your downloads.",
    cartHasPurchased:
      "Your cart contains products you already own. Remove them to check out.",
    // Stripe refused or was unreachable when opening a Checkout Session. The
    // buyer's cart is untouched, so retrying is the right advice.
    checkoutFailed: "We couldn't reach the payment provider. Please try again.",
    // {count} is replaced with MAX_CART_ITEMS from lib/schemas/cart.ts.
    cartFull: "A cart can hold up to {count} products.",
    // The AI Gateway call failed or came back empty. Not the creator's fault,
    // and the description they had is left untouched.
    descriptionGeneration:
      "Couldn't write a description right now. Try again, or write one yourself.",
  },

  // Copy for outbound email (lib/server/emails/*). It lives here with the rest
  // of the user-facing text rather than inside the sending code: an email is
  // read by a person exactly like a page is, and splitting the two would mean
  // two places to keep a tone consistent.
  email: {
    receipt: {
      // {order} is the order id. Deliberately in the subject — it's what a
      // buyer quotes when they write in about a purchase.
      subject: "Your Creator Commerce order #{order}",
      heading: "Thanks for your purchase",
      // Says the money moved and where the goods are, in that order. Nothing
      // else in the message needs to be read for the buyer to act.
      intro:
        "Your payment went through. Your files are in your downloads library.",
      itemsHeading: "What you bought",
      total: "Total",
      // {url} is an absolute link to /downloads — email has no notion of a
      // site-relative path.
      cta: "View your downloads: {url}",
      footer:
        "You're receiving this because you bought something on Creator Commerce.",
    },

    passwordReset: {
      subject: "Reset your Creator Commerce password",
      heading: "Reset your password",
      // {name} is the account holder's name.
      intro:
        "Hi {name}, someone asked to reset the password on your Creator Commerce account.",
      // {url} is the one-time reset link Better Auth generated.
      cta: "Choose a new password: {url}",
      linkLabel: "Choose a new password",
      expiry: "The link works once and expires in one hour.",
      // The one line that matters to someone who didn't ask for this. No
      // action is required precisely because the link alone changes nothing.
      ignore:
        "If you didn't ask for this, you can ignore this email. Your password stays as it is.",
    },
  },
} as const;

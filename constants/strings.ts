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
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    signIn: "Sign In",
    continueWith: "or continue with",
    google: "Google",
    github: "GitHub",
    forgotPassword: "Forgot password?",
  },

  signup: "Sign Up",

  validation: {
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    passwordMin: "Password must contain at least 8 characters.",
  },

  errors: {
    generic: "Something went wrong.",
    unauthorized: "Invalid email or password.",
  },
} as const;

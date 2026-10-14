// packages/web-features/src/web/modules/user/messages.ts
// Web-only strings for the user/auth feature.
// Shared strings (common.save, errors.*) come from @avuny/i18n via useMessages().
// Server error text (INVALID_CREDENTIALS etc.) comes from the API response's
// `message` field (Q13 default: show server message with Accept-Language).

const en = {
  auth: {
    // Sign-up
    signUp: {
      title: "Create account",
      step1: {
        heading: "Enter your email or phone",
        identifierLabel: "Email or phone number",
        identifierPlaceholder: "you@example.com or +1234567890",
        submitButton: "Send code",
        submitting: "Sending…",
      },
      step2: {
        heading: "Enter the code",
        // CR9: neutral wording — never say "we sent to <identifier>".
        neutralMessage:
          "If this can be used, a code is on its way. Enter it below.",
        codeLabel: "6-digit code",
        codePlaceholder: "000000",
        verifyButton: "Verify",
        verifying: "Verifying…",
        resendButton: "Resend code",
        resendCountdown: (seconds: number) => `Resend in ${seconds}s`,
        codeExpiredMessage: "This code has expired. Request a new one.",
        tooManyAttemptsMessage:
          "Too many wrong attempts. Request a new code.",
        rateLimitedMessage:
          "Too many code requests. Please wait before trying again.",
        changeIdentifier: "Use a different email or phone",
      },
      step3: {
        heading: "Set up your account",
        nameLabel: "Full name",
        namePlaceholder: "Your name",
        passwordLabel: "Password",
        passwordPlaceholder: "Min. 8 characters",
        submitButton: "Create account",
        submitting: "Creating account…",
      },
    },
    // Sign-in
    signIn: {
      title: "Sign in",
      identifierLabel: "Email, phone or username",
      identifierPlaceholder: "you@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Your password",
      submitButton: "Sign in",
      submitting: "Signing in…",
      // Generic error for INVALID_CREDENTIALS (never reveal which field).
      invalidCredentialsMessage:
        "Incorrect credentials. Please try again.",
      accountSuspendedMessage:
        "This account has been suspended.",
      // TOO_MANY_ATTEMPTS: show countdown from retryAfter.
      tooManyAttemptsMessage: (seconds: number) =>
        `Too many attempts. Try again in ${seconds}s.`,
      noAccount: "Don't have an account?",
      signUpLink: "Create one",
    },
    // Home
    home: {
      title: "Home",
      greeting: (name: string) => `Hello, ${name}`,
      primaryIdentifierLabel: "Sign-in method",
      signOutButton: "Sign out",
      signingOut: "Signing out…",
    },
  },
}

export type UserMessages = typeof en

const ar: UserMessages = {
  auth: {
    signUp: {
      title: "إنشاء حساب",
      step1: {
        heading: "أدخل بريدك الإلكتروني أو رقم هاتفك",
        identifierLabel: "البريد الإلكتروني أو رقم الهاتف",
        identifierPlaceholder: "you@example.com أو +1234567890",
        submitButton: "إرسال الرمز",
        submitting: "جارٍ الإرسال…",
      },
      step2: {
        heading: "أدخل الرمز",
        neutralMessage:
          "إذا كان هذا صالحًا للاستخدام، فالرمز في طريقه إليك. أدخله أدناه.",
        codeLabel: "رمز مكوّن من 6 أرقام",
        codePlaceholder: "000000",
        verifyButton: "تحقق",
        verifying: "جارٍ التحقق…",
        resendButton: "إعادة إرسال الرمز",
        resendCountdown: (seconds: number) => `إعادة الإرسال خلال ${seconds}s`,
        codeExpiredMessage: "انتهت صلاحية هذا الرمز. اطلب رمزًا جديدًا.",
        tooManyAttemptsMessage:
          "محاولات خاطئة كثيرة. اطلب رمزًا جديدًا.",
        rateLimitedMessage:
          "طلبات كثيرة جدًا. انتظر قبل المحاولة مرة أخرى.",
        changeIdentifier: "استخدم بريدًا أو رقم هاتف آخر",
      },
      step3: {
        heading: "إعداد حسابك",
        nameLabel: "الاسم الكامل",
        namePlaceholder: "اسمك",
        passwordLabel: "كلمة المرور",
        passwordPlaceholder: "٨ أحرف على الأقل",
        submitButton: "إنشاء الحساب",
        submitting: "جارٍ إنشاء الحساب…",
      },
    },
    signIn: {
      title: "تسجيل الدخول",
      identifierLabel: "البريد الإلكتروني أو الهاتف أو اسم المستخدم",
      identifierPlaceholder: "you@example.com",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "كلمة المرور",
      submitButton: "تسجيل الدخول",
      submitting: "جارٍ تسجيل الدخول…",
      invalidCredentialsMessage:
        "بيانات الاعتماد غير صحيحة. حاول مرة أخرى.",
      accountSuspendedMessage: "تم تعليق هذا الحساب.",
      tooManyAttemptsMessage: (seconds: number) =>
        `محاولات كثيرة جدًا. حاول مرة أخرى خلال ${seconds}s.`,
      noAccount: "ليس لديك حساب؟",
      signUpLink: "أنشئ واحدًا",
    },
    home: {
      title: "الرئيسية",
      greeting: (name: string) => `مرحبًا، ${name}`,
      primaryIdentifierLabel: "طريقة تسجيل الدخول",
      signOutButton: "تسجيل الخروج",
      signingOut: "جارٍ تسجيل الخروج…",
    },
  },
}

export const userMessages = { en, ar } satisfies Record<"en" | "ar", UserMessages>

export function getUserMessages(locale: string): UserMessages {
  return locale === "ar" ? ar : en
}

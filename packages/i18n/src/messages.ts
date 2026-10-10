// packages/i18n/src/messages.ts
// Shared strings only (common UI words + API errors).
// `en` defines the shape; every other locale must match it exactly.
import type { Locale } from "./locales.js";

const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    loading: "Loading...",
  },
  errors: {
    validation: "Some fields are invalid.",
    unauthorized: "You need to sign in to continue.",
    forbidden: "You don't have permission to do this.",
    notFound: "We couldn't find what you were looking for.",
    conflict: "This item already exists.",
    tooManyRequests: "Too many requests. Please try again later.",
    internal: "Something went wrong. Please try again.",
  },
};

export type Messages = typeof en;

const ar: Messages = {
  common: {
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    search: "بحث",
    loading: "جارٍ التحميل...",
  },
  errors: {
    validation: "بعض الحقول غير صالحة.",
    unauthorized: "يجب تسجيل الدخول للمتابعة.",
    forbidden: "ليس لديك صلاحية للقيام بذلك.",
    notFound: "لم نتمكن من العثور على ما تبحث عنه.",
    conflict: "هذا العنصر موجود بالفعل.",
    tooManyRequests: "عدد الطلبات كبير جدًا. يرجى المحاولة لاحقًا.",
    internal: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
};

// `satisfies` fails the build if a Locale has no messages.
export const messages = { en, ar } satisfies Record<Locale, Messages>;

export const getMessages = (locale: Locale): Messages => messages[locale];

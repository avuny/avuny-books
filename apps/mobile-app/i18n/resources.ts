export const resources = {
  en: {
    common: {
      status: {
        error: 'Error',
        loading: 'Loading...',
        success: 'Success',
      },
      entities: {
        role: 'Role',
        organization: 'Organization',
        item: 'Item',
        warehouse: 'Warehouse',
        organizationUser: 'User',
        unit: 'Unit',
        unitCollection: 'Unit Collection',
      },
      actions: {
        create: 'Create',
        add: 'Add',
        update: 'Update',
        save: 'Save',
        delete: 'Delete',
      },
      msgs: {
        save: 'Saved successfully',
        create: '{thing} created successfully',
        add: '{thing} added successfully',
        update: '{thing} updated successfully',
        delete: '{thing} deleted successfully',
        welcome: 'Welcome back, {thing}!',
        actionThingTitle: '{action} {thing}',
        actionThingDescription: 'Fill in the details below to {action} {thing}.',
      },
    },
    auth: {
      headers: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
      },
      labels: {
        identifier: 'Email or Username',
        name: 'Full Name',
        password: 'Password',
      },
      msgs: {
        orHaveNotAnAccountSignUp: "Don't have an account?",
        orAlreadyHaveAnAccountSignIn: 'Already have an account?',
        welcome: 'Welcome back, {thing}!',
      },
      errors: {
        AUTH_USER_CREATION_FAILED: 'Failed to create user account.',
        INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
      },
    },
    organization: {
      title: 'Organization',
      createTitle: 'Create Organization',
    },
    role: {
      title: 'Role',
      createTitle: 'Create Role',
    },
  },
  ar: {
    common: {
      status: {
        error: 'خطأ',
        loading: 'جارٍ التحميل...',
        success: 'تم بنجاح',
      },
      entities: {
        role: 'الدور',
        organization: 'المنشأة',
        item: 'الصنف',
        warehouse: 'المستودع',
        organizationUser: 'المستخدم',
        unit: 'الوحدة',
        unitCollection: 'مجموعة الوحدات',
      },
      actions: {
        create: 'إنشاء',
        add: 'إضافة',
        update: 'تحديث',
        save: 'حفظ',
        delete: 'حذف',
      },
      msgs: {
        save: 'تم الحفظ بنجاح',
        create: 'تم إنشاء {thing} بنجاح',
        add: 'تم إضافة {thing} بنجاح',
        update: 'تم تحديث {thing} بنجاح',
        delete: 'تم حذف {thing} بنجاح',
        welcome: 'مرحباً بك مجدداً، {thing}!',
        actionThingTitle: '{action} {thing}',
        actionThingDescription: 'أدخل التفاصيل أدناه لـ {action} {thing}.',
      },
    },
    auth: {
      headers: {
        signIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
      },
      labels: {
        identifier: 'البريد الإلكتروني أو اسم المستخدم',
        name: 'الاسم بالكامل',
        password: 'كلمة المرور',
      },
      msgs: {
        orHaveNotAnAccountSignUp: 'ليس لديك حساب؟',
        orAlreadyHaveAnAccountSignIn: 'لديك حساب بالفعل؟',
        welcome: 'مرحباً بك مجدداً، {thing}!',
      },
      errors: {
        AUTH_USER_CREATION_FAILED: 'فشل في إنشاء الحساب.',
        INVALID_CREDENTIALS: 'بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.',
      },
    },
    organization: {
      title: 'المنشأة',
      createTitle: 'إنشاء منشأة',
    },
    role: {
      title: 'الدور',
      createTitle: 'إنشاء دور',
    },
  },
} as const;

export type AppResources = (typeof resources)['en'];

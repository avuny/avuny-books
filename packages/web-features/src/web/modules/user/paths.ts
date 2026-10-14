// packages/web-features/src/web/modules/user/paths.ts
// All auth and user path constants. Links and the host route table both use these.


export const authPaths = {
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const

export const userPaths = {
  home: "/",
} as const

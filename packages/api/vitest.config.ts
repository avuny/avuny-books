import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      ACCESS_TOKEN_SECRET: "0123456789abcdef0123456789abcdef",
      VERIFICATION_TOKEN_SECRET: "0123456789abcdef0123456789abcdef",
      OTP_SECRET: "0123456789abcdef0123456789abcdef",
      AUDIT_HMAC_SECRET: "0123456789abcdef0123456789abcdef",
      BACKGROUND_RUNNER: "inline",
      BCRYPT_ROUNDS: "4",
    },
  },
})

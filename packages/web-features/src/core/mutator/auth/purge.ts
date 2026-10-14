// packages/web-features/src/core/mutator/auth/purge.ts
// CR6: purge = clear access token + notify listeners so the app can
// clear the query cache and navigate to sign-in.

import { tokenStorage } from "./token-storage"

type PurgeListener = () => void
const listeners = new Set<PurgeListener>()

export const purge = {
  /**
   * Register a callback that fires whenever a purge happens.
   * Returns an unsubscribe function.
   */
  subscribe(fn: PurgeListener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  /**
   * CR6: clear the in-memory access token and notify all listeners.
   * Listeners are responsible for clearing the query cache, in-memory
   * user state, and navigating to sign-in.
   */
  run() {
    tokenStorage.removeAccessToken()
    for (const fn of listeners) {
      fn()
    }
  },
}

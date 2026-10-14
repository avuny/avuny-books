// Single-flight queue: at most one refresh in flight; every other request waits (CR5).

type QueueItem = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []
let inFlight: Promise<string> | null = null

export const refreshQueue = {
  isRefreshing: () => isRefreshing || inFlight !== null,

  startRefreshing() {
    isRefreshing = true
  },

  stopRefreshing() {
    isRefreshing = false
  },

  enqueue(item: QueueItem) {
    failedQueue.push(item)
  },

  process(error: unknown, token: string | null = null) {
    for (const promise of failedQueue) {
      if (error) {
        promise.reject(error)
      } else if (token) {
        promise.resolve(token)
      }
    }
    failedQueue = []
  },

  run<T>(task: () => Promise<T>): Promise<T> {
    if (inFlight) {
      return inFlight as Promise<T>
    }
    const pending = task().finally(() => {
      inFlight = null
    }) as Promise<string>
    inFlight = pending
    return pending as Promise<T>
  },
}

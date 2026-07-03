"use client";

import { toast } from "sonner";

/**
 * sonner's toast.promise() returns the toast id (not the awaited result), so
 * `await toast.promise(p, ...)` does not actually wait for `p` to settle.
 * This wraps it to keep the toast UX while returning the real promise.
 */
export function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: (err: unknown) => string;
  },
): Promise<T> {
  toast.promise(promise, messages);
  return promise;
}

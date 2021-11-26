/**
 * Executes a promise with a given timeout.
 * If the timeout is reached, the promise will not reject
 * but returns a supplied errorValue instead
 *
 * @param milliseconds
 * @param promise
 * @param errorValue
 * @returns
 */
export function timeoutPromise<T>(
  milliseconds: number,
  promise: Promise<T>,
  errorValue: T
) {
  const timeout = new Promise<T>((resolve, reject) => {
    setTimeout(resolve, milliseconds, errorValue);
  });
  return Promise.race([timeout, promise]);
}

export {}; // only needed if imported as a module

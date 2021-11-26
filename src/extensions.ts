// From: https://stackoverflow.com/a/69887283/6597672
declare global {
  interface Promise<T> {
    /** Adds a timeout (in milliseconds) that will reject the promise when expired. */
    withTimeout(milliseconds: number): Promise<T>;
  }
}

/** Adds a timeout (in milliseconds) that will reject the promise when expired. */
Promise.prototype.withTimeout = function (milliseconds) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Timeout")),
      milliseconds
    );
    return this.then((value) => {
      clearTimeout(timeout);
      resolve(value);
    }).catch((exception) => {
      clearTimeout(timeout);
      reject(exception);
    });
  });
};

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

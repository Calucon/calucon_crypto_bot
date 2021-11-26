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

/**
 * Trims off \r and \n at the start/end of a string
 *
 * @param str
 * @returns
 */
export function trimNewlines(str: string): string {
  const result = str.match(/[^\r\n]/);
  if (!result) {
    return "";
  }
  var firstIndex = result.index || 0;
  var lastIndex = str.length - 1;
  while (str[lastIndex] === "\r" || str[lastIndex] === "\n") {
    lastIndex--;
  }
  return str.substring(firstIndex, lastIndex + 1);
}

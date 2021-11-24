/**
 * Wraps the given text in the given html tags
 *
 * @param tag html tag
 * @param str text to wrap in tags
 * @returns
 */
function wrap_tag(tag: string, str: string): string {
  return `<${tag}>${str}</${tag}>`;
}

/**
 * Bold Text
 * @param str text
 * @returns
 */
export function bold(str: string): string {
  return wrap_tag("i", str);
}

/**
 * Italic Text
 * @param str text
 * @returns
 */
export function italic(str: string): string {
  return wrap_tag("i", str);
}

/**
 * Code Text
 * @param str text
 * @returns
 */
export function code(str: string): string {
  return wrap_tag("code", str);
}

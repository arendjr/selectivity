/**
 * Returns whether the given element matches the given selector.
 */
export default function matchesSelector(el, selector) {
    const method =
        el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    return method.call(el, selector);
}

/**
 * Removes a DOM element.
 *
 * @param el The element to remove.
 */
export default function removeElement(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
}

/**
 * Parses an HTML string and returns the resulting DOM element.
 *
 * @param html HTML representation of the element to parse.
 */
export default function parseElement(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.firstChild;
}

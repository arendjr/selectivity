/**
 * Returns the CSS selector for selecting a specific item by ID.
 *
 * @param selector Generic CSS selector to identify items.
 * @param id ID of the item to select.
 */
export default function getItemSelector(selector, id) {
    const quotedId = `"${`${id}`.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    return `${selector}[data-item-id=${quotedId}]`;
}

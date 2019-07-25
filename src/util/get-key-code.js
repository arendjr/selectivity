/**
 * Returns the keyCode value of the given event.
 */
export default function getKeyCode(event) {
    return event.which || event.keyCode || 0;
}

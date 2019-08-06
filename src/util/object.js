import assign from "lodash/assign";

const { hasOwnProperty } = Object.prototype;

export { assign };

export function has(object, key) {
    return hasOwnProperty.call(object, key);
}

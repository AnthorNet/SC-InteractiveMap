/** @type {Map<string, string> | undefined} */
let translations = undefined;

export function setupTranslate({ callback, dataUrl }) {
    $.getJSON(dataUrl, (data) => {
        if (data !== undefined) {
            translations = new Map(Object.entries(data));
        }
    }).done(() => {
        callback?.();
    });
}

/**
 * Translate the given string
 *
 * @param {string} value
 * @param {string|string[]} [replace]
 * @returns
 */
export function translate(value, replace) {
    const registeredString = translations.get(value);
    if (registeredString !== undefined) {
        value = registeredString;
    }

    if (replace !== undefined) {
        if (!Array.isArray(replace)) {
            replace = [replace];
        }
        for (let i = 0; i < replace.length; i++) {
            value = value.replace("%" + (i + 1) + "$s", replace[i]);
        }
    }

    return value;
}

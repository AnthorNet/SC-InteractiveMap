/**
 * @typedef {import("./types").Reporter} Reporter
 */

import { parse } from "./Read.js"

self.onmessage = (e) => {
    /** @type {Reporter} */
    const reporter = {
        reportProgress: (data) => {
            if (data.message) {
                self.postMessage({ command: 'loaderMessage', message: data.message, replace: data.messageReplace });
            }
            if (data.progress) {
                self.postMessage({ command: 'loaderProgress', progress: data.progress });
            }
        },
        reportFailure: (data) => {
            if (data.message) {
                self.postMessage({ command: 'alert', message: data.message, replace: data.messageReplace });
            } else {
                self.postMessage({command: 'alertParsing'});
            }
        },
    };

    const result = parse(reporter, e.data);

    if (result !== undefined) {
        self.postMessage({ command: 'saveResult', result });
    }
};
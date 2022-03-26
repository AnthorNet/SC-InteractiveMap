import { parse } from "./Read.js"

self.onmessage = (e) => {
    const result = parse(self, e.data);
    if (result !== undefined) {
        self.postMessage({ command: 'saveResult', result });
    }
};
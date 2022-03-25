import { parse } from "./Read.js"

self.onmessage = (e) => {
    parse(self, e.data);
};
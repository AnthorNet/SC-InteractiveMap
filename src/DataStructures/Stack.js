/**
 * A stack data structure.
 *
 * @template T
 */
export default class Stack {
    /**
     * The last item in the stack.
     *  @type {(StackItem | undefined)}
     */
    #head = undefined;

    /**
     * The number of items in the stack.
     * @type {number}
     */
    #size = 0;

    /**
     * The number of values in the stack.
     * @returns {number}
     */
    get size() {
        return this.#size;
    }

    /**
     * The if the stack contains no values.
     * @returns {boolean}
     */
    get isEmpty() {
        return this.size === 0;
    }

    /**
     * The items that make up the stack.
     * @typedef {{prev: (StackItem | undefined), value: T}} StackItem
     */

    /**
     * Create an item to add to the stack.
     *
     * @param {T} value
     * @param {StackItem} value
     * @returns {StackItem}
     */
    #createItem(value, prev) {
        return {
            prev,
            value,
        };
    }

    /**
     * Add a value to the stack.
     *
     * @param {T} value - The value to add to stack.
     * @returns {void}
     */
    push(value) {
        const newItem = this.#createItem(value, this.#head);
        this.#head = newItem;
        this.#size++;
    }

    /**
     * Get and remove the next value from the stack.
     *
     * @returns {(T)} - The removed value or undefined if the stack was empty.
     */
    pop() {
        if (this.isEmpty) {
            throw new Error("Stack is empty");
        }

        const value = this.#head.value;
        this.#head = this.#head.prev;
        this.#size--;

        return value;
    }

    /**
     * Get the next item in the stack without removing it.
     *
     * @returns {(T)} - The next value or undefined if the stack was empty.
     */
    peek() {
        if (this.isEmpty) {
            throw new Error("Stack is empty");
        }

        return this.#head.value;
    }

    /**
     * Get a stringified representation of the stack.
     *
     * @returns {string}
     */
    toString() {
        if (this.isEmpty) {
            return "Stack {}";
        }

        let current = this.#head;
        let data = String(current.value);
        while (current.prev !== undefined) {
            current = current.prev;
            data = `${String(current.value)}, ${data}`;
        }

        return `Stack { ${data} }`;
    }

    /**
     * Get an iterator of this Stack (from top to bottom).
     *
     * @returns {Generator<T, void, void>}
     */
    *[Symbol.iterator]() {
        let current = this.#head;
        while (current !== undefined) {
            yield current.value;
            current = current.prev;
        }
    }
}

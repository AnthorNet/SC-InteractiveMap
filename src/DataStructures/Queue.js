/**
 * A queue data structure.
 *
 * @template T
 */
export default class Queue {
    /**
     * The first item in the queue.
     *  @type {(QueueItem | undefined)}
     */
    #head = undefined;

    /**
     * The last item in the queue.
     *  @type {(QueueItem | undefined)}
     */
    #tail = undefined;

    /**
     * The number of items in the queue.
     * @type {number}
     */
    #size = 0;

    /**
     * The number of values in the queue.
     * @returns {number}
     */
    get size() {
        return this.#size;
    }

    /**
     * The if the queue contains no values.
     * @returns {boolean}
     */
    get isEmpty() {
        return this.size === 0;
    }

    /**
     * The items that make up the queue.
     * @typedef {{next: (QueueItem | undefined), value: T}} QueueItem
     */

    /**
     * Create an item to add to the queue.
     *
     * @param {T} value
     * @returns {QueueItem}
     */
    #createItem(value) {
        return {
            next: undefined,
            value,
        };
    }

    /**
     * Add a value to the end of the queue.
     *
     * @param {T} value - The value to add to queue.
     * @returns {void}
     */
    enqueue(value) {
        const newItem = this.#createItem(value);

        if (this.isEmpty) {
            this.#head = newItem;
            this.#tail = newItem;
        } else {
            this.#tail.next = newItem;
            this.#tail = newItem;
        }

        this.#size++;
    }

    /**
     * Get and remove the next value from the queue.
     *
     * @returns {(T)} - The removed value or undefined if the queue was empty.
     */
    dequeue() {
        if (this.isEmpty) {
            throw new Error("Queue is empty");
        }

        const value = this.#head.value;
        this.#head = this.#head.next;
        this.#size--;

        return value;
    }

    /**
     * Get the next item in the queue without removing it.
     *
     * @returns {(T)} - The next value or undefined if the queue was empty.
     */
    peek() {
        if (this.isEmpty) {
            throw new Error("Queue is empty");
        }

        return this.#head.value;
    }

    /**
     * Get a stringified representation of the queue.
     *
     * @returns {string}
     */
    toString() {
        if (this.isEmpty) {
            return "Queue {}";
        }

        let current = this.#head;
        let data = String(current.value);
        while (current.next !== undefined) {
            current = current.next;
            data = `${data}, ${String(current.value)}`;
        }

        return `Queue { ${data} }`;
    }

    /**
     * Get an iterator of this Queue.
     *
     * @returns {Generator<T, void, void>}
     */
    *[Symbol.iterator]() {
        let current = this.#head;
        while (current !== undefined) {
            yield current.value;
            current = current.next;
        }
    }
}

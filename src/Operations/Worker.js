import Queue from "../DataStructures/Queue.js";

import operationMap from "./AllOperations.js"

/**
 * @typedef { import("./types").OperationInfo<unknown> } OperationInfo
 *
 * @typedef { import("./types").WorkerReceiveMessage } WorkerReceiveMessage
 * @typedef { import("./types").WorkerSendMessage } WorkerSendMessage
 * @typedef { import("../types").Worker<WorkerSendMessage, WorkerReceiveMessage>["postMessage"] } PostMessageFn
 */

/**
 * The states that this worker can be in.
 *
 * @readonly
 * @enum {symbol}
 */
const State = {
    READY: Symbol("Ready"),
    RUNNING: Symbol("Running"),
};

/**
 * The state the worker is in.
 *  @type {State}
 */
let state = State.READY;

/**
 * The queue of operations to perform.
 *  @type {Queue<OperationInfo>}
 */
const queue = new Queue();

/**
 * @type {PostMessageFn}
 */
const postMessage = self.postMessage;

/**
 * Add an operation to perform.
 *
 * @param {OperationInfo} operation
 */
function addOperation(operation) {
    queue.enqueue(operation);

    if (state === State.READY) {
        runNextOperation();
    }
}

/**
 * Add an operation to perform.
 */
function runNextOperation() {
    runOperation(queue.dequeue());
}

function runOperation({name, data}) {
    state = State.RUNNING;

    const timerId = `Performing operation: ${name}`;

    console.time(timerId);
    postMessage({
        command: "operation-started",
        operationName: name,
    });

    try {
        const operation = operationMap.get(name);
        if (operation === undefined) {
            throw new Error(`Unknown operation "${name}".`);
        }

        operation(data);
    } finally {
        postMessage({
            command: "operation-finished",
            operationName: name,
        });
        console.timeEnd(timerId);
    }

    state = State.READY;
}

/**
 * Listen for events to respond to.
 */
self.addEventListener(
    "message",
    /** @param {MessageEvent<WorkerReceiveMessage>} event */
    ({ data }) => {
        switch (data.command) {
            case "run-operation":
                return addOperation(data.operationInfo);
        }
    }
);

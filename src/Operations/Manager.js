/**
 * @typedef { import("./types").OperationInfo<unknown> } OperationInfo
 * @typedef { import("./types").OperationManagerOptions } OperationManagerOptions
 *
 * @typedef { import("./types").WorkerReceiveMessage } WorkerReceiveMessage
 * @typedef { import("./types").WorkerSendMessage } WorkerSendMessage
 * @typedef { import("../types").Worker<WorkerReceiveMessage, WorkerSendMessage> } Worker
 */

/**
 * Manages running operations on a save file's data.
 */
export default class OperationManager {
    /**
     * The worker that will perform the operations.
     *  @type {Worker}
     */
    #worker;

    /**
     * Constructor
     *
     * @param {OperationManagerOptions} options
     */
    constructor(options) {
        this.#worker = new Worker(options.operationWorker, { type: "module" });
        this.#worker.addEventListener(
            "message",
            this.#onWorkerMessage.bind(this)
        );
    }

    /**
     * Run an operation.
     *
     * @param {OperationInfo} operationInfo
     */
    runOperation(operationInfo) {
        this.#worker.postMessage({
            command: "run-operation",
            operationInfo,
        });
    }

    /**
     * Handle communication form the worker.
     *
     * @param {MessageEvent<WorkerSendMessage>} event
     */
    #onWorkerMessage({ data }) {
        switch (data.command) {
        }
    }
}

/* global Sentry, Intl */
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class SaveParser_Read
{
    constructor(options)
    {
        console.time('loadSave');

        this.saveParser         = options.saveParser;
        this.callback           = options.callback;
        this.language           = options.language;
        this.translate          = options.translate;

        $('#loaderProgressBar').css('display', 'flex');
        this.progressBar = $('#loaderProgressBar .progress-bar');
        this.loaderMessage = $('.loader h6');

        this.worker = new Worker(new URL("./read.worker.js", import.meta.url));

        this.worker.addEventListener('message', this._onMessage.bind(this));

        this.worker.postMessage({
            cmd: "run",
            arrayBuffer: options.saveParser.arrayBuffer,
            defaultValues: options.saveParser.defaultValues,
        });
    }

    _onMessage(event)
    {
        if (event.data.alert !== undefined) {
            BaseLayout_Modal.alert(event.data.error);
        }

        if (event.data.message) {
            this.loaderMessage.html(event.data.message);
        }
        else if (event.data.messageTranslateNumber) {
            this.loaderMessage.html(this.translate._(event.data.messageTranslateNumber[0], new Intl.NumberFormat(this.language).format(event.data.messageTranslateNumber[1])));
        }

        if (event.data.currentPercentage) {
            this.progressBar.css('width', `${event.data.currentPercentage}%`);
        }

        if (event.data.result) {
            for (const [key, value] of Object.entries(event.data.result)) {
                this.saveParser[key] = value;
            }

            this.progressBar.css('width', '100%');

            console.timeEnd('loadSave');

            if(this.callback !== null)
            {
                this.progressBar.css('width', '45%');
                this.callback();
            }

            this.worker.terminate();
        }
    }
}

/* global Intl */
import SaveParser_FicsIt from './FicsIt.js';
export default class SaveParser_Write
{
    constructor(options)
    {
        this.saveParser             = options.saveParser;
        this.baseLayout             = options.baseLayout;
        this.callback               = options.callback;

        this.language               = options.language;
        this.translate              = options.translate;
    }

    streamSave()
    {
        if(this.saveParser.header.saveVersion >= 21)
        {
            console.time('writeFileSaveAs');
            $('#loaderProgressBar').css('display', 'flex');
            this.progressBar = $('#loaderProgressBar .progress-bar');
            this.loaderMessage = $('.loader h6');

            this.worker = new Worker(new URL("./write.worker.js", import.meta.url));

            this.worker.addEventListener('message', this._onMessage.bind(this));

            this.fixSave();

            this.worker.postMessage({
                cmd: "run",
                header: this.saveParser.getHeader(),
                objects: this.saveParser.getObjects(),
                collectables: this.saveParser.getCollectables(),
                maxChunkSize: this.saveParser.maxChunkSize,
                PACKAGE_FILE_TAG: this.saveParser.PACKAGE_FILE_TAG,
                gameStatePathName: this.saveParser.gameStatePathName,
                playerHostPathName: this.saveParser.playerHostPathName,
            })
        }
        else
        {
            alert('How did you get there!!!! We should not support old save loading...');
        }
    }

    fixSave()
    {
        let objectsKeys     = Object.keys(this.objects);
        let countObjects    = objectsKeys.length;

            for(let i = 0; i < countObjects; i++)
            {
                let currentObject = this.saveParser.getTargetObject(objectsKeys[i]);
                    if(currentObject === null)
                    {
                        continue;
                    }
                    SaveParser_FicsIt.callADA(this.baseLayout, currentObject);
            }
    }

    _onMessage(event)
    {
        if (event.data.message) {
            this.loaderMessage.html(event.data.message);
        }
        else if (event.data.messageTranslate) {
            this.loaderMessage.html(this.translate._(event.data.messageTranslate));
        }
        else if (event.data.messageTranslateNumber) {
            this.loaderMessage.html(this.translate._(event.data.messageTranslateNumber[0], new Intl.NumberFormat(this.language).format(event.data.messageTranslateNumber[1])));
        }
        else if (event.data.messageTranslateNumberNumber) {
            this.loaderMessage.html(this.translate._(event.data.messageTranslateNumberNumber[0], [new Intl.NumberFormat(this.language).format(event.data.messageTranslateNumberNumber[1]), new Intl.NumberFormat(this.language).format(event.data.messageTranslateNumberNumber[2])]));
        }

        if (event.data.currentPercentage) {
            this.progressBar.css('width', `${event.data.currentPercentage}%`);
        }

        if (event.data.result) {
            saveAs(
                new Blob(
                    event.data.result,
                    {type: "application/octet-stream; charset=utf-8"}
                ), this.saveParser.fileName.replace('.sav', '') + '_CALCULATOR.sav'
            );


            window.SCIM.hideLoader();
            console.timeEnd('writeFileSaveAs');
            
            this.worker.terminate();
        }
    }
}

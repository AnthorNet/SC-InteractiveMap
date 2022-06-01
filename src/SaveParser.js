import BaseLayout_Modal                         from './BaseLayout/Modal.js';
import SaveParser_FicsIt                        from './SaveParser/FicsIt.js';
import saveAs                                   from './Lib/FileSaver.js';

export default class SaveParser
{
    constructor(options)
    {
        this.fileName               = options.fileName;
        this.arrayBuffer            = options.arrayBuffer;

        this.language               = options.language;
        this.translate              = options.translate;
        this.workers                = {SaveParserRead: options.saveParserReadWorker, SaveParserWrite: options.saveParserWriteWorker};

        this.header                 = null;
        this.PACKAGE_FILE_TAG       = null;
        this.maxChunkSize           = null;

        this.levels                 = null;
        this.objects                = null;
        this.collectables           = null;

        this.gameStatePathName      = null;
        this.playerHostPathName     = null;
    }

    load(callback = null)
    {
        console.time('loadSave');

        this.callback           = callback;
        this.header             = null;
        this.levels             = [];
        this.objects            = {};

        this.worker             = new Worker(this.workers.SaveParserRead, { type: "module" });
        this.worker.onmessage   = (e) => { this.onWorkerMessage(e.data); };
        this.worker.postMessage({
            arrayBuffer     : this.arrayBuffer,
            language        : this.language
        });

        $('#loaderProgressBar').css('display', 'flex');
        this.onWorkerMessage({command: 'loaderProgress', percentage: 0});

        delete this.arrayBuffer;
    }

    save(baseLayout, callback = null)
    {
        if(this.header.saveVersion >= 21)
        {
            console.time('writeFileSaveAs');

            this.callback           = callback;
            this.fixSave(baseLayout);

            this.worker             = new Worker(this.workers.SaveParserWrite, { type: "module" });
            this.worker.onmessage   = (e) => { this.onWorkerMessage(e.data); };
            this.worker.postMessage({
                language            : this.language,

                header              : this.header,
                objects             : this.objects,
                levels              : this.levels,
                collectables        : this.collectables,

                maxChunkSize        : this.maxChunkSize,
                PACKAGE_FILE_TAG    : this.PACKAGE_FILE_TAG,
                gameStatePathName   : this.gameStatePathName,
                playerHostPathName  : this.playerHostPathName
            });

            $('#loaderProgressBar').css('display', 'flex');
            this.onWorkerMessage({command: 'loaderProgress', percentage: 0});
        }
        else
        {
            this.onWorkerMessage({command: 'alert', message: 'How did you get there!!!! We should not support old save loading...'});
        }
    }

    fixSave(baseLayout)
    {
        let objectsKeys     = Object.keys(this.objects);
        let countObjects    = objectsKeys.length;

            for(let i = 0; i < countObjects; i++)
            {
                let currentObject = this.getTargetObject(objectsKeys[i]);
                    if(currentObject === null)
                    {
                        continue;
                    }
                    SaveParser_FicsIt.callADA(baseLayout, currentObject);
            }

        return;
    }



    onWorkerMessage(data)
    {
        switch(data.command)
        {
            case 'alert':
                return BaseLayout_Modal.alert(data.message);
            case 'alertParsing':
                return BaseLayout_Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');

            case 'loaderHide':
                window.SCIM.hideLoader();
            case 'loaderMessage':
                return $('.loader h6').html(this.translate._(data.message, data.replace));
            case 'loaderProgress':
                return $('#loaderProgressBar .progress-bar').css('width', data.percentage + '%');

            case 'transferData':
                for(const [key, value] of Object.entries(data.data))
                {
                    if(data.key !== undefined)
                    {
                        this[data.key][key] = value;
                    }
                    else
                    {
                        this[key] = value;
                    }
                }
                break;

            case 'endSaveLoading':
                console.timeEnd('loadSave');
                this.onWorkerMessage({command: 'loaderProgress', percentage: 50});

                if(this.callback !== null)
                {
                    this.callback();
                    this.callback = null;
                }
                else
                {
                    this.onWorkerMessage({command: 'loaderProgress', percentage: 100});
                }

                return this.worker.terminate();

            case 'endSaveWriting':
                console.timeEnd('writeFileSaveAs');

                saveAs(
                    new Blob(
                        data.blobArray,
                        {type: "application/octet-stream; charset=utf-8"}
                    ), this.fileName.replace('.sav', '') + '_CALCULATOR.sav'
                );

                if(this.callback !== null)
                {
                    this.callback();
                    this.callback = null;
                }
                else
                {
                    this.onWorkerMessage({command: 'loaderProgress', percentage: 100});
                    window.SCIM.hideLoader();
                }

                return this.worker.terminate();
        }
    }

    getHeader()
    {
        return this.header;
    }

    getObjects()
    {
        return this.objects;
    }

    getCollectables()
    {
        return this.collectables;
    }


    /* SAVE MANIPULATION */
    addObject(currentObject)
    {
        this.objects[currentObject.pathName] = currentObject;
    }

    getTargetObject(pathName)
    {
        // Bypass game state for easy retrievale
        if(pathName === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C' && this.gameStatePathName !== null)
        {
            pathName = this.gameStatePathName;
        }

        if(this.objects[pathName] !== undefined)
        {
            return this.objects[pathName];
        }

        return null;
    }

    deleteObject(pathName)
    {
        let currentObject = this.getTargetObject(pathName);
            if(currentObject !== null)
            {
                if(currentObject.children !== undefined && currentObject.children.length > 0)
                {
                    for(let i = 0; i < currentObject.children.length; i++)
                    {
                        if(this.objects[currentObject.children[i].pathName] !== undefined)
                        {
                            delete this.objects[currentObject.children[i].pathName];
                        }
                    }
                }

                if(this.objects[pathName] !== undefined)
                {
                    delete this.objects[pathName];
                }
            }
    }
}
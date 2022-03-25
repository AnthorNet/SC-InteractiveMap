import BaseLayout_Modal                         from './BaseLayout/Modal.js';
import SaveParser_FicsIt                        from './SaveParser/FicsIt.js';
import saveAs                                   from './Lib/FileSaver.js';

import { translate }                            from './Translate.js';

export default class SaveParser
{
    constructor(options)
    {
        this.fileName               = options.fileName;
        this.arrayBuffer            = options.arrayBuffer;

        this.language               = options.language;
        this.workers                = {SaveParserRead: options.saveParserReadWorker, SaveParserWrite: options.saveParserWriteWorker};

        this.header                 = null;
        this.PACKAGE_FILE_TAG       = null;
        this.maxChunkSize           = null;

        this.objects                = null;
        this.collectables           = null;

        this.gameStatePathName      = null;
        this.playerHostPathName     = null;

        // Holds some default values to reduce memory usage...
        this.defaultValues          = {
            rotation                    : [0, 0, 0, 1],
            translation                 : [0, 0, 0],

            mPrimaryColor               : {
                name: "mPrimaryColor",
                type: "StructProperty",
                value: {
                    type: "LinearColor",
                    values: {
                        a: 1,
                        b: 0.15631400048732758,
                        g: 0.44070500135421753,
                        r: 1
                    }
                }
            },
            mSecondaryColor             : {
                name: "mSecondaryColor",
                type: "StructProperty",
                value: {
                    type: "LinearColor",
                    values: {
                        a: 1,
                        b: 0.26225098967552185,
                        g: 0.13286800682544708,
                        r: 0.11697100102901459
                    }
                }
            }
        };
    }

    load(callback = null)
    {
        console.time('loadSave');

        this.callback           = callback;
        this.header             = null;
        this.objects            = {};

        this.worker             = new Worker(this.workers.SaveParserRead, { type: "module" });
        this.worker.onmessage   = function(e){ this.onWorkerMessage(e.data); }.bind(this);
        this.worker.postMessage({
            arrayBuffer     : this.arrayBuffer,
            defaultValues   : this.defaultValues,
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
            this.worker.onmessage   = function(e){ this.onWorkerMessage(e.data); }.bind(this);
            this.worker.postMessage({
                defaultValues       : this.defaultValues,
                language            : this.language,

                header              : this.header,
                objects             : this.objects,
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
            case 'loaderMessage':
                return $('.loader h6').html(translate(data.message, data.replace));
            case 'loaderProgress':
                return $('#loaderProgressBar .progress-bar').css('width', data.percentage + '%');

            case 'saveResult':
                for(const [key, value] of Object.entries(data.result))
                {
                    this[key] = value;
                }
                break;

            case 'endSaveLoading':
                console.timeEnd('loadSave');
                this.onWorkerMessage({command: 'loaderProgress', percentage: 45});

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
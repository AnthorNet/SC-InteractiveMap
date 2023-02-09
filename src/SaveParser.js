/* global Sentry */

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
        this.worker.onmessage   = (e) => { this.onLoadWorkerMessage(e.data); };
        this.worker.postMessage({
            arrayBuffer     : this.arrayBuffer,
            language        : this.language
        }, [this.arrayBuffer]);

        $('#loaderProgressBar').css('display', 'flex');
        this.onGenericWorkerMessage({command: 'loaderProgress', percentage: 0});

        delete this.arrayBuffer;
    }

    save(baseLayout, callback = null)
    {
        if(this.header.saveVersion >= 21)
        {
            console.time('writeFileSaveAs');

            this.callback       = callback;
            this.objectsKeys    = Object.keys(this.objects);
            this.countObjects   = this.objectsKeys.length;

            // Fix save before sending results...
            baseLayout.blueprintSubSystem.clearEmptyProxies();
            for(let i = 0; i < this.countObjects; i++)
            {
                let currentObject = this.getTargetObject(this.objectsKeys[i]);
                    if(currentObject === null)
                    {
                        continue;
                    }
                    SaveParser_FicsIt.callADA(baseLayout, currentObject);
            }

            // Prepare available levels
            this.availableLevels = [];
            for(let j = 0; j < (this.levels.length - 1); j++)
            {
                let currentLevelName = this.levels[j].replace('Level ', '').split(':');
                    currentLevelName.pop();
                    currentLevelName = currentLevelName[0].split('.').pop();

                this.availableLevels.push(currentLevelName);
            }

            // Do the magic!
            this.worker             = new Worker(this.workers.SaveParserWrite, { type: "module" });
            this.worker.onmessage   = (e) => { this.onSaveWorkerMessage(e.data); };
            this.worker.postMessage({
                language            : this.language,

                header              : this.header,
                levels              : this.levels,
                availableLevels     : this.availableLevels,

                countObjects        : this.countObjects,

                maxChunkSize        : this.maxChunkSize,
                PACKAGE_FILE_TAG    : this.PACKAGE_FILE_TAG,
                gameStatePathName   : this.gameStatePathName,
                playerHostPathName  : this.playerHostPathName
            });

            $('#loaderProgressBar').css('display', 'flex');
            this.onGenericWorkerMessage({command: 'loaderProgress', percentage: 0});
        }
        else
        {
            this.onGenericWorkerMessage({command: 'alert', message: 'How did you get there!!!! We should not support old save loading...'});
        }
    }



    onGenericWorkerMessage(data)
    {
        switch(data.command)
        {
            case 'alert':
                return BaseLayout_Modal.alert(data.message);
            case 'alertParsing':
                return BaseLayout_Modal.alert('Something went wrong while we were trying to parse your save game...<br />Please try to contact us on Twitter or Discord!<br />Source: ' + data.source);

            case 'loaderHide':
                window.SCIM.hideLoader();
            case 'loaderMessage':
                return $('.loader h6').html(this.translate._(data.message, data.replace));
            case 'loaderProgress':
                return $('#loaderProgressBar .progress-bar').css('width', data.percentage + '%');
        }
    }

    onLoadWorkerMessage(data)
    {
        switch(data.command)
        {
            case 'transferData':
                for(const [key, value] of Object.entries(data.data))
                {
                    if(key === 'header') // Console.log from worker not working correctly ^^
                    {
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('SaveHeader', value);
                        }
                        console.log(value);
                    }

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
                this.onGenericWorkerMessage({command: 'loaderProgress', percentage: 50});

                if(this.callback !== null)
                {
                    this.callback();
                    this.callback = null;
                }
                else
                {
                    this.onGenericWorkerMessage({command: 'loaderProgress', percentage: 100});
                }

                return this.worker.terminate();
        }

        return this.onGenericWorkerMessage(data);
    }

    onSaveWorkerMessage(data)
    {
        switch(data.command)
        {
            case 'requestObjectKeys':
                let currentObjectKeys = [];
                    for(let i = 0; i < this.countObjects; i++)
                    {
                        if(this.objects[this.objectsKeys[i]] !== undefined)
                        {
                            if(this.objects[this.objectsKeys[i]].levelName !== undefined && this.objects[this.objectsKeys[i]].levelName === data.levelName)
                            {
                                currentObjectKeys.push(this.objectsKeys[i]);
                                continue;
                            }
                            if(data.levelName === this.header.mapName)
                            {
                                if(this.objects[this.objectsKeys[i]].levelName !== undefined && this.availableLevels.includes(this.objects[this.objectsKeys[i]].levelName) === false)
                                {
                                    currentObjectKeys.push(this.objectsKeys[i]);
                                    continue;
                                }
                                if(this.objects[this.objectsKeys[i]].levelName === undefined)
                                {
                                    currentObjectKeys.push(this.objectsKeys[i]);
                                    continue;
                                }
                            }
                        }

                    }

                this.worker.postMessage({
                    messageId   : data.messageId,
                    command     : 'requestObjectKeys',
                    data        : currentObjectKeys
                });
                break;

            case 'requestObjects':
                let currentObjects = [];
                    for(let i = 0; i < data.objectKeys.length; i++)
                    {
                        if(this.objects[data.objectKeys[i]] !== undefined)
                        {
                            currentObjects.push(this.objects[data.objectKeys[i]]);
                        }
                    }

                this.worker.postMessage({
                    messageId   : data.messageId,
                    command     : 'requestObjects',
                    data        : currentObjects
                });
                break;

            case 'requestCollectables':
                let currentLevelCollectables = [];
                    for(let i = 0; i < this.collectables.length; i++)
                    {
                        if(this.collectables[i].levelName !== undefined && this.collectables[i].levelName === data.levelName)
                        {
                            currentLevelCollectables.push(this.collectables[i]);
                            continue;
                        }
                        if(data.levelName === this.header.mapName)
                        {
                            if(this.collectables[i].levelName !== undefined && this.availableLevels.includes(this.collectables[i].levelName) === false)
                            {
                                currentLevelCollectables.push(this.collectables[i]);
                                continue;
                            }
                            if(this.collectables[i].levelName === undefined)
                            {
                                currentLevelCollectables.push(this.collectables[i]);
                                continue;
                            }
                        }
                    }

                this.worker.postMessage({
                    messageId   : data.messageId,
                    command     : 'requestCollectables',
                    data        : currentLevelCollectables
                });
                break;

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
                    this.onGenericWorkerMessage({command: 'loaderProgress', percentage: 100});
                    window.SCIM.hideLoader();
                }

                return this.worker.terminate();
        }

        return this.onGenericWorkerMessage(data);
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
        // Mainly to handle outerPathName requests
        /*
        if(this.objects[pathName.replace(this.header.mapName + ':', '')] !== undefined)
        {
            return this.objects[pathName.replace(this.header.mapName + ':', '')];
        }
        */

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
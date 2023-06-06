/* global Sentry, Intl, self */
import pako                                     from '../Lib/pako.esm.js';

import Building_Conveyor                        from '../Building/Conveyor.js';

export default class SaveParser_Read
{
    constructor(worker, options)
    {
        this.worker             = worker;
        this.objects            = {};

        this.language           = options.language;

        this.arrayBuffer        = options.arrayBuffer;
        // Still used for header try not to shrink it too much as modMetadata can be longer than anticipated...
        this.bufferView         = new DataView(this.arrayBuffer, 0, Math.min(102400, this.arrayBuffer.byteLength));
        this.currentByte        = 0;

        this.parseSave();
    }

    parseSave()
    {
        this.header                      = {};
        this.header.saveHeaderType       = this.readInt();

        if(this.header.saveHeaderType <= 99)
        {
            this.header.saveVersion          = this.readInt();
            this.header.buildVersion         = this.readInt();
            this.header.mapName              = this.readString();
            this.header.mapOptions           = this.readString();
            this.header.sessionName          = this.readString();
            this.header.playDurationSeconds  = this.readInt();
            this.header.saveDateTime         = this.readLong();
            this.header.sessionVisibility    = this.readByte();

            if(this.header.saveHeaderType >= 7)
            {
                this.header.fEditorObjectVersion = this.readInt();
            }
            if(this.header.saveHeaderType >= 8)
            {
                this.header.modMetadata      = this.readString();
                this.header.isModdedSave     = this.readInt();
            }
            if(this.header.saveHeaderType >= 10)
            {
                this.header.saveIdentifier  = this.readString();
            }

            if(this.header.saveHeaderType >= 13)
            {
                this.header.isPartitionedWorld      = this.readInt();
                this.header.isCreativeModeEnabled   = this.readInt();
                this.header.saveDataHash            = this.readHex(20);
            }

            this.worker.postMessage({command: 'transferData', data: {header: this.header}});

            // We should now unzip the body!
            if(this.header.saveVersion >= 21)
            {
                // Remove the header...
                this.arrayBuffer        = this.arrayBuffer.slice(this.currentByte);

                this.handledByte        = 0;
                this.currentByte        = 0;
                this.maxByte            = this.arrayBuffer.byteLength;

                this.PACKAGE_FILE_TAG   = null;
                this.maxChunkSize       = null;
                this.currentChunks      = [];

                return this.inflateChunks();
            }
            else
            {
                this.worker.postMessage({command: 'alert', message: 'That save version isn\'t supported anymore... Please save it again in the game.'});
            }
        }
        else
        {
            this.worker.postMessage({command: 'alert', message: 'That save version isn\'t supported! Are you sure this is a proper save file???'});
        }
    }

    /*
     * Progress bar from 0 to 30%
     */
    inflateChunks()
    {
        while(this.handledByte < this.maxByte)
        {
            // Read chunk info size...
            let preHeader           = 0;
            let headerLength        = (this.header.saveVersion >= 41) ? 49 : 48;
            let chunkHeader         = new DataView(this.arrayBuffer.slice(preHeader, (preHeader + headerLength)));
                this.currentByte    = (preHeader + headerLength);
                this.handledByte   += (preHeader + headerLength);

            if(this.PACKAGE_FILE_TAG === null)
            {
                if(this.header.saveVersion >= 41)
                {
                    this.PACKAGE_FILE_TAG = chunkHeader.getBigUint64(0, true);
                }
                else
                {
                    this.PACKAGE_FILE_TAG = chunkHeader.getUint32(0, true);
                }

                this.worker.postMessage({command: 'transferData', data: {PACKAGE_FILE_TAG: this.PACKAGE_FILE_TAG}});
            }
            if(this.maxChunkSize === null)
            {
                this.maxChunkSize = chunkHeader.getUint32(8, true);
                this.worker.postMessage({command: 'transferData', data: {maxChunkSize: this.maxChunkSize}});
            }

            let currentChunkSize    = chunkHeader.getUint32(((this.header.saveVersion >= 41) ? 17 : 16), true); // 16 before update 8?
            let currentChunk        = this.arrayBuffer.slice(this.currentByte, this.currentByte + currentChunkSize);
                this.handledByte   += currentChunkSize;
                this.currentByte   += currentChunkSize;

            // Free memory from previous chunk...
            this.arrayBuffer            = this.arrayBuffer.slice(this.currentByte);
            this.currentByte            = 0;

            // Inflate!
            try {
                // Inflate current chunk
                let currentInflatedChunk    = null;
                    currentInflatedChunk    = pako.inflate(currentChunk);
                    this.currentChunks.push(currentInflatedChunk);
            }
            catch(error)
            {
                this.worker.postMessage({command: 'alert', message: 'Something went wrong while trying to inflate your savegame. It seems to be related to adblock and we are looking into it.'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('pako', pako);
                }

                console.log(error);
                throw new Error(error);

                this.worker.postMessage({command: 'loaderHide'});
                return;
            }

            let currentPercentage = Math.round(this.handledByte / this.maxByte * 100);
                this.worker.postMessage({command: 'loaderMessage', message: 'Inflating save game (%1$s%)...', replace: currentPercentage});
                this.worker.postMessage({command: 'loaderProgress', percentage: (currentPercentage * 0.3)});
        }

        delete this.arrayBuffer;
        console.log('Inflated: ' + this.currentChunks.length + ' chunks...');
        this.worker.postMessage({command: 'loaderMessage', message: 'Merging inflated chunks...'});

        // Create the complete Uint8Array
        let newChunkLength = 0;
            for(let i = 0; i < this.currentChunks.length; i++)
            {
                newChunkLength += this.currentChunks[i].length;
            }

        let tempChunk       = new Uint8Array(newChunkLength);
        let currentLength   = 0;
            for(let i = 0; i < this.currentChunks.length; i++)
            {
                tempChunk.set(this.currentChunks[i], currentLength);
                currentLength += this.currentChunks[i].length;
            }

        delete this.currentChunks;
        this.maxByte            = tempChunk.buffer.byteLength;
        this.bufferView         = new DataView(tempChunk.buffer);

        this.currentByte = (this.header.saveVersion >= 41) ? 8 : 4; // totalInflatedLength

        if(this.header.saveVersion >= 41)
        {
            let partitions      = {};
                partitions.unk2 = this.readInt();
                partitions.unk3 = this.readString();

                partitions.unk4 = this.readInt64();
                partitions.unk5 = this.readInt();
                partitions.unk6 = this.readString();

                partitions.unk7 = this.readInt();

                partitions.data = {};

            for(let i = 1; i < partitions.unk2; i++)
            {
                let partitionName                           = this.readString();
                    partitions.data[partitionName]          = {};
                    partitions.data[partitionName].unk1     = this.readInt();
                    partitions.data[partitionName].unk2     = this.readInt();
                    partitions.data[partitionName].levels   = {};

                let nbLevels = this.readInt();
                    for(let j = 0; j < nbLevels; j++)
                    {
                        partitions.data[partitionName].levels[this.readString()] = this.readUint();
                    }
            }

            this.worker.postMessage({command: 'transferData', data: {partitions: partitions}});
        }

        if(this.header.saveVersion >= 29)
        {
            let collectables    = [];
            let nbLevels        = this.readInt();
            let levels          = [];

            for(let j = 0; j <= nbLevels; j++)
            {
                let levelName           = (j === nbLevels) ? 'Level ' + this.header.mapName : this.readString();
                    levels.push(levelName);
                    //console.log('OBJ', levelName, this.readInt());
                    this.readInt(); // objectsBinaryLength
                let countObjects        = this.readInt();
                    if(levelName === 'Level ' + this.header.mapName)
                    {
                        console.log('Loaded ' + countObjects + ' objects...');
                    }
                let entitiesToObjects   = [];

                for(let i = 0; i < countObjects; i++)
                {
                    let objectType = this.readInt();
                        switch(objectType)
                        {
                            case 0:
                                let object                          = this.readObject();
                                    this.objects[object.pathName]   = object;
                                    entitiesToObjects[i]            = object.pathName;
                                break;
                            case 1:
                                let actor                           = this.readActor();
                                    this.objects[actor.pathName]    = actor;
                                    entitiesToObjects[i]            = actor.pathName;

                                    if(actor.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                                    {
                                        this.worker.postMessage({command: 'transferData', data: {gameStatePathName: actor.pathName}});
                                    }
                                break;
                            default:
                                console.log('Unknown object type', objectType);
                                break;
                        }

                    // Only show progress for the main level
                    if(i % 2500 === 0 && levelName === 'Level ' + this.header.mapName)
                    {
                        this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countObjects), Math.round(i / countObjects * 100)]});
                        this.worker.postMessage({command: 'loaderProgress', percentage: (30 + (i / countObjects * 15))});
                    }
                }

                let countCollected = this.readInt();
                    if(countCollected > 0)
                    {
                        for(let i = 0; i < countCollected; i++)
                        {
                            let collectable = this.readObjectProperty({});
                                collectables.push(collectable);
                        }
                    }

                    //console.log('ENT', levelName, this.readInt());
                    this.readInt(); // entitiesBinaryLength
                let countEntities       = this.readInt();
                    if(levelName === 'Level ' + this.header.mapName)
                    {
                        console.log('Loaded ' + countEntities + ' entities...');
                    }
                let objectsToFlush      = {};

                for(let i = 0; i < countEntities; i++)
                {
                    this.readEntity(entitiesToObjects[i]);

                    // Avoid memory error on very large save!
                    objectsToFlush[entitiesToObjects[i]] = this.objects[entitiesToObjects[i]];
                    delete this.objects[entitiesToObjects[i]];

                    if(i % 5000 === 0)
                    {
                        this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
                        objectsToFlush = {};
                    }

                    // Only show progress for the main level
                    if(i % 2500 === 0 && levelName === 'Level ' + this.header.mapName)
                    {
                        this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s entities (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countEntities), Math.round(i / countEntities * 100)]});
                        this.worker.postMessage({command: 'loaderProgress', percentage: (45 + (i / countEntities * 15))});
                    }
                }

                // Twice but we need to handle them in order to fetch the next level...
                countCollected = this.readInt();
                if(countCollected > 0)
                {
                    for(let i = 0; i < countCollected; i++)
                    {
                        this.readObjectProperty({});
                    }
                }

                this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
            }

            // SKIP LAST COLLECTED - They represent old actor not exisiting in game anymore

            this.worker.postMessage({command: 'transferData', data: {collectables: collectables}});
            this.worker.postMessage({command: 'transferData', data: {levels: levels}});
            this.worker.postMessage({command: 'endSaveLoading'});
            return;
        }

        return this.parseObjects();
    }

    /*
     * Progress bar from 30 to 45%
     */
    parseObjects()
    {
        let countObjects                = this.readInt();
        let entitiesToObjects           = [];
            console.log('Parsing: ' + countObjects + ' objects...');
            this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countObjects), 0]});
            this.worker.postMessage({command: 'loaderProgress', percentage: 30});

            for(let i = 0; i < countObjects; i++)
            {
                let objectType = this.readInt();
                    switch(objectType)
                    {
                        case 0:
                            let object                          = this.readObject();
                                this.objects[object.pathName]   = object;
                                entitiesToObjects[i]            = object.pathName;
                            break;
                        case 1:
                            let actor                           = this.readActor();
                                this.objects[actor.pathName]    = actor;
                                entitiesToObjects[i]            = actor.pathName;

                                if(actor.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                                {
                                    this.worker.postMessage({command: 'transferData', data: {gameStatePathName: actor.pathName}});
                                }
                            break;
                        default:
                            console.log('Unknown object type', objectType);
                            break;
                    }

                if(i % 2500 === 0)
                {
                    this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s objects (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countObjects), Math.round(i / countObjects * 100)]});
                    this.worker.postMessage({command: 'loaderProgress', percentage: (30 + (i / countObjects * 15))});
                }
            }

        return this.parseEntities(entitiesToObjects, 0, this.readInt());
    }

    /*
     * Progress bar from 45 to 60%
     */
    parseEntities(entitiesToObjects, i, countEntities)
    {
        console.log('Parsing: ' + countEntities + ' entities...');
        this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s entities (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countEntities), 0]});
        this.worker.postMessage({command: 'loaderProgress', percentage: 40});

        let objectsToFlush = {};

        for(i; i < countEntities; i++)
        {
            this.readEntity(entitiesToObjects[i]);

            // Avoid memory error on very large save!
            objectsToFlush[entitiesToObjects[i]] = this.objects[entitiesToObjects[i]];
            delete this.objects[entitiesToObjects[i]];

            if(i % 5000 === 0)
            {
                this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});
                objectsToFlush = {};
            }
            if(i % 2500 === 0)
            {
                this.worker.postMessage({command: 'loaderMessage', message: 'Parsing %1$s entities (%2$s%)...', replace: [new Intl.NumberFormat(this.language).format(countEntities), Math.round(i / countEntities * 100)]});
                this.worker.postMessage({command: 'loaderProgress', percentage: (45 + (i / countEntities * 15))});
            }
        }

        this.worker.postMessage({command: 'transferData', key: 'objects', data: objectsToFlush});

        return this.parseCollectables();
    }

    parseCollectables()
    {
        let collectables    = [];
        let countCollected  = this.readInt();
            for(let i = 0; i < countCollected; i++)
            {
                collectables.push(this.readObjectProperty({}));
            }

        this.worker.postMessage({command: 'transferData', data: {collectables: collectables}});

        delete this.bufferView;
        this.worker.postMessage({command: 'endSaveLoading'});
    }

    /*
     * Main objects
     */
    readObject()
    {
        let object                  = {};
            object.className        = this.readString();
            object                  = this.readObjectProperty(object);
            object.outerPathName    = this.readString();

        return object;
    }

    readActor()
    {
        let actor               = {};
            actor.className     = this.readString();
            actor               = this.readObjectProperty(actor);

        let needTransform       = this.readInt();
            if(needTransform !== 0)
            {
                actor.needTransform = needTransform;
            }

            // {rotation: [0, 0, 0, 1], translation: [0, 0, 0], scale3d: [1, 1, 1]}
            actor.transform     = {
                rotation            : [this.readFloat(), this.readFloat(), this.readFloat(), this.readFloat()],
                translation         : [this.readFloat(), this.readFloat(), this.readFloat()]
            };

            // Enforce bounding on the map to avoid the game from skipping physics!
            if(actor.transform.translation[0] < -500000 || actor.transform.translation[0] > 500000 || actor.transform.translation[1] < -500000 || actor.transform.translation[1] > 500000 || actor.transform.translation[2] < -500000 || actor.transform.translation[2] > 500000)
            {
                actor.transform.translation = [0, 0, 2000];
                console.log('Out of bounds translation', actor.pathName);
            }
            // Avoid lost vehicles in the game!
            if(isNaN(actor.transform.translation[0]) || isNaN(actor.transform.translation[1]) || isNaN(actor.transform.translation[2]))
            {
                actor.transform.translation = [0, 0, 2000];
                console.log('NaN translation', actor.pathName);
            }

            let scale3d = [this.readFloat(), this.readFloat(), this.readFloat()];
                if(scale3d[0] !== 1 || scale3d[1] !== 1 || scale3d[2] !== 1)
                {
                    actor.transform.scale3d = scale3d
                }

        let wasPlacedInLevel       = this.readInt();
            if(wasPlacedInLevel !== 0) //TODO: Switch to 1?
            {
                actor.wasPlacedInLevel = wasPlacedInLevel;
            }

        return actor;
    }

    readEntity(objectKey)
    {
        let entityLength                            = this.readInt();
        let startByte                               = this.currentByte;

        if(this.objects[objectKey].outerPathName === undefined)
        {
            this.objects[objectKey].entity = this.readObjectProperty({});

            let countChild  = this.readInt();
                if(countChild > 0)
                {
                    this.objects[objectKey].children = [];

                    for(let i = 0; i < countChild; i++)
                    {
                        this.objects[objectKey].children.push(this.readObjectProperty({}));
                    }
                }
        }

        if((this.currentByte - startByte) === entityLength)
        {
            this.objects[objectKey].shouldBeNulled = true;
            return;
        }

        // Read properties
        this.objects[objectKey].properties       = [];
        while(true)
        {
            let property = this.readProperty(this.objects[objectKey].className, objectKey);
                if(property === null)
                {
                    break;
                }

                if(property.name !== 'CachedActorTransform') // Should be removed on release
                {
                    this.objects[objectKey].properties.push(property);
                }
        }

        // Read Conveyor missing bytes
        if(Building_Conveyor.isConveyor(this.objects[objectKey]))
        {
            this.objects[objectKey].extra   = {count: this.readInt(), items: []};
            let itemsLength                 = this.readInt();
                for(let i = 0; i < itemsLength; i++)
                {
                    let currentItem             = {};
                    let currentItemLength       = this.readInt();
                        if(currentItemLength !== 0)
                        {
                            currentItem.length  = currentItemLength;
                        }
                        currentItem.name        = this.readString();
                        this.readString(); //currentItem.levelName   = this.readString();
                        this.readString(); //currentItem.pathName    = this.readString();
                        currentItem.position    = this.readFloat();

                    this.objects[objectKey].extra.items.push(currentItem);
                }
        }
        else
        {
            // Extra processing
            switch(this.objects[objectKey].className)
            {
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                    this.objects[objectKey].extra   = {count: this.readInt(), game: []};
                    let gameLength                  = this.readInt();

                    for(let i = 0; i < gameLength; i++)
                    {
                        this.objects[objectKey].extra.game.push(this.readObjectProperty({}));

                        if(i === 0 && this.objects[objectKey].className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                        {
                            this.worker.postMessage({command: 'transferData', data: {playerHostPathName: this.objects[objectKey].extra.game[0].pathName}});
                        }
                    }

                    break;
                case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                    let missingPlayerState                      = (startByte + entityLength) - this.currentByte;
                        this.objects[objectKey].missing         = this.readHex(missingPlayerState);
                        this.currentByte                       -= missingPlayerState; // Reset back to grab the user ID if possible!

                        if(missingPlayerState > 0)
                        {
                            this.readInt(); // Skip count
                            let playerType = this.readByte();
                                switch(playerType)
                                {
                                    case 248: // EOS
                                            this.readString();
                                        let eosStr                          = this.readString().split('|');
                                            this.objects[objectKey].eosId   = eosStr[0];
                                        break;
                                    case 249: // EOS
                                            this.readString(); // EOS, then follow 17
                                    case 17: // Old EOS
                                        let epicHexLength   = this.readByte();
                                        let epicHex         = '';
                                            for(let i = 0; i < epicHexLength; i++)
                                            {
                                                epicHex += this.readByte().toString(16).padStart(2, '0');
                                            }

                                        this.objects[objectKey].eosId       = epicHex.replace(/^0+/, '');
                                        break;
                                    case 25: // Steam
                                        let steamHexLength  = this.readByte();
                                        let steamHex        = '';
                                            for(let i = 0; i < steamHexLength; i++)
                                            {
                                                steamHex += this.readByte().toString(16).padStart(2, '0');
                                            }

                                        this.objects[objectKey].steamId     = steamHex.replace(/^0+/, '');
                                        break;
                                    case 8: // ???
                                        this.objects[objectKey].platformId  = this.readString();
                                        break;
                                    case 3: // Offline
                                        break;
                                    default:
                                        this.worker.postMessage({command: 'alertParsing'});
                                        if(typeof Sentry !== 'undefined')
                                        {
                                            Sentry.setContext('BP_PlayerState_C', this.objects[objectKey]);
                                            Sentry.setContext('playerType', playerType);
                                        }

                                        console.log(playerType, this.objects[objectKey]);
                                        //throw new Error('Unimplemented BP_PlayerState_C type: ' + playerType);

                                        // By pass, and hope that the user will still continue to send us the save!
                                        this.currentByte += missingPlayerState - 5;
                                }
                        }
                    break;
                //TODO: Not 0 here so bypass those special cases, but why? We mainly do not want to get warned here...
                case '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C':
                    let missingDrone                    = (startByte + entityLength) - this.currentByte;
                        this.objects[objectKey].missing = this.readHex(missingDrone);

                    break;
                case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                        this.objects[objectKey].extra   = {count: this.readInt(), circuits: []};
                    let circuitsLength                  = this.readInt();

                        for(let i = 0; i < circuitsLength; i++)
                        {
                            this.objects[objectKey].extra.circuits.push({
                                circuitId   : this.readInt(),
                                levelName   : this.readString(),
                                pathName    : this.readString()
                            });
                        }

                    break;
                case '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
                case '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C':
                case '/FlexSplines/PowerLine/Build_FlexPowerline.Build_FlexPowerline_C':
                case '/AB_CableMod/Visuals1/Build_AB-PLCopper.Build_AB-PLCopper_C':
                case '/AB_CableMod/Visuals1/Build_AB-PLCaterium.Build_AB-PLCaterium_C':
                case '/AB_CableMod/Visuals3/Build_AB-PLHeavy.Build_AB-PLHeavy_C':
                case '/AB_CableMod/Visuals4/Build_AB-SPLight.Build_AB-SPLight_C':
                case '/AB_CableMod/Visuals3/Build_AB-PLPaintable.Build_AB-PLPaintable_C':
                    this.objects[objectKey].extra       = {
                        count   : this.readInt(),
                        source  : this.readObjectProperty({}),
                        target  : this.readObjectProperty({})
                    };

                    // 2022-10-18: Added Cached locations for wire locations for use in visualization in blueprint hologram (can't depend on connection components)
                    if(this.header.saveVersion >= 33)
                    {
                        this.objects[objectKey].extra.sourceTranslation = [this.readFloat(), this.readFloat(), this.readFloat()];
                        this.objects[objectKey].extra.targetTranslation = [this.readFloat(), this.readFloat(), this.readFloat()];
                    }

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C':
                case '/x3_mavegrag/Vehicles/Trains/Locomotive_Mk1/BP_X3Locomotive_Mk1.BP_X3Locomotive_Mk1_C':
                case '/x3_mavegrag/Vehicles/Trains/CargoWagon_Mk1/BP_X3CargoWagon_Mk1.BP_X3CargoWagon_Mk1_C':
                        this.objects[objectKey].extra   = {count: this.readInt(), objects: []};
                    let trainLength                     = this.readInt();
                        for(let i = 0; i < trainLength; i++)
                        {
                            this.objects[objectKey].extra.objects.push({
                                name   : this.readString(),
                                unk    : this.readHex(53)
                            });
                        }

                    this.objects[objectKey].extra.previous  = this.readObjectProperty({});
                    this.objects[objectKey].extra.next      = this.readObjectProperty({});
                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C':
                case '/x3_mavegrag/Vehicles/Trucks/TruckMk1/BP_X3Truck_Mk1.BP_X3Truck_Mk1_C':
                        this.objects[objectKey].extra   = {count: this.readInt(), objects: []};
                    let vehicleLength                   = this.readInt();
                        for(let i = 0; i < vehicleLength; i++)
                        {
                            this.objects[objectKey].extra.objects.push({
                                name   : this.readString(),
                                unk    : this.readHex(53)
                            });
                        }
                    break;
                default:
                    let missingBytes = (startByte + entityLength) - this.currentByte;
                        if(missingBytes > 4)
                        {
                            this.objects[objectKey].missing = this.readHex(missingBytes); // TODO
                            console.log('MISSING ' + missingBytes + '  BYTES', this.objects[objectKey]);
                        }
                        else
                        {
                            this.skipBytes(4);
                        }

                    break;
            }
        }
    }

    /*
     * Properties types
     */
    readProperty(parentType = null, objectKey = null)
    {
        let currentProperty         = {};
            currentProperty.name    = this.readString();

        if(currentProperty.name === 'None')
        {
            return null;
        }

        //TODO: What is this extra byte that is appearing sometime?
        let extraByteTest       = this.readByte();
            if(extraByteTest !== 0)
            {
                this.currentByte -= 1;
            }
            else
            {
                console.log('Property extra byte', currentProperty);

                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                    if(objectKey !== null)
                    {
                        Sentry.setContext('object', this.objects[objectKey]);
                    }
                    Sentry.captureMessage('Property extra byte');
                }
            }

        currentProperty.type    = this.readString().replace('Property', '');
                                  this.readInt(); // Length of the property, this is calculated when writing back ;)

        let index = this.readInt();
            if(index !== 0)
            {
                currentProperty.index = index;
            }

        switch(currentProperty.type)
        {
            case 'Bool':
                currentProperty.value   = this.readByte();
                currentProperty         = this.readPropertyGUID(currentProperty);
                break;

            case 'Int8':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readInt8();
                break;

            case 'Int':
            case 'UInt32': // Mod?
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readInt();
                break;

            case 'Int64':
            case 'UInt64':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readLong();
                break;

            case 'Float':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readFloat();
                break;

            case 'Double':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readDouble();
                break;

            case 'Str':
            case 'Name':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readString();
                break;

            case 'Object':
            case 'Interface':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty.value   = this.readObjectProperty({});
                break;

            case 'Enum':
                let enumPropertyName        = this.readString();
                    currentProperty         = this.readPropertyGUID(currentProperty);
                    currentProperty.value   = {
                        name    : enumPropertyName,
                        value   : this.readString()
                    };
                break;

            case 'Byte':
                let enumName            = this.readString(); //TODO
                    currentProperty     = this.readPropertyGUID(currentProperty);

                if(enumName === 'None')
                {
                    currentProperty.value = {
                        enumName: enumName,
                        value: this.readByte()
                    };
                }
                else
                {
                    currentProperty.value = {
                        enumName: enumName,
                        valueName: this.readString()
                    };
                }
                break;

            case 'Text':
                currentProperty         = this.readPropertyGUID(currentProperty);
                currentProperty         = this.readTextProperty(currentProperty);
                break;

            case 'Array':
                currentProperty         = this.readArrayProperty(currentProperty, parentType);
                break;

            case 'Map':
                currentProperty         = this.readMapProperty(currentProperty, parentType);
                break;

            case 'Set':
                currentProperty         = this.readSetProperty(currentProperty, parentType);
                break;

            case 'Struct':
                currentProperty         = this.readStructProperty(currentProperty, parentType);
                break;

            default:
                let rewind = this.lastStrRead + 128;
                    this.currentByte -= rewind;

                if(objectKey !== null)
                {
                    console.log(this.objects[objectKey]);
                }

                console.log(this.lastStrRead, this.readHex(rewind), this.readInt(), this.readInt(), this.readInt(), this.readInt());
                this.worker.postMessage({command: 'alertParsing', source: 'readProperty'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }

                console.log('Unimplemented type `' + currentProperty.type + '` in Property `' + currentProperty.name + '` (' + this.currentByte + ')');
                throw new Error('Unimplemented type `' + currentProperty.type + '` in Property `' + currentProperty.name + '` (' + this.currentByte + ')');
        }

        return currentProperty;
    }

    readArrayProperty(currentProperty, parentType)
    {
            currentProperty.value       = {type: this.readString().replace('Property', ''), values: []};
            this.skipBytes();
        let currentArrayPropertyCount   = this.readInt();

        switch(currentProperty.value.type)
        {
            case 'Byte':
                switch(currentProperty.name)
                {
                    case 'mFogOfWarRawData':
                        for(let i = 0; i < (currentArrayPropertyCount / 4); i++)
                        {
                            this.readByte(); // 0
                            this.readByte(); // 0
                            currentProperty.value.values.push(this.readByte());
                            this.readByte(); // 255
                        }
                        break;
                    default:
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readByte());
                        }
                }
                break;

            case 'Bool':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readByte());
                }
                break;

            case 'Int':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readInt());
                }
                break;

            case 'Int64':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readLong());
                }
                break;

            case 'Float':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readFloat());
                }
                break;

            case 'Enum':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push({name: this.readString()});
                }
                break;
            case 'Str':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readString());
                }
                break;
            case 'Text':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readTextProperty({}));
                }
                break;

            case 'Object':
            case 'Interface':
                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    currentProperty.value.values.push(this.readObjectProperty({}));
                }
                break;

            case 'Struct':
                this.readString(); // Same as currentProperty.name
                this.readString(); // StructProperty

                this.readInt(); // structureSize
                this.readInt(); // 0

                currentProperty.structureSubType    = this.readString();

                let propertyGuid1 = this.readInt();
                let propertyGuid2 = this.readInt();
                let propertyGuid3 = this.readInt();
                let propertyGuid4 = this.readInt();
                    if(propertyGuid1 !== 0)
                    {
                        currentProperty.propertyGuid1 = propertyGuid1;
                    }
                    if(propertyGuid2 !== 0)
                    {
                        currentProperty.propertyGuid2 = propertyGuid2;
                    }
                    if(propertyGuid3 !== 0)
                    {
                        currentProperty.propertyGuid3 = propertyGuid3;
                    }
                    if(propertyGuid4 !== 0)
                    {
                        currentProperty.propertyGuid4 = propertyGuid4;
                    }

                this.skipBytes(1);

                for(let i = 0; i < currentArrayPropertyCount; i++)
                {
                    switch(currentProperty.structureSubType)
                    {
                        case 'InventoryItem': // MOD: FicsItNetworks
                            currentProperty.value.values.push({
                                unk1          : this.readInt(),
                                itemName      : this.readString(),
                                levelName     : this.readString(),
                                pathName      : this.readString()
                            });
                            break;

                        case 'Guid':
                            currentProperty.value.values.push(this.readHex(16));
                            break;

                        case 'FINNetworkTrace': // MOD: FicsIt-Networks
                            currentProperty.value.values.push(this.readFINNetworkTrace());
                            break;

                        case 'Vector':
                            currentProperty.value.values.push({
                                x           : this.readFloat(),
                                y           : this.readFloat(),
                                z           : this.readFloat()
                            });
                            break;

                        case 'LinearColor':
                            currentProperty.value.values.push({
                                r : this.readFloat(),
                                g : this.readFloat(),
                                b : this.readFloat(),
                                a : this.readFloat()
                            });
                            break;

                        // MOD: FicsIt-Networks
                        // See: https://github.com/CoderDE/FicsIt-Networks/blob/3472a437bcd684deb7096ede8f03a7e338b4a43d/Source/FicsItNetworks/Computer/FINComputerGPUT1.h#L42
                        case 'FINGPUT1BufferPixel':
                            currentProperty.value.values.push(this.readFINGPUT1BufferPixel());
                            break;

                        default: // Try normalised structure, then throw Error if not working...
                            try
                            {
                                let subStructProperties = [];
                                    while(true)
                                    {
                                        let subStructProperty = this.readProperty(currentProperty.structureSubType);
                                            if(subStructProperty === null)
                                            {
                                                break;
                                            }

                                        subStructProperties.push(subStructProperty);
                                    }
                                currentProperty.value.values.push(subStructProperties);
                            }
                            catch(error)
                            {
                                this.worker.postMessage({command: 'alertParsing', source: 'readArrayProperty/structureSubType'});
                                if(typeof Sentry !== 'undefined')
                                {
                                    Sentry.setContext('currentProperty', currentProperty);
                                }

                                console.log(error);
                                console.log('Unimplemented structureSubType `' + currentProperty.structureSubType + '` in ArrayProperty `' + currentProperty.name + '`');
                                throw new Error('Unimplemented structureSubType `' + currentProperty.structureSubType + '` in ArrayProperty `' + currentProperty.name + '`');
                            }
                    }
                }

                break;

            default:
                this.worker.postMessage({command: 'alertParsing', source: 'readArrayProperty'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }

                console.log('Unimplemented type `' + currentProperty.value.type + '` in ArrayProperty `' + currentProperty.name + '`');
                throw new Error('Unimplemented type `' + currentProperty.value.type + '` in ArrayProperty `' + currentProperty.name + '`');
        }

        return currentProperty;
    }

    readMapProperty(currentProperty, parentType)
    {
        currentProperty.value = {
            keyType         : this.readString().replace('Property', ''),
            valueType       : this.readString().replace('Property', ''),
            values          : []
        };

        this.skipBytes(1);
        currentProperty.value.modeType = this.readInt();

        if(currentProperty.value.modeType === 2)
        {
            currentProperty.value.modeUnk2 = this.readString();
            currentProperty.value.modeUnk3 = this.readString();
        }
        if(currentProperty.value.modeType === 3)
        {
            currentProperty.value.modeUnk1 = this.readHex(9);
            currentProperty.value.modeUnk2 = this.readString();
            currentProperty.value.modeUnk3 = this.readString();
        }

        /*
        if(parentType === '/KeysForAll/KSUb.KSUb_C')
        {
            console.log(this.readInt());
            let unk1 = this.readString();
                console.log(unk1);
                if(unk1 !== ' ')
                {
                    currentProperty.value.unk1 = unk1;
                }
                else
                {
                    console.log('rewind?');
                    this.currentByte -= 4;
                }
        }
        */

        let currentMapPropertyCount = this.readInt();
            for(let iMapProperty = 0; iMapProperty < currentMapPropertyCount; iMapProperty++)
            {
                let mapPropertyKey;
                let mapPropertySubProperties    = [];

                    switch(currentProperty.value.keyType)
                    {
                        case 'Int':
                            mapPropertyKey = this.readInt();
                            break;
                        case 'Int64':
                            mapPropertyKey = this.readLong();
                            break;
                        case 'Name':
                        case 'Str':
                            mapPropertyKey = this.readString();
                            break;
                        case 'Object':
                            mapPropertyKey = this.readObjectProperty({});
                            break;
                        case 'Enum':
                            mapPropertyKey = {
                                name        : this.readString()
                            };
                            break;
                        case 'Struct':
                            if(currentProperty.name === 'Destroyed_Foliage_Transform' || parentType === '/BuildGunUtilities/BGU_Subsystem.BGU_Subsystem_C') // Mod: Universal Destroyer/Factory Statistics
                            {
                                mapPropertyKey = {
                                    x: this.readFloat(),
                                    y: this.readFloat(),
                                    z: this.readFloat()
                                };
                                break;
                            }

                            mapPropertyKey = [];
                            while(true)
                            {
                                let subMapPropertyValue = this.readProperty();
                                    if(subMapPropertyValue === null)
                                    {
                                        break;
                                    }

                                mapPropertyKey.push(subMapPropertyValue);
                            }
                            break;
                        default:
                            this.worker.postMessage({command: 'alertParsing', source: 'readMapProperty/keyType'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }

                            console.log('Unimplemented keyType `' + currentProperty.value.keyType + '` in MapProperty `' + currentProperty.name + '`');
                            throw new Error('Unimplemented keyType `' + currentProperty.value.keyType + '` in MapProperty `' + currentProperty.name + '`');
                    }

                    switch(currentProperty.value.valueType)
                    {
                        case 'Byte':
                            if(currentProperty.value.keyType === 'Str')
                            {
                                mapPropertySubProperties = this.readString();
                            }
                            else
                            {
                                mapPropertySubProperties = this.readByte();
                            }
                            break;
                        case 'Bool':
                            mapPropertySubProperties = this.readByte();
                            break;
                        case 'Int':
                            mapPropertySubProperties = this.readInt();
                            break;
                        case 'Float':
                            mapPropertySubProperties = this.readFloat();
                            break;
                        case 'Str':
                            mapPropertySubProperties = this.readString();
                            break;
                        case 'Object':
                            mapPropertySubProperties = this.readObjectProperty({});
                            break;
                        case 'Struct':
                            if(parentType === 'LBBalancerData')
                            {
                                mapPropertySubProperties.mNormalIndex   = this.readInt();
                                mapPropertySubProperties.mOverflowIndex = this.readInt();
                                mapPropertySubProperties.mFilterIndex   = this.readInt();
                                break;
                            }
                            if(parentType === '/StorageStatsRoom/Sub_SR.Sub_SR_C')
                            {
                                mapPropertySubProperties.unk1           = this.readFloat();
                                mapPropertySubProperties.unk2           = this.readFloat();
                                mapPropertySubProperties.unk3           = this.readFloat();
                                break;
                            }

                            while(true)
                            {
                                let subMapProperty = this.readProperty();
                                    if(subMapProperty === null)
                                    {
                                        break;
                                    }

                                mapPropertySubProperties.push(subMapProperty);
                            }
                            break;
                        default:
                            this.worker.postMessage({command: 'alertParsing', source: 'readMapProperty/valueType'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }

                            console.log('Unimplemented valueType `' + currentProperty.value.valueType + '` in MapProperty `' + currentProperty.name + '`');
                            throw new Error('Unimplemented valueType `' + currentProperty.value.valueType + '` in MapProperty `' + currentProperty.name + '`');
                    }

                currentProperty.value.values[iMapProperty]    = {
                    keyMap      : mapPropertyKey,
                    valueMap    : mapPropertySubProperties
                };
            }

        return currentProperty;
    }

    readSetProperty(currentProperty, parentType)
    {
        currentProperty.value = {type: this.readString().replace('Property', ''), values: []};
        this.skipBytes(5); // skipByte(1) + 0

        let setPropertyLength = this.readInt();
            for(let iSetProperty = 0; iSetProperty < setPropertyLength; iSetProperty++)
            {
                switch(currentProperty.value.type)
                {
                    case 'Object':
                        currentProperty.value.values.push(this.readObjectProperty({}));
                        break;
                    case 'Struct':
                        if(this.header.saveVersion >= 29 && parentType === '/Script/FactoryGame.FGFoliageRemoval')
                        {
                            currentProperty.value.values.push({
                                x: this.readFloat(),
                                y: this.readFloat(),
                                z: this.readFloat()
                            });
                            break;
                        }
                        // MOD: FicsIt-Networks
                        currentProperty.value.values.push(this.readFINNetworkTrace());
                        break;
                    case 'Name':  // MOD: Sweet Transportal
                        currentProperty.value.values.push({name: this.readString()});
                        break;
                    case 'Int':  // MOD: ???
                        currentProperty.value.values.push({int: this.readInt()});
                        break;
                    default:
                        let rewind = this.lastStrRead + 128;
                            this.currentByte -= rewind;
                        console.log(this.lastStrRead, this.readHex(rewind), this.readInt(), this.readInt(), this.readInt(), this.readInt());
                        this.worker.postMessage({command: 'alertParsing', source: 'readSetProperty'});
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('currentProperty', currentProperty);
                        }

                        console.log('Unimplemented type `' + currentProperty.value.type + '` in SetProperty `' + currentProperty.name + '` (' + this.currentByte + ')');
                        throw new Error('Unimplemented type `' + currentProperty.value.type + '` in SetProperty `' + currentProperty.name + '` (' + this.currentByte + ')');
                }
            }

        return currentProperty;
    }

    readStructProperty(currentProperty, parentType)
    {
        currentProperty.value = {type: this.readString()};
        this.skipBytes(17); // 0 0 0 0 + skipByte(1)

        switch(currentProperty.value.type)
        {
            case 'Color':
                currentProperty.value.values = {
                    b           : this.readByte(),
                    g           : this.readByte(),
                    r           : this.readByte(),
                    a           : this.readByte()
                };

                break;

            case 'LinearColor':
                currentProperty.value.values ={
                    r           : this.readFloat(),
                    g           : this.readFloat(),
                    b           : this.readFloat(),
                    a           : this.readFloat()
                };
                break;

            case 'Vector':
            case 'Rotator':
                if(this.header.saveVersion >= 41)
                {
                    currentProperty.value.values = {
                        x           : this.readDouble(),
                        y           : this.readDouble(),
                        z           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.values = {
                        x           : this.readFloat(),
                        y           : this.readFloat(),
                        z           : this.readFloat()
                    };
                }
                break;

            case 'Vector2D': // Mod?
                currentProperty.value.values = {
                    x           : this.readFloat(),
                    y           : this.readFloat()
                };

                break;

            case 'Quat':
            case 'Vector4':
                if(this.header.saveVersion >= 41)
                {
                    currentProperty.value.values = {
                        a           : this.readDouble(),
                        b           : this.readDouble(),
                        c           : this.readDouble(),
                        d           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.values = {
                        a           : this.readFloat(),
                        b           : this.readFloat(),
                        c           : this.readFloat(),
                        d           : this.readFloat()
                    };
                }
                break;

            case 'Box':
                if(this.header.saveVersion >= 41)
                {
                    currentProperty.value.min = {
                        x           : this.readDouble(),
                        y           : this.readDouble(),
                        z           : this.readDouble()
                    };
                    currentProperty.value.max = {
                        x           : this.readDouble(),
                        y           : this.readDouble(),
                        z           : this.readDouble()
                    };
                }
                else
                {
                    currentProperty.value.min = {
                        x           : this.readFloat(),
                        y           : this.readFloat(),
                        z           : this.readFloat()
                    };
                    currentProperty.value.max = {
                        x           : this.readFloat(),
                        y           : this.readFloat(),
                        z           : this.readFloat()
                    };
                }

                currentProperty.value.isValid = this.readByte();
                break;

            case 'RailroadTrackPosition':
                currentProperty.value               = this.readObjectProperty(currentProperty.value);
                currentProperty.value.offset        = this.readFloat();
                currentProperty.value.forward       = this.readFloat();

                break;

            case 'TimerHandle':
                currentProperty.value.handle        = this.readString();

                break;

            case 'Guid': // MOD?
                currentProperty.value.guid          = this.readHex(16);
                break;

            case 'InventoryItem':
                currentProperty.value.unk1          = this.readInt();
                currentProperty.value.itemName      = this.readString();
                currentProperty.value               = this.readObjectProperty(currentProperty.value);
                currentProperty.value.properties    = [];
                currentProperty.value.properties.push(this.readProperty());
                break;

            case 'FluidBox':
                currentProperty.value.value         = this.readFloat();
                break;

            case 'SlateBrush': // MOD?
                currentProperty.value.unk1          = this.readString();
                break;

            case 'DateTime': // MOD: Power Suit
                currentProperty.value.dateTime      = this.readLong();
                break;

            case 'FINNetworkTrace': // MOD: FicsIt-Networks
                currentProperty.value.values        = this.readFINNetworkTrace();
                break;
            case 'FINLuaProcessorStateStorage': // MOD: FicsIt-Networks
                currentProperty.value.values        = this.readFINLuaProcessorStateStorage();
                break;
            case 'FICFrameRange': // https://github.com/Panakotta00/FicsIt-Cam/blob/c55e254a84722c56e1badabcfaef1159cd7d2ef1/Source/FicsItCam/Public/Data/FICTypes.h#L34
                currentProperty.value.begin         = this.readLong();
                currentProperty.value.end           = this.readLong();
                break;

            default: // Try normalised structure, then throw Error if not working...
                try
                {
                    currentProperty.value.values = [];
                    while(true)
                    {
                        let subStructProperty = this.readProperty(currentProperty.value.type);
                            if(subStructProperty === null)
                            {
                                break;
                            }

                        currentProperty.value.values.push(subStructProperty);

                        if(subStructProperty.value !== undefined && subStructProperty.value.properties !== undefined && subStructProperty.value.properties.length === 1 && subStructProperty.value.properties[0] === null)
                        {
                            break;
                        }
                    }
                }
                catch(error)
                {
                    this.worker.postMessage({command: 'alertParsing', source: 'readStructProperty'});
                    if(typeof Sentry !== 'undefined')
                    {
                        Sentry.setContext('currentProperty', currentProperty);
                    }

                    console.log(error);
                    console.log('Unimplemented type `' + currentProperty.value.type + '` in StructProperty `' + currentProperty.name + '`');
                    throw new Error('Unimplemented type `' + currentProperty.value.type + '` in StructProperty `' + currentProperty.name + '`');
                }
        }

        return currentProperty;
    }


    /*
    // ETextHistoryType
    const HISTORYTYPE_BASE = 0;
    const HISTORYTYPE_NAMEDFORMAT = 1;
    const HISTORYTYPE_ORDEREDFORMAT = 2;
    const HISTORYTYPE_ARGUMENTFORMAT = 3;
    const HISTORYTYPE_ASNUMBER = 4;
    const HISTORYTYPE_ASPERCENT = 5;
    const HISTORYTYPE_ASCURRENCY = 6;
    const HISTORYTYPE_ASDATE = 7;
    const HISTORYTYPE_ASTIME = 8;
    const HISTORYTYPE_ASDATETIME = 9;
    const HISTORYTYPE_TRANSFORM = 10;
    const HISTORYTYPE_STRINGTABLEENTRY = 11;
    const HISTORYTYPE_NONE = 255; // -1
    // EFormatArgumentType
    const FORMATARGUMENTTYPE_INT = 0;
    const FORMATARGUMENTTYPE_UINT = 1;
    const FORMATARGUMENTTYPE_FLOAT = 2;
    const FORMATARGUMENTTYPE_DOUBLE = 3;
    const FORMATARGUMENTTYPE_TEXT = 4;
    const FORMATARGUMENTTYPE_GENDER = 5;
    */
    readTextProperty(currentProperty)
    {
        currentProperty.flags       = this.readInt();
        currentProperty.historyType = this.readByte();

        switch(currentProperty.historyType)
        {
            // HISTORYTYPE_BASE
            case 0:
                currentProperty.namespace       = this.readString();
                currentProperty.key             = this.readString();
                currentProperty.value           = this.readString();
                break;
            // HISTORYTYPE_NAMEDFORMAT
            case 1:
            // HISTORYTYPE_ARGUMENTFORMAT
            case 3:
                currentProperty.sourceFmt       = this.readTextProperty({});

                currentProperty.argumentsCount  = this.readInt();
                currentProperty.arguments       = [];

                for(let i = 0; i < currentProperty.argumentsCount; i++)
                {
                    let currentArgumentsData                = {};
                        currentArgumentsData.name           = this.readString();
                        currentArgumentsData.valueType      = this.readByte();

                        switch(currentArgumentsData.valueType)
                        {
                            case 4:
                                currentArgumentsData.argumentValue    = this.readTextProperty({});
                                break;
                            default:
                                this.worker.postMessage({command: 'alertParsing'});
                                if(typeof Sentry !== 'undefined')
                                {
                                    Sentry.setContext('currentProperty', currentProperty);
                                    Sentry.setContext('currentArgumentsData', currentArgumentsData);
                                }
                                throw new Error('Unimplemented FormatArgumentType `' + currentArgumentsData.valueType + '` in TextProperty `' + currentProperty.name + '`');
                        }

                    currentProperty.arguments.push(currentArgumentsData);
                }
                break;
            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L2268
            // HISTORYTYPE_TRANSFORM
            case 10:
                currentProperty.sourceText          = this.readTextProperty({});
                currentProperty.transformType       = this.readByte();
                break;
            // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/TextHistory.cpp#L2463
            //HISTORYTYPE_STRINGTABLEENTRY
            case 11:
                currentProperty.tableId             = this.readString();
                currentProperty.textKey             = this.readString();
                break;
            // HISTORYTYPE_NONE
            case 255:
                // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/Text.cpp#L894
                if(this.header.buildVersion >= 140822)
                {
                    currentProperty.hasCultureInvariantString   = this.readInt();

                    if(currentProperty.hasCultureInvariantString === 1)
                    {
                        currentProperty.value = this.readString();
                    }
                }
                break;
            default:
                this.worker.postMessage({command: 'alertParsing'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }
                throw new Error('Unimplemented historyType `' + currentProperty.historyType + '` in TextProperty `' + currentProperty.name + '`');
        }

        return currentProperty;
    }

    readObjectProperty(currentProperty)
    {
        let levelName   = this.readString();
            if(levelName !== this.header.mapName)
            {
                currentProperty.levelName   = levelName;
                currentProperty.pathName    = this.readString();
            }
            else
            {
                currentProperty.pathName    = this.readString();
                //currentProperty.pathName    = this.readString().replace(this.header.mapName + ':', '');
            }

        return currentProperty;
    }

    readPropertyGUID(currentProperty)
    {
        let hasPropertyGuid         = this.readByte();
            if(hasPropertyGuid === 1)
            {
                currentProperty.propertyGuid = this.readHex(16);
            }

        return currentProperty;
    }





    /*
     * BYTES MANIPULATIONS
     */
    skipBytes(byteLength = 1)
    {
        this.currentByte += byteLength;
    }
    readByte()
    {
        return parseInt(this.bufferView.getUint8(this.currentByte++, true));
    }
    readHex(hexLength)
    {
        let hexPart = [];
            for(let i = 0; i < hexLength; i++)
            {
                let currentHex = String.fromCharCode(
                        this.bufferView.getUint8(this.currentByte++, true)
                    );
                    hexPart.push(currentHex);
            }

        return hexPart.join('');
    }

    readInt8()
    {
        let data = this.bufferView.getInt8(this.currentByte++, true);
            return data;
    }
    readInt()
    {
        let data = this.bufferView.getInt32(this.currentByte, true);
            this.currentByte += 4;
            return data;
    }
    readLong()
    {
        let data1   = this.readInt();
        let data2   = this.readInt();

            if(data2 === 0)
            {
                return data1;
            }
            else
            {
                return [data1, data2];
            }
    }

    readFloat()
    {
        let data = this.bufferView.getFloat32(this.currentByte, true);
            this.currentByte += 4;
            return data;
    }
    readDouble()
    {
        let data = this.bufferView.getFloat64(this.currentByte, true);
            this.currentByte += 8;
            return data;
    }

    readString()
    {
        let strLength       = this.readInt();
        this.lastStrRead    = strLength;
        let startBytes      = this.currentByte;

        if(strLength === 0)
        {
            return '';
        }

        // Range error!
        if(strLength > (this.maxByte - this.currentByte))
        {
            let debugSize       = 512;
            this.currentByte    = Math.max(0, startBytes - (debugSize * 2));
            let errorMessage    = 'Cannot readString (' + strLength + '): `' + this.readHex(debugSize * 2) + '`=========`' + this.readHex(debugSize) + '`';
                console.log(errorMessage);
                this.worker.postMessage({command: 'alertParsing'});
                throw new Error(errorMessage);
        }

        // UTF16
        if(strLength < 0)
        {
                strLength   = -strLength - 1;
            let string      = [];

            for(let i = 0; i < strLength; ++i)
            {
                let caracter = String.fromCharCode(
                        this.bufferView.getUint16(this.currentByte++, true)
                    );
                    string.push(caracter);
                    this.currentByte++;
            }
            this.currentByte++;
            this.currentByte++;

            return string.join('');
        }

        try
        {
                strLength   = strLength -1;
            let string      = [];

            for(let i = 0; i < strLength; i++)
            {
                string.push(String.fromCharCode(
                    this.bufferView.getUint8(this.currentByte++, true)
                ));
            }
            this.currentByte++;

            return string.join('');
        }
        catch(error)
        {
            let debugSize       = 512;
            this.currentByte    = Math.max(0, startBytes - (debugSize * 2));
            let errorMessage    = 'Cannot readString (' + strLength + '): `' + this.readHex(debugSize * 2) + '`=========`' + this.readHex(debugSize) + '`';
                console.log(error);
                console.log(errorMessage);
                this.worker.postMessage({command: 'alertParsing'});
                throw new Error(errorMessage);
        }
    }

    /*
     * FicsIt-Networks properties
     */
    readFINGPUT1BufferPixel()
    {
        return {
            character           : this.readHex(2),
            foregroundColor     : {
                r : this.readFloat(),
                g : this.readFloat(),
                b : this.readFloat(),
                a : this.readFloat()
            },
            backgroundColor     : {
                r : this.readFloat(),
                g : this.readFloat(),
                b : this.readFloat(),
                a : this.readFloat()
            }
        };
    }

    // https://github.com/CoderDE/FicsIt-Networks/blob/ab918a81a8a7527aec0cf6cd35270edfc5a1ddfe/Source/FicsItNetworks/Network/FINNetworkTrace.cpp#L154
    readFINNetworkTrace()
    {
        let data            = {};
            data.levelName  = this.readString();
            data.pathName   = this.readString();

            let hasPrev = this.readInt();
                if(hasPrev === 1)
                {
                    data.prev  = this.readFINNetworkTrace();
                }
            let hasStep = this.readInt();
                if(hasStep === 1)
                {
                    data.step  = this.readString();
                }

        return data;
    }

    // https://github.com/CoderDE/FicsIt-Networks/blob/master/Source/FicsItNetworks/FicsItKernel/Processor/Lua/LuaProcessorStateStorage.cpp#L6
    readFINLuaProcessorStateStorage()
    {
        let data            = {trace: [], reference: [], structs: []};
        let countTrace      = this.readInt();
            for(let i = 0; i < countTrace; i++)
            {
                data.trace.push(this.readFINNetworkTrace());
            }

        let countReference  = this.readInt();
            for(let i = 0; i < countReference; i++)
            {
                data.reference.push({
                    levelName: this.readString(),
                    pathName: this.readString()
                });
            }

        data.thread         = this.readString();
        data.globals        = this.readString();

        let countStructs    = this.readInt();
            data.structs    = [];

            for(let i = 0; i < countStructs; i++)
            {
                let structure = {};
                    structure.unk1  = this.readInt();
                    structure.unk2  = this.readString();

                    switch(structure.unk2)
                    {
                        case '/Script/CoreUObject.Vector':
                            structure.x         = this.readFloat();
                            structure.y         = this.readFloat();
                            structure.z         = this.readFloat();
                            break;
                        case '/Script/CoreUObject.LinearColor':
                            structure.r         = this.readFloat();
                            structure.g         = this.readFloat();
                            structure.b         = this.readFloat();
                            structure.a         = this.readFloat();
                            break;
                        case '/Script/FactoryGame.InventoryStack':
                            structure.unk3      = this.readInt();
                            structure.unk4      = this.readString();
                            structure.unk5      = this.readInt();
                            structure.unk6      = this.readInt();
                            structure.unk7      = this.readInt();
                            break;
                        case '/Script/FactoryGame.ItemAmount':
                            structure.unk3      = this.readInt();
                            structure.unk4      = this.readString();
                            structure.unk5      = this.readInt();
                            break;
                        case '/Script/FicsItNetworks.FINTrackGraph':
                            structure.trace     = this.readFINNetworkTrace();
                            structure.trackId   = this.readInt();
                            break;
                        case '/Script/FactoryGame.PrefabSignData': // Skip!
                        case '/Script/FicsItNetworks.FINInternetCardHttpRequestFuture': // Skip!
                        case '/Script/FactoryGame.InventoryItem': // Skip!
                            break;
                        case '/Script/FicsItNetworks.FINGPUT1Buffer':
                            structure.x         = this.readInt();
                            structure.y         = this.readInt();
                            structure.size      = this.readInt();
                            structure.name      = this.readString();
                            structure.type      = this.readString();
                            structure.length    = this.readInt();
                            structure.buffer    = [];
                                for(let size = 0; size < structure.size; size++)
                                {
                                    structure.buffer.push(this.readFINGPUT1BufferPixel());
                                }
                            structure.unk3      = this.readHex(45); //TODO: Not sure at all!
                            break;
                        default:
                            this.worker.postMessage({command: 'alertParsing'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentData', data);
                            }

                            throw new Error('Unimplemented `' + structure.unk2 + '` in readFINLuaProcessorStateStorage');
                            break;
                    }

                    data.structs.push(structure);
            }

        return data;
    }
};

self.onmessage = function(e){
    return new SaveParser_Read(self, e.data);
};
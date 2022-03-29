/* global Sentry, Intl, self */
import pako                                     from '../Lib/pako.esm.mjs';

import { defaultValues }                        from '../SaveParser.js'

export default class SaveParser_Read
{
    constructor(worker, options)
    {
        this.worker             = worker;
        this.saveResult         = {};
        this.saveResult.objects = {};

        this.language           = options.language;

        this.arrayBuffer        = options.arrayBuffer;
        this.bufferView         = new DataView(this.arrayBuffer); // Still used for header...
        this.currentByte        = 0;

        this.parseHeader();
    }

    parseHeader()
    {
        this.header                      = {};
        this.header.saveHeaderType       = this.readInt();
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

        console.log(this.header);

        this.worker.postMessage({command: 'saveResult', result: {header: this.header}});

        this.parseObjects();
    }

    parseObjects()
    {
        // We should now unzip the body!
        if(this.header.saveVersion >= 21)
        {
            this.parseCompressedObjectsV21();
        }
        else
        {
            this.worker.postMessage({command: 'alert', message: 'That save version isn\'t supported anymore... Please save it again in the game.'});
        }
    }

    // V21 FUNCTIONS
    parseCompressedObjectsV21()
    {
        // Remove the header...
        this.arrayBuffer                    = this.arrayBuffer.slice(this.currentByte);

        this.handledByte                    = 0;
        this.currentByte                    = 0;
        this.maxByte                        = this.arrayBuffer.byteLength;

        this.saveResult.PACKAGE_FILE_TAG    = null;
        this.saveResult.maxChunkSize        = null;
        this.currentChunks                  = [];

        return this.inflateChunks();
    }

    inflateChunks()
    {
        while(this.handledByte < this.maxByte)
        {
            // Read chunk info size...
            let chunkHeader         = new DataView(this.arrayBuffer.slice(0, 48));
                this.currentByte    = 48;
                this.handledByte   += 48;

            if(this.saveResult.PACKAGE_FILE_TAG === null)
            {
                //this.saveResult.PACKAGE_FILE_TAG = chunkHeader.getBigInt64(0, true);
                this.saveResult.PACKAGE_FILE_TAG = chunkHeader.getUint32(0, true);
                //console.log(chunkHeader.getBigInt64(0, true), chunkHeader.getUint32(0, true));
            }
            if(this.saveResult.maxChunkSize === null)
            {
                this.saveResult.maxChunkSize = chunkHeader.getUint32(8, true);
            }

            let currentChunkSize    = chunkHeader.getUint32(16, true);
            let currentChunk        = this.arrayBuffer.slice(this.currentByte, this.currentByte + currentChunkSize);
                this.handledByte   += currentChunkSize;
                this.currentByte   += currentChunkSize;

            // Free memory from previous chunk...
            this.arrayBuffer            = this.arrayBuffer.slice(this.currentByte);
            this.currentByte            = 0;

            // Unzip!
            try {
                // Inflate current chunk
                let currentInflatedChunk    = null;
                    currentInflatedChunk    = pako.inflate(currentChunk);
                    this.currentChunks.push(currentInflatedChunk);
            }
            catch(err)
            {
                this.worker.postMessage({command: 'alert', message: 'Something went wrong while trying to inflate your savegame. It seems to be related to adblock and we are looking into it.'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('pako', pako);
                }
                throw new Error(err);

                window.SCIM.hideLoader();
                return;
            }

            let currentPercentage = Math.round(this.handledByte / this.maxByte * 100);
                this.worker.postMessage({command: 'loaderMessage', message: 'Inflating save game (' + currentPercentage + '%)...'});
                this.worker.postMessage({command: 'loaderProgress', percentage: (currentPercentage * 0.4)});
        }

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

        // Parse them as usual while skipping the firt 4 bytes!
        this.currentByte        = 4;
        this.maxByte            = tempChunk.buffer.byteLength;
        this.bufferView         = new DataView(tempChunk.buffer);

        return this.parseObjectsV5();
    }

    // V5 FUNCTIONS
    parseObjectsV5()
    {
        let countObjects                = this.readInt();
        let entitiesToObjects           = [];
            console.log('Parsing: ' + countObjects + ' objects...');
            this.worker.postMessage({command: 'loaderMessage', message: 'MAP\\SAVEPARSER\\Parsing %1$s objects...', replace: new Intl.NumberFormat(this.language).format(countObjects)});

            for(let i = 0; i < countObjects; i++)
            {
                let objectType = this.readInt();
                    switch(objectType)
                    {
                        case 0:
                            let object                                      = this.readObjectV5();
                                this.saveResult.objects[object.pathName]    = object;
                                entitiesToObjects[i]                        = object.pathName;
                            break;
                        case 1:
                            let actor                                       = this.readActorV5();
                                this.saveResult.objects[actor.pathName]     = actor;
                                entitiesToObjects[i]                        = actor.pathName;

                                if(actor.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                                {
                                    this.saveResult.gameStatePathName   = actor.pathName;
                                }
                            break;
                        default:
                            console.log('Unknown object type', objectType);
                            break;
                    }
            }

            let countEntities   = this.readInt();
                console.log('Parsing: ' + countEntities + ' entities...');
                this.worker.postMessage({command: 'loaderMessage', message: 'MAP\\SAVEPARSER\\Parsing %1$s entities...', replace: new Intl.NumberFormat(this.language).format(countEntities)});

            for(let i = 0; i < countEntities; i++)
            {
                this.readEntityV5(entitiesToObjects[i]);
            }

            this.saveResult.collectables   = [];
                let countCollected  = this.readInt();
                    console.log('Parsing: ' + countCollected + ' collectables...');
                    this.worker.postMessage({command: 'loaderMessage', message: 'MAP\\SAVEPARSER\\Parsing %1$s collectables...', replace: new Intl.NumberFormat(this.language).format(countCollected)});

            for(let i = 0; i < countCollected; i++)
            {
                this.saveResult.collectables.push(this.readObjectProperty({}));
            }

            delete this.arrayBuffer;
            delete this.bufferView;

            this.worker.postMessage({command: 'saveResult', result: this.saveResult});
            this.worker.postMessage({command: 'endSaveLoading'});
    }

    // V5 Functions
    readObjectV5()
    {
        let object                  = {type : 0};
            object.className        = this.readString();
            object                  = this.readObjectProperty(object);
            object.outerPathName    = this.readString();

        return object;
    }

    readActorV5()
    {
        let actor               = {type : 1};
            actor.className     = this.readString();
            actor               = this.readObjectProperty(actor);

        let needTransform       = this.readInt();
            if(needTransform !== 0)
            {
                actor.needTransform = needTransform;
            }

            // {rotation: [0, 0, 0, 1], translation: [0, 0, 0], scale3d: [1, 1, 1]}
        let rotation            = [this.readFloat(), this.readFloat(), this.readFloat(), this.readFloat()];
        let translation         = [this.readFloat(), this.readFloat(), this.readFloat()];
        let scale3d             = [this.readFloat(), this.readFloat(), this.readFloat()];

            actor.transform     = {};

            if(
                    rotation[0] === defaultValues.rotation[0]
                 && rotation[1] === defaultValues.rotation[1]
                 && rotation[2] === defaultValues.rotation[2]
                 && rotation[3] === defaultValues.rotation[3]
            )
            {
                actor.transform.rotation    = defaultValues.rotation;
            }
            else
            {
                actor.transform.rotation    = rotation;
            }

            if(
                    translation[0] === defaultValues.translation[0]
                 && translation[1] === defaultValues.translation[1]
                 && translation[2] === defaultValues.translation[2]
            )
            {
                actor.transform.translation = defaultValues.translation;
            }
            else
            {

                actor.transform.translation = translation;
            }

            // Enforce bounding on the map to avoid the game from skipping physics!
            if(actor.transform.translation[0] < -500000 || actor.transform.translation[0] > 500000 || actor.transform.translation[1] < -500000 || actor.transform.translation[1] > 500000 || actor.transform.translation[1] < -500000 || actor.transform.translation[1] > 500000)
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

            if(scale3d[0] !== 1 || scale3d[1] !== 1 || scale3d[2] !== 1)
            {
                if(actor.transform === undefined)
                {
                    actor.transform = {};
                }

                actor.transform.scale3d = scale3d
            }

        let wasPlacedInLevel       = this.readInt();
            if(wasPlacedInLevel !== 0) //TODO: Switch to 1?
            {
                actor.wasPlacedInLevel = wasPlacedInLevel;
            }

        return actor;
    }

    readEntityV5(objectKey)
    {
        let entityLength                            = this.readInt();
        let startByte                               = this.currentByte;

        if(this.saveResult.objects[objectKey].type === 1)
        {
            this.saveResult.objects[objectKey].entity = this.readObjectProperty({});

            let countChild  = this.readInt();
                if(countChild > 0)
                {
                    this.saveResult.objects[objectKey].children = [];

                    for(let i = 0; i < countChild; i++)
                    {
                        this.saveResult.objects[objectKey].children.push(this.readObjectProperty({}));
                    }
                }
        }

        if((this.currentByte - startByte) === entityLength)
        {
            this.saveResult.objects[objectKey].shouldBeNulled = true;
            return;
        }

        // Read properties
        this.saveResult.objects[objectKey].properties       = [];
        while(true)
        {
            let property = this.readPropertyV5();
                if(property === null)
                {
                    break;
                }

                this.saveResult.objects[objectKey].properties.push(property);
        }

        // Read Conveyor missing bytes
        if(
                this.saveResult.objects[objectKey].className.includes('/Build_ConveyorBeltMk')
             || this.saveResult.objects[objectKey].className.includes('/Build_ConveyorLiftMk')
             // MODS
             || this.saveResult.objects[objectKey].className.startsWith('/Conveyors_Mod/Build_BeltMk')
             || this.saveResult.objects[objectKey].className.startsWith('/Conveyors_Mod/Build_LiftMk')
             || this.saveResult.objects[objectKey].className.startsWith('/Game/CoveredConveyor')
             || this.saveResult.objects[objectKey].className.startsWith('/CoveredConveyor/')
             || this.saveResult.objects[objectKey].className.startsWith('/UltraFastLogistics/Buildable/build_conveyorbeltMK')
             || this.saveResult.objects[objectKey].className.startsWith('/FlexSplines/Conveyor/Build_Belt')
        )
        {
            this.saveResult.objects[objectKey].extra    = {count: this.readInt(), items: []};
            let itemsLength                             = this.readInt();
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

                    this.saveResult.objects[objectKey].extra.items.push(currentItem);
                }
        }
        else
        {
            // Extra processing
            switch(this.saveResult.objects[objectKey].className)
            {
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                    this.saveResult.objects[objectKey].extra    = {count: this.readInt(), game: []};
                    let gameLength                              = this.readInt();

                    for(let i = 0; i < gameLength; i++)
                    {
                        this.saveResult.objects[objectKey].extra.game.push(this.readObjectProperty({}));

                        if(i === 0 && this.saveResult.objects[objectKey].className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                        {
                            this.saveResult.playerHostPathName  = this.saveResult.objects[objectKey].extra.game[0].pathName;
                        }
                    }

                    break;
                case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                    let missingPlayerState                          = (startByte + entityLength) - this.currentByte;
                        this.saveResult.objects[objectKey].missing  = this.readHex(missingPlayerState);
                        this.currentByte                           -= missingPlayerState; // Reset back to grab the user ID if possible!

                        if(missingPlayerState > 0)
                        {
                            this.readInt(); // Skip count
                            let playerType = this.readByte();
                                switch(playerType)
                                {
                                    case 248: // EOS
                                            this.readString();
                                        let eosStr                                      = this.readString().split('|');
                                            this.saveResult.objects[objectKey].eosId    = eosStr[0];
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

                                        this.saveResult.objects[objectKey].eosId = epicHex.replace(/^0+/, '');
                                        break;
                                    case 25: // Steam
                                        let steamHexLength  = this.readByte();
                                        let steamHex        = '';
                                            for(let i = 0; i < steamHexLength; i++)
                                            {
                                                steamHex += this.readByte().toString(16).padStart(2, '0');
                                            }

                                        this.saveResult.objects[objectKey].steamId = steamHex.replace(/^0+/, '');
                                        break;
                                    case 8: // ???
                                        this.saveResult.objects[objectKey].platformId = this.readString();
                                        break;
                                    case 3: // Offline
                                        break;
                                    default:
                                        this.worker.postMessage({command: 'alertParsing'});
                                        if(typeof Sentry !== 'undefined')
                                        {
                                            Sentry.setContext('BP_PlayerState_C', this.saveResult.objects[objectKey]);
                                            Sentry.setContext('playerType', playerType);
                                        }
                                        console.log(playerType, this.saveResult.objects[objectKey]);
                                        //throw new Error('Unimplemented BP_PlayerState_C type: ' + playerType);

                                        // By pass, and hope that the user will still continue to send us the save!
                                        this.currentByte += missingPlayerState - 5;
                                }
                        }
                    break;
                //TODO: Not 0 here so bypass those special cases, but why? We mainly do not want to get warned here...
                case '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C':
                    let missingDrone                                = (startByte + entityLength) - this.currentByte;
                        this.saveResult.objects[objectKey].missing  = this.readHex(missingDrone);

                    break;
                case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                    this.saveResult.objects[objectKey].extra    = {count: this.readInt(), circuits: []};
                    let circuitsLength                          = this.readInt();

                        for(let i = 0; i < circuitsLength; i++)
                        {
                            this.saveResult.objects[objectKey].extra.circuits.push({
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
                    this.saveResult.objects[objectKey].extra        = {
                        count   : this.readInt(),
                        source  : this.readObjectProperty({}),
                        target  : this.readObjectProperty({})
                    };

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C':
                    this.saveResult.objects[objectKey].extra    = {count: this.readInt(), objects: []};
                    let trainLength                             = this.readInt();
                        for(let i = 0; i < trainLength; i++)
                        {
                            this.saveResult.objects[objectKey].extra.objects.push({
                                name   : this.readString(),
                                unk    : this.readHex(53)
                            });
                        }

                    this.saveResult.objects[objectKey].extra.previous   = this.readObjectProperty({});
                    this.saveResult.objects[objectKey].extra.next       = this.readObjectProperty({});
                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C':
                    this.saveResult.objects[objectKey].extra    = {count: this.readInt(), objects: []};
                    let vehicleLength                           = this.readInt();
                        for(let i = 0; i < vehicleLength; i++)
                        {
                            this.saveResult.objects[objectKey].extra.objects.push({
                                name   : this.readString(),
                                unk    : this.readHex(53)
                            });
                        }
                    break;
                default:
                    let missingBytes = (startByte + entityLength) - this.currentByte;
                        if(missingBytes > 4)
                        {
                            this.saveResult.objects[objectKey].missing = this.readHex(missingBytes); // TODO
                            console.log('MISSING ' + missingBytes + '  BYTES', this.saveResult.objects[objectKey]);
                        }
                        else
                        {
                            this.skipBytes(4);
                        }

                    break;
            }
        }
    }


    readPropertyV5()
    {
        let currentProperty         = {};
            currentProperty.name    = this.readString();

        if(currentProperty.name === 'None')
        {
            return null;
        }

        currentProperty.type    = this.readString();

        this.skipBytes(4); // Length of the property, this is calculated when writing back ;)

        let index = this.readInt();
            if(index !== 0)
            {
                currentProperty.index = index;
            }

        switch(currentProperty.type)
        {
            case 'BoolProperty':
                currentProperty.value = this.readByte();

                let unkBoolByte = this.readByte();
                    if(unkBoolByte === 1)
                    {
                        currentProperty.unkBool = this.readHex(16);
                    }

                break;

            case 'Int8Property':
                this.skipBytes();
                currentProperty.value = this.readInt8();

                break;

            case 'IntProperty':
            case 'UInt32Property': // Mod?
                let unkIntByte = this.readByte();
                    if(unkIntByte === 1)
                    {
                        currentProperty.unkInt = this.readHex(16);
                    }
                currentProperty.value = this.readInt();

                break;

            case 'Int64Property':
            case 'UInt64Property':
                this.skipBytes();
                currentProperty.value = this.readLong();

                break;

            case 'FloatProperty':
                this.skipBytes();
                currentProperty.value = this.readFloat();

                break;

            case 'DoubleProperty':
                this.skipBytes();
                currentProperty.value = this.readDouble();

                break;

            case 'StrProperty':
            case 'NameProperty':
                this.skipBytes();
                currentProperty.value = this.readString();

                break;

            case 'ObjectProperty':
            case 'InterfaceProperty':
                this.skipBytes();
                currentProperty.value = this.readObjectProperty({});
                break;

            case 'EnumProperty':
                let enumPropertyName = this.readString();
                this.skipBytes();
                currentProperty.value = {
                    name: enumPropertyName,
                    value: this.readString()
                };

                break;

            case 'ByteProperty':
                let enumName = this.readString(); //TODO
                this.skipBytes();

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

            case 'TextProperty':
                this.skipBytes();
                currentProperty             = this.readTextProperty(currentProperty);

                break;

            case 'ArrayProperty':
                    currentProperty.value       = {type    : this.readString(), values  : []};
                    this.skipBytes();
                let currentArrayPropertyCount   = this.readInt();

                switch(currentProperty.value.type)
                {
                    case 'ByteProperty':
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

                    case 'IntProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readInt());
                        }
                        break;

                    case 'FloatProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readFloat());
                        }
                        break;

                    case 'EnumProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push({name: this.readString()});
                        }
                        break;
                    case 'StrProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readString());
                        }
                        break;
                    case 'TextProperty': // ???
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readTextProperty({}));
                        }
                        break;

                    case 'ObjectProperty':
                    case 'InterfaceProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readObjectProperty({}));
                        }
                        break;

                    case 'StructProperty':
                        currentProperty.structureName       = this.readString();
                        currentProperty.structureType       = this.readString();

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
                                                let subStructProperty = this.readPropertyV5();

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
                                        this.worker.postMessage({command: 'alertParsing'});
                                        if(typeof Sentry !== 'undefined')
                                        {
                                            Sentry.setContext('currentProperty', currentProperty);
                                        }
                                        throw new Error('Unimplemented key structureSubType `' + currentProperty.structureSubType + '` in ArrayProperty `' + currentProperty.name + '`');
                                    }
                            }
                        }

                        break;

                    default:
                        this.worker.postMessage({command: 'alertParsing'});
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('currentProperty', currentProperty);
                        }
                        throw new Error('Unimplemented type `' + currentProperty.value.type + '` in ArrayProperty `' + currentProperty.name + '`');
                }

                break;

            case 'MapProperty':
                currentProperty.value = {
                    keyType         : this.readString(),
                    valueType       : this.readString(),
                    values          : []
                };

                    this.skipBytes(1);
                    currentProperty.value.modeType = this.readInt();

                    if(currentProperty.value.modeType === 3)
                    {
                        currentProperty.value.modeUnk1 = this.readHex(9);
                        currentProperty.value.modeUnk2 = this.readString();
                        currentProperty.value.modeUnk3 = this.readString();
                    }

                let currentMapPropertyCount = this.readInt();
                    for(let iMapProperty = 0; iMapProperty < currentMapPropertyCount; iMapProperty++)
                    {
                        let mapPropertyKey;
                        let mapPropertySubProperties    = [];

                            switch(currentProperty.value.keyType)
                            {
                                case 'IntProperty':
                                    mapPropertyKey = this.readInt();
                                    break;
                                case 'Int64Property':
                                    mapPropertyKey = this.readLong();
                                    break;
                                case 'NameProperty':
                                case 'StrProperty':
                                    mapPropertyKey = this.readString();
                                    break;
                                case 'ObjectProperty':
                                    mapPropertyKey = this.readObjectProperty({});
                                    break;
                                case 'EnumProperty':
                                    mapPropertyKey = {
                                        name        : this.readString()
                                    };
                                    break;
                                case 'StructProperty':
                                    mapPropertyKey = [];
                                    while(true)
                                    {
                                        let subMapPropertyValue = this.readPropertyV5();
                                            if(subMapPropertyValue === null)
                                            {
                                                break;
                                            }

                                        mapPropertyKey.push(subMapPropertyValue);
                                    }
                                    break;
                                default:
                                    this.worker.postMessage({command: 'alertParsing'});
                                    if(typeof Sentry !== 'undefined')
                                    {
                                        Sentry.setContext('currentProperty', currentProperty);
                                    }
                                    throw new Error('Unimplemented key type `' + currentProperty.value.keyType + '` in MapProperty `' + currentProperty.name + '`');
                            }

                            switch(currentProperty.value.valueType)
                            {
                                case 'ByteProperty':
                                    if(currentProperty.value.keyType === 'StrProperty')
                                    {
                                        mapPropertySubProperties = this.readString();
                                    }
                                    else
                                    {
                                        mapPropertySubProperties = this.readByte();
                                    }
                                    break;
                                case 'BoolProperty':
                                    mapPropertySubProperties = this.readByte();
                                    break;
                                case 'IntProperty':
                                    mapPropertySubProperties = this.readInt();
                                    break;
                                case 'StrProperty':
                                    mapPropertySubProperties = this.readString();
                                    break;
                                case 'ObjectProperty':
                                    mapPropertySubProperties = this.readObjectProperty({});
                                    break;
                                case 'StructProperty':
                                    while(true)
                                    {
                                        let subMapProperty = this.readPropertyV5();
                                            if(subMapProperty === null)
                                            {
                                                break;
                                            }

                                        mapPropertySubProperties.push(subMapProperty);
                                    }
                                    break;
                                default:
                                    this.worker.postMessage({command: 'alertParsing'});
                                    if(typeof Sentry !== 'undefined')
                                    {
                                        Sentry.setContext('currentProperty', currentProperty);
                                    }
                                    throw new Error('Unimplemented value type `' + currentProperty.value.valueType + '` in MapProperty `' + currentProperty.name + '`');
                            }

                        currentProperty.value.values[iMapProperty]    = {
                            key     : mapPropertyKey,
                            value   : mapPropertySubProperties
                        };
                    }
                break;

            case 'StructProperty':
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

                        // We use default values to avoid memory consumption
                        if(currentProperty.name === 'mPrimaryColor' || currentProperty.name === 'mSecondaryColor')
                        {
                            if(
                                   currentProperty.value.values.r === defaultValues[currentProperty.name].value.values.r
                                && currentProperty.value.values.g === defaultValues[currentProperty.name].value.values.g
                                && currentProperty.value.values.b === defaultValues[currentProperty.name].value.values.b
                                && currentProperty.value.values.a === defaultValues[currentProperty.name].value.values.a
                            )
                            {
                                currentProperty = defaultValues[currentProperty.name];
                            }
                        }

                        break;

                    case 'Vector':
                    case 'Rotator':
                        currentProperty.value.values = {
                            x           : this.readFloat(),
                            y           : this.readFloat(),
                            z           : this.readFloat()
                        };

                        break;

                    case 'Vector2D': // Mod?
                        currentProperty.value.values = {
                            x           : this.readFloat(),
                            y           : this.readFloat()
                        };

                        break;

                    case 'Quat':
                    case 'Vector4':
                        currentProperty.value.values = {
                            a           : this.readFloat(),
                            b           : this.readFloat(),
                            c           : this.readFloat(),
                            d           : this.readFloat()
                        };

                        break;

                    case 'Box':
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
                        currentProperty.value.properties.push(this.readPropertyV5());
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

                    default: // Try normalised structure, then throw Error if not working...
                        try
                        {
                            currentProperty.value.values = [];
                            while(true)
                            {
                                let subStructProperty = this.readPropertyV5();
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
                            this.worker.postMessage({command: 'alertParsing'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }
                            throw new Error('Unimplemented type `' + currentProperty.value.type + '` in StructProperty `' + currentProperty.name + '`');
                        }
                }

                break;

            case 'SetProperty':
                currentProperty.value = {type: this.readString(), values: []};
                this.skipBytes(5); // skipByte(1) + 0

                let setPropertyLength = this.readInt();
                for(let iSetProperty = 0; iSetProperty < setPropertyLength; iSetProperty++)
                {
                    switch(currentProperty.value.type)
                    {
                        case 'ObjectProperty': // MOD: Efficiency Checker
                            currentProperty.value.values.push(this.readObjectProperty({}));
                            break;
                        case 'StructProperty': // MOD: FicsIt-Networks
                            currentProperty.value.values.push(this.readFINNetworkTrace());
                            break;
                        case 'NameProperty':  // MOD: Sweet Transportal
                            currentProperty.value.values.push({name: this.readString()});
                            break;
                        case 'IntProperty':  // MOD: ???
                            currentProperty.value.values.push({int: this.readInt()});
                            break;
                        default:
                            let rewind = this.lastStrRead + 128;
                                this.currentByte -= rewind;
                            console.log(this.lastStrRead, this.readHex(rewind), this.readInt(), this.readInt(), this.readInt(), this.readInt());
                            this.worker.postMessage({command: 'alertParsing'});
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }
                            throw new Error('Unimplemented type `' + currentProperty.value.type + '` in SetProperty `' + currentProperty.name + '` (' + this.currentByte + ')');
                    }
                }

                break;

            default:
                let rewind = this.lastStrRead + 128;
                    this.currentByte -= rewind;
                console.log(this.lastStrRead, this.readHex(rewind), this.readInt(), this.readInt(), this.readInt(), this.readInt());
                this.worker.postMessage({command: 'alertParsing'});
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }
                throw new Error('Unimplemented type `' + currentProperty.type + '` in Property `' + currentProperty.name + '` (' + this.currentByte + ')');
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
            if(levelName !== 'Persistent_Level')
            {
                currentProperty.levelName = levelName;
            }
        currentProperty.pathName  = this.readString();

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
            let errorMessage    = 'Cannot readString (' + strLength + '):' + error + ': `' + this.readHex(debugSize * 2) + '`=========`' + this.readHex(debugSize) + '`';
                console.log(errorMessage);
                this.worker.postMessage({command: 'alertParsing'});
                throw new Error(errorMessage);
        }

        return;
    }

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
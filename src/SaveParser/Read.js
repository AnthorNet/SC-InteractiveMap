/* global Sentry */
import Modal                                    from '../Modal.js';
import pako                                     from '../Lib/pako.esm.mjs';

export default class SaveParser_Read
{
    constructor(options)
    {
        console.time('loadSave');

        this.saveParser         = options.saveParser;
        this.callback           = options.callback;

        this.arrayBuffer        = this.saveParser.arrayBuffer;
        this.bufferView         = new DataView(this.arrayBuffer); // Still used for header...
        this.currentByte        = 0;

        this.parseHeader();
    }

    parseHeader()
    {
        this.saveParser.header                      = {};
        this.saveParser.header.saveHeaderType       = this.readInt();
        this.saveParser.header.saveVersion          = this.readInt();
        this.saveParser.header.buildVersion         = this.readInt();
        this.saveParser.header.mapName              = this.readString();
        this.saveParser.header.mapOptions           = this.readString();
        this.saveParser.header.sessionName          = this.readString();
        this.saveParser.header.playDurationSeconds  = this.readInt();
        this.saveParser.header.saveDateTime         = this.readLong();
        this.saveParser.header.sessionVisibility    = this.readByte();

        if(this.saveParser.header.saveHeaderType >= 7)
        {
            this.saveParser.header.fEditorObjectVersion = this.readInt();
        }
        if(this.saveParser.header.saveHeaderType >= 8)
        {
            this.saveParser.header.modMetadata      = this.readString();
            this.saveParser.header.isModdedSave     = this.readInt();
        }

        console.log(this.saveParser.header);

        this.parseObjects();
    }

    parseObjects()
    {
        // We should now unzip the body!
        if(this.saveParser.header.saveVersion >= 21)
        {
            this.parseCompressedObjectsV21();
        }
        else
        {
            alert('That save version isn\'t supported anymore... Please save it again in the game.');
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

        this.saveParser.PACKAGE_FILE_TAG    = null;
        this.saveParser.maxChunkSize        = null;
        this.currentChunks                  = [];

        $('#loaderProgressBar').css('display', 'flex');
        $('#loaderProgressBar .progress-bar').css('width', '0px');

        return this.inflateChunks();
    }

    inflateChunks()
    {
        if(this.handledByte < this.maxByte)
        {
            // Read chunk info size...
            let chunkHeader         = new DataView(this.arrayBuffer.slice(0, 48));
                this.currentByte    = 48;
                this.handledByte   += 48;

            if(this.saveParser.PACKAGE_FILE_TAG === null)
            {
                //this.saveParser.PACKAGE_FILE_TAG = chunkHeader.getBigInt64(0, true);
                this.saveParser.PACKAGE_FILE_TAG = chunkHeader.getUint32(0, true);
                //console.log(chunkHeader.getBigInt64(0, true), chunkHeader.getUint32(0, true));
            }
            if(this.saveParser.maxChunkSize === null)
            {
                this.saveParser.maxChunkSize = chunkHeader.getUint32(8, true);
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
                console.log('INFLATE ERROR', err);
                alert('Something went wrong while trying to inflate your savegame. It seems to be related to adblock and we are looking into it.')
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('pako', pako);
                }
                throw new Error(err);

                window.SCIM.hideLoader();
                return;
            }

            let currentPercentage = Math.round(this.handledByte / this.maxByte * 100);
                $('.loader h6').html('Inflating save game (' + currentPercentage + '%)...');
                $('#loaderProgressBar .progress-bar').css('width', currentPercentage * 0.4 + '%');

            setTimeout(() => {
                return this.inflateChunks();
            }, 5);
        }
        else
        {
            console.log('Inflated: ' + this.currentChunks.length + ' chunks...');
            $('.loader h6').html('Merging inflated chunks...');

            setTimeout(() => {
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
                this.bufferView         = new DataView(tempChunk.buffer);

                return this.parseObjectsV5();
            }, 50);
        }
    }

    // V5 FUNCTIONS
    parseObjectsV5()
    {
        let countObjects                = this.readInt();
        let entitiesToObjects           = [];
            this.saveParser.objects     = {};
            console.log('Reading: ' + countObjects + ' objects...');
            $('.loader h6').html('Parsing ' + countObjects + ' objects...');

            setTimeout(() => {
                for(let i = 0; i < countObjects; i++)
                {
                    let objectType = this.readInt();
                        switch(objectType)
                        {
                            case 0:
                                let object                                      = this.readObjectV5();
                                    this.saveParser.objects[object.pathName]    = object;
                                    entitiesToObjects[i]                        = object.pathName;
                                break;
                            case 1:
                                let actor                                       = this.readActorV5();
                                    this.saveParser.objects[actor.pathName]     = actor;
                                    entitiesToObjects[i]                        = actor.pathName;

                                    if(actor.className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                                    {
                                        this.saveParser.gameStatePathName   = actor.pathName;
                                    }
                                    if(actor.className === '/Script/FactoryGame.FGTrainStationIdentifier' || actor.className === '/Script/FactoryGame.FGTrain')
                                    {
                                        this.saveParser.trainIdentifiers.push(actor.pathName);
                                    }
                                break;
                            default:
                                console.log('Unknown object type', objectType);
                                break;
                        }
                }

                let countEntities   = this.readInt();
                    console.log('Reading: ' + countEntities + ' entities...');
                    $('.loader h6').html('Parsing ' + countEntities + ' entities...');

                setTimeout(() => {
                    for(let i = 0; i < countEntities; i++)
                    {
                        this.readEntityV5(entitiesToObjects[i]);
                    }

                    this.saveParser.collectables   = [];
                        let countCollected  = this.readInt();
                            console.log('Reading: ' + countCollected + ' collectables...');
                            $('.loader h6').html('Parsing ' + countCollected + ' collectables...');

                    setTimeout(() => {
                            for(let i = 0; i < countCollected; i++)
                            {
                                let currentCollectable = {
                                    levelName: this.readString(),
                                    pathName: this.readString()
                                };
                                this.saveParser.collectables.push(currentCollectable);
                            }

                        this.arrayBuffer        = undefined;
                        this.bufferView         = undefined;

                        console.timeEnd('loadSave');

                        if(this.callback !== null)
                        {
                            $('#loaderProgressBar .progress-bar').css('width', '45%');

                            setTimeout(() => {
                                return this.callback();
                            }, 50);
                        }
                    }, 50);
                }, 50);
            }, 50);
    }

    // V5 Functions
    readObjectV5()
    {
        let object                  = {type : 0};
            object.className        = this.readString();

            let levelName           = this.readString();
                if(levelName !== 'Persistent_Level')
                {
                    object.levelName     = levelName;
                }

            object.pathName         = this.readString();
            object.outerPathName    = this.readString();

        return object;
    }

    readActorV5()
    {
        let actor               = {type : 1};
            actor.className     = this.readString();

        let levelName           = this.readString();
            if(levelName !== 'Persistent_Level')
            {
                actor.levelName     = levelName;
            }

            actor.pathName      = this.readString();

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
                    rotation[0] === this.saveParser.defaultValues.rotation[0]
                 && rotation[1] === this.saveParser.defaultValues.rotation[1]
                 && rotation[2] === this.saveParser.defaultValues.rotation[2]
                 && rotation[3] === this.saveParser.defaultValues.rotation[3]
            )
            {
                actor.transform.rotation    = this.saveParser.defaultValues.rotation;
            }
            else
            {
                actor.transform.rotation    = rotation;
            }

            if(
                    translation[0] === this.saveParser.defaultValues.translation[0]
                 && translation[1] === this.saveParser.defaultValues.translation[1]
                 && translation[2] === this.saveParser.defaultValues.translation[2]
            )
            {
                actor.transform.translation = this.saveParser.defaultValues.translation;
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

        if(this.saveParser.objects[objectKey].type === 1)
        {
            this.saveParser.objects[objectKey].entityLevelName  = this.readString();
            this.saveParser.objects[objectKey].entityPathName   = this.readString();

            let countChild  = this.readInt();
                if(countChild > 0)
                {
                    this.saveParser.objects[objectKey].children = [];

                    for(let i = 0; i < countChild; i++)
                    {
                        this.saveParser.objects[objectKey].children.push({
                            levelName   : this.readString(),
                            pathName    : this.readString()
                        });
                    }
                }
        }

        if((this.currentByte - startByte) === entityLength)
        {
            this.saveParser.objects[objectKey].shouldBeNulled = true;
            return;
        }

        // Read properties
        this.saveParser.objects[objectKey].properties       = [];
        while(true)
        {
            let property = this.readPropertyV5();
                if(property === null)
                {
                    break;
                }

                this.saveParser.objects[objectKey].properties.push(property);
        }

        // Read Conveyor missing bytes
        if(
                this.saveParser.objects[objectKey].className.search('/Build_ConveyorBeltMk') !== -1
             || this.saveParser.objects[objectKey].className.search('/Build_ConveyorLiftMk') !== -1
             // MODS
             || this.saveParser.objects[objectKey].className.startsWith('/Conveyors_Mod/Build_BeltMk')
             || this.saveParser.objects[objectKey].className.startsWith('/Conveyors_Mod/Build_LiftMk')
             || this.saveParser.objects[objectKey].className.startsWith('/Game/CoveredConveyor')
             || this.saveParser.objects[objectKey].className.startsWith('/CoveredConveyor/')
             || this.saveParser.objects[objectKey].className.startsWith('/UltraFastLogistics/Buildable/build_conveyorbeltMK')
             || this.saveParser.objects[objectKey].className.startsWith('/FlexSplines/Conveyor/Build_Belt')
        )
        {
            this.saveParser.objects[objectKey].extra    = {count: this.readInt(), items: []};
            let itemsLength                             = this.readInt();
                for(let i = 0; i < itemsLength; i++)
                {
                    this.saveParser.objects[objectKey].extra.items.push({
                        length      : this.readInt(),
                        name        : this.readString(),
                        levelName   : this.readString(),
                        pathName    : this.readString(),
                        position    : this.readFloat()
                    });
                }
        }
        else
        {
            // Extra processing
            switch(this.saveParser.objects[objectKey].className)
            {
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                    this.saveParser.objects[objectKey].extra    = {count: this.readInt(), game: []};
                    let gameLength                              = this.readInt();

                    for(let i = 0; i < gameLength; i++)
                    {
                        this.saveParser.objects[objectKey].extra.game.push({
                            levelName   : this.readString(),
                            pathName    : this.readString()
                        });

                        if(i === 0 && this.saveParser.objects[objectKey].className === '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C')
                        {
                            this.saveParser.playerHostPathName  = this.saveParser.objects[objectKey].extra.game[0].pathName;
                        }
                    }

                    break;
                //TODO: Not 0 here so bypass those special cases, but why? We mainly do not want to get warned here...
                case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                case '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C':
                    let missingPlayerState                      = (startByte + entityLength) - this.currentByte;
                    this.saveParser.objects[objectKey].missing  = this.readHex(missingPlayerState);

                    break;
                case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                    this.saveParser.objects[objectKey].extra    = {count: this.readInt(), circuits: []};
                    let circuitsLength                          = this.readInt();

                        for(let i = 0; i < circuitsLength; i++)
                        {
                            this.saveParser.objects[objectKey].extra.circuits.push({
                                circuitId   : this.readInt(),
                                levelName   : this.readString(),
                                pathName    : this.readString()
                            });
                        }

                    break;
                case '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
                case '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C':
                case '/FlexSplines/PowerLine/Build_FlexPowerline.Build_FlexPowerline_C':
                    this.saveParser.objects[objectKey].extra        = {
                        count               : this.readInt(),
                        sourceLevelName     : this.readString(),
                        sourcePathName      : this.readString(),
                        targetLevelName     : this.readString(),
                        targetPathName      : this.readString()
                    };

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C':
                    this.saveParser.objects[objectKey].extra       = {
                        unk1                : this.readString(), //TODO: What is it?
                        unk2                : this.readString(), //TODO: What is it?
                        previousLevelName   : this.readString(),
                        previousPathName    : this.readString(),
                        nextLevelName       : this.readString(),
                        nextPathName        : this.readString()
                    };

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C':
                    this.saveParser.objects[objectKey].extra    = {count: this.readInt(), objects: []};
                    let objectLength                            = this.readInt();
                        for(let i = 0; i < objectLength; i++)
                        {
                            this.saveParser.objects[objectKey].extra.objects.push({
                                name   : this.readString(),
                                unk    : this.readHex(53)
                            });
                        }

                    break;
                default:
                    let missingBytes = (startByte + entityLength) - this.currentByte;
                        if(missingBytes > 4)
                        {
                            this.saveParser.objects[objectKey].missing = this.readHex(missingBytes); // TODO

                            console.log(
                                'MISSING ' + missingBytes + '  BYTES',
                                this.saveParser.objects[objectKey]
                            );
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
                this.skipBytes();

                break;

            case 'Int8Property':
                this.skipBytes();
                currentProperty.value = this.readInt8();

                break;

            case 'IntProperty':
            case 'UInt32Property': // Mod?
                this.skipBytes();
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
                currentProperty.value = {
                    levelName: this.readString(),
                    pathName: this.readString()
                };

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
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            currentProperty.value.values.push(this.readByte());
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
                            currentProperty.value.values.push({levelName: this.readString(), pathName: this.readString()});
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

                                case 'SpawnData':
                                case 'Transform':
                                case 'PhaseCost':
                                case 'ItemAmount':
                                case 'TimeTableStop':
                                case 'RemovedInstance':
                                case 'SplinePointData':
                                case 'InventoryStack':
                                case 'ResearchData':
                                case 'SchematicCost':
                                case 'ItemFoundData':
                                case 'ScannableResourcePair':
                                case 'Hotbar':
                                case 'PresetHotbar':
                                case 'MessageData':
                                case 'SplitterSortRule':
                                case 'FeetOffset':
                                case 'RecipeAmountStruct':
                                case 'DroneTripInformation':
                                case 'ResearchTime':
                                case 'ResearchCost':
                                case 'CompletedResearch':
                                // MODS
                                case 'LampGroup':
                                case 'STRUCT_ProgElevator_Floor':
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
                                    break;
                                default:
                                    Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
                                    if(typeof Sentry !== 'undefined')
                                    {
                                        Sentry.setContext('currentProperty', currentProperty);
                                    }
                                    throw new Error('Unimplemented key structureSubType `' + currentProperty.structureSubType + '` in ArrayProperty `' + currentProperty.name + '`');
                                    break;
                            }
                        }

                        break;

                    default:
                        Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
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

                this.skipBytes(5); // skipByte(1) + 0

                let currentMapPropertyCount    = this.readInt();

                for(let iMapProperty = 0; iMapProperty < currentMapPropertyCount; iMapProperty++)
                {
                    let mapPropertyKey;

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
                            mapPropertyKey = {
                                levelName   : this.readString(),
                                pathName    : this.readString()
                            };
                            break;
                        case 'EnumProperty':
                            mapPropertyKey = {
                                name        : this.readString()
                            };
                            break;
                        default:
                            Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
                            if(typeof Sentry !== 'undefined')
                            {
                                Sentry.setContext('currentProperty', currentProperty);
                            }
                            throw new Error('Unimplemented key type `' + currentProperty.value.keyType + '` in MapProperty `' + currentProperty.name + '`');
                    }

                    let mapPropertySubProperties                    = [];

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
                        case 'IntProperty':
                            mapPropertySubProperties = this.readInt();
                            break;
                        case 'StrProperty':
                            mapPropertySubProperties = this.readString();
                            break;
                        case 'ObjectProperty':
                            mapPropertySubProperties = {
                                levelName: this.readString(),
                                pathName: this.readString()
                            };
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
                            Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
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
                                   currentProperty.value.values.r === this.saveParser.defaultValues[currentProperty.name].value.values.r
                                && currentProperty.value.values.g === this.saveParser.defaultValues[currentProperty.name].value.values.g
                                && currentProperty.value.values.b === this.saveParser.defaultValues[currentProperty.name].value.values.b
                                && currentProperty.value.values.a === this.saveParser.defaultValues[currentProperty.name].value.values.a
                            )
                            {
                                currentProperty = this.saveParser.defaultValues[currentProperty.name];
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
                        currentProperty.value.levelName     = this.readString();
                        currentProperty.value.pathName      = this.readString();
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
                        currentProperty.value.levelName     = this.readString();
                        currentProperty.value.pathName      = this.readString();
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

                    case 'Transform':
                    case 'RemovedInstanceArray':
                    case 'InventoryStack':
                    case 'ProjectileData':
                    case 'TrainSimulationData':
                    case 'DroneDockingStateInfo':
                    case 'DroneTripInformation':
                    case 'ResearchData':
                    case 'Hotbar':
                    case 'LightSourceControlData':
                    case 'EnabledCheats': // MOD: Satisfactory Helper
                    case 'FICFloatAttribute': // MOD: ???
                    case 'FFCompostingTask': // MOD: ???
                    case 'FFSeedExtrationTask': // MOD: ???
                    case 'FFSlugBreedTask': // MOD: ???
                    case 'FFSlimeProcessingTask': // MOD: ???
                    case 'FFPlotTask': // MOD: ???
                    case 'SInventory': // MOD: ???
                    case 'MFGBuildableAutoSplitterReplicatedProperties': // MOD: AutoSplitters
                        currentProperty.value.values = [];
                        while(true)
                        {
                            let subStructProperty = this.readPropertyV5();
                                if(subStructProperty === null)
                                {
                                    break;
                                }

                            currentProperty.value.values.push(subStructProperty);
                            if(subStructProperty.value.properties !== undefined && subStructProperty.value.properties.length === 1 && subStructProperty.value.properties[0] === null)
                            {
                                break;
                            }
                        }

                        break;

                    default:
                        Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('currentProperty', currentProperty);
                        }
                        throw new Error('Unimplemented type `' + currentProperty.value.type + '` in StructProperty `' + currentProperty.name + '`');
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
                            currentProperty.value.values.push({
                                levelName: this.readString(),
                                pathName: this.readString()
                            });
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
                            Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
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
                Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }
                throw new Error('Unimplemented type `' + currentProperty.type + '` in Property `' + currentProperty.name + '` (' + this.currentByte + ')');
        }

        return currentProperty;
    }

    readTextProperty(currentProperty)
    {
        currentProperty.flags       = this.readInt();
        currentProperty.historyType = this.readByte();

        switch(currentProperty.historyType)
        {
            case 0:
                currentProperty.namespace       = this.readString();
                currentProperty.key             = this.readString();
                currentProperty.value           = this.readString();
                break;
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
                                Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
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
            case 255:
                // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/Text.cpp#L894
                if(this.saveParser.header.buildVersion >= 140822)
                {
                    currentProperty.hasCultureInvariantString   = this.readInt();

                    if(currentProperty.hasCultureInvariantString === 1)
                    {
                        currentProperty.value = this.readString();
                    }
                }
                break;
            default:
                Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
                if(typeof Sentry !== 'undefined')
                {
                    Sentry.setContext('currentProperty', currentProperty);
                }
                throw new Error('Unimplemented historyType `' + currentProperty.historyType + '` in TextProperty `' + currentProperty.name + '`');
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

        // UTF16
        if(strLength < 0)
        {
                strLength   = strLength * -2;
            let string      = [];

            for(let i = 0; i < ((strLength / 2) -1); ++i)
            {
                string.push(String.fromCharCode(
                    this.bufferView.getUint16(this.currentByte++, true)
                ));
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
            this.currentByte = Math.max(0, startBytes - 512);

            let errorMessage = 'Cannot readString (' + strLength + '):' + error + ': `' + this.readHex(512) + '`=========`' + this.readHex(256) + '`';
                console.log(errorMessage);
                Modal.alert('Something went wrong while we were trying to parse your save game... Please try to contact us on Twitter or Discord!');
                throw new Error(errorMessage);
        }

        return;
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
        let data            = {trace: [], reference: []};
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

        data.unk1 = this.readString();
        data.unk2 = this.readString();
        data.unk3 = this.readString();

        return data;
    }
}
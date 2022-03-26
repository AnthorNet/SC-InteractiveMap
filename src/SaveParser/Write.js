/* global Intl, self */
import pako                                     from '../Lib/pako.esm.mjs';

export default class SaveParser_Write
{
    constructor(worker, options)
    {
        this.worker                 = worker;

        this.header                 = options.header;
        this.objects                = options.objects;
        this.collectables           = options.collectables;
        this.maxChunkSize           = options.maxChunkSize;
        this.PACKAGE_FILE_TAG       = options.PACKAGE_FILE_TAG;
        this.gameStatePathName      = options.gameStatePathName;
        this.playerHostPathName     = options.playerHostPathName;

        this.language               = options.language;

        this.currentBufferLength    = 0; // Used for writing...

        return this.streamCompressedSave();
    }

    streamCompressedSave()
    {
        this.saveBlobArray  = [];
        this.saveBinary     = '';

        this.writeHeader();
        this.saveBlobArray.push(this.flushToUint8Array());

        return this.generateChunks();
    }

    generateChunks()
    {
            this.generatedChunks    = [];
        let objectsKeys             = Object.keys(this.objects);
        let countObjects            = objectsKeys.length;

            this.saveBinary += this.writeInt(countObjects, false); // This is a reservation for the inflated length ;)
            this.saveBinary += this.writeInt(countObjects, false);

        return this.generateObjectsChunks(objectsKeys);
    }

    generateObjectsChunks(objectsKeys)
    {
        let countObjects = objectsKeys.length;
            for(let i = 0; i < countObjects; i++)
            {
                if(this.objects[objectsKeys[i]] !== undefined)
                {
                    if(this.objects[objectsKeys[i]].type === 0)
                    {
                        this.saveBinary += this.writeObject(this.objects[objectsKeys[i]]);
                    }
                    if(this.objects[objectsKeys[i]].type === 1)
                    {
                        this.saveBinary += this.writeActor(this.objects[objectsKeys[i]]);
                    }
                }

                if(this.saveBinary.length >= this.maxChunkSize)
                {
                    this.pushSaveToChunk();

                    this.worker.postMessage({command: 'loaderMessage', message: 'MAP\\SAVEPARSER\\Compiling %1$s/%2$s objects...', replace: [new Intl.NumberFormat(this.language).format(i), new Intl.NumberFormat(this.language).format(countObjects)]});
                    this.worker.postMessage({command: 'loaderProgress', progress: ((i / countObjects) * 0.48)});
                }
            }

        console.log('Saved ' + countObjects + ' objects...');

        this.saveBinary += this.writeInt(countObjects, false);
        return this.generateEntitiesChunks(objectsKeys);
    }

    generateEntitiesChunks(objectsKeys)
    {
        let countObjects = objectsKeys.length;
            for(let i = 0; i < countObjects; i++)
            {
                if(this.objects[objectsKeys[i]] !== undefined)
                {
                    this.saveBinary += this.writeEntity(this.objects[objectsKeys[i]]);
                }

                if(this.saveBinary.length >= this.maxChunkSize)
                {
                    this.pushSaveToChunk();

                    this.worker.postMessage({command: 'loaderMessage', message: 'MAP\\SAVEPARSER\\Compiling %1$s/%2$s entities...', replace: [new Intl.NumberFormat(this.language).format(i), new Intl.NumberFormat(this.language).format(countObjects)]});
                    this.worker.postMessage({command: 'loaderProgress', progress: (0.48 + (i / countObjects) * 0.48)});
                }
            }

        console.log('Saved ' + countObjects + ' entities...');

        return this.generateCollectablesChunks();
    }

    generateCollectablesChunks()
    {
        let countCollectables = this.collectables.length;
            this.saveBinary  += this.writeInt(countCollectables, false);

        this.worker.postMessage({command: 'loaderMessage', message: 'MAP\\SAVEPARSER\\Compiling %1$s collectables...', replace: new Intl.NumberFormat(this.language).format(countCollectables)});

        for(let i = 0; i < countCollectables; i++)
        {
            this.saveBinary += this.writeObjectProperty(this.collectables[i], false);

            if(this.saveBinary.length >= this.maxChunkSize)
            {
                this.pushSaveToChunk();
            }
        }

        console.log('Saved ' + countCollectables + ' collectables...');

        return this.finalizeChunks();
    }

    pushSaveToChunk()
    {
        //$('.loader h6').html('Deflate chunk ' + this.generatedChunks.length + ' (' + this.saveBinary.length + ' / ' + this.maxChunkSize + ')...');
        while(this.saveBinary.length >= this.maxChunkSize)
        {
            // Extract extra to be processed later...
            let tempSaveBinary  = this.saveBinary.slice(this.maxChunkSize);
                this.saveBinary = this.saveBinary.slice(0, this.maxChunkSize);

            // Add a new chunk!
            if(this.generatedChunks.length > 0)
            {
                this.generatedChunks.push(this.deflateChunk());
            }
            else
            {
                let input = this.flushToUint8Array();
                    this.generatedChunks.push({
                        uncompressedLength  : input.byteLength,
                        output              : input
                    });
            }

            this.saveBinary = tempSaveBinary;
        }
    }

    finalizeChunks()
    {
        if(this.saveBinary.length > 0)
        {
            // Add last chunk!
            if(this.generatedChunks.length > 0)
            {
                this.generatedChunks.push(this.deflateChunk());
            }
            else
            {
                let input = this.flushToUint8Array();
                this.generatedChunks.push({
                    uncompressedLength  : input.byteLength,
                    output              : input
                });
            }
        }

        console.log('Generated ' + this.generatedChunks.length + ' chunks...');

        setTimeout(function(){
            this.streamChunks(this.generatedChunks);
        }.bind(this), 250);
    }

    streamChunks(chunks)
    {
        this.worker.postMessage({command: 'loaderMessage', message: 'Generating save file...'});

        while(chunks.length > 0)
        {
            let currentChunk = chunks.shift();
                if(currentChunk.compressedLength === undefined)
                {
                    // Update first chunk inflated size
                    let totalInflated = currentChunk.uncompressedLength - 4;
                        for(let i = 0; i < chunks.length; i++)
                        {
                            totalInflated += chunks[i].uncompressedLength;
                        }

                    currentChunk.output[3] = (totalInflated >>> 24);
                    currentChunk.output[2] = (totalInflated >>> 16);
                    currentChunk.output[1] = (totalInflated >>> 8);
                    currentChunk.output[0] = (totalInflated & 0xff);

                    currentChunk.output             = pako.deflate(currentChunk.output);
                    currentChunk.compressedLength   = currentChunk.output.byteLength;
                }

            // Write chunk header
            this.saveBinary = '';
            this.saveBinary += this.writeInt(this.PACKAGE_FILE_TAG);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(this.maxChunkSize);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.compressedLength);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.uncompressedLength);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.compressedLength);
            this.saveBinary += this.writeInt(0);
            this.saveBinary += this.writeInt(currentChunk.uncompressedLength);
            this.saveBinary += this.writeInt(0);

            this.saveBlobArray.push(this.flushToUint8Array());
            this.saveBlobArray.push(currentChunk.output);
        }

        this.worker.postMessage({command: 'endSaveWriting', blobArray: this.saveBlobArray});
    }

    deflateChunk()
    {
        let input   = this.flushToUint8Array();
        let output  = pako.deflate(input);

        return {
            compressedLength    : output.byteLength,
            uncompressedLength  : input.byteLength,
            output              : output
        };
    }

    flushToUint8Array()
    {
        let slice       = this.saveBinary.length;
        let buffer      = new Uint8Array(slice);
            for(let j = 0; j < slice; j++)
            {
                buffer[j]   = this.saveBinary.charCodeAt(j) & 0xFF;
            }

        this.saveBinary     = '';

        return buffer;
    }



    writeHeader()
    {
        let header  = '';
            header += this.writeInt(this.header.saveHeaderType, false);
            header += this.writeInt(this.header.saveVersion, false);
            header += this.writeInt(this.header.buildVersion, false);
            header += this.writeString(this.header.mapName, false);
            header += this.writeString(this.header.mapOptions, false);
            header += this.writeString(this.header.sessionName, false);
            header += this.writeInt(this.header.playDurationSeconds, false);
            header += this.writeLong(this.header.saveDateTime, false);
            header += this.writeByte(this.header.sessionVisibility, false);

            if(this.header.saveHeaderType >= 7)
            {
                header += this.writeInt(this.header.fEditorObjectVersion, false);
            }
            if(this.header.saveHeaderType >= 8)
            {
                header += this.writeString(this.header.modMetadata, false);
                header += this.writeInt(this.header.isModdedSave, false);
            }

        this.saveBinary += header;
    }

    writeObject(currentObject)
    {
        let object  = this.writeInt(0, false);
            object += this.writeString(currentObject.className, false);
            object += this.writeObjectProperty(currentObject, false);
            object += this.writeString(currentObject.outerPathName, false);

        return object;
    }

    writeActor(currentActor)
    {
        let actor  = this.writeInt(1, false);
            actor += this.writeString(currentActor.className, false);
            actor += this.writeObjectProperty(currentActor, false);

            if(currentActor.needTransform !== undefined)
            {
                actor += this.writeInt(currentActor.needTransform, false);
            }
            else
            {
                actor += this.writeInt(0, false);
            }

            actor += this.writeFloat(currentActor.transform.rotation[0], false);
            actor += this.writeFloat(currentActor.transform.rotation[1], false);
            actor += this.writeFloat(currentActor.transform.rotation[2], false);
            actor += this.writeFloat(currentActor.transform.rotation[3], false);

            // Enforce bounding on the map to avoid the game from skipping physics!
            if(currentActor.transform.translation[0] < -500000 || currentActor.transform.translation[0] > 500000 || currentActor.transform.translation[1] < -500000 || currentActor.transform.translation[1] > 500000 || currentActor.transform.translation[1] < -500000 || currentActor.transform.translation[1] > 500000)
            {
                currentActor.transform.translation = [0, 0, 2000];
            }

            actor += this.writeFloat(currentActor.transform.translation[0], false);
            actor += this.writeFloat(currentActor.transform.translation[1], false);
            actor += this.writeFloat(currentActor.transform.translation[2], false);

            if(currentActor.transform !== undefined && currentActor.transform.scale3d !== undefined)
            {
                actor += this.writeFloat(currentActor.transform.scale3d[0], false);
                actor += this.writeFloat(currentActor.transform.scale3d[1], false);
                actor += this.writeFloat(currentActor.transform.scale3d[2], false);
            }
            else
            {
                actor += this.writeFloat(1, false);
                actor += this.writeFloat(1, false);
                actor += this.writeFloat(1, false);
            }

            if(currentActor.wasPlacedInLevel !== undefined)
            {
                actor += this.writeInt(currentActor.wasPlacedInLevel, false);
            }
            else
            {
                actor += this.writeInt(0, false);
            }


        return actor;
    }

    writeEntity(currentObject)
    {
        this.currentEntityLength    = 0;
        let entity                  = '';

        if(currentObject.type === 1)
        {
            entity += this.writeObjectProperty(currentObject.entity);

            if(currentObject.children !== undefined)
            {
                let countChild  = currentObject.children.length;
                    entity += this.writeInt(countChild);
                    for(let i = 0; i < countChild; i++)
                    {
                        entity += this.writeObjectProperty(currentObject.children[i]);
                    }
            }
            else
            {
                entity += this.writeInt(0);
            }
        }

        if(currentObject.shouldBeNulled !== undefined && currentObject.shouldBeNulled === true)
        {
            return this.writeInt(this.currentEntityLength) + entity;
        }

        entity += this.writeProperties(currentObject);
        entity += this.writeString('None');

        // Extra properties!
        if(
                currentObject.className.includes('/Build_ConveyorBeltMk')
             || currentObject.className.includes('/Build_ConveyorLiftMk')
             // MODS
             || currentObject.className.startsWith('/Conveyors_Mod/Build_BeltMk')
             || currentObject.className.startsWith('/Conveyors_Mod/Build_LiftMk')
             || currentObject.className.startsWith('/Game/CoveredConveyor')
             || currentObject.className.startsWith('/CoveredConveyor')
             || currentObject.className.startsWith('/UltraFastLogistics/Buildable/build_conveyorbeltMK')
             || currentObject.className.startsWith('/FlexSplines/Conveyor/Build_Belt')
        )
        {
            let itemsLength  = currentObject.extra.items.length;
                     entity += this.writeInt(currentObject.extra.count);
                     entity += this.writeInt(itemsLength);

                for(let i = 0; i < itemsLength; i++)
                {
                    //TODO: Proper langth handle?
                    if(currentObject.extra.items[i].length !== undefined)
                    {
                        entity += this.writeInt(currentObject.extra.items[i].length);
                    }
                    else
                    {
                        entity += this.writeInt(0);
                    }

                    entity += this.writeString(currentObject.extra.items[i].name);
                    // Always empty
                    //entity += this.writeObjectProperty(currentObject.extra.items[i]);
                    entity += this.writeString('');
                    entity += this.writeString('');

                    entity += this.writeFloat(currentObject.extra.items[i].position);
                }
        }
        else
        {
            switch(currentObject.className)
            {
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameState.BP_GameState_C':
                case '/Game/FactoryGame/-Shared/Blueprint/BP_GameMode.BP_GameMode_C':
                    entity += this.writeInt(currentObject.extra.count);
                    entity += this.writeInt(currentObject.extra.game.length);

                    for(let i = 0; i < currentObject.extra.game.length; i++)
                    {
                        entity += this.writeObjectProperty(currentObject.extra.game[i]);
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
                    entity += this.writeInt(currentObject.extra.count);
                    entity += this.writeObjectProperty(currentObject.extra.source);
                    entity += this.writeObjectProperty(currentObject.extra.target);

                    break;
                case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                    entity += this.writeInt(currentObject.extra.count);
                    entity += this.writeInt(currentObject.extra.circuits.length);

                    for(let i = 0; i < currentObject.extra.circuits.length; i++)
                    {
                        entity += this.writeInt(currentObject.extra.circuits[i].circuitId);
                        entity += this.writeObjectProperty(currentObject.extra.circuits[i]);
                    }

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C':
                    entity += this.writeInt(currentObject.extra.count);

                    if(currentObject.extra.objects !== undefined)
                    {
                        entity += this.writeInt(currentObject.extra.objects.length);

                        for(let i = 0; i < currentObject.extra.objects.length; i++)
                        {
                            entity += this.writeString(currentObject.extra.objects[i].name);
                            entity += this.writeHex(currentObject.extra.objects[i].unk);
                        }
                    }
                    else
                    {
                        entity += this.writeInt(0);
                    }

                    entity += this.writeObjectProperty(currentObject.extra.previous);
                    entity += this.writeObjectProperty(currentObject.extra.next);

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C':
                    entity += this.writeInt(currentObject.extra.count);
                    entity += this.writeInt(currentObject.extra.objects.length);

                    for(let i = 0; i < currentObject.extra.objects.length; i++)
                    {
                        entity += this.writeString(currentObject.extra.objects[i].name);
                        entity += this.writeHex(currentObject.extra.objects[i].unk);
                    }

                    break;
                default:
                    if(currentObject.missing !== undefined)
                    {
                        entity += this.writeHex(currentObject.missing);
                    }
                    else
                    {
                        entity += this.writeByte(0);
                        entity += this.writeByte(0);
                        entity += this.writeByte(0);
                        entity += this.writeByte(0);
                    }

                    break;
            }
        }

        return this.writeInt(this.currentEntityLength) + entity;
    }
    writeProperties(currentObject)
    {
        let propertiesLength    = currentObject.properties.length;
        let properties          = '';

        for(let i = 0; i < propertiesLength; i++)
        {
            properties += this.writeProperty(currentObject.properties[i]);
            //this.currentBufferLength += 4; // Add property index for entity length!
        }

        return properties;
    }

    writeProperty(currentProperty)
    {
        let propertyStart   = '';
            propertyStart  += this.writeString(currentProperty.name);
            propertyStart  += this.writeString(currentProperty.type);
        let property        = '';


        // Reset to get property length...
        let startCurrentPropertyBufferLength    = this.currentBufferLength;
            this.currentBufferLength            = 0;
            property                            = this.writeInt( ((currentProperty.index !== undefined) ? currentProperty.index : 0), false);

        switch(currentProperty.type)
        {
            case 'BoolProperty':
                property += this.writeByte(currentProperty.value, false);

                if(currentProperty.unkBool !== undefined)
                {
                    property += this.writeByte(1, false);
                    property += this.writeHex(16, false);
                }
                else
                {
                    property += this.writeByte(0, false);
                }
                break;

            case 'Int8Property':
                property += this.writeByte(0, false);
                property += this.writeInt8(currentProperty.value);

                break;


            case 'IntProperty':
            case 'UInt32Property': // Mod?
                if(currentProperty.unkInt !== undefined)
                {
                    property += this.writeByte(1, false);
                    property += this.writeHex(16, false);
                }
                else
                {
                    property += this.writeByte(0, false);
                }

                property += this.writeInt(currentProperty.value);
                break;

            case 'Int64Property': //TODO: Use 64bit integer
            case 'UInt64Property':
                property += this.writeByte(0, false);
                property += this.writeLong(currentProperty.value);
                break;

            case 'FloatProperty':
                property += this.writeByte(0, false);
                property += this.writeFloat(currentProperty.value);
                break;

            case 'DoubleProperty':
                property += this.writeByte(0, false);
                property += this.writeDouble(currentProperty.value);
                break;

            case 'StrProperty':
            case 'NameProperty':
                property += this.writeByte(0, false);
                property += this.writeString(currentProperty.value);
                break;

            case 'ObjectProperty':
            case 'InterfaceProperty':
                property += this.writeByte(0, false);
                property += this.writeObjectProperty(currentProperty.value);
                break;

            case 'EnumProperty':
                property += this.writeString(currentProperty.value.name, false);
                property += this.writeByte(0, false);
                property += this.writeString(currentProperty.value.value);
                break;

            case 'ByteProperty':
                property += this.writeString(currentProperty.value.enumName, false);
                property += this.writeByte(0, false);

                if(currentProperty.value.enumName === 'None')
                {
                    property += this.writeByte(currentProperty.value.value);
                }
                else
                {
                    property += this.writeString(currentProperty.value.valueName);
                }

                break;

            case 'TextProperty': //TODO: Rewrite textProperty!
                property += this.writeByte(0, false);
                property += this.writeTextProperty(currentProperty);

                break;

            case 'StructProperty':
                property += this.writeString(currentProperty.value.type, false);
                property += this.writeInt(0, false);
                property += this.writeInt(0, false);
                property += this.writeInt(0, false);
                property += this.writeInt(0, false);
                property += this.writeByte(0, false);

                switch(currentProperty.value.type)
                {
                    case 'Color':
                        property += this.writeByte(currentProperty.value.values.b);
                        property += this.writeByte(currentProperty.value.values.g);
                        property += this.writeByte(currentProperty.value.values.r);
                        property += this.writeByte(currentProperty.value.values.a);
                        break;

                    case 'LinearColor':
                        property += this.writeFloat(currentProperty.value.values.r);
                        property += this.writeFloat(currentProperty.value.values.g);
                        property += this.writeFloat(currentProperty.value.values.b);
                        property += this.writeFloat(currentProperty.value.values.a);
                        break;

                    case 'Vector':
                    case 'Rotator':
                        property += this.writeFloat(currentProperty.value.values.x);
                        property += this.writeFloat(currentProperty.value.values.y);
                        property += this.writeFloat(currentProperty.value.values.z);
                        break;

                    case 'Vector2D': // Mod?
                        property += this.writeFloat(currentProperty.value.values.x);
                        property += this.writeFloat(currentProperty.value.values.y);
                        break;

                    case 'Quat':
                    case 'Vector4':
                        property += this.writeFloat(currentProperty.value.values.a);
                        property += this.writeFloat(currentProperty.value.values.b);
                        property += this.writeFloat(currentProperty.value.values.c);
                        property += this.writeFloat(currentProperty.value.values.d);
                        break;

                    case 'Box':
                        property += this.writeFloat(currentProperty.value.min.x);
                        property += this.writeFloat(currentProperty.value.min.y);
                        property += this.writeFloat(currentProperty.value.min.z);
                        property += this.writeFloat(currentProperty.value.max.x);
                        property += this.writeFloat(currentProperty.value.max.y);
                        property += this.writeFloat(currentProperty.value.max.z);
                        property += this.writeByte(currentProperty.value.isValid);
                        break;

                    case 'RailroadTrackPosition':
                        property += this.writeObjectProperty(currentProperty.value);
                        property += this.writeFloat(currentProperty.value.offset);
                        property += this.writeFloat(currentProperty.value.forward);

                        break;

                    case 'TimerHandle':
                        property += this.writeString(currentProperty.value.handle);

                        break;

                    case 'Guid': // MOD?
                        property += this.writeHex(currentProperty.value.guid);
                        break;

                    case 'InventoryItem':
                        property += this.writeInt(currentProperty.value.unk1, false);
                        property += this.writeString(currentProperty.value.itemName);
                        property += this.writeObjectProperty(currentProperty.value);

                        let oldLength   = this.currentBufferLength;

                        for(let i =0; i < currentProperty.value.properties.length; i++)
                        {
                            if(currentProperty.value.properties[i] !== null)
                            {
                                property += this.writeProperty(currentProperty.value.properties[i]);
                            }
                        }

                        this.currentBufferLength = oldLength + 4; // Don't ask why!

                        break;

                    case 'FluidBox':
                        property += this.writeFloat(currentProperty.value.value);
                        break;

                    case 'SlateBrush': // MOD?
                        property += this.writeString(currentProperty.value.unk1);
                        break;

                    case 'DateTime': // MOD: Power Suit
                        property += this.writeLong(currentProperty.value.dateTime);
                        break;

                    case 'FINNetworkTrace': // MOD: FicsIt-Networks
                        property += this.writeFINNetworkTrace(currentProperty.value.values);
                        break;
                    case 'FINLuaProcessorStateStorage': // MOD: FicsIt-Networks
                        property += this.writeFINLuaProcessorStateStorage(currentProperty.value.values);
                        break;

                    default:
                        let currentBufferStartingLength     = this.currentBufferLength;
                        let structPropertyBufferLength      = this.currentEntityLength;

                        for(let i = 0; i < currentProperty.value.values.length; i++)
                        {
                            property += this.writeProperty(currentProperty.value.values[i]);
                        }
                        property += this.writeString('None');

                        this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);

                        break;
                }

                break;

            case 'SetProperty':
                let setPropertyLength = currentProperty.value.values.length;

                property += this.writeString(currentProperty.value.type, false);
                property += this.writeByte(0, false);
                property += this.writeInt(0);
                property += this.writeInt(setPropertyLength);

                for(let iSetProperty = 0; iSetProperty < setPropertyLength; iSetProperty++)
                {
                    switch(currentProperty.value.type)
                    {
                        case 'ObjectProperty': // MOD: Efficiency Checker
                            property += this.writeObjectProperty(currentProperty.value.values[iSetProperty]);
                            break;
                        case 'StructProperty': // MOD: FicsIt-Networks
                            property += this.writeFINNetworkTrace(currentProperty.value.values[iSetProperty]);
                            break;
                        case 'NameProperty':  // MOD: Sweet Transportal
                            property += this.writeString(currentProperty.value.values[iSetProperty].name);
                            break;
                        case 'IntProperty':  // MOD: ???
                            property += this.writeInt(currentProperty.value.values[iSetProperty].int);
                            break;
                        default:
                            console.log('Missing ' + currentProperty.value.type + ' in SetProperty=>' + currentProperty.name);
                            break;
                    }
                }

                break;

            case 'ArrayProperty':
                let currentArrayPropertyCount    = currentProperty.value.values.length;
                    if(currentProperty.name === 'mFogOfWarRawData')
                    {
                        currentArrayPropertyCount *= 4;
                    }

                property += this.writeString(currentProperty.value.type, false);
                property += this.writeByte(0, false);
                property += this.writeInt(currentArrayPropertyCount);

                switch(currentProperty.value.type)
                {
                    case 'ByteProperty':
                        switch(currentProperty.name)
                        {
                            case 'mFogOfWarRawData':
                                for(let i = 0; i < (currentArrayPropertyCount / 4); i++)
                                {
                                    property += this.writeByte(0);
                                    property += this.writeByte(0);
                                    property += this.writeByte(currentProperty.value.values[i]);
                                    property += this.writeByte(255);
                                }
                                break;
                            default:
                                property += this.writeBytesArray(currentProperty.value.values);
                        }
                        break;

                    case 'IntProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            property += this.writeInt(currentProperty.value.values[i]);
                        }
                        break;

                    case 'FloatProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            property += this.writeFloat(currentProperty.value.values[i]);
                        }
                        break;

                    case 'EnumProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            property += this.writeString(currentProperty.value.values[i].name);
                        }
                        break;

                    case 'StrProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            property += this.writeString(currentProperty.value.values[i]);
                        }
                        break;

                    case 'TextProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            property += this.writeTextProperty(currentProperty.value.values[i]);
                        }
                        break;

                    case 'ObjectProperty':
                    case 'InterfaceProperty':
                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            property += this.writeObjectProperty(currentProperty.value.values[i]);
                        }
                        break;

                    case 'StructProperty':
                        let currentBufferStartingLength     = this.currentBufferLength;
                        let structPropertyBufferLength      = this.currentEntityLength;

                        property += this.writeString(currentProperty.structureName);
                        property += this.writeString(currentProperty.structureType);

                        let structure   = this.writeInt(0);
                            structure  += this.writeString(currentProperty.structureSubType);

                            structure  += this.writeInt( ((currentProperty.propertyGuid1 !== undefined) ? currentProperty.propertyGuid1 : 0) );
                            structure  += this.writeInt( ((currentProperty.propertyGuid2 !== undefined) ? currentProperty.propertyGuid2 : 0) );
                            structure  += this.writeInt( ((currentProperty.propertyGuid3 !== undefined) ? currentProperty.propertyGuid3 : 0) );
                            structure  += this.writeInt( ((currentProperty.propertyGuid4 !== undefined) ? currentProperty.propertyGuid4 : 0) );

                            structure  += this.writeByte(0);

                        let structureSizeLength      = this.currentEntityLength;

                        for(let i = 0; i < currentArrayPropertyCount; i++)
                        {
                            switch(currentProperty.structureSubType)
                            {
                                case 'InventoryItem': // MOD: FicsItNetworks
                                    structure += this.writeInt(currentProperty.value.values[i].unk1);
                                    structure += this.writeString(currentProperty.value.values[i].itemName);
                                    structure += this.writeObjectProperty(currentProperty.value.values[i]);
                                    break;

                                case 'Guid':
                                    structure += this.writeHex(currentProperty.value.values[i]);
                                    break;

                                case 'FINNetworkTrace': // MOD: FicsIt-Networks
                                    structure += this.writeFINNetworkTrace(currentProperty.value.values[i]);
                                    break;

                                case 'Vector':
                                    structure += this.writeFloat(currentProperty.value.values[i].x);
                                    structure += this.writeFloat(currentProperty.value.values[i].y);
                                    structure += this.writeFloat(currentProperty.value.values[i].z);
                                    break;

                                case 'LinearColor':
                                    structure += this.writeFloat(currentProperty.value.values[i].r);
                                    structure += this.writeFloat(currentProperty.value.values[i].g);
                                    structure += this.writeFloat(currentProperty.value.values[i].b);
                                    structure += this.writeFloat(currentProperty.value.values[i].a);
                                    break;


                                // MOD: FicsIt-Networks
                                case 'FINGPUT1BufferPixel':
                                    structure += this.writeFINGPUT1BufferPixel(currentProperty.value.values[i]);
                                    break;

                                default:
                                    for(let j = 0; j < currentProperty.value.values[i].length; j++)
                                    {
                                        structure += this.writeProperty(currentProperty.value.values[i][j]);
                                    }
                                    structure += this.writeString('None');
                                    break;
                            }
                        }

                        property += this.writeInt(this.currentEntityLength - structureSizeLength);
                        property += structure;

                        this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);

                        break;
                    default:
                        console.log('Missing ' + currentProperty.value.type + ' in ArrayProperty=>' + currentProperty.name);
                        break;
                }

                break;

            case 'MapProperty':
                let currentMapPropertyCount    = currentProperty.value.values.length;

                property += this.writeString(currentProperty.value.keyType, false);
                property += this.writeString(currentProperty.value.valueType, false);
                property += this.writeByte(0, false);
                property += this.writeInt(currentProperty.value.modeType);

                if(currentProperty.value.modeType === 3)
                {
                    property += this.writeHex(currentProperty.value.modeUnk1);
                    property += this.writeString(currentProperty.value.modeUnk2);
                    property += this.writeString(currentProperty.value.modeUnk3);
                }

                property += this.writeInt(currentMapPropertyCount);

                for(let iMapProperty = 0; iMapProperty < currentMapPropertyCount; iMapProperty++)
                {
                    switch(currentProperty.value.keyType)
                    {
                        case 'IntProperty':
                            property += this.writeInt(currentProperty.value.values[iMapProperty].key);
                            break;
                        case 'Int64Property':
                            property += this.writeLong(currentProperty.value.values[iMapProperty].key);
                            break;
                        case 'NameProperty':
                        case 'StrProperty':
                            property += this.writeString(currentProperty.value.values[iMapProperty].key);
                            break;
                        case 'ObjectProperty':
                            property += this.writeObjectProperty(currentProperty.value.values[iMapProperty].key);
                            break;
                        case 'EnumProperty':
                             property += this.writeString(currentProperty.value.values[iMapProperty].key.name);
                            break;
                        case 'StructProperty':
                            for(let i = 0; i < currentProperty.value.values[iMapProperty].key.length; i++)
                            {
                                property += this.writeProperty(currentProperty.value.values[iMapProperty].key[i]);
                            }
                            property += this.writeString('None');
                            break;
                        default:
                            console.log('Missing ' + currentProperty.value.type + ' in ' + currentProperty.name);
                    }

                    switch(currentProperty.value.valueType)
                    {
                        case 'ByteProperty':
                            if(currentProperty.value.keyType === 'StrProperty')
                            {
                                property += this.writeString(currentProperty.value.values[iMapProperty].value);
                            }
                            else
                            {
                                property += this.writeByte(currentProperty.value.values[iMapProperty].value);
                            }
                            break;
                        case 'BoolProperty':
                            property += this.writeByte(currentProperty.value.values[iMapProperty].value);
                            break;
                        case 'IntProperty':
                            property += this.writeInt(currentProperty.value.values[iMapProperty].value);
                            break;
                        case 'StrProperty':
                            property += this.writeString(currentProperty.value.values[iMapProperty].value);
                            break;
                        case 'ObjectProperty':
                            property += this.writeObjectProperty(currentProperty.value.values[iMapProperty].value);
                            break;
                        case 'StructProperty':
                            let currentBufferStartingLength     = this.currentBufferLength;
                            let structPropertyBufferLength      = this.currentEntityLength;

                            for(let i = 0; i < currentProperty.value.values[iMapProperty].value.length; i++)
                            {
                                property += this.writeProperty(currentProperty.value.values[iMapProperty].value[i]);
                            }
                            property += this.writeString('None');

                            this.currentBufferLength = currentBufferStartingLength + (this.currentEntityLength - structPropertyBufferLength);
                            break;
                        default:
                            console.log('Missing ' + currentProperty.value.type + ' in MapProperty=>' + currentProperty.name);
                            break;
                    }
                }

                break;
        }

        let propertyLength          = parseInt(this.currentBufferLength) || 0; // Prevent NaN
        this.currentBufferLength    = startCurrentPropertyBufferLength + propertyLength;

        return propertyStart + this.writeInt(propertyLength) + property;
    }

    writeTextProperty(currentProperty)
    {
        let property  = this.writeInt(currentProperty.flags);
            property += this.writeByte(currentProperty.historyType);

        switch(currentProperty.historyType)
        {
            case 0:
                property += this.writeString(currentProperty.namespace);
                property += this.writeString(currentProperty.key);
                property += this.writeString(currentProperty.value);
                break;
            case 1:
            case 3:
                property += this.writeTextProperty(currentProperty.sourceFmt);
                property += this.writeInt(currentProperty.argumentsCount);

                for(let i = 0; i < currentProperty.argumentsCount; i++)
                {
                    property += this.writeString(currentProperty.arguments[i].name);
                    property += this.writeByte(currentProperty.arguments[i].valueType);

                    switch(currentProperty.arguments[i].valueType)
                    {
                        case 4:
                            property += this.writeTextProperty(currentProperty.arguments[i].argumentValue);
                            break;
                    }
                }
                break;
            case 10:
                property += this.writeTextProperty(currentProperty.sourceText);
                property += this.writeByte(currentProperty.transformType);
                break;
            case 255:
                // Broke during engine upgrade?
                // See: https://github.com/EpicGames/UnrealEngine/blob/4.25/Engine/Source/Runtime/Core/Private/Internationalization/Text.cpp#L894
                if(this.header.buildVersion >= 140822)
                {
                    property += this.writeInt(currentProperty.hasCultureInvariantString);

                    if(currentProperty.hasCultureInvariantString === 1)
                    {
                        property += this.writeString(currentProperty.value);
                    }
                }
                break;
        }

        return property;
    }
    writeObjectProperty(value, count = true)
    {
        let property = '';
            if(value.levelName !== undefined)
            {
                property += this.writeString(value.levelName, count);
            }
            else
            {
                property += this.writeString('Persistent_Level', count);
            }

            property += this.writeString(value.pathName, count);

        return property;
    }



    writeByte(value, count = true)
    {
        if(this.precacheByte === undefined)
        {
            this.precacheByte = [];
        }
        if(this.precacheByte[value] === undefined)
        {
            this.precacheByte[value] = String.fromCharCode(value & 0xff);
        }

        if(count === true)
        {
            this.currentBufferLength += 1;
        }
        this.currentEntityLength += 1;

        return this.precacheByte[value];
        //return String.fromCharCode(value & 0xff);
    }
    writeBytesArray(values, count = true)
    {
        let arrayLength = values.length;
        let saveBinary  = '';
        //let arrayBuffer = new Uint8Array(arrayLength);

        for(let i = 0; i < arrayLength; i++)
        {
            saveBinary += String.fromCharCode(values[i] & 0xff);
            //arrayBuffer[i] = (values[i] & 0xff);
        }

        if(count === true)
        {
            this.currentBufferLength += arrayLength;
        }
        this.currentEntityLength += arrayLength;

        return saveBinary;
        //this.saveBinary += String.fromCharCode.apply(null, arrayBuffer);
    }

    writeHex(value, count = true)
    {
        if(count === true)
        {
            this.currentBufferLength += value.length;
        }
        this.currentEntityLength += value.length;

        return value;
    }

    // https://github.com/feross/buffer/blob/v6.0.3/index.js#L1440
    writeInt8(value, count = true)
    {
        let arrayBuffer     = new Uint8Array(1);
            arrayBuffer[0]  = (value & 0xff);

        if(count === true)
        {
            this.currentBufferLength++;
        }
        this.currentEntityLength++;

        return String.fromCharCode.apply(null, arrayBuffer);
    }

    // https://github.com/feross/buffer/blob/v6.0.3/index.js#L1469
    writeInt(value, count = true)
    {
        let arrayBuffer     = new Uint8Array(4);
            arrayBuffer[3]  = (value >>> 24);
            arrayBuffer[2]  = (value >>> 16);
            arrayBuffer[1]  = (value >>> 8);
            arrayBuffer[0]  = (value & 0xff);

        if(count === true)
        {
            this.currentBufferLength += 4;
        }
        this.currentEntityLength += 4;

        return String.fromCharCode.apply(null, arrayBuffer);
    }

    writeLong(value, count = true)
    {
        if(value instanceof Array)
        {
            let property  = this.writeInt(value[0], count);
                property += this.writeInt(value[1], count);

                return property;
        }
        else
        {
            let property  = this.writeInt(value, count);
                property += this.writeInt(0, count);

                return property;
        }
    }

    writeFloat(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(4);
        let dataView        = new DataView(arrayBuffer);
            dataView.setFloat32(0, value, true);

        if(count === true)
        {
            this.currentBufferLength += 4;
        }
        this.currentEntityLength += 4;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }
    writeDouble(value, count = true)
    {
        let arrayBuffer     = new ArrayBuffer(8);
        let dataView        = new DataView(arrayBuffer);
            dataView.setFloat64(0, value, true);

        if(count === true)
        {
            this.currentBufferLength += 8;
        }
        this.currentEntityLength += 8;

        return String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    }

    writeString(value, count = true)
    {
        let stringLength = value.length;
            if(stringLength === 0)
            {
                return this.writeInt(0, count);
            }

        // UTF8
        if(/^[\x00-\x7F]*$/.test(value) === true)
        {
            let saveBinary  = this.writeInt(stringLength + 1, count);
                saveBinary += value;
                saveBinary += this.writeByte(0, count);

            if(count === true)
            {
                this.currentBufferLength += stringLength;
            }
            this.currentEntityLength += stringLength;

            return saveBinary;
        }
        // UTF16
        else
        {
            let saveBinary      = this.writeInt(-stringLength - 1, count);
            let arrayBuffer     = new Uint8Array(stringLength * 2);
                for(let i = 0; i < stringLength; i++)
                {
                    arrayBuffer[i * 2]      = value.charCodeAt(i) & 0xff;
                    arrayBuffer[i * 2 + 1]  = (value.charCodeAt(i) >> 8) & 0xff;
                }

            if(count === true)
            {
                this.currentBufferLength += stringLength * 2;
            }
            this.currentEntityLength += stringLength * 2;

            saveBinary += String.fromCharCode.apply(null, arrayBuffer);
            saveBinary += this.writeByte(0, count);
            saveBinary += this.writeByte(0, count);

            return saveBinary;
        }
    }

    writeFINGPUT1BufferPixel(value)
    {
        let saveBinary  = '';
            saveBinary += this.writeHex(value.character);
            saveBinary += this.writeFloat(value.foregroundColor.r);
            saveBinary += this.writeFloat(value.foregroundColor.g);
            saveBinary += this.writeFloat(value.foregroundColor.b);
            saveBinary += this.writeFloat(value.foregroundColor.a);
            saveBinary += this.writeFloat(value.backgroundColor.r);
            saveBinary += this.writeFloat(value.backgroundColor.g);
            saveBinary += this.writeFloat(value.backgroundColor.b);
            saveBinary += this.writeFloat(value.backgroundColor.a);

        return saveBinary;
    }

    writeFINNetworkTrace(value)
    {
        let saveBinary  = '';
            saveBinary += this.writeObjectProperty(value);

            if(value.prev !== undefined)
            {
                saveBinary += this.writeInt(1);
                saveBinary += this.writeFINNetworkTrace(value.prev);
            }
            else
            {
                saveBinary += this.writeInt(0);
            }

            if(value.step !== undefined)
            {
                saveBinary += this.writeInt(1);
                saveBinary += this.writeString(value.step);
            }
            else
            {
                saveBinary += this.writeInt(0);
            }

        return saveBinary;
    };

    writeFINLuaProcessorStateStorage(value)
    {
        let saveBinary  = '';

            saveBinary += this.writeInt(value.trace.length);
            for(let i = 0; i < value.trace.length; i++)
            {
                saveBinary += this.writeFINNetworkTrace(value.trace[i]);
            }

            saveBinary += this.writeInt(value.reference.length);
            for(let i = 0; i < value.reference.length; i++)
            {
                saveBinary += this.writeString(value.reference[i].levelName);
                saveBinary += this.writeString(value.reference[i].pathName);
            }

            saveBinary += this.writeString(value.thread);
            saveBinary += this.writeString(value.globals);

            saveBinary += this.writeInt(value.structs.length);
            for(let i = 0; i < value.structs.length; i++)
            {
                saveBinary += this.writeInt(value.structs[i].unk1);
                saveBinary += this.writeString(value.structs[i].unk2);

                switch(value.structs[i].unk2)
                {
                    case '/Script/CoreUObject.Vector':
                        saveBinary += this.writeFloat(value.structs[i].x);
                        saveBinary += this.writeFloat(value.structs[i].y);
                        saveBinary += this.writeFloat(value.structs[i].z);
                        break;
                    case '/Script/CoreUObject.LinearColor':
                        saveBinary += this.writeFloat(value.structs[i].r);
                        saveBinary += this.writeFloat(value.structs[i].g);
                        saveBinary += this.writeFloat(value.structs[i].b);
                        saveBinary += this.writeFloat(value.structs[i].a);
                        break;
                    case '/Script/FactoryGame.InventoryStack':
                        saveBinary += this.writeInt(value.structs[i].unk3);
                        saveBinary += this.writeString(value.structs[i].unk4);
                        saveBinary += this.writeInt(value.structs[i].unk5);
                        saveBinary += this.writeInt(value.structs[i].unk6);
                        saveBinary += this.writeInt(value.structs[i].unk7);
                        break;
                    case '/Script/FactoryGame.ItemAmount':
                        saveBinary += this.writeInt(value.structs[i].unk3);
                        saveBinary += this.writeString(value.structs[i].unk4);
                        saveBinary += this.writeInt(value.structs[i].unk5);
                        break;
                    case '/Script/FicsItNetworks.FINTrackGraph':
                        saveBinary += this.writeFINNetworkTrace(value.structs[i].trace);
                        saveBinary += this.writeInt(value.structs[i].trackId);
                        break;
                    case '/Script/FicsItNetworks.FINGPUT1Buffer':
                        saveBinary += this.writeInt(value.structs[i].x);
                        saveBinary += this.writeInt(value.structs[i].y);
                        saveBinary += this.writeInt(value.structs[i].size);
                        saveBinary += this.writeString(value.structs[i].name);
                        saveBinary += this.writeString(value.structs[i].type);
                        saveBinary += this.writeInt(value.structs[i].length);

                        for(let size = 0; size < value.structs[i].size; size++)
                        {
                            saveBinary += this.writeFINGPUT1BufferPixel(value.structs[i].buffer[size]);
                        }

                        saveBinary += this.writeHex(value.structs[i].unk3);
                        break;
                }
            }

        return saveBinary;
    }
};

self.onmessage = function(e){
    return new SaveParser_Write(self, e.data);
};
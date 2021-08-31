import pako                                     from '../Lib/pako.esm.mjs';

export default class SaveParser_Write
{
    constructor(options)
    {
        this.saveParser             = options.saveParser;
        this.callback               = options.callback;

        this.currentBufferLength    = 0; // Used for writing...
    }

    streamSave()
    {
        console.time('writeFileSaveAs');

        if(this.saveParser.header.saveVersion >= 21)
        {
            this.streamCompressedSave();
        }
        else
        {
            alert('How did you get there!!!! We should not support old save loading...');
        }
    }

    streamCompressedSave()
    {
        this.saveBlobArray  = [];
        this.saveBinary     = '';

        this.writeHeader();
        this.saveBlobArray.push(this.flushToUint8Array());

        setTimeout(function(){
            $('#loaderProgressBar').css('display', 'flex');
            $('#loaderProgressBar .progress-bar').css('width', '0px');
            this.generateChunks();
        }.bind(this), 5);
    }

    generateChunks()
    {
        this.generatedChunks = [];

        let objectsKeys      = Object.keys(this.saveParser.objects);
        let countObjects     = objectsKeys.length;
            this.saveBinary += this.writeInt(countObjects, false); // This is a reservation for the inflated length ;)
            this.saveBinary += this.writeInt(countObjects, false);

        return this.generateObjectsChunks(0, objectsKeys);
    }

    generateObjectsChunks(i = 0, objectsKeys)
    {
        let countObjects = objectsKeys.length;
            for(i; i < countObjects; i++)
            {
                if(this.saveParser.objects[objectsKeys[i]] !== undefined)
                {
                    if(this.saveParser.objects[objectsKeys[i]].type === 0)
                    {
                        this.saveBinary += this.writeObject(this.saveParser.objects[objectsKeys[i]]);
                    }
                    if(this.saveParser.objects[objectsKeys[i]].type === 1)
                    {
                        this.saveBinary += this.writeActor(this.saveParser.objects[objectsKeys[i]]);
                    }
                }

                if(this.saveBinary.length >= this.saveParser.maxChunkSize)
                {
                    return new Promise(function(resolve){
                        this.pushSaveToChunk();

                        $('#loaderProgressBar .progress-bar').css('width', ((i / countObjects * 100) * 0.48) + '%');
                        $('.loader h6').html('Compiling ' + i + '/' + countObjects + ' objects...');
                        setTimeout(resolve, 5);
                    }.bind(this)).then(function(){
                        this.generateObjectsChunks((i + 1), objectsKeys);
                    }.bind(this));
                }
            }

        console.log('Saved ' + countObjects + ' objects...');

        this.saveBinary += this.writeInt(countObjects, false);
        return this.generateEntitiesChunks(0, objectsKeys);
    }

    generateEntitiesChunks(i = 0, objectsKeys)
    {
        let countObjects = objectsKeys.length;
            for(i; i < countObjects; i++)
            {
                if(this.saveParser.objects[objectsKeys[i]] !== undefined)
                {
                    this.saveBinary += this.writeEntity(this.saveParser.objects[objectsKeys[i]]);
                }

                if(this.saveBinary.length >= this.saveParser.maxChunkSize)
                {
                    return new Promise(function(resolve){
                        this.pushSaveToChunk();

                        $('#loaderProgressBar .progress-bar').css('width', (48 + (i / countObjects * 100) * 0.48) + '%');
                        $('.loader h6').html('Compiling ' + i + '/' + countObjects + ' entities...');
                        setTimeout(resolve, 5);
                    }.bind(this)).then(function(){
                        this.generateEntitiesChunks((i + 1), objectsKeys);
                    }.bind(this));
                }
            }

        console.log('Saved ' + countObjects + ' entities...');

        let countCollectables = this.saveParser.collectables.length;
            this.saveBinary  += this.writeInt(countCollectables, false);
        return this.generateCollectablesChunks(0, countCollectables);
    }

    generateCollectablesChunks(i = 0, countCollectables)
    {
        $('.loader h6').html('Compiling ' + countCollectables + ' collectables...');

        for(i = 0; i < countCollectables; i++)
        {
            this.saveBinary += this.writeString(this.saveParser.collectables[i].levelName, false);
            this.saveBinary += this.writeString(this.saveParser.collectables[i].pathName, false);

            if(this.saveBinary.length >= this.saveParser.maxChunkSize)
            {
                this.pushSaveToChunk();
            }
        }

        console.log('Saved ' + countCollectables + ' collectables...');

        return this.finalizeChunks();
    }

    pushSaveToChunk()
    {
        //$('.loader h6').html('Deflate chunk ' + this.generatedChunks.length + ' (' + this.saveBinary.length + ' / ' + this.saveParser.maxChunkSize + ')...');
        while(this.saveBinary.length >= this.saveParser.maxChunkSize)
        {
            // Extract extra to be processed later...
            let tempSaveBinary  = this.saveBinary.slice(this.saveParser.maxChunkSize);
                this.saveBinary = this.saveBinary.slice(0, this.saveParser.maxChunkSize);

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
        this.saveBinary += this.writeInt(this.saveParser.PACKAGE_FILE_TAG);
        this.saveBinary += this.writeInt(0);
        this.saveBinary += this.writeInt(this.saveParser.maxChunkSize);
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

        setTimeout(function(){
            $('.loader h6').html('Generating save file...');

            if(chunks.length > 0)
            {
                this.streamChunks(chunks);
            }
            else
            {
                saveAs(
                    new Blob(
                        this.saveBlobArray,
                        {type: "application/octet-stream; charset=utf-8"}
                    ), this.saveParser.fileName.replace('.sav', '') + '_CALCULATOR.sav'
                );


                window.SCIM.hideLoader();
                console.timeEnd('writeFileSaveAs');

                this.saveBlobArray  = [];
                return;
            }
        }.bind(this), 5);
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
            header += this.writeInt(this.saveParser.header.saveHeaderType, false);
            header += this.writeInt(this.saveParser.header.saveVersion, false);
            header += this.writeInt(this.saveParser.header.buildVersion, false);
            header += this.writeString(this.saveParser.header.mapName, false);
            header += this.writeString(this.saveParser.header.mapOptions, false);
            header += this.writeString(this.saveParser.header.sessionName, false);
            header += this.writeInt(this.saveParser.header.playDurationSeconds, false);
            header += this.writeLong(this.saveParser.header.saveDateTime, false);
            header += this.writeByte(this.saveParser.header.sessionVisibility, false);

            if(this.saveParser.header.saveHeaderType >= 7)
            {
                header += this.writeInt(this.saveParser.header.fEditorObjectVersion, false);
            }
            if(this.saveParser.header.saveHeaderType >= 8)
            {
                header += this.writeString(this.saveParser.header.modMetadata, false);
                header += this.writeInt(this.saveParser.header.isModdedSave, false);
            }

        this.saveBinary += header;
    }

    writeObject(currentObject)
    {
        let object  = this.writeInt(0, false);
            object += this.writeString(currentObject.className, false);

            if(currentObject.levelName !== undefined)
            {
                object += this.writeString(currentObject.levelName, false);
            }
            else
            {
                object += this.writeString('Persistent_Level', false);
            }

            object += this.writeString(currentObject.pathName, false);
            object += this.writeString(currentObject.outerPathName, false);

        return object;
    }

    writeActor(currentActor)
    {
        let actor  = this.writeInt(1, false);
            actor += this.writeString(currentActor.className, false);

            if(currentActor.levelName !== undefined)
            {
                actor += this.writeString(currentActor.levelName, false);
            }
            else
            {
                actor += this.writeString('Persistent_Level', false);
            }

            actor += this.writeString(currentActor.pathName, false);

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
            entity += this.writeString(currentObject.entityLevelName);
            entity += this.writeString(currentObject.entityPathName);

            if(currentObject.children !== undefined)
            {
                let countChild  = currentObject.children.length;
                    entity += this.writeInt(countChild);
                    for(let i = 0; i < countChild; i++)
                    {
                        entity += this.writeString(currentObject.children[i].levelName);
                        entity += this.writeString(currentObject.children[i].pathName);
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
                currentObject.className.search('/Build_ConveyorBeltMk') !== -1
             || currentObject.className.search('/Build_ConveyorLiftMk') !== -1
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
                    entity += this.writeInt(currentObject.extra.items[i].length);
                    entity += this.writeString(currentObject.extra.items[i].name);
                    entity += this.writeString(currentObject.extra.items[i].levelName);
                    entity += this.writeString(currentObject.extra.items[i].pathName);
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
                        entity += this.writeString(currentObject.extra.game[i].levelName);
                        entity += this.writeString(currentObject.extra.game[i].pathName);
                    }

                    break;
                case '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
                case '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C':
                case '/FlexSplines/PowerLine/Build_FlexPowerline.Build_FlexPowerline_C':
                    entity += this.writeInt(currentObject.extra.count);
                    entity += this.writeString(currentObject.extra.sourceLevelName);
                    entity += this.writeString(currentObject.extra.sourcePathName);
                    entity += this.writeString(currentObject.extra.targetLevelName);
                    entity += this.writeString(currentObject.extra.targetPathName);

                    break;
                case '/Game/FactoryGame/-Shared/Blueprint/BP_CircuitSubsystem.BP_CircuitSubsystem_C':
                    entity += this.writeInt(currentObject.extra.count);
                    entity += this.writeInt(currentObject.extra.circuits.length);

                    for(let i = 0; i < currentObject.extra.circuits.length; i++)
                    {
                        entity += this.writeInt(currentObject.extra.circuits[i].circuitId);
                        entity += this.writeString(currentObject.extra.circuits[i].levelName);
                        entity += this.writeString(currentObject.extra.circuits[i].pathName);
                    }

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C':
                    entity += this.writeString(currentObject.extra.unk1);
                    entity += this.writeString(currentObject.extra.unk2);
                    entity += this.writeString(currentObject.extra.previousLevelName);
                    entity += this.writeString(currentObject.extra.previousPathName);
                    entity += this.writeString(currentObject.extra.nextLevelName);
                    entity += this.writeString(currentObject.extra.nextPathName);

                    break;
                case '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C':
                case '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C':
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
                property += this.writeByte(0, false);
                break;

            case 'Int8Property':
                property += this.writeByte(0, false);
                property += this.writeInt8(currentProperty.value);

                break;


            case 'IntProperty':
            case 'UInt32Property': // Mod?
                property += this.writeByte(0, false);
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
                property += this.writeString(currentProperty.value.levelName);
                property += this.writeString(currentProperty.value.pathName);
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
                        property += this.writeString(currentProperty.value.levelName);
                        property += this.writeString(currentProperty.value.pathName);
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
                        property += this.writeString(currentProperty.value.levelName);
                        property += this.writeString(currentProperty.value.pathName);

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
                            property += this.writeString(currentProperty.value.values[iSetProperty].levelName);
                            property += this.writeString(currentProperty.value.values[iSetProperty].pathName);
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

                property += this.writeString(currentProperty.value.type, false);
                property += this.writeByte(0, false);
                property += this.writeInt(currentArrayPropertyCount);

                switch(currentProperty.value.type)
                {
                    case 'ByteProperty':
                        property += this.writeBytesArray(currentProperty.value.values);
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
                            property += this.writeString(currentProperty.value.values[i].levelName);
                            property += this.writeString(currentProperty.value.values[i].pathName);
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
                                    structure += this.writeString(currentProperty.value.values[i].levelName);
                                    structure += this.writeString(currentProperty.value.values[i].pathName);
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
                                    structure += this.writeHex(currentProperty.value.values[i].character);
                                    structure += this.writeFloat(currentProperty.value.values[i].foregroundColor.r);
                                    structure += this.writeFloat(currentProperty.value.values[i].foregroundColor.g);
                                    structure += this.writeFloat(currentProperty.value.values[i].foregroundColor.b);
                                    structure += this.writeFloat(currentProperty.value.values[i].foregroundColor.a);
                                    structure += this.writeFloat(currentProperty.value.values[i].backgroundColor.r);
                                    structure += this.writeFloat(currentProperty.value.values[i].backgroundColor.g);
                                    structure += this.writeFloat(currentProperty.value.values[i].backgroundColor.b);
                                    structure += this.writeFloat(currentProperty.value.values[i].backgroundColor.a);
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
                property += this.writeInt(0);
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
                            property += this.writeString(currentProperty.value.values[iMapProperty].key.levelName);
                            property += this.writeString(currentProperty.value.values[iMapProperty].key.pathName);
                            break;
                        case 'EnumProperty':
                             property += this.writeString(currentProperty.value.values[iMapProperty].key.name);
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
                        case 'IntProperty':
                            property += this.writeInt(currentProperty.value.values[iMapProperty].value);
                            break;
                        case 'StrProperty':
                            property += this.writeString(currentProperty.value.values[iMapProperty].value);
                            break;
                        case 'ObjectProperty':
                            property += this.writeString(currentProperty.value.values[iMapProperty].value.levelName);
                            property += this.writeString(currentProperty.value.values[iMapProperty].value.pathName);
                            break;
                        case 'StructProperty':
                            let currentBufferStartingLength     = this.currentBufferLength;
                            let structPropertyBufferLength      = this.currentEntityLength;

                            for(let i =0; i < currentProperty.value.values[iMapProperty].value.length; i++)
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
                if(this.saveParser.header.buildVersion >= 140822)
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
            let saveBinary      = this.writeInt(-stringLength, count);
            let arrayBuffer     = new Uint8Array(stringLength * 2);

            for (let i = 0; i < stringLength; i++)
            {
                arrayBuffer[i * 2] = value.charCodeAt(i) & 0xff;
                arrayBuffer[i * 2 + 1] = (value.charCodeAt(i) >> 8) & 0xff;
            }

            if(count === true)
            {
                this.currentBufferLength += stringLength * 2;
            }
            this.currentEntityLength += stringLength * 2;

            saveBinary += String.fromCharCode.apply(null, arrayBuffer);

            return saveBinary;
        }
    }

    writeFINNetworkTrace(value)
    {
        let saveBinary  = '';
            saveBinary += this.writeString(value.levelName);
            saveBinary += this.writeString(value.pathName);

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

                if(value.structs[i].unk2 === '/Script/FactoryGame.InventoryStack')
                {
                    saveBinary += this.writeInt(value.structs[i].unk3);
                    saveBinary += this.writeString(value.structs[i].ink4);
                    saveBinary += this.writeInt(value.structs[i].unk5);
                    saveBinary += this.writeInt(value.structs[i].unk6);
                    saveBinary += this.writeInt(value.structs[i].unk7);
                }
            }

        return saveBinary;
    }
}
/* global Infinity, gtag, L, Promise */
import SaveParser_FicsIt                        from '../SaveParser/FicsIt.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import pako                                     from '../Lib/pako.esm.js';
import saveAs                                   from '../Lib/FileSaver.js';

export default class Spawn_Megaprint
{
    constructor(options)
    {
        this.baseLayout                     = options.baseLayout;

        this.clipboard                      = JSON.parse(JSON.stringify(options.clipboard));
        this.marker                         = options.marker;
        this.pasteOn                        = (options.pasteOn !== undefined) ? options.pasteOn : 'bottom';

        this.xOffset                        = (options.xOffset !== undefined) ? parseFloat(options.xOffset) : 0;
        this.yOffset                        = (options.yOffset !== undefined) ? parseFloat(options.yOffset) : 0;
        this.zOffset                        = (this.clipboard.zOffset !== undefined) ? parseFloat(this.clipboard.zOffset) : ((options.zOffset !== undefined) ? parseFloat(options.zOffset) : 0);
        this.colorSlotHelper                = (options.colorSlotHelper !== undefined) ? options.colorSlotHelper : 'NONE';
        this.powerLineClassName             = ['/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C', '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C'];
        this.excludedTranslationClassName   = this.powerLineClassName.concat(['/Script/FactoryGame.FGDockingStationInfo', '/Script/FactoryGame.FGDroneStationInfo', '/Script/FactoryGame.FGTrainStationIdentifier', '/Script/FactoryGame.FGRailroadTimeTable', '/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C']);

        this.useHistory                     = (options.history !== undefined) ? options.history : true;

        if(this.useHistory === true && this.baseLayout.history !== null)
        {
            this.historyValues      = [];
            this.historyPathName    = [];
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Megaprint', {event_category: 'Spawn'});
        }

        return this.spawn();
    }

    spawn()
    {
        if(this.clipboard !== null)
        {
            if(this.baseLayout.useDebug === true)
            {
                console.log('PASTE', this.clipboard);
            }

            console.time('pasteOnFoundation');
            $('#liveLoader').show()
                            .find('.progress-bar').css('width', '0%');

            // Offset double ramps before U5
            if(this.clipboard.buildVersion < 170147)
            {
                for(let i = 0; i < this.clipboard.data.length; i++)
                {
                    if(this.clipboard.data[i].parent.transform !== undefined && this.clipboard.data[i].parent.transform.translation !== undefined)
                    {
                        if(this.clipboard.data[i].parent.className === '/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble_8x1.Build_RampDouble_8x1_C')
                        {
                            this.clipboard.data[i].parent.transform.translation[2] += 100;
                        }
                        if(this.clipboard.data[i].parent.className === '/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble.Build_RampDouble_C')
                        {
                            this.clipboard.data[i].parent.transform.translation[2] += 200;
                        }
                        if(this.clipboard.data[i].parent.className === '/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_8x8x8.Build_Ramp_8x8x8_C')
                        {
                            this.clipboard.data[i].parent.transform.translation[2] += 400;
                        }
                    }
                }
            }

            // Old drone format?
            //TODO: Get mCurrentAction/mActionsToExecute to the new format!
            if(this.baseLayout.saveGameParser.header.saveVersion >= 41 && this.clipboard.saveVersion < 41)
            {
                for(let i = 0; i < this.clipboard.data.length; i++)
                {
                    if(this.clipboard.data[i].parent.className === '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C')
                    {
                        this.clipboard.data[i].parent.extra = {unk1 :0, unk2 :0, mActiveAction: [], mActionQueue: []};
                    }
                }
            }

            // Apply SaveParser_FicsIt
            for(let i = (this.clipboard.data.length - 1); i >= 0; i--)
            {
                this.clipboard.data[i].parent = SaveParser_FicsIt.callADA(this.baseLayout, this.clipboard.data[i].parent, true);
                if(this.clipboard.data[i].parent === null)
                {
                    this.clipboard.data.splice(i, 1);
                }
            }

            if(this.marker === null) // Paste on original location
            {
                this.centerObject       = {
                    transform: {
                        translation: [
                            ((this.clipboard.minX + this.clipboard.maxX) / 2) + this.xOffset,
                            ((this.clipboard.minY + this.clipboard.maxY) / 2) + this.yOffset
                        ]
                    }
                };
            }
            else
            {
                this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
                this.centerObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
                this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;

                // Update translation according to the center
                let centerX             = ((this.clipboard.minX + this.clipboard.maxX) / 2) + this.xOffset;
                let centerY             = ((this.clipboard.minY + this.clipboard.maxY) / 2) + this.yOffset;
                let minZ                = Infinity;

                // Try to find the minZ
                for(let i = 0; i < this.clipboard.data.length; i++)
                {
                    if(this.clipboard.data[i].parent.transform !== undefined && this.excludedTranslationClassName.includes(this.clipboard.data[i].parent.className) === false)
                    {
                        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.clipboard.data[i].parent.className);
                            if(currentObjectData !== null && currentObjectData.height !== undefined && (currentObjectData.category === 'frame' || currentObjectData.category === 'foundation' || currentObjectData.category === 'roof'))
                            {
                                // GROUND BUILDING USE HALF AS CENTER
                                minZ = Math.min(minZ, this.clipboard.data[i].parent.transform.translation[2] - (currentObjectData.height * 100 / 2));
                            }
                            else
                            {
                                minZ = Math.min(minZ, this.clipboard.data[i].parent.transform.translation[2]); // OTHER ARE PLACED FROM BOTTOM
                            }

                            /* CHECK IF TRANSLATION SUM EQUALS 0, MEANING MOST LIKELY A SCRIPT THAT SHOUD BE EXCLUDED
                            if(this.clipboard.data[i].parent.transform.translation.reduce((a, b) => a + b, 0) === 0)
                            {
                                console.log(this.clipboard.data[i].parent.transform.translation[2], this.clipboard.data[i].parent)
                            }
                            /**/
                    }
                }

                // Inverse as it's removed from the object translation
                if(this.zOffset !== 0)
                {
                    minZ -= this.zOffset;
                }

                // Apply centering transformation
                for(let i = 0; i < this.clipboard.data.length; i++)
                {
                    if(this.clipboard.data[i].parent.transform !== undefined && this.excludedTranslationClassName.includes(this.clipboard.data[i].parent.className) === false)
                    {
                        this.clipboard.data[i].parent.transform.translation[0] -= centerX;
                        this.clipboard.data[i].parent.transform.translation[1] -= centerY;
                        this.clipboard.data[i].parent.transform.translation[2] -= minZ;

                        if(this.clipboard.data[i].targetPoints !== undefined)
                        {
                            for(let j = 0; j < this.clipboard.data[i].targetPoints.length; j++)
                            {
                                let currentTargetPoint  = this.clipboard.data[i].targetPoints[j];
                                    currentTargetPoint.transform.translation[0] -= centerX;
                                    currentTargetPoint.transform.translation[1] -= centerY;
                                    currentTargetPoint.transform.translation[2] -= minZ;
                            }
                        }
                    }
                }

                // Add foundation helper!
                if(this.colorSlotHelper !== 'NONE')
                {
                    this.setColorSlotHelper(this.colorSlotHelper);
                }
            }

            return new Promise((resolve) => {
                $('#liveLoader .progress-bar').css('width', '1%');

                // Zoom on center?
                let centerPosition = this.baseLayout.satisfactoryMap.unproject(this.centerObject.transform.translation);
                    this.baseLayout.satisfactoryMap.leafletMap.setView(centerPosition, 7);

                window.requestAnimationFrame(resolve);
            }).then(() => {
                this.generatePathName();
            });
        }
    }

    generatePathName()
    {
        let pathNameToConvert       = [];
        let pathNameConversion      = {};

        return new Promise((resolve) => {
            // Generate proper path name...
            for(let i = (this.clipboard.data.length - 1); i >= 0; i--)
            {
                if(pathNameToConvert.includes(this.clipboard.data[i].parent.pathName) === false)
                {
                    pathNameToConvert.push(this.clipboard.data[i].parent.pathName);
                }
                else // Try to remove duplicates...
                {
                    this.clipboard.data.splice(i, 1);
                }
            }

            if(this.clipboard.hiddenConnections !== undefined)
            {
                for(let pathName in this.clipboard.hiddenConnections)
                {
                    if(pathNameToConvert.includes(pathName) === false)
                    {
                        pathNameToConvert.push(pathName);
                    }
                }
            }

            for(let i = 0; i < this.clipboard.data.length; i++)
            {
                let newPathName         = this.baseLayout.generateFastPathName(this.clipboard.data[i].parent);

                    while(pathNameToConvert.includes(newPathName))
                    {
                        newPathName = this.baseLayout.generateFastPathName(this.clipboard.data[i].parent);
                    }

                    pathNameConversion[this.clipboard.data[i].parent.pathName] = newPathName;
            }

            if(this.clipboard.hiddenConnections !== undefined)
            {
                for(let pathName in this.clipboard.hiddenConnections)
                {
                    let oldPathName         = this.clipboard.hiddenConnections[pathName].pathName.split('.');
                    let extension           = oldPathName.pop();

                        if(extension.includes('_'))
                        {
                            oldPathName.push(extension);
                        }

                        oldPathName         = oldPathName.join('.');

                    if(pathNameConversion[oldPathName] === undefined)
                    {
                        let newPathName         = this.baseLayout.generateFastPathName({
                            className: this.clipboard.hiddenConnections[pathName].className,
                            pathName: oldPathName
                        });

                            while(pathNameToConvert.includes(newPathName))
                            {
                                newPathName = this.baseLayout.generateFastPathName({
                                    className: this.clipboard.hiddenConnections[pathName].className,
                                    pathName: oldPathName
                                });
                            }

                            pathNameConversion[pathName] = newPathName;
                    }
                }
            }

            window.requestAnimationFrame(resolve);
        }).then(() => {
            $('#liveLoader .progress-bar').css('width', '2%');
            this.replacePathName(JSON.parse(JSON.stringify(pathNameConversion)));
        });
    }

    replacePathName(pathNameConversion)
    {
        return new Promise((resolve) => {
            let clipboardLength = this.clipboard.data.length;

                // Replace with new pathname...
                for(let i = 0; i < clipboardLength; i++)
                {
                    if(pathNameConversion[this.clipboard.data[i].parent.pathName] !== undefined)
                    {
                        this.clipboard.data[i].parent.pathName = pathNameConversion[this.clipboard.data[i].parent.pathName];
                    }

                    if(this.clipboard.data[i].parent.outerPathName !== undefined && pathNameConversion[this.clipboard.data[i].parent.outerPathName] !== undefined)
                    {
                        this.clipboard.data[i].parent.outerPathName = pathNameConversion[this.clipboard.data[i].parent.outerPathName];
                    }

                    // Convert from old format...
                    if(this.clipboard.data[i].parent.entityPathName !== undefined)
                    {
                        this.clipboard.data[i].parent.entity                        = {};
                        this.clipboard.data[i].parent.entity.pathName               = this.clipboard.data[i].parent.entityPathName;

                        if(this.clipboard.data[i].parent.entityLevelName !== undefined)
                        {
                            this.clipboard.data[i].parent.entity.levelName          = this.clipboard.data[i].parent.entityLevelName;
                        }
                    }
                    // Convert from old format...
                    if(this.clipboard.data[i].parent.extra !== undefined)
                    {
                        if(this.clipboard.data[i].parent.extra.sourcePathName !== undefined)
                        {
                            this.clipboard.data[i].parent.extra.source                  = {};
                            this.clipboard.data[i].parent.extra.source.pathName         = this.clipboard.data[i].parent.extra.sourcePathName;

                            if(this.clipboard.data[i].parent.extra.sourceLevelName !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.source.levelName    = this.clipboard.data[i].parent.extra.sourceLevelName;
                            }
                        }
                        if(this.clipboard.data[i].parent.extra.targetPathName !== undefined)
                        {
                            this.clipboard.data[i].parent.extra.target                  = {};
                            this.clipboard.data[i].parent.extra.target.pathName         = this.clipboard.data[i].parent.extra.targetPathName;

                            if(this.clipboard.data[i].parent.extra.targetLevelName !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.target.levelName    = this.clipboard.data[i].parent.extra.targetLevelName;
                            }
                        }
                        if(this.clipboard.data[i].parent.extra.previousPathName !== undefined)
                        {
                            this.clipboard.data[i].parent.extra.previous                = {};
                            this.clipboard.data[i].parent.extra.previous.pathName       = this.clipboard.data[i].parent.extra.previousPathName;

                            if(this.clipboard.data[i].parent.extra.previousLevelName !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.previous.levelName  = this.clipboard.data[i].parent.extra.previousLevelName;
                            }
                        }
                        if(this.clipboard.data[i].parent.extra.nextPathName !== undefined)
                        {
                            this.clipboard.data[i].parent.extra.next                    = {};
                            this.clipboard.data[i].parent.extra.next.pathName           = this.clipboard.data[i].parent.extra.nextPathName;

                            if(this.clipboard.data[i].parent.extra.nextLevelName !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.next.levelName      = this.clipboard.data[i].parent.extra.nextLevelName;
                            }
                        }
                    }

                    if(this.clipboard.data[i].parent.entity !== undefined && pathNameConversion[this.clipboard.data[i].parent.entity.pathName] !== undefined)
                    {
                        this.clipboard.data[i].parent.entity.pathName = pathNameConversion[this.clipboard.data[i].parent.entity.pathName];
                    }

                    // Power lines connections
                    if(this.powerLineClassName.includes(this.clipboard.data[i].parent.className) && this.clipboard.data[i].parent.extra !== undefined)
                    {
                        // Convert source
                        if(this.clipboard.data[i].parent.extra.source !== undefined && this.clipboard.data[i].parent.extra.source.pathName !== undefined)
                        {
                            let sourcePathName  = this.clipboard.data[i].parent.extra.source.pathName.split('.');
                            let extraPart       = sourcePathName.pop();
                                sourcePathName  = sourcePathName.join('.');

                            if(pathNameConversion[sourcePathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.source.pathName = pathNameConversion[sourcePathName] + '.' + extraPart;
                            }
                        }
                        // Convert target
                        if(this.clipboard.data[i].parent.extra.target !== undefined && this.clipboard.data[i].parent.extra.target.pathName !== undefined)
                        {
                            let targetPathName  = this.clipboard.data[i].parent.extra.target.pathName.split('.');
                            let extraPart       = targetPathName.pop();
                                targetPathName  = targetPathName.join('.');

                            if(pathNameConversion[targetPathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.target.pathName = pathNameConversion[targetPathName] + '.' + extraPart;
                            }
                        }
                    }

                    // Wagons connections
                    if(this.clipboard.data[i].parent.extra !== undefined)
                    {
                        if(this.clipboard.data[i].parent.extra.previous !== undefined && this.clipboard.data[i].parent.extra.previous.pathName !== undefined && this.clipboard.data[i].parent.extra.previous.pathName !== '')
                        {
                            if(pathNameConversion[this.clipboard.data[i].parent.extra.previous.pathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.previous.pathName = pathNameConversion[this.clipboard.data[i].parent.extra.previous.pathName];
                            }
                        }
                        if(this.clipboard.data[i].parent.extra.next !== undefined && this.clipboard.data[i].parent.extra.next.pathName !== undefined && this.clipboard.data[i].parent.extra.next.pathName !== '')
                        {
                            if(pathNameConversion[this.clipboard.data[i].parent.extra.next.pathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.next.pathName = pathNameConversion[this.clipboard.data[i].parent.extra.next.pathName];
                            }
                        }
                    }

                    // Properties
                    if(this.clipboard.data[i].parent.properties !== undefined && this.clipboard.data[i].parent.properties.length > 0)
                    {
                        this.clipboard.data[i].parent.properties = this.transformProperties(this.clipboard.data[i].parent.properties, pathNameConversion);
                    }

                    // Children
                    if(this.clipboard.data[i].children !== undefined && this.clipboard.data[i].children.length > 0)
                    {
                        for(let j = 0; j < this.clipboard.data[i].children.length; j++)
                        {
                            if(this.clipboard.data[i].children[j] !== null)
                            {
                                let childrenPathName    = this.clipboard.data[i].children[j].pathName.split('.');
                                let extraPart           = childrenPathName.pop();
                                    childrenPathName    = childrenPathName.join('.');

                                if(pathNameConversion[childrenPathName] !== undefined)
                                {
                                    for(let k = 0; k < this.clipboard.data[i].parent.children.length; k++)
                                    {
                                        if(this.clipboard.data[i].parent.children[k].pathName === this.clipboard.data[i].children[j].pathName)
                                        {
                                            this.clipboard.data[i].parent.children[k].pathName = pathNameConversion[childrenPathName] + '.' + extraPart;
                                            break;
                                        }
                                    }

                                    this.clipboard.data[i].children[j].pathName = pathNameConversion[childrenPathName] + '.' + extraPart;
                                }

                                if(this.clipboard.data[i].children[j].outerPathName !== undefined && pathNameConversion[this.clipboard.data[i].children[j].outerPathName] !== undefined)
                                {
                                    this.clipboard.data[i].children[j].outerPathName = pathNameConversion[this.clipboard.data[i].children[j].outerPathName];
                                }

                                if(this.clipboard.data[i].children[j].properties !== undefined && this.clipboard.data[i].children[j].properties.length > 0)
                                {
                                    this.clipboard.data[i].children[j].properties = this.transformProperties(this.clipboard.data[i].children[j].properties, pathNameConversion);
                                }
                            }
                        }
                    }

                    // Vehicle target points
                    if(this.clipboard.data[i].targetPoints !== undefined)
                    {
                        for(let j = 0; j < this.clipboard.data[i].targetPoints.length; j++)
                        {
                            if(this.clipboard.data[i].targetPoints[j].properties !== undefined && this.clipboard.data[i].targetPoints[j].properties.length > 0)
                            {
                                this.clipboard.data[i].targetPoints[j].properties = this.transformProperties(this.clipboard.data[i].targetPoints[j].properties, pathNameConversion);
                            }
                        }
                    }

                    // Vehicles waypoints
                    if(this.clipboard.data[i].linkedList !== undefined)
                    {
                        if(this.clipboard.data[i].linkedList.properties !== undefined && this.clipboard.data[i].linkedList.properties.length > 0)
                        {
                            this.clipboard.data[i].linkedList.properties = this.transformProperties(this.clipboard.data[i].linkedList.properties, pathNameConversion);
                        }

                        this.clipboard.data[i].linkedList = JSON.stringify(this.clipboard.data[i].linkedList);
                        for(let oldPathName in pathNameConversion)
                        {
                            if(this.clipboard.data[i].linkedList.indexOf(oldPathName) !== -1)
                            {
                                this.clipboard.data[i].linkedList     = this.clipboard.data[i].linkedList.split('"' + oldPathName + '.').join('"' + pathNameConversion[oldPathName] + '.');
                                this.clipboard.data[i].linkedList     = this.clipboard.data[i].linkedList.split('"' + oldPathName + '"').join('"' + pathNameConversion[oldPathName] + '"');
                            }
                        }
                        this.clipboard.data[i].linkedList = JSON.parse(this.clipboard.data[i].linkedList);
                    }
                }

            window.requestAnimationFrame(resolve);
        }).then(() => {
            $('#liveLoader .progress-bar').css('width', '3%');
            return this.handleHiddenConnections(pathNameConversion);
        });
    }

    transformProperties(properties, pathNameConversion)
    {
        for(let j = 0; j < properties.length; j++)
        {
            let currentProperty = properties[j];

                // Fix old megaprints
                if(currentProperty.type !== undefined)
                {
                    currentProperty.type = currentProperty.type.replace('Property', '');

                    if(currentProperty.type === 'Map')
                    {
                        currentProperty.value.keyType   = currentProperty.value.keyType.replace('Property', '');
                        currentProperty.value.valueType = currentProperty.value.valueType.replace('Property', '');

                        for(let i = 0; i < currentProperty.value.values.length; i++)
                        {
                            if(currentProperty.value.values[i].key !== undefined)
                            {
                                currentProperty.value.values[i].keyMap = currentProperty.value.values[i].key;
                                delete currentProperty.value.values[i].key;
                            }
                            // Loop keyMap
                            if(currentProperty.value.values[i].keyMap !== undefined)
                            {
                                for(let k = 0; k < currentProperty.value.values[i].keyMap.length; k++)
                                {
                                    if(currentProperty.value.values[i].keyMap[k].type !== undefined)
                                    {
                                        currentProperty.value.values[i].keyMap[k].type = currentProperty.value.values[i].keyMap[k].type.replace('Property', '');
                                    }
                                }
                            }

                            if(currentProperty.value.values[i].value !== undefined)
                            {
                                currentProperty.value.values[i].valueMap = currentProperty.value.values[i].value;
                                delete currentProperty.value.values[i].value;
                            }
                            // Loop valueMap
                            if(currentProperty.value.values[i].valueMap !== undefined)
                            {
                                for(let k = 0; k < currentProperty.value.values[i].valueMap.length; k++)
                                {
                                    if(currentProperty.value.values[i].valueMap[k].type !== undefined)
                                    {
                                        currentProperty.value.values[i].valueMap[k].type = currentProperty.value.values[i].valueMap[k].type.replace('Property', '');
                                    }
                                }
                            }
                        }
                    }
                }

                if(currentProperty.structureName !== undefined)
                {
                    delete currentProperty.structureName;
                }
                if(currentProperty.structureType !== undefined)
                {
                    delete currentProperty.structureType;
                }

                if(currentProperty.value !== undefined)
                {
                    if(currentProperty.value.type !== undefined)
                    {
                        currentProperty.value.type = currentProperty.value.type.replace('Property', '');
                    }

                    if(currentProperty.value.properties !== undefined)
                    {
                        currentProperty.value.properties = this.transformProperties(currentProperty.value.properties, pathNameConversion);
                    }
                }

                // Traverse pathName
                if(currentProperty.value !== undefined && currentProperty.value.values !== undefined)
                {
                    currentProperty.value.values = this.transformProperties(currentProperty.value.values, pathNameConversion);

                    for(let k = 0; k < currentProperty.value.values.length; k++)
                    {
                        if(currentProperty.value.values[k].pathName !== undefined && currentProperty.value.values[k].pathName !== '')
                        {
                            currentProperty.value.values[k] = this.transformValue(currentProperty.value.values[k], pathNameConversion);
                        }

                        if(Array.isArray(currentProperty.value.values[k]))
                        {
                            currentProperty.value.values[k] = this.transformProperties(currentProperty.value.values[k], pathNameConversion);

                            for(let i = 0; i < currentProperty.value.values[k].length; i++)
                            {
                                if(currentProperty.value.values[k][i].value !== undefined && currentProperty.value.values[k][i].value.pathName !== undefined && currentProperty.value.values[k][i].value.pathName !== '')
                                {
                                    currentProperty.value.values[k][i].value = this.transformValue(currentProperty.value.values[k][i].value, pathNameConversion);
                                }
                            }
                        }
                    }
                }
                if(currentProperty.value !== undefined && currentProperty.value.pathName !== undefined)
                {
                    currentProperty.value = this.transformValue(currentProperty.value, pathNameConversion);
                }
                if(currentProperty.keyMap !== undefined && currentProperty.keyMap.pathName !== undefined)
                {
                    currentProperty.keyMap = this.transformValue(currentProperty.keyMap, pathNameConversion);
                }
        }

        return properties;
    }

    transformValue(value, pathNameConversion)
    {
        if(pathNameConversion[value.pathName] !== undefined)
        {
            value.pathName = pathNameConversion[value.pathName];
        }
        else
        {
            let testPathName    = value.pathName.split('.');
            let extraPart       = testPathName.pop();
                testPathName    = testPathName.join('.');

            if(pathNameConversion[testPathName] !== undefined)
            {
                value.pathName = pathNameConversion[testPathName] + '.' + extraPart;
            }
        }

        return value;
    }

    handleHiddenConnections(pathNameConversion)
    {
        return new Promise((resolve) => {
            // Add hidden connections
            if(this.clipboard.hiddenConnections !== undefined)
            {
                for(let pathName in this.clipboard.hiddenConnections)
                {
                    let currentHiddenConnections            = JSON.parse(JSON.stringify(this.clipboard.hiddenConnections[pathName]));
                        currentHiddenConnections.pathName   = currentHiddenConnections.pathName.split('.');
                    let extension                           = currentHiddenConnections.pathName[currentHiddenConnections.pathName.length -1];

                        if(pathNameConversion[currentHiddenConnections.pathName.join('.')] !== undefined)
                        {
                            if(extension.includes('_'))
                            {
                                currentHiddenConnections.pathName   = pathNameConversion[currentHiddenConnections.pathName.join('.')];
                            }
                            else
                            {
                                currentHiddenConnections.pathName.pop();
                                currentHiddenConnections.pathName   = pathNameConversion[currentHiddenConnections.pathName.join('.')] + '.' + extension;
                            }
                        }
                        else
                        {
                            currentHiddenConnections.pathName = currentHiddenConnections.pathName.join('.');
                        }

                    if(currentHiddenConnections.outerPathName !== undefined && pathNameConversion[currentHiddenConnections.outerPathName] !== undefined)
                    {
                        currentHiddenConnections.outerPathName = pathNameConversion[currentHiddenConnections.outerPathName];
                    }

                    currentHiddenConnections.properties = this.transformProperties(currentHiddenConnections.properties, pathNameConversion);

                    this.baseLayout.saveGameParser.addObject(currentHiddenConnections);

                    // Push railroadSubSystem power connection
                    if(currentHiddenConnections.className === '/Script/FactoryGame.FGPowerConnectionComponent')
                    {
                        if(this.baseLayout.railroadSubSystem.subSystem.children === undefined)
                        {
                            this.baseLayout.railroadSubSystem.subSystem.children = [];
                        }
                        if(this.baseLayout.railroadSubSystem.subSystem.children.includes(currentHiddenConnections.pathName) === false)
                        {
                            this.baseLayout.railroadSubSystem.subSystem.children.push({pathName: currentHiddenConnections.pathName});
                        }
                    }
                }
            }

            window.requestAnimationFrame(resolve);
        }).then(() => {
            $('#liveLoader .progress-bar').css('width', '4%');
            return this.handlePipeNetworks(pathNameConversion);
        });
    }

    handlePipeNetworks(pathNameConversion)
    {
        let pipesConversion = {};

        return new Promise((resolve) => {
            if(this.clipboard.pipes !== undefined)
            {
                for(let pipeNetworkID in this.clipboard.pipes)
                {
                    let newPipeNetworkID    = this.baseLayout.pipeNetworkSubSystem.getNextId();
                    let newPipeNetwork      = {
                        type                    : 1,
                        className               : '/Script/FactoryGame.FGPipeNetwork',
                        pathName                : this.baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.FGPipeNetwork_XXX'}),
                        transform               : {rotation: [0, 0, 0, 1], translation: [0, 0, 0]},
                        children                : [],
                        properties              : [{name: 'mPipeNetworkID', type: 'Int', value: newPipeNetworkID}],
                        entity                  : {levelName: '', pathName: ''}
                    };

                    if(this.clipboard.pipes[pipeNetworkID].fluid !== null)
                    {
                        let newmFluidDescriptor = {name: 'mFluidDescriptor', type: 'Object'};
                            if(this.clipboard.pipes[pipeNetworkID].fluid.pathName !== undefined)
                            {
                                newmFluidDescriptor.value = this.clipboard.pipes[pipeNetworkID].fluid;
                            }
                            else
                            {
                                newmFluidDescriptor.value = {levelName: '', pathName: this.clipboard.pipes[pipeNetworkID].fluid};
                            }

                            newPipeNetwork.properties.push(newmFluidDescriptor);
                    }

                    if(this.clipboard.pipes[pipeNetworkID].interface.length > 0)
                    {
                        let mFluidIntegrantScriptInterfaces = {name: 'mFluidIntegrantScriptInterfaces', type: 'Array', value: {type: 'Interface', values: []}};

                            for(let i = 0; i < this.clipboard.pipes[pipeNetworkID].interface.length; i++)
                            {
                                let newPipeNetworkPathName = this.transformValue({pathName: this.clipboard.pipes[pipeNetworkID].interface[i]}, pathNameConversion);
                                    mFluidIntegrantScriptInterfaces.value.values.push(newPipeNetworkPathName);
                                    pipesConversion[newPipeNetworkPathName.pathName] = newPipeNetworkID;
                            }

                        newPipeNetwork.properties.push(mFluidIntegrantScriptInterfaces);
                    }

                    this.baseLayout.saveGameParser.addObject(newPipeNetwork);
                    this.baseLayout.pipeNetworkSubSystem.add(newPipeNetwork);
                }
            }

            window.requestAnimationFrame(resolve);
        }).then(() => {
            $('#liveLoader .progress-bar').css('width', '4.5%');
            return this.handlePowerCircuits(pathNameConversion, pipesConversion);
        });
    }

    handlePowerCircuits(pathNameConversion, pipesConversion)
    {
        return new Promise((resolve) => {
            if(this.clipboard.powerCircuits !== undefined)
            {
                for(let powerCircuitPathName in this.clipboard.powerCircuits)
                {
                    let newPowerCircuit             = JSON.parse(JSON.stringify(this.clipboard.powerCircuits[powerCircuitPathName]));
                        newPowerCircuit.pathName    = this.baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.CircuitSubsystem.FGPowerCircuit_XXX'});
                        newPowerCircuit.properties  = this.transformProperties(newPowerCircuit.properties, pathNameConversion);
                        this.baseLayout.setObjectProperty(newPowerCircuit, 'mCircuitID', this.baseLayout.circuitSubSystem.getNextId(), 'Int');

                        this.baseLayout.saveGameParser.addObject(newPowerCircuit);
                        this.baseLayout.circuitSubSystem.add(newPowerCircuit);
                }
            }

            window.requestAnimationFrame(resolve);
        }).then(() => {
            $('#liveLoader .progress-bar').css('width', '5%');

            this.arrangeLayers = [];
            this.loop(pipesConversion);
        });
    }

    loop(pipesConversion, i = 0)
    {
        let results         = [];
        let clipboardLength = this.clipboard.data.length;

        for(i; i < clipboardLength; i++)
        {
            let currentClipboard             = this.clipboard.data[i];

            // Vehicle target list?
            if(currentClipboard.linkedList !== undefined)
            {
                let newLinkedList           = currentClipboard.linkedList;
                    let mTargetList = this.baseLayout.getObjectProperty(currentClipboard.parent, 'mTargetList');
                        if(mTargetList !== null)
                        {
                            newLinkedList.pathName  = this.baseLayout.generateFastPathName(newLinkedList);
                            mTargetList.pathName    = newLinkedList.pathName;
                        }

                let firstNode               = this.baseLayout.getObjectProperty(newLinkedList, 'mFirst');
                let lastNode                = this.baseLayout.getObjectProperty(newLinkedList, 'mLast');
                let currentNode             = this.baseLayout.getObjectProperty(newLinkedList, 'mCurrentTarget');

                let targetConversion        = {};

                if(currentClipboard.targetPoints !== undefined)
                {
                    for(let j = 0; j < currentClipboard.targetPoints.length; j++)
                    {
                        let currentTargetPoint  = currentClipboard.targetPoints[j];
                        let newNodePathName     = this.baseLayout.generateFastPathName(currentTargetPoint);

                            targetConversion[currentTargetPoint.pathName]   = newNodePathName;

                            // Replace pathname in FGTargetPointLinkedList
                            if(firstNode !== null && firstNode.pathName === currentTargetPoint.pathName)
                            {
                                firstNode.pathName = newNodePathName;
                            }
                            if(lastNode !== null && lastNode.pathName === currentTargetPoint.pathName)
                            {
                                lastNode.pathName = newNodePathName;
                            }
                            if(currentNode !== null && currentNode.pathName === currentTargetPoint.pathName)
                            {
                                currentNode.pathName = newNodePathName;
                            }
                    }

                    for(let j = 0; j < currentClipboard.targetPoints.length; j++)
                    {
                        let currentTargetPoint  = currentClipboard.targetPoints[j];

                            if(this.marker !== null)
                            {
                                // Calculate new position
                                let translationRotation = BaseLayout_Math.getPointRotation(
                                        [
                                            (currentTargetPoint.transform.translation[0] + this.centerObject.transform.translation[0]),
                                            (currentTargetPoint.transform.translation[1] + this.centerObject.transform.translation[1])
                                        ],
                                        this.centerObject.transform.translation,
                                        this.centerObject.transform.rotation
                                    );
                                    currentTargetPoint.transform.translation[0]  = translationRotation[0];
                                    currentTargetPoint.transform.translation[1]  = translationRotation[1];
                                    currentTargetPoint.transform.translation[2]  = currentTargetPoint.transform.translation[2] + this.centerObject.transform.translation[2] + (this.centerObjectData.height * 100 / 2);

                                    // Switch to the bottom of center object
                                    if(this.pasteOn === 'bottom')
                                    {
                                        currentTargetPoint.transform.translation[2] -= this.centerObjectData.height * 100;
                                    }
                            }

                            if(currentTargetPoint.properties !== undefined)
                            {
                                for(let k = 0; k < currentTargetPoint.properties.length; k++)
                                {
                                    if(currentTargetPoint.properties[k].name === 'mNext')
                                    {
                                        if(targetConversion[currentTargetPoint.properties[k].value.pathName] !== undefined)
                                        {
                                            currentTargetPoint.properties[k].value.pathName = targetConversion[currentTargetPoint.properties[k].value.pathName];
                                        }
                                    }
                                    if(currentTargetPoint.properties[k].name === 'mOwningVehicle')
                                    {
                                        currentTargetPoint.properties[k].value.pathName = currentClipboard.parent.pathName;
                                    }
                                }
                            }

                            currentTargetPoint.pathName = targetConversion[currentTargetPoint.pathName];

                        this.baseLayout.saveGameParser.addObject(currentTargetPoint);
                    }
                }

                this.baseLayout.saveGameParser.addObject(newLinkedList);
            }

            // Parent object
            let newObject       = currentClipboard.parent;

                if(this.marker !== null)
                {
                    // Calculate new position
                    if(newObject.transform !== undefined)
                    {
                        if(this.centerYaw !== 0)
                        {
                            let translationRotation = BaseLayout_Math.getPointRotation(
                                    [
                                        (newObject.transform.translation[0] + this.centerObject.transform.translation[0]),
                                        (newObject.transform.translation[1] + this.centerObject.transform.translation[1])
                                    ],
                                    this.centerObject.transform.translation,
                                    this.centerObject.transform.rotation
                                );
                                newObject.transform.translation[0]  = translationRotation[0];
                                newObject.transform.translation[1]  = translationRotation[1];
                        }
                        else
                        {
                            newObject.transform.translation[0]  += this.centerObject.transform.translation[0];
                            newObject.transform.translation[1]  += this.centerObject.transform.translation[1];
                        }

                        // Update height transform
                        newObject.transform.translation[2]  = newObject.transform.translation[2] + this.centerObject.transform.translation[2] + (this.centerObjectData.height * 100 / 2);

                        // Switch to the bottom of center object
                        if(this.pasteOn === 'bottom')
                        {
                            newObject.transform.translation[2] -= this.centerObjectData.height * 100;
                        }

                        // Rotate all spline data and tangeant!
                        if(this.centerYaw !== 0)
                        {
                            let mSplineData                      = this.baseLayout.getObjectProperty(newObject, 'mSplineData');
                                if(mSplineData !== null)
                                {
                                    for(let j = 0; j < mSplineData.values.length; j++)
                                    {
                                        for(let k = 0; k < mSplineData.values[j].length; k++)
                                        {
                                            let currentValue            = mSplineData.values[j][k];
                                            let splineRotation          = BaseLayout_Math.getPointRotation(
                                                    [currentValue.value.values.x, currentValue.value.values.y],
                                                    [0, 0],
                                                    this.centerObject.transform.rotation
                                                );

                                            currentValue.value.values.x = splineRotation[0];
                                            currentValue.value.values.y = splineRotation[1];
                                        }
                                    }
                                }
                                else
                                {
                                    newObject.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(newObject.transform.rotation, this.centerYaw);
                                }
                        }
                    }

                    // Update vehicle current destination
                    let mCurrentDestination = this.baseLayout.getObjectProperty(newObject, 'mCurrentDestination');
                        if(mCurrentDestination !== null)
                        {
                            let translationRotation = BaseLayout_Math.getPointRotation(
                                    [
                                        (mCurrentDestination.values.x + this.centerObject.transform.translation[0]),
                                        (mCurrentDestination.values.y + this.centerObject.transform.translation[1])
                                    ],
                                    this.centerObject.transform.translation,
                                    this.centerObject.transform.rotation
                                );
                                mCurrentDestination.values.x  = translationRotation[0];
                                mCurrentDestination.values.y  = translationRotation[1];
                                mCurrentDestination.values.z  = mCurrentDestination.values.z + this.centerObject.transform.translation[2] + (this.centerObjectData.height * 100 / 2);

                                // Switch to the bottom of center object
                                if(this.pasteOn === 'bottom')
                                {
                                    mCurrentDestination.values.z -= this.centerObjectData.height * 100;
                                }
                        }
                }

            // Push identifier for train station or trains
            if(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrainStationIdentifier', '/Script/FactoryGame.FGTrain'].includes(newObject.className))
            {
                this.baseLayout.railroadSubSystem.addObjectIdentifier(newObject);
            }

            // Update save/map
            results.push(new Promise((resolve) => {
                this.baseLayout.saveGameParser.addObject(newObject);

                if(currentClipboard.children !== undefined)
                {
                    for(let j = 0; j < currentClipboard.children.length; j++)
                    {
                        let newChildren     = currentClipboard.children[j];
                            if(newChildren !== null)
                            {
                                let testPathName    = newChildren.pathName.split('.');
                                        testPathName.pop();
                                        testPathName    = testPathName.join('.');

                                    // Do we need to update mPipeNetworkID?
                                    if(pipesConversion[newChildren.pathName] !== undefined)
                                    {
                                        for(let m = 0; m < newChildren.properties.length; m++)
                                        {
                                            if(newChildren.properties[m].name === 'mPipeNetworkID')
                                            {
                                                newChildren.properties[m].value = pipesConversion[newChildren.pathName];
                                                break;
                                            }
                                        }
                                    }
                                    if(pipesConversion[testPathName] !== undefined)
                                    {
                                        for(let m = 0; m < newChildren.properties.length; m++)
                                        {
                                            if(newChildren.properties[m].name === 'mPipeNetworkID')
                                            {
                                                newChildren.properties[m].value = pipesConversion[testPathName];
                                                break;
                                            }
                                        }
                                    }

                                this.baseLayout.saveGameParser.addObject(newChildren);
                            }
                    }
                }

                return this.baseLayout.parseObject(newObject, resolve);
            }));

            if(i % 250 === 0 || (i + 1) === clipboardLength)
            {
                return Promise.all(results).then((results) => {
                    for(let j = 0; j < results.length; j++)
                    {
                        if(results[j] !== null)
                        {
                            if(this.useHistory === true && this.baseLayout.history !== null)
                            {
                                this.historyPathName.push([results[j].marker.options.pathName, results[j].layer]);
                            }

                            this.baseLayout.addElementToLayer(results[j].layer, results[j].marker);
                            this.arrangeLayers.push(results[j].layer);

                            if(results[j].layer === 'playerVehiculesLayer')
                            {
                                let vehicleDataMarker = this.baseLayout.getMarkerFromPathName(results[j].marker.options.pathName + '_vehicleTrackData', results[j].layer);
                                    if(vehicleDataMarker !== null)
                                    {
                                        vehicleDataMarker.addTo(this.baseLayout.playerLayers[results[j].layer].subLayer);
                                    }
                            }
                        }
                    }
                }).finally(() => {
                    window.requestAnimationFrame(() => {
                        $('#liveLoader .progress-bar').css('width',  5 + (Math.round(i / clipboardLength * 100) * 0.95) + '%');
                        this.loop(pipesConversion, (i + 1));
                    });
                });
            }
        }

        return this.release();
    }

    release()
    {
        // Delete center object!
        if(this.pasteOn === 'bottom' && this.marker !== null)
        {
            this.baseLayout.deleteGenericBuilding(this.marker);
        }

        // Rearrange layer orders!
        for(let layerId in this.baseLayout.playerLayers)
        {
            if(this.baseLayout.playerLayers[layerId].subLayer !== null/* && arrangeLayers.includes(layerId)*/)
            {
                if(this.arrangeLayers.includes(layerId))
                {
                    this.baseLayout.setBadgeLayerCount(layerId);
                }

                if(this.baseLayout.playerLayers[layerId].layerGroup.hasLayer(this.baseLayout.playerLayers[layerId].subLayer))
                {
                    this.baseLayout.playerLayers[layerId].layerGroup.removeLayer(this.baseLayout.playerLayers[layerId].subLayer)
                                                         .addLayer(this.baseLayout.playerLayers[layerId].subLayer);
                }
            }
        }

        // Update altitude slider
        this.baseLayout.altitudeSliderControl.updateSliderAltitudes(this.baseLayout.minAltitude, this.baseLayout.maxAltitude);


        if(this.useHistory === true && this.baseLayout.history !== null && this.historyPathName.length > 0)
        {
            this.historyValues.push({callback: 'Selection_Delete', pathNameArray: this.historyPathName});
                if(this.pasteOn === 'bottom' && this.marker !== null)
                {
                    this.historyValues.unshift({callback: 'restoreObject', object: this.centerObject});
                }

            this.baseLayout.history.add({name: 'Undo: Paste megaprint', values: this.historyValues});
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        console.timeEnd('pasteOnFoundation');
        this.baseLayout.updateRadioactivityLayer();
    }


    setColorSlotHelper(colorSlotHelper)
    {
        let centerX             = ((this.clipboard.minX + this.clipboard.maxX) / 2) + this.xOffset;
        let centerY             = ((this.clipboard.minY + this.clipboard.maxY) / 2) + this.yOffset;
        let originalColorSlot   = this.baseLayout.buildableSubSystem.getObjectColorSlot(this.centerObject);

        // Redraw!
        new Promise((resolve) => {
            this.historyValues.push({callback: 'setObjectColorSlot', pathName: this.centerObject.pathName, colorSlot: originalColorSlot});
            this.baseLayout.buildableSubSystem.setObjectColorSlot(this.centerObject, parseInt(colorSlotHelper));
            return this.baseLayout.parseObject(this.centerObject, resolve);
        }).then((result) => {
            this.baseLayout.deleteMarkerFromElements(result.layer, this.marker.relatedTarget);
            this.baseLayout.addElementToLayer(result.layer, result.marker);
            this.marker.relatedTarget = result.marker;
        });

        let corners = [
            // TOP LEFT
            [
                (this.centerObject.transform.translation[0] - (centerX - this.clipboard.minX) - 800),
                (this.centerObject.transform.translation[1] - (centerY - this.clipboard.minY) - 800)
            ],
            // TOP RIGHT
            [
                (this.centerObject.transform.translation[0] + (this.clipboard.maxX - centerX) + 800),
                (this.centerObject.transform.translation[1] - (centerY - this.clipboard.minY) - 800)
            ],
            // BOTTOM LEFT
            [
                (this.centerObject.transform.translation[0] - (centerX - this.clipboard.minX) - 800),
                (this.centerObject.transform.translation[1] + (this.clipboard.maxY - centerY) + 800)
            ],
            // BOTTOM RIGHT
            [
                (this.centerObject.transform.translation[0] + (this.clipboard.maxX - centerX) + 800),
                (this.centerObject.transform.translation[1] + (this.clipboard.maxY - centerY) + 800)
            ]
        ];

        for(let i = 0; i < corners.length; i++)
        {
            let newFoundation                           = JSON.parse(JSON.stringify(this.centerObject));
                newFoundation.pathName                  = this.baseLayout.generateFastPathName(this.centerObject);
            let translationRotation                     = BaseLayout_Math.getPointRotation(corners[i], this.centerObject.transform.translation, this.centerObject.transform.rotation);
                newFoundation.transform.translation[0]  = translationRotation[0];
                newFoundation.transform.translation[1]  = translationRotation[1];

            new Promise((resolve) => {
                this.historyPathName.push(newFoundation.pathName);
                this.baseLayout.saveGameParser.addObject(newFoundation);
                return this.baseLayout.parseObject(newFoundation, resolve);
            }).then((result) => {
                this.baseLayout.addElementToLayer(result.layer, result.marker);
            });
        }
    }
}

/**
 * Clipboard control
 */
L.Control.ClipboardControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function(options){
        //  apply options to instance
        L.Util.setOptions(this, options);
    },

    onAdd: function(){
        let baseLayout = this.options.baseLayout;

        let className = 'leaflet-control-zoom leaflet-bar';
        let container           = L.DomUtil.create('div', className);

        let link1               = L.DomUtil.create('a', 'leaflet-control-clipboard leaflet-bar-part', container);
            link1.innerHTML     = '<i class="far fa-microchip"></i>';
            link1.href          = '#';
            link1.dataset.hover = 'tooltip';
            link1.dataset.placement = 'right';
            link1.title         = 'Import/Export a megaprint';

        L.DomEvent
            .on(link1, 'click', L.DomEvent.stopPropagation)
            .on(link1, 'click', L.DomEvent.preventDefault)
            .on(link1, 'click', this._showClipboardModal, this)
            .on(link1, 'dbclick', L.DomEvent.stopPropagation);

        let link2               = L.DomUtil.create('a', 'leaflet-control-clipboard leaflet-bar-part', container);
            link2.innerHTML     = '<i class="far fa-paste"></i>';
            link2.href          = '#';
            link2.dataset.hover = 'tooltip';
            link2.dataset.placement = 'right';
            link2.title         = 'Paste megaprint in the original position';
            this.options.pasteInPlaceButton = link2;
        $(this.options.pasteInPlaceButton).hide();

        L.DomEvent
            .on(link2, 'click', L.DomEvent.stopPropagation)
            .on(link2, 'click', L.DomEvent.preventDefault)
            .on(link2, 'click', this._pasteInPlace, this)
            .on(link2, 'dbclick', L.DomEvent.stopPropagation);

        let modal = [];
            modal.push('<div class="modal fade" tabindex="-1" id="clipboardControlModal"><div class="modal-dialog modal-lg"><div class="modal-content">');
            modal.push('<div class="modal-header"><h5 class="modal-title">Megaprint</h5><button type="button" class="close" data-dismiss="modal"><span>&times;</span></button></div>');
            modal.push('<div class="modal-body"><p>You can copy a selection of items using the <strong>Lasso tool</strong>, then export them into a file.</p><div id="dropMegaprint"><input name="megaprintFile" type="file" id="megaprintFileInput" accept=".cbp"><label for="megaprintFileInput" class="m-0"><i class="fas fa-upload"></i> Click/Drop a megaprint file</label></div></div>');
            modal.push('<div class="modal-body"><button class="downloadButton btn btn-secondary w-100">Download current megaprint</button></div>');
            modal.push('</div></div></div>');

        $('body').append(modal.join(''));

        $('#clipboardControlModal .downloadButton').on('click', function(e){
            saveAs(
                new Blob(
                    [pako.deflate(JSON.stringify(baseLayout.clipboard))],
                    {type: "application/octet-stream; charset=utf-8"}
                ), "megaprint-calculator.cbp"
            );
            $('#clipboardControlModal').modal('hide');
            return;
        });

        if(window.File && window.FileReader && window.FileList && window.Blob)
        {
            let processMegaprintFile = (droppedFile) => {
                if(droppedFile !== undefined)
                {
                    if(droppedFile.name.endsWith('.cbp'))
                    {
                        let reader = new FileReader();
                            reader.readAsArrayBuffer(droppedFile);
                            reader.onload = () => {
                                let restored = null;
                                    try
                                    {
                                        restored = JSON.parse(pako.inflate(reader.result, { to: 'string' }));
                                    }
                                    catch(error)
                                    {
                                        restored = null;
                                        console.error(error);
                                    }

                                if(restored !== null)
                                {
                                    this.options.baseLayout.clipboard = restored;

                                    $(this.options.pasteInPlaceButton).show();
                                    BaseLayout_Modal.alert('Imported ' + restored.data.length + ' items from the megaprint!<br />Don\'t forget to paste it on original location or by right clicking any foundation!');
                                }

                                $('#clipboardControlModal').modal('hide');
                            };
                    }
                    else
                    {
                        alert('File should be name XXX.cbp');
                    }
                }
                else
                {
                    alert('Something went wrong reading your megaprint file!');
                }
            };

            $('#dropMegaprint').on('drag dragstart dragend dragover dragenter dragleave drop', function(e){e.preventDefault();e.stopPropagation();})
                               .on('dragover dragenter', function(){$('#dropMegaprint').addClass('is-dragover');})
                               .on('dragleave dragend drop', function(){$('#dropMegaprint').removeClass('is-dragover');})
                               .on('drop', function(e){ processMegaprintFile(e.originalEvent.dataTransfer.files[0]); });
            $('#megaprintFileInput').on('change', function(e){
                let currentFile = $(this).prop('files')[0];
                    $(this).val('');

                processMegaprintFile(currentFile);
            });
        }
        else
        {
            $('#dropSaveGame').remove();
        }

        return container;
    },

    onRemove: function(){
        $('#clipboardControlModal .downloadButton').off('click');
        $('#dropMegaprint').off('drag dragstart dragend dragover dragenter dragleave drop')
                           .off('dragover dragenter')
                           .off('dragleave dragend drop')
                           .off('drop');
        $('#megaprintFileInput').off('change');

        $('#clipboardControlModal').remove();
    },

    _showClipboardModal: function(){
        $('#clipboardControlModal').modal('show');
        $('#clipboardControlModal .downloadButton').addClass('disabled').prop('disabled', true);

        if(this.options.baseLayout.clipboard !== null)
        {
            $('#clipboardControlModal .downloadButton').removeClass('disabled').prop('disabled', false);
        }
    },

    _pasteInPlace: function(){
        if(this.options.baseLayout.clipboard !== null)
        {
            new Spawn_Megaprint({
                baseLayout          : this.options.baseLayout,
                marker              : null,
                clipboard           : this.options.baseLayout.clipboard
            });
        }

        $(this.options.pasteInPlaceButton).hide();
    }
});

L.control.clipboardControl = function (options) {
    return new L.Control.ClipboardControl(options);
};
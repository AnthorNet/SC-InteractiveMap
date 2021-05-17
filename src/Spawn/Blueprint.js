/* global Infinity, gtag, L, streamSaver, pako */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import Modal                                    from '../Modal.js';

export default class Spawn_Blueprint
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        this.clipboard          = JSON.parse(JSON.stringify(options.clipboard));
        this.marker             = options.marker;

        this.xOffset            = (options.xOffset !== undefined) ? parseFloat(options.xOffset) : 0;
        this.yOffset            = (options.yOffset !== undefined) ? parseFloat(options.yOffset) : 0;
        this.zOffset            = (this.clipboard.zOffset !== undefined) ? parseFloat(this.clipboard.zOffset) : ((options.zOffset !== undefined) ? parseFloat(options.zOffset) : 0);
        this.colorSlotHelper    = (options.colorSlotHelper !== undefined) ? options.colorSlotHelper : 'NONE';
        this.powerLineClassName = ['/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C', '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C'];

        this.useHistory         = (options.history !== undefined) ? options.history : true;

        if(this.useHistory === true && this.baseLayout.history !== null)
        {
            this.historyPathName = [];
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Blueprint', {event_category: 'Spawn'});
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

            if(this.marker === null)
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
                    if(this.clipboard.data[i].parent.transform !== undefined && this.powerLineClassName.includes(this.clipboard.data[i].parent.className) === false)
                    {
                        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.clipboard.data[i].parent.className);
                            if(currentObjectData !== null)
                            {
                                if(this.clipboard.data[i].parent.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_') || this.clipboard.data[i].parent.className.startsWith('/Game/FactoryGame/Buildable/Building/Foundation/Build_'))
                                {
                                    minZ = Math.min(minZ, this.clipboard.data[i].parent.transform.translation[2] - (currentObjectData.height * 100 / 2)); // GROUND BUILDING USE HALF AS CENTER
                                }
                                else
                                {
                                    minZ = Math.min(minZ, this.clipboard.data[i].parent.transform.translation[2]); // OTHER ARE PLACED FROM BOTTOM
                                }
                            }
                    }
                }

                if(this.zOffset !== 0)
                {
                    minZ -= this.zOffset; // Inverse as it removed from the object translation
                }

                for(let i = 0; i < this.clipboard.data.length; i++)
                {
                    if(this.clipboard.data[i].parent.transform !== undefined && this.powerLineClassName.includes(this.clipboard.data[i].parent.className) === false)
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

            return new Promise(function(resolve){
                $('#liveLoader .progress-bar').css('width', '1%');

                // Zoom on center?
                let centerPosition = this.baseLayout.satisfactoryMap.unproject(this.centerObject.transform.translation);
                    this.baseLayout.satisfactoryMap.leafletMap.setView(centerPosition, 7);

                setTimeout(resolve, 50);
            }.bind(this)).then(function(){
                this.generatePathName();
            }.bind(this));
        }
    }

    generatePathName()
    {
        let pathNameToConvert       = [];
        let pathNameConversion      = {};

        return new Promise(function(resolve){
            // Generate proper path name...
            for(let i = 0; i < this.clipboard.data.length; i++)
            {
                pathNameToConvert.push(this.clipboard.data[i].parent.pathName);
            }

            if(this.clipboard.hiddenConnections !== undefined)
            {
                for(let pathName in this.clipboard.hiddenConnections)
                {
                    pathNameToConvert.push(pathName);
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

                        if(extension.search('_') !== -1)
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

            setTimeout(resolve, 5);
        }.bind(this)).then(function(){
            $('#liveLoader .progress-bar').css('width', '2%');
            this.replacePathName(JSON.parse(JSON.stringify(pathNameConversion)));
        }.bind(this));
    }

    replacePathName(pathNameConversion)
    {
        return new Promise(function(resolve){
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

                    // Power lines connections
                    if(this.powerLineClassName.includes(this.clipboard.data[i].parent.className) && this.clipboard.data[i].parent.extra !== undefined)
                    {
                        if(this.clipboard.data[i].parent.extra.sourcePathName !== undefined)
                        {
                            let sourcePathName  = this.clipboard.data[i].parent.extra.sourcePathName.split('.');
                            let extraPart       = sourcePathName.pop();
                                sourcePathName  = sourcePathName.join('.');

                            if(pathNameConversion[sourcePathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.sourcePathName = pathNameConversion[sourcePathName] + '.' + extraPart;
                            }
                        }
                        if(this.clipboard.data[i].parent.extra.targetPathName !== undefined)
                        {
                            let targetPathName  = this.clipboard.data[i].parent.extra.targetPathName.split('.');
                            let extraPart       = targetPathName.pop();
                                targetPathName  = targetPathName.join('.');

                            if(pathNameConversion[targetPathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.targetPathName = pathNameConversion[targetPathName] + '.' + extraPart;
                            }
                        }
                    }

                    // Wagons connections
                    if(this.clipboard.data[i].parent.extra !== undefined)
                    {
                        if(this.clipboard.data[i].parent.extra.previousPathName !== undefined && this.clipboard.data[i].parent.extra.previousPathName !== '')
                        {
                            if(pathNameConversion[this.clipboard.data[i].parent.extra.previousPathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.previousPathName = pathNameConversion[this.clipboard.data[i].parent.extra.previousPathName];
                            }
                        }
                        if(this.clipboard.data[i].parent.extra.nextPathName !== undefined && this.clipboard.data[i].parent.extra.nextPathName !== '')
                        {
                            if(pathNameConversion[this.clipboard.data[i].parent.extra.nextPathName] !== undefined)
                            {
                                this.clipboard.data[i].parent.extra.nextPathName = pathNameConversion[this.clipboard.data[i].parent.extra.nextPathName];
                            }
                        }
                    }

                    if(this.clipboard.data[i].parent.properties !== undefined && this.clipboard.data[i].parent.properties.length > 0)
                    {
                        for(let j = 0; j < this.clipboard.data[i].parent.properties.length; j++)
                        {
                            let currentProperty = this.clipboard.data[i].parent.properties[j];
                                /*
                                if(currentProperty.type === 'ArrayProperty' && currentProperty.value.values !== undefined)
                                {
                                    for(let k = 0; k < currentProperty.value.values.length; k++)
                                    {
                                        if(pathNameConversion[currentProperty.value.values[k].pathName] !== undefined)
                                        {
                                            currentProperty.value.values[k].pathName = pathNameConversion[currentProperty.value.values[k].pathName];
                                        }
                                    }
                                }
                                */
                                if(currentProperty.value !== undefined && currentProperty.value.pathName !== undefined)
                                {
                                    if(pathNameConversion[currentProperty.value.pathName] !== undefined)
                                    {
                                        currentProperty.value.pathName = pathNameConversion[currentProperty.value.pathName];
                                    }
                                    else
                                    {
                                        let testPathName    = currentProperty.value.pathName.split('.');
                                        let extraPart       = testPathName.pop();
                                            testPathName    = testPathName.join('.');

                                        if(pathNameConversion[testPathName] !== undefined)
                                        {
                                            currentProperty.value.pathName = pathNameConversion[testPathName] + '.' + extraPart;
                                        }
                                    }
                                }
                        }
                    }

                    if(this.clipboard.data[i].children !== undefined && this.clipboard.data[i].children.length > 0)
                    {
                        for(let j = 0; j < this.clipboard.data[i].children.length; j++)
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
                                for(let k = 0; k < this.clipboard.data[i].children[j].properties.length; k++)
                                {
                                    let currentProperty = this.clipboard.data[i].children[j].properties[k];
                                        if(currentProperty.value !== undefined && currentProperty.value.pathName !== undefined)
                                        {
                                            if(pathNameConversion[currentProperty.value.pathName] !== undefined)
                                            {
                                                currentProperty.value.pathName = pathNameConversion[currentProperty.value.pathName];
                                            }
                                            else
                                            {
                                                let testPathName    = currentProperty.value.pathName.split('.');
                                                let extraPart       = testPathName.pop();
                                                    testPathName    = testPathName.join('.');

                                                if(pathNameConversion[testPathName] !== undefined)
                                                {
                                                    currentProperty.value.pathName = pathNameConversion[testPathName] + '.' + extraPart;
                                                }
                                            }
                                        }

                                        if(currentProperty.type === 'ArrayProperty' && currentProperty.value !== undefined && currentProperty.value.values !== undefined)
                                        {
                                            for(let m = 0; m < currentProperty.value.values.length; m++)
                                            {
                                                if(currentProperty.value.values[m].pathName !== undefined)
                                                {
                                                    if(pathNameConversion[currentProperty.value.values[m].pathName] !== undefined)
                                                    {
                                                        currentProperty.value.values[m].pathName = pathNameConversion[currentProperty.value.values[m].pathName];
                                                    }
                                                    else
                                                    {
                                                        let testPathName    = currentProperty.value.values[m].pathName.split('.');
                                                        let extraPart       = testPathName.pop();
                                                            testPathName    = testPathName.join('.');

                                                        if(pathNameConversion[testPathName] !== undefined)
                                                        {
                                                            currentProperty.value.values[m].pathName = pathNameConversion[testPathName] + '.' + extraPart;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                }
                            }
                        }
                    }

                    // Vehicles waypoints
                    if(this.clipboard.data[i].linkedList !== undefined)
                    {
                        this.clipboard.data[i] = JSON.stringify(this.clipboard.data[i]);
                        for(let oldPathName in pathNameConversion)
                        {
                            if(this.clipboard.data[i].indexOf(oldPathName) !== -1)
                            {
                                this.clipboard.data[i]     = this.clipboard.data[i].split('"' + oldPathName + '.').join('"' + pathNameConversion[oldPathName] + '.');
                                this.clipboard.data[i]     = this.clipboard.data[i].split('"' + oldPathName + '"').join('"' + pathNameConversion[oldPathName] + '"');
                            }
                        }
                        this.clipboard.data[i] = JSON.parse(this.clipboard.data[i]);
                    }

                    /*
                    if(this.clipboard.data[i].children.length > 0 || this.clipboard.data[i].linkedList !== undefined)
                    {
                        this.clipboard.data[i].parent = JSON.stringify(this.clipboard.data[i].parent);
                        for(let oldPathName in pathNameConversion)
                        {
                            if(this.clipboard.data[i].parent.indexOf(oldPathName) !== -1)
                            {
                                if(this.baseLayout.useDebug === true)
                                {
                                    let debug                  = JSON.parse(this.clipboard.data[i].parent);
                                        if(JSON.stringify(debug).indexOf('"' + oldPathName + '.') !== -1)
                                        {
                                            console.log('PARENT.', oldPathName, pathNameConversion[oldPathName], debug);
                                        }
                                        if(JSON.stringify(debug).indexOf('"' + oldPathName + '"') !== -1)
                                        {
                                            console.log('PARENT', oldPathName, pathNameConversion[oldPathName], debug);
                                        }
                                }

                                this.clipboard.data[i].parent     = this.clipboard.data[i].parent.split('"' + oldPathName + '.').join('"' + pathNameConversion[oldPathName] + '.');
                                this.clipboard.data[i].parent     = this.clipboard.data[i].parent.split('"' + oldPathName + '"').join('"' + pathNameConversion[oldPathName] + '"');
                            }
                        }
                        this.clipboard.data[i].parent = JSON.parse(this.clipboard.data[i].parent);

                        this.clipboard.data[i].children = JSON.stringify(this.clipboard.data[i].children);
                        for(let oldPathName in pathNameConversion)
                        {
                            if(this.clipboard.data[i].children.indexOf(oldPathName) !== -1)
                            {
                                if(this.baseLayout.useDebug === true)
                                {
                                    let debug                  = JSON.parse(this.clipboard.data[i].children);
                                        if(JSON.stringify(debug).indexOf('"' + oldPathName + '.') !== -1)
                                        {
                                            console.log('CHILDREN.', oldPathName, pathNameConversion[oldPathName], debug);
                                        }
                                        if(JSON.stringify(debug).indexOf('"' + oldPathName + '"') !== -1)
                                        {
                                            console.log('CHILDREN', oldPathName, pathNameConversion[oldPathName], debug);
                                        }
                                }

                                this.clipboard.data[i].children     = this.clipboard.data[i].children.split('"' + oldPathName + '.').join('"' + pathNameConversion[oldPathName] + '.');
                                this.clipboard.data[i].children     = this.clipboard.data[i].children.split('"' + oldPathName + '"').join('"' + pathNameConversion[oldPathName] + '"');
                            }
                        }
                        this.clipboard.data[i].children = JSON.parse(this.clipboard.data[i].children);
                    }
                    /**/
                }

            setTimeout(resolve, 5);
        }.bind(this)).then(function(){
            $('#liveLoader .progress-bar').css('width', '3%');
            return this.handleHiddenConnections(pathNameConversion);
        }.bind(this));
    }

    handleHiddenConnections(pathNameConversion)
    {
        return new Promise(function(resolve){
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
                            if(extension.search('_') !== -1)
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

                    let mHiddenConnections = this.baseLayout.getObjectProperty(currentHiddenConnections, 'mHiddenConnections');
                        if(mHiddenConnections !== null)
                        {
                            for(let j = 0; j < mHiddenConnections.values.length; j++)
                            {
                                if(pathNameConversion[mHiddenConnections.values[j].pathName] !== undefined)
                                {
                                    mHiddenConnections.values[j].pathName = pathNameConversion[mHiddenConnections.values[j].pathName];
                                }
                                else
                                {
                                    for(let oldPathName in pathNameConversion)
                                    {
                                        mHiddenConnections.values[j].pathName = mHiddenConnections.values[j].pathName.split(oldPathName + '.').join(pathNameConversion[oldPathName] + '.');
                                    }
                                }
                            }
                        }

                    this.baseLayout.saveGameParser.addObject(currentHiddenConnections);
                }
            }

            setTimeout(resolve, 5);
        }.bind(this)).then(function(){
            $('#liveLoader .progress-bar').css('width', '4%');
            return this.handlePipeNetworks(pathNameConversion);
        }.bind(this));
    }

    handlePipeNetworks(pathNameConversion)
    {
        let pipesConversion = {};

        return new Promise(function(resolve){
            if(this.clipboard.pipes !== undefined)
            {
                for(let pipeNetworkID in this.clipboard.pipes)
                {
                    let newPipeNetworkID    = Object.keys(this.baseLayout.saveGamePipeNetworks);
                        newPipeNetworkID    = (newPipeNetworkID.length > 0) ? (parseInt(newPipeNetworkID.reduce(function(a, b){ return parseInt(a) > parseInt(b) ? parseInt(a) : parseInt(b) })) + 1) : 1;
                    let newPipeNetwork      = {
                        type                    : 1,
                        className               : '/Script/FactoryGame.FGPipeNetwork',
                        pathName                : this.baseLayout.generateFastPathName({pathName: 'Persistent_Level:PersistentLevel.FGPipeNetwork_XXX'}),
                        transform               : {rotation: [0, 0, 0, 1], translation: [0, 0, 0]},
                        children                : [],
                        properties              : [{name: "mPipeNetworkID", type: "IntProperty", value: newPipeNetworkID}],
                        entityLevelName         : "",
                        entityPathName          : ""
                    };

                    if(this.clipboard.pipes[pipeNetworkID].fluid !== null)
                    {
                        newPipeNetwork.properties.push({name: "mFluidDescriptor", type: "ObjectProperty", value: {levelName: "", pathName: this.clipboard.pipes[pipeNetworkID].fluid}});
                    }

                    if(this.clipboard.pipes[pipeNetworkID].interface.length > 0)
                    {
                        let mFluidIntegrantScriptInterfaces = {name: "mFluidIntegrantScriptInterfaces", type: "ArrayProperty", value: {type: "InterfaceProperty", values: []}};

                            for(let i = 0; i < this.clipboard.pipes[pipeNetworkID].interface.length; i++)
                            {
                                let newPipeNetworkPathName = this.clipboard.pipes[pipeNetworkID].interface[i];

                                    if(pathNameConversion[newPipeNetworkPathName] !== undefined)
                                    {
                                        newPipeNetworkPathName = pathNameConversion[newPipeNetworkPathName];
                                    }
                                    else
                                    {
                                        for(let oldPathName in pathNameConversion)
                                        {
                                            newPipeNetworkPathName = newPipeNetworkPathName.split(oldPathName + '.').join(pathNameConversion[oldPathName] + '.');
                                        }
                                    }

                                    mFluidIntegrantScriptInterfaces.value.values.push({levelName: "Persistent_Level", pathName: newPipeNetworkPathName});
                                    pipesConversion[newPipeNetworkPathName] = newPipeNetworkID;
                            }

                        newPipeNetwork.properties.push(mFluidIntegrantScriptInterfaces);
                    }

                    this.baseLayout.saveGameParser.addObject(newPipeNetwork);
                    this.baseLayout.saveGamePipeNetworks[newPipeNetworkID] = newPipeNetwork.pathName;
                }
            }

            setTimeout(resolve, 5);
        }.bind(this)).then(function(){
            $('#liveLoader .progress-bar').css('width', '5%');

            this.arrangeLayers = [];
            this.loop(pipesConversion);
        }.bind(this));
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
                    newLinkedList.pathName  = currentClipboard.parent.pathName + '.LinkedList';

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
                            }

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

                            currentTargetPoint.pathName = targetConversion[currentTargetPoint.pathName];

                        this.baseLayout.saveGameParser.addObject(currentTargetPoint);
                    }
                }

                this.baseLayout.saveGameParser.addObject(newLinkedList);

                let mTargetNodeLinkedList = this.baseLayout.getObjectProperty(currentClipboard.parent, 'mTargetNodeLinkedList');
                    if(mTargetNodeLinkedList !== null)
                    {
                        mTargetNodeLinkedList.pathName = newLinkedList.pathName;
                    }
            }

            // Parent object
            let newObject       = currentClipboard.parent;

                if(this.marker !== null)
                {
                    // Calculate new position
                    if(newObject.transform !== undefined)
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
                            newObject.transform.translation[2]  = newObject.transform.translation[2] + this.centerObject.transform.translation[2] + (this.centerObjectData.height * 100 / 2);

                        // Rotate all spline data and tangeant!
                        let mSplineData                      = this.baseLayout.getObjectProperty(newObject, 'mSplineData');
                            if(mSplineData !== null)
                            {
                                for(let j = 0; j < mSplineData.values.length; j++)
                                {
                                    for(let k = 0; k < mSplineData.values[j].length; k++)
                                    {
                                        let currentValue    = mSplineData.values[j][k];
                                        let splineRotation  = BaseLayout_Math.getPointRotation(
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
                                newObject.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(newObject.transform.rotation, this.centerYaw);
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
                        }
                }

            // Update save/map
                this.baseLayout.saveGameParser.addObject(newObject);
            let result = this.baseLayout.parseObject(newObject);
                //TODO: Use promises when we have to laod a mod not yet loaded, silently pass for now...
                if(result !== undefined) // Prevent unknown mod object from throwing error
                {
                    results.push(result);

                    if(this.useHistory === true && this.baseLayout.history !== null)
                    {
                        this.historyPathName.push([newObject.pathName, result.layerId]);
                    }
                }

            //TODO: ???
            if(currentClipboard.linkedList !== undefined)
            {
                /*
                let vehicleDataMarker = this.baseLayout.getMarkerFromPathName(newObject.pathName + '_vehicleTrackData', result.layer);
                    if(vehicleDataMarker !== null)
                    {
                        vehicleDataMarker.addTo(this.playerLayers[result.layer].subLayer);
                    }
                */
            }

            if(currentClipboard.children !== undefined)
            {
                for(let j = 0; j < currentClipboard.children.length; j++)
                {
                    let newChildren     = currentClipboard.children[j];
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

            // Push identifier for train station or trains
            if(currentClipboard.parent.className === '/Script/FactoryGame.FGTrainStationIdentifier' || currentClipboard.parent.className === '/Script/FactoryGame.FGTrain')
            {
                this.baseLayout.saveGameParser.trainIdentifiers.push(currentClipboard.parent.pathName);
            }

            if(i % 250 === 0 || (i + 1) === clipboardLength)
            {
                return new Promise(function(resolve){
                    $('#liveLoader .progress-bar').css('width',  5 + (Math.round(i / clipboardLength * 100) * 0.95) + '%');
                    setTimeout(resolve, 5);
                }.bind(this)).then(function(){
                    for(let j = 0; j < results.length; j++)
                    {
                        let result = results[j];
                            if(result.marker !== undefined)
                            {
                                this.baseLayout.addElementToLayer(result.layer, result.marker);
                                this.arrangeLayers.push(result.layer);
                            }
                            else
                            {
                                console.log('Error in marker...');
                            }
                    }

                    this.loop(pipesConversion, (i + 1));
                }.bind(this));
            }
        }

        return this.release();
    }

    release()
    {
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
            this.baseLayout.history.add({
                name: 'Undo: Paste blueprint',
                values: [{
                    pathNameArray: this.historyPathName,
                    callback: 'BaseLayout_Selection_Delete'
                }]
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        console.timeEnd('pasteOnFoundation');
        this.baseLayout.updateRadioactivityLayer();
        this.baseLayout.unpauseMap();
    }


    setColorSlotHelper(colorSlotHelper)
    {
        let centerX             = ((this.clipboard.minX + this.clipboard.maxX) / 2) + this.xOffset;
        let centerY             = ((this.clipboard.minY + this.clipboard.maxY) / 2) + this.yOffset;

        this.centerObject.properties.push({name: "mColorSlot", type: "ByteProperty", value: {enumName: "None", value: parseFloat(colorSlotHelper)}});

        // Delete and add again!
        let resultCenter = this.baseLayout.parseObject(this.centerObject);
            this.baseLayout.deleteMarkerFromElements(resultCenter.layer, this.marker);
            this.baseLayout.addElementToLayer(resultCenter.layer, resultCenter.marker);

        // TOP LEFT
        let newFoundationTopLeft                    = JSON.parse(JSON.stringify(this.centerObject));
            newFoundationTopLeft.pathName           = this.baseLayout.generateFastPathName(this.centerObject);
        let translationRotationTopLeft              = BaseLayout_Math.getPointRotation(
                [
                    (this.centerObject.transform.translation[0] - (centerX - this.clipboard.minX) - 800),
                    (this.centerObject.transform.translation[1] - (centerY - this.clipboard.minY) - 800)
                ], this.centerObject.transform.translation, this.centerObject.transform.rotation
            );
            newFoundationTopLeft.transform.translation[0]  = translationRotationTopLeft[0];
            newFoundationTopLeft.transform.translation[1]  = translationRotationTopLeft[1];

            this.baseLayout.saveGameParser.addObject(newFoundationTopLeft);

            let resultTopLeft = this.baseLayout.parseObject(newFoundationTopLeft);
                this.baseLayout.addElementToLayer(resultTopLeft.layer, resultTopLeft.marker);

        // TOP RIGHT
        let newFoundationTopRight                   = JSON.parse(JSON.stringify(this.centerObject));
            newFoundationTopRight.pathName          = this.baseLayout.generateFastPathName(this.centerObject);
        let translationRotationTopRight             = BaseLayout_Math.getPointRotation(
                [
                    (this.centerObject.transform.translation[0] + (this.clipboard.maxX - centerX) + 800),
                    (this.centerObject.transform.translation[1] - (centerY - this.clipboard.minY) - 800)
                ], this.centerObject.transform.translation, this.centerObject.transform.rotation
            );
            newFoundationTopRight.transform.translation[0] = translationRotationTopRight[0];
            newFoundationTopRight.transform.translation[1] = translationRotationTopRight[1];

            this.baseLayout.saveGameParser.addObject(newFoundationTopRight);

            let resultTopRight = this.baseLayout.parseObject(newFoundationTopRight);
                this.baseLayout.addElementToLayer(resultTopRight.layer, resultTopRight.marker);

        // BOTTOM LEFT
        let newFoundationBottomLeft                 = JSON.parse(JSON.stringify(this.centerObject));
            newFoundationBottomLeft.pathName        = this.baseLayout.generateFastPathName(this.centerObject);
        let translationRotationBottomLeft           = BaseLayout_Math.getPointRotation(
                [
                    (this.centerObject.transform.translation[0] - (centerX - this.clipboard.minX) - 800),
                    (this.centerObject.transform.translation[1] + (this.clipboard.maxY - centerY) + 800)
                ], this.centerObject.transform.translation, this.centerObject.transform.rotation
            );
            newFoundationBottomLeft.transform.translation[0]    = translationRotationBottomLeft[0];
            newFoundationBottomLeft.transform.translation[1]    = translationRotationBottomLeft[1];

            this.baseLayout.saveGameParser.addObject(newFoundationBottomLeft);

            let resultBottomLeft = this.baseLayout.parseObject(newFoundationBottomLeft);
                this.baseLayout.addElementToLayer(resultBottomLeft.layer, resultBottomLeft.marker);

        // BOTTOM RIGHT
        let newFoundationBottomRight                = JSON.parse(JSON.stringify(this.centerObject));
            newFoundationBottomRight.pathName       = this.baseLayout.generateFastPathName(this.centerObject);
        let translationRotationBottomRight          = BaseLayout_Math.getPointRotation(
                [
                    (this.centerObject.transform.translation[0] + (this.clipboard.maxX - centerX) + 800),
                    (this.centerObject.transform.translation[1] + (this.clipboard.maxY - centerY) + 800)
                ], this.centerObject.transform.translation, this.centerObject.transform.rotation
            );
            newFoundationBottomRight.transform.translation[0]   = translationRotationBottomRight[0];
            newFoundationBottomRight.transform.translation[1]   = translationRotationBottomRight[1];

            this.baseLayout.saveGameParser.addObject(newFoundationBottomRight);

            let resultBottomRight = this.baseLayout.parseObject(newFoundationBottomRight);
                this.baseLayout.addElementToLayer(resultBottomRight.layer, resultBottomRight.marker);
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
            link1.title         = 'Import/Export a blueprint';

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
            link2.title         = 'Paste blueprint in the original position';
            this.options.pasteInPlaceButton = link2;
        $(this.options.pasteInPlaceButton).hide();

        L.DomEvent
            .on(link2, 'click', L.DomEvent.stopPropagation)
            .on(link2, 'click', L.DomEvent.preventDefault)
            .on(link2, 'click', this._pasteInPlace, this)
            .on(link2, 'dbclick', L.DomEvent.stopPropagation);

        let modal = new Array();
            modal.push('<div class="modal fade" tabindex="-1" role="dialog" id="clipboardControlModal"><div class="modal-dialog modal-lg"><div class="modal-content">');
            modal.push('<div class="modal-header"><h5 class="modal-title">Blueprint</h5><button type="button" class="close" data-dismiss="modal"><span>&times;</span></button></div>');
            modal.push('<div class="modal-body"><p>You can copy a selection of items using the <strong>Lasso tool</strong>, then export them into a file.</p><div id="dropBlueprint"><input name="bluePrintFile" type="file" id="blueprintFileInput" accept=".cbp"><label for="blueprintFileInput" class="m-0"><i class="fas fa-upload"></i> Click/Drop a blueprint file</label></div></div>');
            modal.push('<div class="modal-body"><button class="downloadButton btn btn-secondary w-100">Download current blueprint</button></div>');
            modal.push('</div></div></div>');

        $('body').append(modal.join(''));

        $('#clipboardControlModal .downloadButton').on('click', function(e){
            saveAs(
                new Blob(
                    [pako.deflate(JSON.stringify(baseLayout.clipboard))],
                    {type: "application/octet-stream; charset=utf-8"}
                ), "blueprint-calculator.cbp"
            );
            $('#clipboardControlModal').modal('hide');
            return;
        });

        if(window.File && window.FileReader && window.FileList && window.Blob)
        {
            let processBlueprintFile = function(droppedFile)
            {
                if(droppedFile !== undefined)
                {
                    if(droppedFile.name.endsWith('.cbp'))
                    {
                        let reader = new FileReader();
                            reader.readAsArrayBuffer(droppedFile);

                        reader.onload = function(){
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
                                Modal.alert('Imported ' + restored.data.length + ' items from the blueprint!<br />Don\'t forget to paste it on original location or by right clicking any foundation!');
                            }

                            $('#clipboardControlModal').modal('hide');
                        }.bind(this);
                    }
                    else
                    {
                        alert('File should be name XXX.cbp');
                    }
                }
                else
                {
                    alert('Something went wrong reading your blueprint file!');
                }
            }.bind(this);

            $('#dropBlueprint').on('drag dragstart dragend dragover dragenter dragleave drop', function(e){e.preventDefault();e.stopPropagation();})
                               .on('dragover dragenter', function(){$('#dropBlueprint').addClass('is-dragover');})
                               .on('dragleave dragend drop', function(){$('#dropBlueprint').removeClass('is-dragover');})
                               .on('drop', function(e){ processBlueprintFile(e.originalEvent.dataTransfer.files[0]); });
            $('#blueprintFileInput').on('change', function(e){
                let currentFile = $(this).prop('files')[0];
                    $(this).val('');

                processBlueprintFile(currentFile);
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
        $('#dropBlueprint').off('drag dragstart dragend dragover dragenter dragleave drop')
                           .off('dragover dragenter')
                           .off('dragleave dragend drop')
                           .off('drop');
        $('#blueprintFileInput').off('change');

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
            new Spawn_Blueprint({
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
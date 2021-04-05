/* global gtag */
export default class BaseLayout_Selection_Copy
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.markersSelected    = options.markersSelected;

        if(typeof gtag === 'function')
        {
            gtag('event', 'Copy', {event_category: 'Selection'});
        }

        return this.copy();
    }

    copy()
    {
        this.baseLayout.clipboard = null;

        if(this.markersSelected)
        {
            let header              = this.baseLayout.saveGameParser.getHeader();
            let clipboard           = {
                saveVersion             : header.saveVersion,
                buildVersion            : header.buildVersion,
                data                    : [],
                pipes                   : {},
                hiddenConnections       : {}
            };

            let availablePathName   = [];

            // Filter not wanted
            for(let i = (this.markersSelected.length - 1); i >= 0; i--)
            {
                let currentObject       = this.baseLayout.saveGameParser.getTargetObject(this.markersSelected[i].options.pathName);
                let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(currentObject.className);

                if(this.baseLayout.useDebug === true && (
                        currentObject.className === '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C'
                     || currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerPoleMk1/Build_PowerPoleMk1.Build_PowerPoleMk1_C'
                ))
                {
                    console.log([Math.round(currentObject.transform.translation[0]), Math.round(currentObject.transform.translation[1])]);
                }

                if(currentObjectData !== null)
                {
                    if(currentObjectData.className === '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C')
                    {
                        this.markersSelected.splice(i, 1);
                        continue;
                    }
                    if(currentObjectData.className === '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C')
                    {
                        this.markersSelected.splice(i, 1);
                        continue;
                    }
                    if(currentObject.className.search('Integrated') !== -1)
                    {
                        this.markersSelected.splice(i, 1);
                        continue;
                    }
                }
                else
                {
                    if(
                            currentObject.className !== '/Script/FactoryGame.FGItemPickup_Spawnable'
                         && currentObject.className !== '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C'
                         && currentObject.className !== '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C'
                         && currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C'
                         //&& currentObject.className !== '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C' //TODO: Check if working?
                    )
                    {
                        this.markersSelected.splice(i, 1);
                    }
                }
            }

            for(let i = 0; i < this.markersSelected.length; i++)
            {
                let currentObject       = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.markersSelected[i].options.pathName);
                let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(currentObject.className);


                if(
                        currentObjectData !== null
                     || currentObject.className === '/Script/FactoryGame.FGItemPickup_Spawnable'
                     || currentObject.className === '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C'
                     || currentObject.className === '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C'
                     || currentObject.className === '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C'
                )
                {
                    let newDataObject           = {};
                        newDataObject.parent    = JSON.parse(JSON.stringify(currentObject));
                        newDataObject.children  = [];

                    // Get object children
                    if(currentObject.children !== undefined)
                    {
                        for(let j = 0; j < currentObject.children.length; j++)
                        {
                            let newObjectChildren = JSON.parse(JSON.stringify(this.baseLayout.saveGameParser.getTargetObject(currentObject.children[j].pathName)));
                                newDataObject.children.push(newObjectChildren);
                        }
                    }

                    // Need some extra linked properties?
                    //TODO: Check mPairedStation?
                    let extraProperties = ['mRailroadTrack', 'mInfo', 'mStationDrone'];
                        for(let j = 0; j < extraProperties.length; j++)
                        {
                            let extraProperty   = this.baseLayout.getObjectProperty(currentObject, extraProperties[j]);
                                if(extraProperty !== null)
                                {
                                    let extraPropertyObject             = this.baseLayout.saveGameParser.getTargetObject(extraProperty.pathName);
                                    let extraPropertyNewObject          = {};
                                        extraPropertyNewObject.parent   = JSON.parse(JSON.stringify(extraPropertyObject));
                                        extraPropertyNewObject.children = [];

                                        if(extraPropertyObject.children !== undefined)
                                        {
                                            for(let k = 0; k < extraPropertyObject.children.length; k++)
                                            {
                                                extraPropertyNewObject.children.push(
                                                    JSON.parse(JSON.stringify(this.baseLayout.saveGameParser.getTargetObject(extraPropertyObject.children[j].pathName)))
                                                );
                                            }
                                        }

                                    clipboard.data.push(extraPropertyNewObject);
                                    availablePathName.push(extraPropertyNewObject.parent.pathName);
                                }
                        }

                    // Does vehicle have a list of waypoints?
                    let mTargetNodeLinkedList   = this.baseLayout.getObjectProperty(currentObject, 'mTargetNodeLinkedList');
                        if(mTargetNodeLinkedList !== null)
                        {
                            let linkedList = this.baseLayout.saveGameParser.getTargetObject(mTargetNodeLinkedList.pathName);
                                newDataObject.linkedList = linkedList;

                                if(linkedList.properties !== undefined && linkedList.properties.length > 0)
                                {
                                    let firstNode   = null;
                                    let lastNode    = null;

                                    for(let j = 0; j < linkedList.properties.length; j++)
                                    {
                                        if(linkedList.properties[j].name === 'mFirst')
                                        {
                                            firstNode = this.baseLayout.saveGameParser.getTargetObject(linkedList.properties[j].value.pathName);
                                        }
                                        if(linkedList.properties[j].name === 'mLast')
                                        {
                                            lastNode = this.baseLayout.saveGameParser.getTargetObject(linkedList.properties[j].value.pathName);
                                        }
                                    }

                                    if(firstNode !== null && lastNode !== null)
                                    {
                                        newDataObject.targetPoints = [];

                                        let checkCurrentNode = firstNode;

                                            while(checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName)
                                            {
                                                newDataObject.targetPoints.push(checkCurrentNode);

                                                let checkCurrentNodeProperties  = checkCurrentNode.properties;
                                                    checkCurrentNode            = null;

                                                for(let k = 0; k < checkCurrentNodeProperties.length; k++)
                                                {
                                                    if(checkCurrentNodeProperties[k].name === 'mNext')
                                                    {
                                                        checkCurrentNode = this.baseLayout.saveGameParser.getTargetObject(checkCurrentNodeProperties[k].value.pathName);
                                                    }
                                                }
                                            }

                                        newDataObject.targetPoints.push(lastNode);
                                    }
                                }
                        }

                    clipboard.data.push(newDataObject);
                    availablePathName.push(newDataObject.parent.pathName);
                }
            }

            for(let i = clipboard.data.length - 1; i >= 0; i--)
            {
                if(clipboard.data[i].parent.className === '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C')
                {
                    let mControlledConnection = this.baseLayout.getObjectProperty(clipboard.data[i].parent, 'mControlledConnection');
                        if(mControlledConnection !== null)
                        {
                            let testPathName    = mControlledConnection.pathName.split('.');
                                testPathName.pop();
                                testPathName    = testPathName.join('.');

                            if(availablePathName.includes(testPathName) === false)
                            {
                                clipboard.data.splice(i, 1);
                            }
                        }
                }

                for(let j = 0; j < clipboard.data[i].children.length; j++)
                {
                    let currentChildren = clipboard.data[i].children[j];

                    // Remove belt connection for objects that aren't in the loop...
                    for(let k = 0; k < this.baseLayout.availableBeltConnection.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(this.baseLayout.availableBeltConnection[k]))
                        {
                            for(let m = currentChildren.properties.length - 1; m >= 0; m--)
                            {
                                if(currentChildren.properties[m].name === 'mConnectedComponent')
                                {
                                    let testPathName    = currentChildren.properties[m].value.pathName.split('.');
                                        testPathName.pop();
                                        testPathName    = testPathName.join('.');

                                    if(availablePathName.includes(testPathName) === false)
                                    {
                                        currentChildren.properties.splice(m, 1);
                                    }
                                }
                            }
                        }
                    }

                    // Remove railway connection for objects that aren't in the loop...
                    for(let k = 0; k < this.baseLayout.availableRailwayConnection.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(this.baseLayout.availableRailwayConnection[k]))
                        {
                            for(let m = currentChildren.properties.length - 1; m >= 0; m--)
                            {
                                if(currentChildren.properties[m].name === 'mConnectedComponents')
                                {
                                    let mConnectedComponents    = currentChildren.properties[m].value;

                                        for(let n = mConnectedComponents.values.length - 1; n >= 0; n--)
                                        {
                                            let testPathName    = mConnectedComponents.values[n].pathName.split('.');
                                                testPathName.pop();
                                                testPathName    = testPathName.join('.');

                                            if(availablePathName.includes(testPathName) === false)
                                            {
                                                mConnectedComponents.values.splice(n, 1);
                                            }
                                        }
                                }
                            }
                        }
                    }

                    // Remove platform connection for objects that aren't in the loop...
                    for(let k = 0; k < this.baseLayout.availablePlatformConnection.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(this.baseLayout.availablePlatformConnection[k]))
                        {
                            for(let m = currentChildren.properties.length - 1; m >= 0; m--)
                            {
                                if(currentChildren.properties[m].name === 'mConnectedTo')
                                {
                                    let testPathName    = currentChildren.properties[m].value.pathName.split('.');
                                        testPathName.pop();
                                        testPathName    = testPathName.join('.');

                                    if(availablePathName.includes(testPathName) === false)
                                    {
                                        currentChildren.properties = [];
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    // Remove hyper pipe connection for objects that aren't in the loop...
                    for(let k = 0; k < this.baseLayout.availableHyperPipeConnection.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(this.baseLayout.availableHyperPipeConnection[k]))
                        {
                            for(let m = currentChildren.properties.length - 1; m >= 0; m--)
                            {
                                if(currentChildren.properties[m].name === 'mConnectedComponent')
                                {
                                    let testPathName    = currentChildren.properties[m].value.pathName.split('.');
                                        testPathName.pop();
                                        testPathName    = testPathName.join('.');

                                    if(availablePathName.includes(testPathName) === false)
                                    {
                                        currentChildren.properties.splice(m, 1);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Handle pipes circuits
            for(let i = 0; i < clipboard.data.length; i++)
            {
                for(let j = 0; j < clipboard.data[i].children.length; j++)
                {
                    let currentChildren = clipboard.data[i].children[j];

                    for(let k = 0; k < this.baseLayout.availablePipeConnection.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(this.baseLayout.availablePipeConnection[k]))
                        {
                            let keepPipeNetwork = false;

                            for(let m = currentChildren.properties.length - 1; m >= 0; m--)
                            {
                                if(currentChildren.properties[m].name === 'mConnectedComponent')
                                {
                                    let testPathName    = currentChildren.properties[m].value.pathName.split('.');
                                        testPathName.pop();
                                        testPathName    = testPathName.join('.');

                                    if(availablePathName.includes(testPathName) === false)
                                    {
                                        currentChildren.properties.splice(m, 1);
                                    }
                                    else
                                    {
                                        keepPipeNetwork = true;
                                    }
                                }
                            }

                            if(keepPipeNetwork === true) // mPipeNetworkID
                            {
                                let pipeNetworkId = null;

                                for(let m = currentChildren.properties.length - 1; m >= 0; m--)
                                {
                                    if(currentChildren.properties[m].name === 'mPipeNetworkID')
                                    {
                                        pipeNetworkId           = currentChildren.properties[m].value;
                                    }
                                }

                                if(pipeNetworkId !== null && this.baseLayout.saveGamePipeNetworks[pipeNetworkId] !== undefined)
                                {
                                    if(clipboard.pipes[pipeNetworkId] === undefined)
                                    {
                                        clipboard.pipes[pipeNetworkId] = {fluid: null, interface: []};
                                    }

                                    // Check if that pathName is in the current pipe network
                                    let currentPipeNetwork = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.saveGamePipeNetworks[pipeNetworkId]);
                                        if(currentPipeNetwork !== null)
                                        {
                                            //console.log(currentPipeNetwork);
                                            for(let n = currentPipeNetwork.properties.length - 1; n >= 0; n--)
                                            {
                                                if(currentPipeNetwork.properties[n].name === 'mFluidDescriptor')
                                                {
                                                    clipboard.pipes[pipeNetworkId].fluid = currentPipeNetwork.properties[n].value.pathName;
                                                }
                                                if(currentPipeNetwork.properties[n].name === 'mFluidIntegrantScriptInterfaces')
                                                {
                                                    for(let o = 0; o < currentPipeNetwork.properties[n].value.values.length; o++)
                                                    {
                                                        if(currentPipeNetwork.properties[n].value.values[o].pathName === currentChildren.pathName)
                                                        {
                                                            if(clipboard.pipes[pipeNetworkId].interface.includes(currentChildren.pathName) === false)
                                                            {
                                                                clipboard.pipes[pipeNetworkId].interface.push(currentChildren.pathName);
                                                            }
                                                        }
                                                        if(currentPipeNetwork.properties[n].value.values[o].pathName === currentChildren.outerPathName)
                                                        {
                                                            if(clipboard.pipes[pipeNetworkId].interface.includes(currentChildren.outerPathName) === false)
                                                            {
                                                                clipboard.pipes[pipeNetworkId].interface.push(currentChildren.outerPathName);
                                                            }
                                                        }

                                                        for(let m = 0; m < currentChildren.properties.length; m++)
                                                        {
                                                            if(currentChildren.properties[m].name === 'mConnectedComponent')
                                                            {
                                                                if(currentPipeNetwork.properties[n].value.values[o].pathName === currentChildren.properties[m].value.pathName)
                                                                {
                                                                    if(clipboard.pipes[pipeNetworkId].interface.includes(currentChildren.properties[m].value.pathName) === false)
                                                                    {
                                                                        clipboard.pipes[pipeNetworkId].interface.push(currentChildren.properties[m].value.pathName);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                }
                            }
                        }
                    }
                }
            }

            // Grab wires when needed, or delete power connection...
            for(let i = 0; i < clipboard.data.length; i++)
            {
                for(let j = 0; j < clipboard.data[i].children.length; j++)
                {
                    let currentChildren = clipboard.data[i].children[j];

                    for(let k = 0; k < this.baseLayout.availablePowerConnection.length; k++)
                    {
                        if(currentChildren.pathName.endsWith(this.baseLayout.availablePowerConnection[k]))
                        {
                            let mWires = this.baseLayout.getObjectProperty(currentChildren, 'mWires');
                                if(mWires !== null)
                                {
                                    for(let m = mWires.values.length - 1; m >= 0; m--)
                                    {
                                        let keepPowerLine    = true;
                                        let currentPowerline = this.baseLayout.saveGameParser.getTargetObject(mWires.values[m].pathName);

                                            if(currentPowerline !== null)
                                            {
                                                let testSourcePathName  = currentPowerline.extra.sourcePathName.split('.');
                                                    testSourcePathName.pop();
                                                    testSourcePathName  = testSourcePathName.join('.');

                                                if(availablePathName.includes(testSourcePathName) === false)
                                                {
                                                    keepPowerLine = false;
                                                }

                                                let testTargetPathName  = currentPowerline.extra.targetPathName.split('.');
                                                    testTargetPathName.pop();
                                                    testTargetPathName  = testTargetPathName.join('.');

                                                if(availablePathName.includes(testTargetPathName) === false)
                                                {
                                                    keepPowerLine = false;
                                                }
                                            }
                                            else
                                            {
                                                keepPowerLine = false;
                                            }

                                            if(keepPowerLine === false)
                                            {
                                                mWires.values.splice(m, 1);
                                            }
                                            else
                                            {
                                                if(availablePathName.includes(currentPowerline.pathName) === false)
                                                {
                                                    clipboard.data.push({parent: currentPowerline, children: []});
                                                    availablePathName.push(currentPowerline.pathName);
                                                }
                                            }
                                    }
                                }

                            let mHiddenConnections = this.baseLayout.getObjectProperty(currentChildren, 'mHiddenConnections');
                                if(mHiddenConnections !== null)
                                {
                                    for(let m = mHiddenConnections.values.length - 1; m >= 0; m--)
                                    {
                                        let currentHiddenConnection = this.baseLayout.saveGameParser.getTargetObject(mHiddenConnections.values[m].pathName);

                                            if(currentHiddenConnection !== null)
                                            {
                                                    currentHiddenConnection     = JSON.parse(JSON.stringify(currentHiddenConnection));
                                                let mCurrentHiddenConnections   = this.baseLayout.getObjectProperty(currentHiddenConnection, 'mHiddenConnections');

                                                    if(mCurrentHiddenConnections !== null)
                                                    {
                                                        for(let n = mCurrentHiddenConnections.values.length - 1; n >= 0; n--)
                                                        {
                                                            let testSourcePathName  = mCurrentHiddenConnections.values[n].pathName.split('.');
                                                                testSourcePathName.pop();
                                                                testSourcePathName  = testSourcePathName.join('.');

                                                                if(availablePathName.includes(testSourcePathName) === false)
                                                                {
                                                                    mCurrentHiddenConnections.values.splice(n, 1);
                                                                }
                                                        }
                                                    }

                                                if(clipboard.hiddenConnections[currentHiddenConnection.pathName] === undefined)
                                                {
                                                    clipboard.hiddenConnections[currentHiddenConnection.pathName] = currentHiddenConnection;
                                                }
                                            }
                                    }
                                }
                        }
                    }
                }
            }

            // CODE TO EXTRACT PIPE LETTERS
            /*
            if(this.baseLayout.useDebug === true)
            {
                let xOffset = -150.09375;
                let data    = {pipes: []};
                for(let i = 0; i < clipboard.data.length; i++)
                {
                    if(clipboard.data[i].parent.className === '/Game/FactoryGame/Buildable/Factory/Pipeline/Build_Pipeline.Build_Pipeline_C')
                    {
                        let mSplineData = this.baseLayout.getObjectProperty(clipboard.data[i].parent, 'mSplineData');

                            if(mSplineData !== null)
                            {
                                let currentPipe         = {
                                    x: clipboard.data[i].parent.transform.translation[0] + xOffset - (Math.round((clipboard.data[i].parent.transform.translation[0] + xOffset) / 800) * 800),
                                    y: clipboard.data[i].parent.transform.translation[1] + 57400,
                                    z: clipboard.data[i].parent.transform.translation[2] - 1975,
                                    spline: []
                                };

                                    for(let j = 0; j < mSplineData.values.length; j++)
                                    {
                                        let currentSplineData   = {};

                                        for(let k = 0; k < mSplineData.values[j].length; k++)
                                        {
                                            currentSplineData[mSplineData.values[j][k].name] = {
                                                x: mSplineData.values[j][k].value.values.x,
                                                y: mSplineData.values[j][k].value.values.y,
                                                z: mSplineData.values[j][k].value.values.z
                                            };
                                        }

                                        currentPipe.spline.push(currentSplineData);
                                    }

                                data.pipes.push(currentPipe);
                            }

                    }
                }
                console.log(JSON.stringify(data));
            }
            /**/

            if(this.baseLayout.useDebug === true)
            {
                console.log('COPY', clipboard);
            }

            // Store boundaries
            let selectionBoundaries = this.baseLayout.getSelectionBoundaries(this.markersSelected);
                clipboard.minX      = selectionBoundaries.minX;
                clipboard.maxX      = selectionBoundaries.maxX;
                clipboard.minY      = selectionBoundaries.minY;
                clipboard.maxY      = selectionBoundaries.maxY;

            this.baseLayout.clipboard  = JSON.parse(JSON.stringify(clipboard));
        }

        this.baseLayout.cancelSelectMultipleMarkers();
    }
}
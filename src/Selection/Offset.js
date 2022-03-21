/* global gtag */
import Modal_Selection                          from '../Modal/Selection.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Selection_Offset
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;

        this.offsetX                = parseFloat(options.offsetX);
        this.offsetY                = parseFloat(options.offsetY);
        this.offsetZ                = parseFloat(options.offsetZ);

        this.selectionBoundaries    = (options.selectionBoundaries !== undefined) ? options.selectionBoundaries : null;
        this.useHistory             = (options.history !== undefined) ? options.history : true;

        if(typeof gtag === 'function')
        {
            gtag('event', 'Offset', {event_category: 'Selection'});
        }

        return this.offset();
    }

    offset()
    {
        if(this.markers)
        {
            console.time('offsetMultipleMarkers');
            let wires           = [];
            let historyPathName = [];

            for(let i = 0; i < this.markers.length; i++)
            {
                if(this.markers[i].options.pathName !== undefined)
                {
                    let currentObject                       = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);

                    if(currentObject !== null)
                    {
                        if(this.useHistory === true && this.baseLayout.history !== null)
                        {
                            let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(currentObject.className);
                                if(currentObjectData !== null && currentObjectData.mapLayer !== undefined)
                                {
                                    historyPathName.push([this.markers[i].options.pathName, currentObjectData.mapLayer]);
                                }
                                else
                                {
                                    historyPathName.push(this.markers[i].options.pathName);
                                }
                        }

                        switch(currentObject.className)
                        {
                            case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                                // Find target
                                let mOwnedPawn = this.baseLayout.getObjectPropertyValue(currentObject, 'mOwnedPawn');
                                    if(mOwnedPawn !== null)
                                    {
                                        let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                            if(currentObjectTarget !== null)
                                            {
                                                if(isNaN(this.offsetX) === false)
                                                {
                                                    currentObjectTarget.transform.translation[0] = currentObjectTarget.transform.translation[0] + this.offsetX;
                                                }
                                                if(isNaN(this.offsetY) === false)
                                                {
                                                    currentObjectTarget.transform.translation[1] = currentObjectTarget.transform.translation[1] + this.offsetY;
                                                }
                                                if(isNaN(this.offsetZ) === false)
                                                {
                                                    currentObjectTarget.transform.translation[2] = currentObjectTarget.transform.translation[2] + this.offsetZ;
                                                }
                                            }
                                    }
                                break;
                            case '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C':
                                // HUB should also move hidden objects
                                let mHubTerminal    = this.baseLayout.getObjectPropertyValue(currentObject, 'mHubTerminal');
                                    if(mHubTerminal !== null)
                                    {
                                        let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mHubTerminal.pathName);
                                            if(currentObjectTarget !== null)
                                            {
                                                if(isNaN(this.offsetX) === false)
                                                {
                                                    currentObjectTarget.transform.translation[0] = currentObjectTarget.transform.translation[0] + this.offsetX;
                                                }
                                                if(isNaN(this.offsetY) === false)
                                                {
                                                    currentObjectTarget.transform.translation[1] = currentObjectTarget.transform.translation[1] + this.offsetY;
                                                }
                                                if(isNaN(this.offsetZ) === false)
                                                {
                                                    currentObjectTarget.transform.translation[2] = currentObjectTarget.transform.translation[2] + this.offsetZ;
                                                }
                                            }
                                    }
                                let mWorkBench      = this.baseLayout.getObjectPropertyValue(currentObject, 'mWorkBench');
                                    if(mWorkBench !== null)
                                    {
                                        let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mWorkBench.pathName);
                                            if(currentObjectTarget !== null)
                                            {
                                                if(isNaN(this.offsetX) === false)
                                                {
                                                    currentObjectTarget.transform.translation[0] = currentObjectTarget.transform.translation[0] + this.offsetX;
                                                }
                                                if(isNaN(this.offsetY) === false)
                                                {
                                                    currentObjectTarget.transform.translation[1] = currentObjectTarget.transform.translation[1] + this.offsetY;
                                                }
                                                if(isNaN(this.offsetZ) === false)
                                                {
                                                    currentObjectTarget.transform.translation[2] = currentObjectTarget.transform.translation[2] + this.offsetZ;
                                                }
                                            }
                                    }
                            default:
                                if(isNaN(this.offsetX) === false)
                                {
                                    currentObject.transform.translation[0] = currentObject.transform.translation[0] + this.offsetX;
                                }
                                if(isNaN(this.offsetY) === false)
                                {
                                    currentObject.transform.translation[1] = currentObject.transform.translation[1] + this.offsetY;
                                }
                                if(isNaN(this.offsetZ) === false)
                                {
                                    currentObject.transform.translation[2] = currentObject.transform.translation[2] + this.offsetZ;
                                }
                                break;
                        }

                        if(currentObject.children !== undefined)
                        {
                            for(const child of currentObject.children)
                            {
                                let currentObjectChildren = this.baseLayout.saveGameParser.getTargetObject(child.pathName);
                                    if(currentObjectChildren !== null)
                                    {
                                        // Grab wires for redraw...
                                        const component = '.' + currentObjectChildren.pathName.split('.').pop();
                                        if(this.baseLayout.availablePowerConnection.has(component))
                                        {
                                            for(let m = 0; m < currentObjectChildren.properties.length; m++)
                                            {
                                                if(currentObjectChildren.properties[m].name === 'mWires')
                                                {
                                                    for(let n = 0; n < currentObjectChildren.properties[m].value.values.length; n++)
                                                    {
                                                        if(wires.includes(currentObjectChildren.properties[m].value.values[n].pathName) === false)
                                                        {
                                                            wires.push(currentObjectChildren.properties[m].value.values[n].pathName);
                                                        }
                                                    }

                                                    break;
                                                }
                                            }
                                        }
                                    }
                            }
                        }

                        // Delete and add again!
                        let result = this.baseLayout.parseObject(currentObject);
                            this.baseLayout.deleteMarkerFromElements(result.layer, this.markers[i], true);
                            this.baseLayout.addElementToLayer(result.layer, result.marker);
                    }
                }
            }

            for(let i = 0; i < wires.length; i++)
            {
                let currentObject   = this.baseLayout.saveGameParser.getTargetObject(wires[i]);
                let result          = this.baseLayout.parseObject(currentObject);
                let oldMarker       = this.baseLayout.getMarkerFromPathName(currentObject.pathName, result.layer);
                    this.baseLayout.deleteMarkerFromElements(result.layer, oldMarker, true);
                    this.baseLayout.addElementToLayer(result.layer, result.marker);
            }

            if(this.useHistory === true && this.baseLayout.history !== null)
            {
                this.baseLayout.history.add({
                    name: 'Undo: Offset selection',
                    values: [{
                        pathNameArray: historyPathName,
                        callback: 'Selection_Offset',
                        properties: {offsetX: -this.offsetX, offsetY: -this.offsetY, offsetZ: -this.offsetZ}
                    }]
                });
            }

            console.timeEnd('offsetMultipleMarkers');
            this.baseLayout.updateRadioactivityLayer();
        }

        Modal_Selection.cancel(this.baseLayout);
    }
}
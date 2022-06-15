/* global gtag, Promise */
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
            let offsetResults   = [];
            let historyPathName = [];

            for(let i = 0; i < this.markers.length; i++)
            {
                if(this.markers[i].options.pathName !== undefined)
                {
                    let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);
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

                        let newTransform = JSON.parse(JSON.stringify(currentObject.transform));
                            switch(currentObject.className)
                            {
                                case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                                    // Find target
                                    let mOwnedPawn = this.baseLayout.getObjectProperty(currentObject, 'mOwnedPawn');
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
                                default:
                                    if(isNaN(this.offsetX) === false)
                                    {
                                        newTransform.translation[0] = currentObject.transform.translation[0] + this.offsetX;
                                    }
                                    if(isNaN(this.offsetY) === false)
                                    {
                                        newTransform.translation[1] = currentObject.transform.translation[1] + this.offsetY;
                                    }
                                    if(isNaN(this.offsetZ) === false)
                                    {
                                        newTransform.translation[2] = currentObject.transform.translation[2] + this.offsetZ;
                                    }
                                    break;
                            }

                            offsetResults.push(this.baseLayout.refreshMarkerPosition({marker: this.markers[i], transform: newTransform, object: currentObject}, true));
                        }
                }
            }

            Promise.all(offsetResults).then(() => {
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
            });
        }

        Modal_Selection.cancel(this.baseLayout);
    }
}
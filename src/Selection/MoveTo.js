/* global gtag, Promise */
import Modal_Selection                          from '../Modal/Selection.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Selection_MoveTo
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;
        this.boundaries             = options.boundaries;

        this.moveToX                = parseFloat(options.moveToX);
        this.moveToY                = parseFloat(options.moveToY);
        this.moveToZ                = parseFloat(options.moveToZ);


        this.useHistory             = (options.history !== undefined) ? options.history : true;

        if(typeof gtag === 'function')
        {
            gtag('event', 'MoveTo', {event_category: 'Selection'});
        }

        return this.offset();
    }

    offset()
    {
        if(this.markers)
        {
            console.time('moveToMultipleMarkers');
            let moveToResults   = [];
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
                                                    if(isNaN(this.moveToX) === false)
                                                    {
                                                        currentObjectTarget.transform.translation[0] = currentObjectTarget.transform.translation[0] + (this.moveToX - this.boundaries.centerX);
                                                    }
                                                    if(isNaN(this.moveToY) === false)
                                                    {
                                                        currentObjectTarget.transform.translation[1] = currentObjectTarget.transform.translation[1] + (this.moveToY - this.boundaries.centerY);
                                                    }
                                                    if(isNaN(this.moveToZ) === false)
                                                    {
                                                        currentObjectTarget.transform.translation[2] = currentObjectTarget.transform.translation[2] + (this.moveToZ - this.boundaries.centerZ);
                                                    }
                                                }
                                        }
                                    break;
                                default:
                                    if(isNaN(this.moveToX) === false)
                                    {
                                        newTransform.translation[0] = currentObject.transform.translation[0] + (this.moveToX - this.boundaries.centerX);
                                    }
                                    if(isNaN(this.moveToY) === false)
                                    {
                                        newTransform.translation[1] = currentObject.transform.translation[1] + (this.moveToY - this.boundaries.centerY);
                                    }
                                    if(isNaN(this.moveToZ) === false)
                                    {
                                        newTransform.translation[2] = currentObject.transform.translation[2] + (this.moveToZ - this.boundaries.centerZ);
                                    }
                                    break;
                            }

                            moveToResults.push(this.baseLayout.refreshMarkerPosition({marker: this.markers[i], transform: newTransform, object: currentObject}, true));
                        }
                }
            }

            Promise.all(moveToResults).then(() => {
                if(this.useHistory === true && this.baseLayout.history !== null)
                {
                    this.baseLayout.history.add({
                        name: 'Undo: Move To selection',
                        values: [{
                            pathNameArray: historyPathName,
                            callback: 'Selection_MoveTo',
                            properties: {moveToX: this.boundaries.centerX, moveToY: this.boundaries.centerY, moveToZ: this.boundaries.centerZ, boundaries: {centerX : this.moveToX, centerY : this.moveToY, centerZ : this.moveToZ}}
                        }]
                    });
                }

                console.timeEnd('moveToMultipleMarkers');
                this.baseLayout.updateRadioactivityLayer();
            });
        }

        Modal_Selection.cancel(this.baseLayout);
    }
}
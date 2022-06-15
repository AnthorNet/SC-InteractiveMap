/* global gtag, Promise */
import Modal_Selection                          from '../Modal/Selection.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Selection_Rotate
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;

        this.angle                  = parseFloat(Math.max(0, Math.min(360, options.angle)));

        this.selectionBoundaries    = (options.selectionBoundaries !== undefined) ? options.selectionBoundaries : null;
        this.useHistory             = (options.history !== undefined) ? options.history : true;

        if(typeof gtag === 'function')
        {
            gtag('event', 'Rotate', {event_category: 'Selection'});
        }

        return this.rotate();
    }

    rotate()
    {
        if(this.markers && isNaN(this.angle) === false)
        {
            console.time('rotateMultipleMarkers');

            if(this.selectionBoundaries === null)
            {
                this.selectionBoundaries = Modal_Selection.getBoundaries(this.baseLayout, this.markers);
            }

            let rotateResults   = [];
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
                                        let mOwnedPawn = this.baseLayout.getObjectProperty(currentObject, 'mOwnedPawn');
                                            if(mOwnedPawn !== null)
                                            {
                                                let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                                    if(currentObjectTarget !== null)
                                                    {
                                                        let translationRotation = BaseLayout_Math.getPointRotation(
                                                            currentObjectTarget.transform.translation,
                                                            [this.selectionBoundaries.centerX, this.selectionBoundaries.centerY],
                                                            BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                                        );
                                                        currentObjectTarget.transform.translation[0]  = translationRotation[0];
                                                        currentObjectTarget.transform.translation[1]  = translationRotation[1];
                                                        currentObjectTarget.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(currentObjectTarget.transform.rotation, this.angle);
                                                    }
                                            }
                                        break;
                                    default:
                                        let translationRotation = BaseLayout_Math.getPointRotation(
                                                newTransform.translation,
                                                [this.selectionBoundaries.centerX, this.selectionBoundaries.centerY],
                                                BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                            );
                                            newTransform.translation[0]  = translationRotation[0];
                                            newTransform.translation[1]  = translationRotation[1];

                                        // Rotate all spline data and tangeant!
                                        let mSplineData                      = this.baseLayout.getObjectProperty(currentObject, 'mSplineData');
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
                                                            BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.angle)
                                                        );

                                                        currentValue.value.values.x = splineRotation[0];
                                                        currentValue.value.values.y = splineRotation[1];
                                                    }
                                                }
                                            }
                                            else
                                            {
                                                newTransform.rotation        = BaseLayout_Math.getNewQuaternionRotate(newTransform.rotation, this.angle);
                                            }
                                }

                            rotateResults.push(this.baseLayout.refreshMarkerPosition({marker: this.markers[i], transform: newTransform, object: currentObject}, true));
                        }
                }
            }

            Promise.all(rotateResults).then(() => {
                if(this.useHistory === true && this.baseLayout.history !== null)
                {
                    this.baseLayout.history.add({
                        name    : 'Undo: Rotate selection by ' + this.angle + '°',
                        values  : [{
                            pathNameArray   : historyPathName,
                            callback        : 'Selection_Rotate',
                            properties      : {angle: (360 - this.angle), selectionBoundaries: this.selectionBoundaries}
                        }]
                    });
                }

                console.timeEnd('rotateMultipleMarkers');
                this.baseLayout.updateRadioactivityLayer();
            });
        }

        Modal_Selection.cancel(this.baseLayout);
    }
}
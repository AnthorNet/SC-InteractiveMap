/* global gtag, Promise */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Road
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.layerId            = 'playerFoundationsLayer';

        this.maxWidth           = parseInt(options.maxWidth);
        this.maxHeight          = parseInt(options.maxHeight);
        this.step               = parseInt(options.step);

        this.useOwnMaterials    = options.useOwnMaterials;

        this.maxWidth           = (Math.min(255, (2* Math.floor(this.maxWidth / 2) + 1)) - 1) / 2;
        this.maxHeight          = Math.min(255, this.maxHeight);
        this.step               = Math.max(1, Math.min(255, this.step));

        this.direction          = (options.direction !== undefined) ? options.direction : 'UP';
        this.curvature          = Math.max(-360, Math.min(360, parseFloat(options.curvature)));

        this.curvatureAngle     = Math.abs(this.curvature) / this.maxHeight;

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.centerObjectHeight = 400;
        this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;
        this.correctedCenterYaw = 0;

        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
            if(currentObjectData !== null)
            {
                if(currentObjectData.mapLayer !== undefined)
                {
                    this.layerId = currentObjectData.mapLayer;
                }
                if(currentObjectData.height !== undefined)
                {
                    this.centerObjectHeight = currentObjectData.height * 100;
                }
                if(currentObjectData.mapCorrectedAngle !== undefined)
                {
                    this.correctedCenterYaw = currentObjectData.mapCorrectedAngle;
                }
            }

            if(typeof gtag === 'function')
            {
                gtag('event', 'Road', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        console.time('spawnRoad');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history        = [];
        this.startPosition  = [
                    (this.maxWidth * 800) + this.centerObject.transform.translation[0],
                    this.centerObject.transform.translation[1]
        ];

        if(this.curvature >= 0)
        {
            this.startPosition  = [
                (-this.maxWidth * 800) + this.centerObject.transform.translation[0],
                this.centerObject.transform.translation[1]
            ];
        }

        if(this.direction === 'DOWN')
        {
            return this.loopDown(0, this.maxHeight, this.step);
        }

        return this.loopUp(0, -this.maxHeight, this.step);
    }

    loopDown(height, maxHeight, step)
    {
        for(height; height <= maxHeight; height+=step)
        {
            let results = (this.curvature >= 0) ? this.loopPositiveCurvature(height) : this.loopNegativeCurvature(height);
                return Promise.all(results).then((results) => {
                    for(let i = 0; i < results.length; i++)
                    {
                        this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                    }
                }).finally(() => {
                    window.requestAnimationFrame(() => {
                        $('#liveLoader .progress-bar').css('width', Math.round(Math.abs(height) / Math.abs(maxHeight) * 100) + '%');
                        this.loopDown((height + step), maxHeight, step);
                    });
                });
        }

        return this.release();
    }

    loopUp(height, maxHeight, step)
    {
        for(height; height >= maxHeight; height-=step)
        {
            let results = (this.curvature >= 0) ? this.loopPositiveCurvature(height) : this.loopNegativeCurvature(height);
                return Promise.all(results).then((results) => {
                    for(let i = 0; i < results.length; i++)
                    {
                        this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                    }
                }).finally(() => {
                    window.requestAnimationFrame(() => {
                        $('#liveLoader .progress-bar').css('width', Math.round(Math.abs(height) / Math.abs(maxHeight) * 100) + '%');
                        this.loopUp((height - step), maxHeight, step);
                    });
                });
        }

        return this.release();
    }

    loopNegativeCurvature(height)
    {
        let results     = [];
            for(let width = this.maxWidth; width >= -this.maxWidth; width--)
            {
                let result = this.spawnFoundation(width, height);
                    if(result !== null)
                    {
                        results.push(result);
                    }
            }

        return results;
    }

    loopPositiveCurvature(height)
    {
        let results     = [];
            for(let width = -this.maxWidth; width <= this.maxWidth; width++)
            {
                let result = this.spawnFoundation(width, height);
                    if(result !== null)
                    {
                        results.push(result);
                    }
            }

        return results;
    }

    spawnFoundation(width, height)
    {
        if(width === 0 && height === 0)
        {
            return null;
        }

        // Check around for materials!
        if(this.useOwnMaterials === 1)
        {
            let result = this.baseLayout.removeFromStorage(this.centerObject);
                if(result === false)
                {
                    BaseLayout_Modal.alert("We could not find enough materials and stopped your construction!");
                    return this.release(); // Don't have materials, stop it...
                }
        }

        let newFoundation           = JSON.parse(JSON.stringify(this.centerObject));
            newFoundation.pathName  = this.baseLayout.generateFastPathName(this.centerObject);

        // Calculate new position
        if(this.curvature === 0 || height === 0)
        {
            let rotation                = BaseLayout_Math.getPointRotation(
                    [
                        (width * 800) + newFoundation.transform.translation[0],
                        (height * 800) + newFoundation.transform.translation[1]
                    ],
                    newFoundation.transform.translation,
                    BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, this.correctedCenterYaw)
                );
                newFoundation.transform.translation[0]  = rotation[0];
                newFoundation.transform.translation[1]  = rotation[1];
        }

        if(this.curvature > 0 && height !== 0 && this.direction === 'UP')
        {
            // Apply bottom-left pivot to start of the line
            if(width === -this.maxWidth)
            {
                if(this.correctedCenterYaw !== 0)
                {
                    this.centerObject.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.correctedCenterYaw);
                }

                let translatedCenter    = BaseLayout_Math.getPointRotation(
                        [this.centerObject.transform.translation[0] - ((height === -1) ? (-width * 800) : 0), this.centerObject.transform.translation[1] - 800],
                        this.centerObject.transform.translation,
                        this.centerObject.transform.rotation
                    );
                let pivotedCenter       = BaseLayout_Math.getPointRotation(
                        [translatedCenter[0] - 400, translatedCenter[1] + 400],
                        translatedCenter,
                        this.centerObject.transform.rotation
                    );

                    newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.curvatureAngle);

                let newCenter       = BaseLayout_Math.getPointRotation(
                        [pivotedCenter[0] + 400, pivotedCenter[1] - 400],
                        pivotedCenter,
                        newFoundation.transform.rotation
                    );

                    if(this.correctedCenterYaw !== 0)
                    {
                        newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, -this.correctedCenterYaw);
                        this.centerObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, -this.correctedCenterYaw);
                    }

                newFoundation.transform.translation[0] = newCenter[0];
                newFoundation.transform.translation[1] = newCenter[1];

                this.centerObject = JSON.parse(JSON.stringify(newFoundation));
            }
            else
            {
                let rotation                = BaseLayout_Math.getPointRotation(
                    [
                        (800 * (width + this.maxWidth)) + newFoundation.transform.translation[0],
                        newFoundation.transform.translation[1]
                    ],
                    newFoundation.transform.translation,
                    BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, this.correctedCenterYaw)
                );
                newFoundation.transform.translation[0]  = rotation[0];
                newFoundation.transform.translation[1]  = rotation[1];
            }
        }

        if(this.curvature > 0 && height !== 0 && this.direction === 'DOWN')
        {
            // Apply top-left pivot to start of the line
            if(width === -this.maxWidth)
            {
                if(this.correctedCenterYaw !== 0)
                {
                    this.centerObject.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.correctedCenterYaw);
                }

                let translatedCenter    = BaseLayout_Math.getPointRotation(
                        [this.centerObject.transform.translation[0] - ((height === -1) ? (-width * 800) : 0), this.centerObject.transform.translation[1] + 800],
                        this.centerObject.transform.translation,
                        this.centerObject.transform.rotation
                    );
                let pivotedCenter       = BaseLayout_Math.getPointRotation(
                        [translatedCenter[0] - 400, translatedCenter[1] - 400],
                        translatedCenter,
                        this.centerObject.transform.rotation
                    );

                    newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, -this.curvatureAngle);

                let newCenter       = BaseLayout_Math.getPointRotation(
                        [pivotedCenter[0] + 400, pivotedCenter[1] + 400],
                        pivotedCenter,
                        newFoundation.transform.rotation
                    );

                    if(this.correctedCenterYaw !== 0)
                    {
                        newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, -this.correctedCenterYaw);
                        this.centerObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, -this.correctedCenterYaw);
                    }

                newFoundation.transform.translation[0] = newCenter[0];
                newFoundation.transform.translation[1] = newCenter[1];

                this.centerObject = JSON.parse(JSON.stringify(newFoundation));
            }
            else
            {
                let rotation                = BaseLayout_Math.getPointRotation(
                    [
                        (800 * (width + this.maxWidth)) + newFoundation.transform.translation[0],
                        newFoundation.transform.translation[1]
                    ],
                    newFoundation.transform.translation,
                    BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, this.correctedCenterYaw)
                );
                newFoundation.transform.translation[0]  = rotation[0];
                newFoundation.transform.translation[1]  = rotation[1];
            }
        }

        if(this.curvature < 0 && height !== 0 && this.direction === 'UP')
        {
            // Apply bottom-right pivot to start of the line
            if(width === this.maxWidth)
            {
                if(this.correctedCenterYaw !== 0)
                {
                    this.centerObject.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.correctedCenterYaw);
                }

                let translatedCenter    = BaseLayout_Math.getPointRotation(
                        [this.centerObject.transform.translation[0] + ((height === -1) ? (width * 800) : 0), this.centerObject.transform.translation[1] - 800],
                        this.centerObject.transform.translation,
                        this.centerObject.transform.rotation
                    );
                let pivotedCenter       = BaseLayout_Math.getPointRotation(
                        [translatedCenter[0] + 400, translatedCenter[1] + 400],
                        translatedCenter,
                        this.centerObject.transform.rotation
                    );

                    newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, -this.curvatureAngle);

                let newCenter       = BaseLayout_Math.getPointRotation(
                        [pivotedCenter[0] - 400, pivotedCenter[1] - 400],
                        pivotedCenter,
                        newFoundation.transform.rotation
                    );

                    if(this.correctedCenterYaw !== 0)
                    {
                        newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, -this.correctedCenterYaw);
                        this.centerObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, -this.correctedCenterYaw);
                    }

                newFoundation.transform.translation[0] = newCenter[0];
                newFoundation.transform.translation[1] = newCenter[1];

                this.centerObject = JSON.parse(JSON.stringify(newFoundation));
            }
            else
            {
                let rotation                = BaseLayout_Math.getPointRotation(
                    [
                        newFoundation.transform.translation[0] - (800 * (this.maxWidth - width)),
                        newFoundation.transform.translation[1]
                    ],
                    newFoundation.transform.translation,
                    BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, this.correctedCenterYaw)
                );
                newFoundation.transform.translation[0]  = rotation[0];
                newFoundation.transform.translation[1]  = rotation[1];
            }
        }

        if(this.curvature < 0 && height !== 0 && this.direction === 'DOWN')
        {
            // Apply top-right pivot to start of the line
            if(width === this.maxWidth)
            {
                if(this.correctedCenterYaw !== 0)
                {
                    this.centerObject.transform.rotation = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.correctedCenterYaw);
                }

                let translatedCenter    = BaseLayout_Math.getPointRotation(
                        [this.centerObject.transform.translation[0] + ((height === -1) ? (width * 800) : 0), this.centerObject.transform.translation[1] + 800],
                        this.centerObject.transform.translation,
                        this.centerObject.transform.rotation
                    );
                let pivotedCenter       = BaseLayout_Math.getPointRotation(
                        [translatedCenter[0] + 400, translatedCenter[1] - 400],
                        translatedCenter,
                        this.centerObject.transform.rotation
                    );

                    newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, this.curvatureAngle);

                let newCenter       = BaseLayout_Math.getPointRotation(
                        [pivotedCenter[0] - 400, pivotedCenter[1] + 400],
                        pivotedCenter,
                        newFoundation.transform.rotation
                    );

                    if(this.correctedCenterYaw !== 0)
                    {
                        newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, -this.correctedCenterYaw);
                        this.centerObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, -this.correctedCenterYaw);
                    }

                newFoundation.transform.translation[0] = newCenter[0];
                newFoundation.transform.translation[1] = newCenter[1];

                this.centerObject = JSON.parse(JSON.stringify(newFoundation));
            }
            else
            {
                let rotation                = BaseLayout_Math.getPointRotation(
                    [
                        newFoundation.transform.translation[0] - (800 * (this.maxWidth - width)),
                        newFoundation.transform.translation[1]
                    ],
                    newFoundation.transform.translation,
                    BaseLayout_Math.getNewQuaternionRotate(newFoundation.transform.rotation, this.correctedCenterYaw)
                );
                newFoundation.transform.translation[0]  = rotation[0];
                newFoundation.transform.translation[1]  = rotation[1];
            }
        }

        // Apply new altitude
        if(this.centerObject.className.includes('Build_Ramp_') === true || this.centerObject.className.includes('Build_RampDouble') === true)
        {
            newFoundation.transform.translation[2] -= height * this.centerObjectHeight;
        }

        return new Promise((resolve) => {
            this.baseLayout.saveGameParser.addObject(newFoundation);

            this.history.push({
                pathName: newFoundation.pathName,
                layerId: this.layerId,
                callback: 'deleteGenericBuilding',
                properties: {fastDelete: true}
            });

            return this.baseLayout.parseObject(newFoundation, resolve);
        });
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn around (Road)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount(this.layerId);

        console.timeEnd('spawnRoad');
    }
}

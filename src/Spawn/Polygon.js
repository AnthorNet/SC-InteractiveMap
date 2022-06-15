/* global gtag, Promise */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Polygon
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.layerId            = 'playerFoundationsLayer';

        this.numberOfSides      = options.numberOfSides;

        this.minSize            = parseInt(options.minSize);
        this.maxSize            = parseInt(options.maxSize);

        this.gridOverlapping    = options.gridOverlapping;
        this.direction          = options.direction;

        this.useOwnMaterials    = options.useOwnMaterials;

        this.numberOfSides      = Math.max(3, Math.min(this.numberOfSides, 12));
        this.minSize            = Math.max(3, Math.min(this.minSize, 63));
        this.maxSize            = Math.max((this.minSize + 1), Math.min(this.maxSize, 65));

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.centerObjectHeight = 400;
        this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;

        this.sideAngle          = (360 / this.numberOfSides);

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
            }

            if(typeof gtag === 'function')
            {
                gtag('event', 'Polygon', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        console.time('spawnPolygon');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop(this.minSize);
    }

    loop(minSize, side = 0)
    {
        for(minSize; minSize <= this.maxSize; minSize++)
        {
            let results         = [];
            let apothem         = (minSize * 800) + 200;

            let sideLength      = 2 * (apothem) * Math.tan(Math.PI / this.numberOfSides);
                sideLength     -= 800; // Remove half a foundation from each side
            let nbFoundation    = Math.max(1, Math.ceil(sideLength / 800));

            for(side; side < this.numberOfSides; side++)
            {
                // Start position
                let angle           = (this.sideAngle * side);
                let centerX         = (Math.cos((angle + this.centerYaw) * (Math.PI / 180)) * apothem) + this.centerObject.transform.translation[0];
                let centerY         = (Math.sin((angle + this.centerYaw) * (Math.PI / 180)) * apothem) + this.centerObject.transform.translation[1];
                let centerRotation  = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, angle);

                // Draw side line
                for(let extraSide = 0; extraSide <= nbFoundation; extraSide++)
                {
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

                    let newFoundation                       = JSON.parse(JSON.stringify(this.centerObject));
                        newFoundation.pathName              = this.baseLayout.generateFastPathName(this.centerObject);
                        newFoundation.transform.rotation    = centerRotation;

                    // Calculate new position
                    let positionY                           = (extraSide * sideLength / nbFoundation) + centerY - (sideLength / 2);
                        if(parseInt(this.gridOverlapping) === 1 && extraSide > 0 && extraSide < nbFoundation)
                        {
                            positionY                           = (extraSide * 800) + centerY - (nbFoundation * 800 / 2);
                        }

                    let rotation                                = BaseLayout_Math.getPointRotation([centerX - 400, positionY], [centerX, centerY], centerRotation);
                        newFoundation.transform.translation[0]  = rotation[0];
                        newFoundation.transform.translation[1]  = rotation[1];

                        if(this.centerObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true || this.centerObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true)
                        {
                            if(this.direction === 'UP')
                            {
                                newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, angle + 180);
                                newFoundation.transform.translation[2] += (minSize - (this.minSize - 1)) * this.centerObjectHeight;
                            }
                            if(this.direction === 'DOWN')
                            {
                                newFoundation.transform.translation[2] -= (minSize - (this.minSize - 1)) * this.centerObjectHeight;
                            }
                        }

                    results.push(new Promise((resolve) => {
                        this.baseLayout.saveGameParser.addObject(newFoundation);

                        this.history.push({
                            pathName: newFoundation.pathName,
                            layerId: this.layerId,
                            callback: 'deleteGenericBuilding',
                            properties: {fastDelete: true}
                        });

                        return this.baseLayout.parseObject(newFoundation, resolve);
                    }));
                }

                return Promise.all(results).then((results) => {
                    for(let i = 0; i < results.length; i++)
                    {
                        this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                    }
                }).finally(() => {
                    window.requestAnimationFrame(() => {
                        $('#liveLoader .progress-bar').css('width', Math.round((minSize * this.numberOfSides) / (this.maxSize * this.numberOfSides) * 100) + '%');
                        this.loop(minSize, (side + 1));
                    });
                });
            }

            return this.loop((minSize + 1));
        }

        return this.release();
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn around (Polygon)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount(this.layerId);

        console.timeEnd('spawnPolygon');
    }
}

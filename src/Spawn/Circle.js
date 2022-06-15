/* global gtag, Promise */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Circle
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.layerId            = 'playerFoundationsLayer';

        this.minRadius          = options.minRadius;
        this.maxRadius          = options.maxRadius;

        this.arcAngle           = options.arcAngle;
        this.direction          = options.direction;

        this.useOwnMaterials    = options.useOwnMaterials;

        this.minRadius          = Math.max(1, this.minRadius);
        this.maxRadius          = Math.min(256, Math.max(this.minRadius, this.maxRadius));

        this.arcAngle           = Math.max(0, Math.min(360, parseInt(this.arcAngle)));

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.centerObjectHeight = 400;
        this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;
        this.arcAngle          += this.centerYaw;

        this.multiplier         = 12;

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
                gtag('event', 'Circle', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        console.time('spawnCircle');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop(this.minRadius);
    }

    loop(radius)
    {
        for(radius; radius <= this.maxRadius; radius++)
        {
            let results     = [];
            let adder       = (radius >= 9) ? 1 : 0;
            let boxCount    = Math.max(24, (Math.ceil(((Math.PI * 2) * (radius + adder)) / this.multiplier) * this.multiplier));

            for(let i = 0; i < boxCount; i++)
            {
                let angle = i * (360 / boxCount) + this.centerYaw;
                    if(angle <= this.arcAngle)
                    {
                        angle -= 90;
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

                        let newFoundation                           = JSON.parse(JSON.stringify(this.centerObject));
                            newFoundation.pathName                  = this.baseLayout.generateFastPathName(this.centerObject);
                            newFoundation.transform.translation[0]  = Math.cos(angle * Math.PI / 180) * (radius * 800) + this.centerObject.transform.translation[0];
                            newFoundation.transform.translation[1]  = Math.sin(angle * Math.PI / 180) * (radius * 800) + this.centerObject.transform.translation[1];

                            if(this.centerObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true || this.centerObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true)
                            {
                                if(this.direction === 'UP')
                                {
                                    angle += 180;
                                    newFoundation.transform.translation[2] += (radius - (this.minRadius - 1)) * this.centerObjectHeight;
                                }
                                if(this.direction === 'DOWN')
                                {
                                    newFoundation.transform.translation[2] -= (radius - (this.minRadius - 1)) * this.centerObjectHeight;
                                }
                            }

                            newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, angle - this.centerYaw);

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
            }

            return Promise.all(results).then((results) => {
                for(let i = 0; i < results.length; i++)
                {
                    this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                }
            }).finally(() => {
                window.requestAnimationFrame(() => {
                    $('#liveLoader .progress-bar').css('width', Math.round(radius / this.maxRadius * 100) + '%');
                    this.loop((radius + 1));
                });
            });
        }

        return this.release();
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn around (Circle)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount(this.layerId);

        console.timeEnd('spawnCircle');
    }
}

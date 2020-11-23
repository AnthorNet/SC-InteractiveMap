/* global bootbox, gtag */
import BaseLayout_Math from '../BaseLayout/Math.js';

export default class BaseLayout_Spawn_CorkScrew
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.marker             = options.marker;
        this.layerId            = null;

        this.minRadius          = options.minRadius;
        this.maxRadius          = options.maxRadius;

        this.useOwnMaterials    = options.useOwnMaterials;

        this.minRadius          = Math.max(4, this.minRadius);
        this.maxRadius          = Math.min(256, this.maxRadius);
        this.maxRadius          = Math.max(this.minRadius + 1, this.maxRadius);

        this.height             = Math.max(parseInt(options.height), 1);
        this.direction          = options.direction;

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.centerObjectHeight = 800;
        this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;

        this.multiplier         = 12;

        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
            if(currentObjectData !== null && currentObjectData.mapLayer !== undefined)
            {
                this.layerId            = currentObjectData.mapLayer;
            }
            if(currentObjectData !== null && currentObjectData.height !== undefined)
            {
                this.centerObjectHeight = currentObjectData.height * 100;
            }

            if(typeof gtag === 'function')
            {
                gtag('event', 'CorkScrew', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop(0, this.minRadius);
    }

    loop(height, radius)
    {
        while(height <= this.height)
        {
            for(radius; radius <= this.maxRadius; radius++)
            {
                let results     = [];
                let adder       = (radius >= 9) ? 1 : 0;
                let boxCount    = ((Math.PI * 2) * (radius + adder));
                    boxCount    = Math.max(24, (Math.ceil(boxCount / this.multiplier) * this.multiplier));

                for(let i = 0; i < boxCount; i++)
                {
                    let angle = i * (360 / boxCount) + this.centerYaw;

                        angle -= 90;
                        // Check around for materials!
                        if(this.useOwnMaterials === 1)
                        {
                            let result = this.baseLayout.removeFromStorage(this.centerObject);
                                if(result === false)
                                {
                                    bootbox.alert("We could not find enough materials and stopped your construction!");
                                    return this.release(); // Don't have materials, stop it...
                                }
                        }

                        let newFoundation           = JSON.parse(JSON.stringify(this.centerObject));
                            newFoundation.pathName  = this.baseLayout.generateNewPathName(this.centerObject);
                            newFoundation.transform.translation[0]  = Math.cos(angle * Math.PI / 180) * (radius * 800) + this.centerObject.transform.translation[0];
                            newFoundation.transform.translation[1]  = Math.sin(angle * Math.PI / 180) * (radius * 800) + this.centerObject.transform.translation[1];

                            newFoundation.transform.rotation        = BaseLayout_Math.getNewQuaternionRotate(this.centerObject.transform.rotation, angle - this.centerYaw);


                        if(this.direction === 'DOWN')
                        {
                            newFoundation.transform.translation[2]      = this.centerObject.transform.translation[2] - (height * this.centerObjectHeight);
                        }
                        else
                        {
                            newFoundation.transform.translation[2]      = this.centerObject.transform.translation[2] + (height * this.centerObjectHeight);
                        }

                        height++;

                        this.baseLayout.saveGameParser.addObject(newFoundation);
                        results.push(this.baseLayout.parseObject(newFoundation));

                        this.history.push({
                            pathName: newFoundation.pathName,
                            layerId: this.layerId,
                            callback: 'deleteGenericBuilding',
                            properties: {transform: JSON.parse(JSON.stringify(newFoundation.transform))}
                        });

                        if(height > this.height)
                        {
                            return this.release();
                        }
                }

                return new Promise(function(resolve){
                    $('#liveLoader .progress-bar').css('width', Math.round(radius / this.maxRadius * 100) + '%');
                    setTimeout(resolve, 5);
                }.bind(this)).then(function(){
                    for(let i = 0; i < results.length; i++)
                    {
                        let result = results[i];
                            this.baseLayout.addElementToLayer(result.layer, result.marker);
                    }

                    this.loop(height, (radius + 1));
                }.bind(this));
            }

            this.loop(height, this.minRadius);
        }

        return this.release();
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name: 'Undo: Spawn around (Circle)',
                autoPurgeDeleteObjects: false,
                values: this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount('playerFoundationsLayer');
        this.baseLayout.unpauseMap();
    }
}

/* global gtag, Promise */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Rectangle
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.layerId            = 'playerFoundationsLayer';

        this.minWidth           = parseInt(options.minWidth);
        this.maxWidth           = parseInt(options.maxWidth);
        this.minHeight          = parseInt(options.minHeight);
        this.maxHeight          = parseInt(options.maxHeight);

        this.useOwnMaterials    = options.useOwnMaterials;

        this.minWidth           = (Math.max(1, (2* Math.floor(this.minWidth / 2) + 1)) - 1) / 2;
        this.maxWidth           = (Math.min(65, (2* Math.floor(this.maxWidth/2) + 1)) - 1) / 2;

        this.minHeight          = Math.max(1, (2* Math.floor(this.minHeight / 2) + 1));
        this.maxHeight          = Math.min(65, (2* Math.floor(this.maxHeight/2) + 1));

        this.maxWidth           = Math.max(this.minWidth + 1, this.maxWidth);
        this.maxHeight          = Math.max(this.minHeight + 1, this.maxHeight);

        this.minHeight          = (this.minHeight - 1) / 2;
        this.maxHeight          = (this.maxHeight - 1) / 2;

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
                gtag('event', 'Rectangle', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        console.time('spawnRectangle');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop(-this.maxWidth);
    }

    loop(width)
    {
        for(width; width <= this.maxWidth; width++)
        {
            let results     = [];

            for(let height = -this.maxHeight; height <= this.maxHeight; height++)
            {
                if(width === 0 && height === 0)
                {
                    continue;
                }
                if(width >= -this.minWidth && width <= this.minWidth && height >= -this.minHeight && height <= this.minHeight)
                {
                    continue;
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

                    if(this.centerObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true || this.centerObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true)
                    {
                        newFoundation.transform.translation[2] -= height * this.centerObjectHeight;
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
                    $('#liveLoader .progress-bar').css('width', Math.round((width + this.maxWidth) / (this.maxWidth * 2) * 100) + '%');
                    this.loop((width + 1));
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
                name    : 'Undo: Spawn around (Rectangle)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount(this.layerId);

        console.timeEnd('spawnRectangle');
    }
}

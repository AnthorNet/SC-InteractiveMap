/* global gtag */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import Modal                                    from '../Modal.js';

export default class Spawn_Road
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.layerId            = null;

        this.maxWidth           = parseInt(options.maxWidth);
        this.maxHeight          = parseInt(options.maxHeight);

        this.useOwnMaterials    = options.useOwnMaterials;

        this.maxWidth           = (Math.min(65, (2* Math.floor(this.maxWidth / 2) + 1)) - 1) / 2;
        this.maxHeight          = Math.min(65, this.maxHeight);

        this.direction          = options.direction;
        this.curvature          = Math.max(-360, Math.min(360, parseInt(options.curvature)));

        this.curvatureAngle     = Math.abs(this.curvature) / this.maxHeight;

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.centerObjectHeight = 400;
        this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;
        this.correctedCenterYaw = 0;

        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
            if(currentObjectData !== null)
            {
                if(currentObjectData !== null && currentObjectData.mapLayer !== undefined)
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

                this.centerObject.transform.rotation
            }

            if(typeof gtag === 'function')
            {
                gtag('event', 'Road', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history = [];

        if(this.direction === 'DOWN')
        {
            return this.loopDown(0, this.maxHeight);
        }

        return this.loopUp(0, -this.maxHeight);
    }

    loopDown(height, maxHeight)
    {
        for(height; height <= maxHeight; height++)
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

            return new Promise(function(resolve){
                $('#liveLoader .progress-bar').css('width', Math.round(Math.abs(height) / Math.abs(maxHeight) * 100) + '%');
                setTimeout(resolve, 5);
            }.bind(this)).then(function(){
                for(let i = 0; i < results.length; i++)
                {
                    let result = results[i];
                        this.baseLayout.addElementToLayer(result.layer, result.marker);
                }

                this.loopDown((height + 1), maxHeight);
            }.bind(this));
        }

        return this.release();
    }

    loopUp(height, maxHeight)
    {
        for(height; height >= maxHeight; height--)
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

            return new Promise(function(resolve){
                $('#liveLoader .progress-bar').css('width', Math.round(Math.abs(height) / Math.abs(maxHeight) * 100) + '%');
                setTimeout(resolve, 5);
            }.bind(this)).then(function(){
                for(let i = 0; i < results.length; i++)
                {
                    let result = results[i];
                        this.baseLayout.addElementToLayer(result.layer, result.marker);
                }

                this.loopUp((height - 1), maxHeight);
            }.bind(this));
        }

        return this.release();
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
                    Modal.alert("We could not find enough materials and stopped your construction!");
                    return this.release(); // Don't have materials, stop it...
                }
        }

        let newFoundation           = JSON.parse(JSON.stringify(this.centerObject));
            newFoundation.pathName  = this.baseLayout.generateNewPathName(this.centerObject);

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

        this.baseLayout.saveGameParser.addObject(newFoundation);
        this.history.push({
            pathName: newFoundation.pathName,
            layerId: this.layerId,
            callback: 'deleteGenericBuilding',
            properties: {transform: JSON.parse(JSON.stringify(newFoundation.transform))}
        });

        return this.baseLayout.parseObject(newFoundation);
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name: 'Undo: Spawn around (Road)',
                autoPurgeDeleteObjects: false,
                values: this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount('playerFoundationsLayer');
        this.baseLayout.unpauseMap();
    }
}

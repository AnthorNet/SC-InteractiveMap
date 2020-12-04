/* global bootbox, gtag */
import BaseLayout_Math from '../BaseLayout/Math.js';

export default class BaseLayout_Spawn_Rectangle
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.marker             = options.marker;
        this.layerId            = null;

        this.minWidth           = parseInt(options.minWidth);
        this.maxWidth           = parseInt(options.maxWidth);
        this.minHeight          = parseInt(options.minHeight);
        this.maxHeight          = parseInt(options.maxHeight);

        this.useDirection       = options.useDirection,

        this.useOwnMaterials    = options.useOwnMaterials;

        this.minWidth           = Math.max(1, (2* Math.floor(this.minWidth/2) + 1));
        this.maxWidth           = Math.min(65, (2* Math.floor(this.maxWidth/2) + 1));

        this.minWidth           = (this.minWidth - 1) / 2;
        this.maxWidth           = (this.maxWidth - 1) / 2;

        this.minHeight          = Math.max(1, (2* Math.floor(this.minHeight/2) + 1));

        if(this.useDirection === false)
        {
            this.maxHeight      = Math.min(65, (2* Math.floor(this.maxHeight/2) + 1));

            this.maxWidth       = Math.max(this.minWidth + 1, this.maxWidth);
            this.maxHeight      = Math.max(this.minHeight + 1, this.maxHeight);

            this.minHeight      = (this.minHeight - 1) / 2;
            this.maxHeight      = (this.maxHeight - 1) / 2;
        }
        else
        {
            this.minHeight      = (this.minHeight - 1);
            this.maxHeight      = Math.min(65, this.maxHeight);
        }

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);

        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
            if(currentObjectData !== null && currentObjectData.mapLayer !== undefined)
            {
                this.layerId = currentObjectData.mapLayer;
            }

            if(typeof gtag === 'function')
            {
                gtag('event', 'Rectangle', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
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

            for(let height = -this.maxHeight; height <= ((this.useDirection === false) ? this.maxHeight : 0); height++)
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
                            bootbox.alert("We could not find enough materials and stopped your construction!");
                            return this.release(); // Don't have materials, stop it...
                        }
                }

                let newFoundation           = JSON.parse(JSON.stringify(this.centerObject));
                    newFoundation.pathName  = this.baseLayout.generateNewPathName(this.centerObject);

                // Calculate new position
                let rotation                = BaseLayout_Math.getPointRotation(
                    [
                        (width * 800) + this.centerObject.transform.translation[0],
                        (height * 800) + this.centerObject.transform.translation[1]
                    ],
                    this.centerObject.transform.translation,
                    this.centerObject.transform.rotation
                );
                newFoundation.transform.translation[0]  = rotation[0];
                newFoundation.transform.translation[1]  = rotation[1];

                this.baseLayout.saveGameParser.addObject(newFoundation);
                results.push(this.baseLayout.parseObject(newFoundation));

                this.history.push({
                    pathName: newFoundation.pathName,
                    layerId: this.layerId,
                    callback: 'deleteGenericBuilding',
                    properties: {transform: JSON.parse(JSON.stringify(newFoundation.transform))}
                });
            }

            return new Promise(function(resolve){
                $('#liveLoader .progress-bar').css('width', Math.round((width + this.maxWidth) / (this.maxWidth * 2) * 100) + '%');
                setTimeout(resolve, 5);
            }.bind(this)).then(function(){
                for(let i = 0; i < results.length; i++)
                {
                    let result = results[i];
                        this.baseLayout.addElementToLayer(result.layer, result.marker);
                }

                this.loop((width + 1));
            }.bind(this));
        }

        return this.release();
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name: 'Undo: Spawn around (Rectangle)',
                autoPurgeDeleteObjects: false,
                values: this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount('playerFoundationsLayer');
        this.baseLayout.unpauseMap();
    }
}

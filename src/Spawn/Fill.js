/* global gtag, L */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import Modal                                    from '../Modal.js';

export default class Spawn_Fill
{
    constructor(options)
    {
        this.selection          = options.selection;
        this.useOwnMaterials    = options.useOwnMaterials;

        this.baseLayout         = options.baseLayout;
        this.layerId            = null;

        this.minWidth           = -1600;
        this.maxWidth           = 1600;
        this.minHeight          = -1600;
        this.maxHeight          = 1600;

        // Detect selection boundaries
        let bounds  = this.selection.getBounds(),
            ne      = this.baseLayout.satisfactoryMap.project([bounds._northEast.lat, bounds._northEast.lng], this.baseLayout.satisfactoryMap.zoom),
            sw      = this.baseLayout.satisfactoryMap.project([bounds._southWest.lat, bounds._southWest.lng], this.baseLayout.satisfactoryMap.zoom);

            ne      = this.baseLayout.satisfactoryMap.convertToGameCoordinates([ne.x, ne.y]);
            sw      = this.baseLayout.satisfactoryMap.convertToGameCoordinates([sw.x, sw.y]);

        this.center             = [
            ((sw[0] + ne[0]) / 2),  // X
            ((ne[1] + sw[1]) / 2),  // Y
            parseFloat(options.z)   // Z
        ];

        this.minWidth           = this.center[0] - ((Math.floor((ne[0] - sw[0]) / 800) * 800) / 2);
        this.maxWidth           = this.center[0] + ((Math.floor((ne[0] - sw[0]) / 800) * 800) / 2);
        this.minHeight          = this.center[1] - ((Math.floor((sw[1] - ne[1]) / 800) * 800) / 2);
        this.maxHeight          = this.center[1] + ((Math.floor((sw[1] - ne[1]) / 800) * 800) / 2);

        // Fake a foundation!
        let extractPathName     = options.fillWith.split('.');
            extractPathName     = extractPathName.pop();
        this.centerObject       = {
            type            : 1,
            className       : options.fillWith,
            pathName        : 'Persistent_Level:PersistentLevel.' + extractPathName + '_XXX',
            needTransform   : 1,
            transform       : {
                rotation        : this.baseLayout.saveGameParser.defaultValues.rotation,
                translation     : this.center
            },
            entityLevelName : "Persistent_Level",
            entityPathName  : "Persistent_Level:PersistentLevel.BuildableSubsystem",
            properties      : [
                {
                    name        : "mPrimaryColor",
                    type        : "StructProperty",
                    value       : {
                        type        : "LinearColor",
                        values      : {
                            r           : 0.10946200042963028,
                            g           : 0.10946200042963028,
                            b           : 0.10946200042963028,
                            a           : 1
                        }
                    }
                },
                {
                    name        : "mSecondaryColor",
                    type        : "StructProperty",
                    value       : {
                        type        : "LinearColor",
                        values      : {
                            r           : 0.10946200042963028,
                            g           : 0.10946200042963028,
                            b           : 0.10946200042963028,
                            a           : 1
                        }
                    }
                },
                {
                    name        : "mBuiltWithRecipe",
                    type        : "ObjectProperty",
                    value       : {
                        levelName   : "",
                        pathName    : "/Game/FactoryGame/Recipes/Buildings/Foundations/Recipe_Foundation_8x4_01.Recipe_Foundation_8x4_01_C"
                    }
                },
                {
                    name        : "mBuildTimeStamp",
                    type        : "FloatProperty",
                    value       : 0
                }
            ]
        };

        this.baseLayout.updateBuiltWithRecipe(this.centerObject);

        return this.spawn();
    }

    spawn()
    {
        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop(this.minHeight);
    }

    loop(height)
    {
        for(height; height <= this.maxHeight; height += 800)
        {
            let results     = [];

            for(let width = this.minWidth; width <= this.maxWidth; width += 800)
            {
                // Check if in selection?
                if(BaseLayout_Math.isPointInsideSelection(this.baseLayout, this.selection, width, height) === false)
                {
                    continue;
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
                    newFoundation.pathName  = this.baseLayout.generateFastPathName(this.centerObject);

                // Calculate new position
                newFoundation.transform.translation[0]  = width;
                newFoundation.transform.translation[1]  = height;

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
                $('#liveLoader .progress-bar').css('width', Math.round((height - this.minHeight) / (this.maxHeight - this.minHeight) * 100) + '%');
                setTimeout(resolve, 5);
            }.bind(this)).then(function(){
                for(let i = 0; i < results.length; i++)
                {
                    let result = results[i];
                        this.baseLayout.addElementToLayer(result.layer, result.marker);
                }

                this.loop((height + 800));
            }.bind(this));
        }

        return this.release();
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Fill selection',
                values  : this.history
            });
        }

        this.baseLayout.cancelSelectMultipleMarkers();
        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');
        this.baseLayout.setBadgeLayerCount('playerFoundationsLayer');
    }
}
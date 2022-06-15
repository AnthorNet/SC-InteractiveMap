/* global gtag, BaseLayout_Modal */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Spawn_Node
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;

        this.foundationType     = options.foundationType;
        this.minerType          = options.minerType;
        this.poleType           = options.poleType;

        this.rotation           = options.rotation;
        this.minerOffset        = 0;

        let foundationData      = this.baseLayout.getBuildingDataFromClassName(this.foundationType);
            if(foundationData !== null)
            {
                this.minerOffset += foundationData.height * 100 / 2;
            }

        this.useOwnMaterials    = options.useOwnMaterials;

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);

            if(typeof gtag === 'function')
            {
                gtag('event', 'Node', {event_category: 'Spawn'});
            }

        return this.spawn();
    }

    spawn()
    {
        console.time('spawnOnNode');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history        = [];
        this.startPosition  = [
                    this.centerObject.transform.translation[0],
                    this.centerObject.transform.translation[1]
        ];

        let status  = true;
        let steps   = [
            {
                className   : this.foundationType,
                x           : this.centerObject.transform.translation[0],
                y           : this.centerObject.transform.translation[1],
                z           : this.centerObject.transform.translation[2]
            },
            {
                className   : this.foundationType,
                x           : this.centerObject.transform.translation[0],
                y           : this.centerObject.transform.translation[1] + 800,
                z           : this.centerObject.transform.translation[2]
            },
            {
                className   : this.minerType,
                x           : this.centerObject.transform.translation[0],
                y           : this.centerObject.transform.translation[1],
                z           : this.centerObject.transform.translation[2] + this.minerOffset
            }
        ];

        for(let i = 0; i < steps.length; i++)
        {
            $('#liveLoader').find('.progress-bar').css('width', ((i + 1) / steps.length * 100) + '%');

            status = this.spawnBuilding.call(this, steps[i]);

            if(status === false)
            {
                break;
            }
        }


        return this.release();
    }

    spawnBuilding(options)
    {
        let pathName        = options.className.split('.');
            pathName        = 'Persistent_Level:PersistentLevel.' + pathName.pop() + '_XXX';
        let fakeBuilding  = {
                            type            : 1,
                            className       : options.className,
                            pathName        : pathName,
                            transform       : {
                                rotation        : BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.rotation),
                                translation     : [options.x, options.y, options.z]
                            },
                            properties      : [
                                { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "" } },
                                { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                            ],
                            entity: {pathName: "Persistent_Level:PersistentLevel.BuildableSubsystem"}
                        };

                        this.baseLayout.buildableSubSystem.setObjectDefaultColorSlot(fakeBuilding);
                        fakeBuilding.pathName = this.baseLayout.generateFastPathName(fakeBuilding);
                        this.baseLayout.updateBuiltWithRecipe(fakeBuilding);

        if(options.className.includes('Miner'))
        {
            fakeBuilding.properties.push({
                name    : 'mExtractableResource',
                type    : 'ObjectProperty',
                value   : {pathName: this.centerObject.pathName}
            });
        }

        // Check around for materials!
        if(this.useOwnMaterials === 1)
        {
            let result = this.baseLayout.removeFromStorage(fakeBuilding);
                if(result === false)
                {
                    BaseLayout_Modal.alert("We could not find enough materials and stopped your construction!");
                    return false; // Don't have materials, stop it...
                }
        }

        // Calculate new position
        let rotation                                = BaseLayout_Math.getPointRotation(fakeBuilding.transform.translation, this.centerObject.transform.translation, fakeBuilding.transform.rotation);
            fakeBuilding.transform.translation[0]   = rotation[0];
            fakeBuilding.transform.translation[1]   = rotation[1];

        // Insert building
        new Promise((resolve) => {
            this.baseLayout.saveGameParser.addObject(fakeBuilding);

            return this.baseLayout.parseObject(fakeBuilding, resolve);
        }).then((result) => {
            this.history.push({
                pathName: fakeBuilding.pathName,
                layerId: result.layer,
                callback: 'deleteGenericBuilding',
                properties: {fastDelete: true}
            });

            this.baseLayout.addElementToLayer(result.layer, result.marker);
            this.baseLayout.setBadgeLayerCount(result.layer);
        });

        return true;
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn a miner',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');

        console.timeEnd('spawnOnNode');
    }
}

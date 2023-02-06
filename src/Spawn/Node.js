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

        this.rotation           = options.rotation;
        this.minerCount         = Math.max(1, Math.min(options.minerCount, 12));
        this.minerOffsetY       = 0;
        this.minerOffsetZ       = 0;

        let foundationData      = this.baseLayout.getBuildingDataFromClassName(this.foundationType);
            if(foundationData !== null)
            {
                this.minerOffsetZ += foundationData.height * 100 / 2;
            }

        if(this.minerType.startsWith('/Game/FactoryGame/Buildable/Factory/OilPump'))
        {
            this.minerOffsetY -= 200;
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
        let steps   = [];
            for(let i = 1; i <= this.minerCount; i++)
            {
                let rotation = BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.rotation + (360 / this.minerCount * (i - 1)));
                    steps.push({
                        className   : this.foundationType,
                        x           : this.centerObject.transform.translation[0],
                        y           : this.centerObject.transform.translation[1] + this.minerOffsetY,
                        z           : this.centerObject.transform.translation[2],
                        rotation    : rotation
                    });
                    steps.push({
                        className   : this.foundationType,
                        x           : this.centerObject.transform.translation[0],
                        y           : this.centerObject.transform.translation[1] + 800 + this.minerOffsetY,
                        z           : this.centerObject.transform.translation[2],
                        rotation    : rotation
                    });
                    steps.push({
                        className   : this.minerType,
                        x           : this.centerObject.transform.translation[0],
                        y           : this.centerObject.transform.translation[1],
                        z           : this.centerObject.transform.translation[2] + this.minerOffsetZ,
                        rotation    : rotation
                    });
            }

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
                                rotation        : options.rotation,
                                translation     : [options.x, options.y, options.z]
                            },
                            properties      : [
                                { name: 'mBuiltWithRecipe', type: 'Object', value: { levelName: '', pathName: '' } },
                                { name: 'mBuildTimeStamp', type: 'Float', value: 0 }
                            ],
                            entity: {pathName: 'Persistent_Level:PersistentLevel.BuildableSubsystem'}
                        };

                        this.baseLayout.buildableSubSystem.setObjectDefaultColorSlot(fakeBuilding);
                        fakeBuilding.pathName = this.baseLayout.generateFastPathName(fakeBuilding);
                        this.baseLayout.updateBuiltWithRecipe(fakeBuilding);

        if(options.className.startsWith('/Game/FactoryGame/Buildable/Factory/Miner') || options.className.startsWith('/Game/FactoryGame/Buildable/Factory/OilPump') || options.className.startsWith('/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal'))
        {
            fakeBuilding.properties.push({
                name    : 'mExtractableResource',
                type    : 'Object',
                value   : {pathName: this.centerObject.pathName}
            });
        }
        if(options.className.startsWith('/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal'))
        {
            
        }

        // Check around for materials!
        if(this.useOwnMaterials === 1)
        {
            let result = this.baseLayout.removeFromStorage(fakeBuilding);
                if(result === false)
                {
                    BaseLayout_Modal.alert('We could not find enough materials and stopped your construction!');
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
                name    : ((this.minerType.startsWith('/Game/FactoryGame/Buildable/Factory/OilPump')) ? 'Undo: Spawn an Oil Extractor' : 'Undo: Spawn a Miner'),
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');

        console.timeEnd('spawnOnNode');
    }
}

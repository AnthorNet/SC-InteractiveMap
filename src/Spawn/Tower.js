/* global gtag, Promise */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Spawn_Tower
{
    constructor(options)
    {
        this.marker             = options.marker;
        this.baseLayout         = options.marker.baseLayout;
        this.delayedLayerId     = [];

        this.useOwnMaterials    = options.useOwnMaterials;

        this.minWidth           = 1;
        this.maxWidth           = (Math.min(65, (2* Math.floor(parseInt(options.maxWidth) / 2) + 1)) - 1) / 2;

        this.minHeight          = 1;
        this.maxHeight          = Math.min(65, (2* Math.floor(parseInt(options.maxHeight) / 2) + 1));

        this.maxWidth           = Math.max(this.minWidth + 1, this.maxWidth);
        this.maxHeight          = Math.max(this.minHeight + 1, this.maxHeight);

        this.minHeight          = (this.minHeight - 1) / 2;
        this.maxHeight          = (this.maxHeight - 1) / 2;

        this.maxFloor           = parseInt(options.maxFloor);
        this.floorHeight        = parseInt(options.floorHeight);
        this.foundationRotation = parseFloat(options.foundationRotation);
        this.wallRotation       = parseFloat(options.wallRotation);

        this.centerObject       = this.baseLayout.saveGameParser.getTargetObject(this.marker.relatedTarget.options.pathName);
        this.centerObjectHeight = 400;
        this.centerYaw          = BaseLayout_Math.getQuaternionToEuler(this.centerObject.transform.rotation).yaw;
        this.correctedCenterYaw = 0;

        let currentObjectData   = this.baseLayout.getBuildingDataFromClassName(this.centerObject.className);
            if(currentObjectData !== null)
            {
                if(currentObjectData.mapLayer !== undefined)
                {
                    this.delayedLayerId.push(currentObjectData.mapLayer);
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

            this.wallType   = options.wallType;
            this.wallHeight = 400;
        let wallData        = this.baseLayout.getBuildingDataFromClassName(this.wallType);
            if(wallData !== null)
            {
                if(wallData.mapLayer !== undefined)
                {
                    this.delayedLayerId.push(wallData.mapLayer);
                }
                if(wallData.height !== undefined)
                {
                    this.wallHeight = wallData.height * 100;
                }
            }

            this.wallCornerType     = options.wallCornerType;
            this.wallCornerHeight   = 400;
        let wallCornerData          = this.baseLayout.getBuildingDataFromClassName(this.wallCornerType);
            if(wallCornerData !== null)
            {
                if(wallCornerData.mapLayer !== undefined)
                {
                    this.delayedLayerId.push(wallCornerData.mapLayer);
                }
                if(wallCornerData.height !== undefined)
                {
                    this.wallCornerHeight = wallCornerData.height * 100;
                }
            }

        // Floor is going on top of the spawning foundation
        this.currentFloor       = 1;
        this.currentAltitude    = this.centerObject.transform.translation[2];
        this.currentRotation    = this.centerYaw + this.correctedCenterYaw;

        if(typeof gtag === 'function')
        {
            gtag('event', 'Tower', {event_category: 'Spawn'});
        }

        return this.spawn();
    }

    spawn()
    {
        console.time('spawnTower');

        $('#liveLoader').show()
                        .find('.progress-bar').css('width', '0%');

        this.history            = [];

        return this.loop();
    }

    loop()
    {
        if(this.currentFloor <= this.maxFloor)
        {
            return this.loopFloor(-this.maxWidth);
        }

        //TODO: Real Roof
        return this.loopFloor(-this.maxWidth);
    }

    loopFloor(width)
    {
        for(width; width <= this.maxWidth; width++)
        {
            let results     = [];

            for(let height = -this.maxHeight; height <= this.maxHeight; height++)
            {
                // Don't overwrite the center
                if(this.currentAltitude === this.centerObject.transform.translation[2] && width === 0 && height === 0)
                {
                    continue;
                }

                let pathName        = this.centerObject.className.split('.');
                    pathName        = 'Persistent_Level:PersistentLevel.' + pathName.pop() + '_XXX';
                let newFoundation   = {
                        type            : 1,
                        className       : this.centerObject.className,
                        pathName        : pathName,
                        transform       : {
                            rotation        : BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.currentRotation),
                            translation     : JSON.parse(JSON.stringify(this.centerObject.transform.translation))
                        },
                        properties      : [
                            { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "" } },
                            { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                        ],
                        entity: {pathName: "Persistent_Level:PersistentLevel.BuildableSubsystem"}
                    };

                this.baseLayout.buildableSubSystem.setObjectDefaultColorSlot(newFoundation);
                newFoundation.pathName = this.baseLayout.generateFastPathName(newFoundation);
                this.baseLayout.updateBuiltWithRecipe(newFoundation);

                // Check around for materials!
                if(this.useOwnMaterials === 1)
                {
                    let result = this.baseLayout.removeFromStorage(newFoundation);
                        if(result === false)
                        {
                            BaseLayout_Modal.alert("We could not find enough materials and stopped your construction!");
                            return this.release(); // Don't have materials, stop it...
                        }
                }

                // Calculate new position
                let rotation                = BaseLayout_Math.getPointRotation(
                        [
                            (width * 800) + newFoundation.transform.translation[0],
                            (height * 800) + newFoundation.transform.translation[1]
                        ],
                        newFoundation.transform.translation,
                        newFoundation.transform.rotation
                    );
                    newFoundation.transform.translation[0]  = rotation[0];
                    newFoundation.transform.translation[1]  = rotation[1];
                    newFoundation.transform.translation[2]  = JSON.parse(JSON.stringify(this.currentAltitude));

                results.push(new Promise((resolve) => {
                    this.baseLayout.saveGameParser.addObject(newFoundation);

                    return this.baseLayout.parseObject(newFoundation, resolve);
                }));
            }

            return Promise.all(results).then((results) => {
                for(let i = 0; i < results.length; i++)
                {
                    this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                    this.history.push({
                        pathName: results[i].marker.options.pathName,
                        layerId: results[i].layer,
                        callback: 'deleteGenericBuilding',
                        properties: {fastDelete: true}
                    });
                }
            }).finally(() => {
                window.requestAnimationFrame(() => {
                    $('#liveLoader .progress-bar').css('width', Math.round(((width + this.maxWidth) * this.currentFloor) / (this.maxWidth * 2 * this.maxFloor) * 100) + '%');
                    this.loopFloor((width + 1));
                });
            });
        }

        // Raise wall!
        this.currentAltitude    += (this.centerObjectHeight / 2);

        if(this.currentFloor <= this.maxFloor)
        {
            return this.loopWall(1);
        }

        return this.release();
    }

    loopWall(floorHeight)
    {
        for(floorHeight; floorHeight <= this.floorHeight; floorHeight++)
        {
            let results     = [];
                for(let width = -this.maxWidth; width <= this.maxWidth; width++)
                {
                    for(let height = -this.maxHeight; height <= this.maxHeight; height++)
                    {
                        if(width === -this.maxWidth || width === this.maxWidth || height === -this.maxHeight || height === this.maxHeight)
                        {
                            let currentWallType = this.wallType;
                            let xOffset         = (width * 800) + ((width === -this.maxWidth) ? -400 : ((width === this.maxWidth) ? 400 : 0));
                            let yOffset         = (height * 800) + ((height === -this.maxHeight) ? -400 : ((height === this.maxHeight) ? 400 : 0));
                            let rotation        = this.currentRotation + ((height === -this.maxHeight || height === this.maxHeight) ? 90 : 0);

                                if((width === -this.maxWidth && height === -this.maxHeight) || (width === -this.maxWidth && height === this.maxHeight))
                                {
                                        currentWallType = this.wallCornerType;
                                    let newWallCorner   = this.spawnWall(currentWallType, (xOffset + 400), yOffset, rotation);
                                        if(newWallCorner === false)
                                        {
                                            return this.release(); // Don't have materials, stop it...
                                        }

                                        results.push(newWallCorner);

                                    xOffset     = (width * 800) - 400;
                                    yOffset     = (height * 800);
                                    rotation   -=90;
                                }

                                if((width === this.maxWidth && height === -this.maxHeight) || (width === this.maxWidth && height === this.maxHeight))
                                {
                                        currentWallType = this.wallCornerType;
                                    let newWallCorner   = this.spawnWall(currentWallType, (xOffset - 400), yOffset, rotation);
                                        if(newWallCorner === false)
                                        {
                                            return this.release(); // Don't have materials, stop it...
                                        }

                                        results.push(newWallCorner);

                                    xOffset     = (width * 800) + 400;
                                    yOffset     = (height * 800);
                                    rotation   -=90;
                                }

                            let newWall     = this.spawnWall(currentWallType, xOffset, yOffset, rotation);
                                if(newWall === false)
                                {
                                    return this.release(); // Don't have materials, stop it...
                                }

                                results.push(newWall);
                        }
                    }
                }

            return Promise.all(results).then((results) => {
                for(let i = 0; i < results.length; i++)
                {
                    this.baseLayout.addElementToLayer(results[i].layer, results[i].marker);
                    this.history.push({
                        pathName: results[i].marker.options.pathName,
                        layerId: results[i].layer,
                        callback: 'deleteGenericBuilding',
                        properties: {fastDelete: true}
                    });
                }
            }).finally(() => {
                window.requestAnimationFrame(() => {
                    //$('#liveLoader .progress-bar').css('width', Math.round((width + this.maxWidth) / (this.maxWidth * 2) * 100) + '%');
                    this.currentAltitude    += this.wallHeight;
                    this.currentRotation    += this.wallRotation;
                    this.loopWall((floorHeight + 1));
                });
            });
        }

        // Raise floor!
        this.currentFloor++;
        this.currentAltitude    += (this.centerObjectHeight / 2);
        this.currentRotation    -= this.wallRotation; // Reset extra rotation
        this.currentRotation    += this.foundationRotation;

        return this.loop();
    }

    spawnWall(currentWallType, xOffset, yOffset, rotation)
    {
        let pathName        = currentWallType.split('.');
            pathName        = 'Persistent_Level:PersistentLevel.' + pathName.pop() + '_XXX';
        let newWall         = {
                type            : 1,
                className       : currentWallType,
                pathName        : pathName,
                transform       : {
                    rotation        : BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], rotation),
                    translation     : JSON.parse(JSON.stringify(this.centerObject.transform.translation))
                },
                properties      : [
                    { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "" } },
                    { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                ],
                entity: {pathName: "Persistent_Level:PersistentLevel.BuildableSubsystem"}
            };

            this.baseLayout.buildableSubSystem.setObjectDefaultColorSlot(newWall);
            newWall.pathName = this.baseLayout.generateFastPathName(newWall);
            this.baseLayout.updateBuiltWithRecipe(newWall);

        // Check around for materials!
        if(this.useOwnMaterials === 1)
        {
            let result = this.baseLayout.removeFromStorage(newWall);
                if(result === false)
                {
                    BaseLayout_Modal.alert("We could not find enough materials and stopped your construction!");
                    return false; // Don't have materials, stop it...
                }
        }

        // Calculate new position
        let pointRotation = BaseLayout_Math.getPointRotation(
                [
                    newWall.transform.translation[0] + xOffset,
                    newWall.transform.translation[1] + yOffset
                ],
                newWall.transform.translation,
                BaseLayout_Math.getNewQuaternionRotate([0, 0, 0, 1], this.currentRotation)
            );
            newWall.transform.translation[0]  = pointRotation[0];
            newWall.transform.translation[1]  = pointRotation[1];
            newWall.transform.translation[2]  = JSON.parse(JSON.stringify(this.currentAltitude));

        return new Promise((resolve) => {
            this.baseLayout.saveGameParser.addObject(newWall);

            return this.baseLayout.parseObject(newWall, resolve);
        });
    }

    release()
    {
        if(this.baseLayout.history !== null)
        {
            this.baseLayout.history.add({
                name    : 'Undo: Spawn around (Tower)',
                values  : this.history
            });
        }

        $('#liveLoader').hide().find('.progress-bar').css('width', '0%');

        for(let i = 0; i < this.delayedLayerId.length; i++)
        {
            this.baseLayout.setBadgeLayerCount(this.delayedLayerId[i]);
        }

        console.timeEnd('spawnTower');
    }
}

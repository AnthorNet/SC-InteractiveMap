export default class BaseLayout_ContextMenu
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;
        this.marker     = options.marker;
    }

    getContextMenu(currentObject)
    {
        let contextMenu = [];

        if(currentObject !== null)
        {
            let faunaData   = this.baseLayout.getFaunaDataFromClassName(currentObject.className);

            if(faunaData !== null)
            {
                contextMenu.push({
                    text: 'Update "' + faunaData.name + '" position',
                    callback: this.baseLayout.updateObjectPosition.bind(this.baseLayout)
                });
                contextMenu.push({
                    text: 'Delete "' + faunaData.name + '"',
                    callback: this.baseLayout.deleteFauna.bind(this.baseLayout)
                });
            }

            let buildingData = this.baseLayout.getBuildingDataFromClassName(currentObject.className);

            switch(currentObject.className)
            {
                case '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C':
                    let mDecorationDescriptor   = this.baseLayout.getObjectProperty(currentObject, 'mDecorationDescriptor');
                        buildingData            = this.baseLayout.getItemDataFromClassName(mDecorationDescriptor.pathName);
                    break;
                case '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C':
                    buildingData                = this.baseLayout.toolsData.BP_ItemDescriptorPortableMiner_C;
                    break;
                case '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C':
                case '/Game/FactoryGame/Events/Art/Buildables/PowerLineLights/Build_xmassLightsLine.Build_XmassLightsLine_C':
                    return false;
                case '/Game/FactoryGame/Buildable/Factory/GeneratorBiomass/Build_GeneratorIntegratedBiomass.Build_GeneratorIntegratedBiomass_C':
                case '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C':
                    return [{
                        text: 'Advanced Debug',
                        callback: this.baseLayout.advancedDebugObject.bind(this.baseLayout)
                    }];
                case '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C':
                    contextMenu.push({
                        text: 'Update "Loot Crate" position',
                        callback: this.baseLayout.updateObjectPosition.bind(this.baseLayout)
                    });
                    contextMenu.push({
                        text: 'Delete "Loot Crate"',
                        callback: this.baseLayout.deletePlayerLootCrate.bind(this.baseLayout)
                    });
                    break;
                case '/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C':
                    contextMenu.push({
                        text: 'Delete "Beacon"',
                        callback: this.baseLayout.deletePlayerBeacon.bind(this.baseLayout)
                    });
                    break;
                case '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C':
                    contextMenu.push({
                        text: 'Delete "Resource Deposit"',
                        callback: this.baseLayout.deleteResourceDeposit.bind(this.baseLayout)
                    });
                    break;
                case '/Script/FactoryGame.FGItemPickup_Spawnable':
                case '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C':
                    contextMenu.push({
                        text: 'Delete "Dropped Items"',
                        callback: this.baseLayout.deleteItemPickUp.bind(this.baseLayout)
                    });
                    break;
            }

            if(buildingData !== null && buildingData.className !== '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C')
            {
                    if(
                            currentObject.className.search('Building/Foundation/Build_Foundation') !== -1
                         || currentObject.className.search('Building/Ramp/Build_Ramp_') !== -1
                    )
                    {
                        contextMenu.push({
                            text: 'Rotate "' + buildingData.name + '" by 90°',
                            callback: this.baseLayout.rotationPlayerFoundation.bind(this.baseLayout)
                        });

                        contextMenu.push({
                            text: 'Pivot "' + buildingData.name + '" from the top-left corner',
                            callback: this.baseLayout.pivotPlayerFoundation.bind(this.baseLayout)
                        });

                        //if(currentObject.className.search('Building/Ramp/Build_Ramp_') === -1)
                        {
                            contextMenu.push({
                                text: 'Spawn around "' + buildingData.name + '"',
                                callback: this.baseLayout.spawnAroundFoundation.bind(this.baseLayout)
                            });
                        }

                        contextMenu.push({
                            text: 'Teleport player on "' + buildingData.name + '"',
                            callback: this.baseLayout.teleportPlayer.bind(this.baseLayout)
                        });
                    }

                    if(
                           (buildingData.category === 'generator' || (buildingData.powerUsed !== undefined && buildingData.powerUsed > 0))
                        && buildingData.category !== 'pad' && buildingData.category !== 'tower' && buildingData.category !== 'logistic' && buildingData.category !== 'dockstation' && buildingData.category !== 'vehicle'
                        && buildingData.category !== 'pipe'
                        && buildingData.category !== 'hyperTube'
                    )
                    {
                        if(this.baseLayout.getBuildingIsOn(currentObject) === false)
                        {
                            contextMenu.push({
                                text: 'Turn "' + buildingData.name + '" <strong class="text-success">On</strong>',
                                callback: this.baseLayout.updateObjectProductionPausedStatus.bind(this.baseLayout)
                            });
                        }
                        else
                        {
                            contextMenu.push({
                                text: 'Turn "' + buildingData.name + '" <strong class="text-danger">Off</strong>',
                                callback: this.baseLayout.updateObjectProductionPausedStatus.bind(this.baseLayout)
                            });
                        }

                        contextMenu.push({
                            text: 'Update "' + buildingData.name + '" clock speed',
                            callback: this.baseLayout.updateObjectClockSpeed.bind(this.baseLayout)
                        });

                        contextMenu.push({separator: true});
                    }

                    if(currentObject.className === '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_8x4_01.Build_Wall_8x4_01_C')
                    {
                        contextMenu.push({
                            text: 'Rotate "' + buildingData.name + '" by 180°',
                            callback: this.baseLayout.rotationPlayerWall180.bind(this.baseLayout)
                        });
                    }

                    if(currentObject.className !== '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C')
                    {
                        contextMenu.push({
                            text: 'Update "' + buildingData.name + '" position',
                            callback: this.baseLayout.updateObjectPosition.bind(this.baseLayout)
                        });
                    }

                    if(
                            currentObject.className !== '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_8x4_02.Build_Wall_8x4_02_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/ConveyorPole/Build_ConveyorPole.Build_ConveyorPole_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StoragePlayer.Build_StoragePlayer_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrack.Build_RailroadTrack_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C'
                         && currentObject.className !== '/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C'
                         && currentObject.className !== '/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C'
                         && buildingData.category !== 'vehicle'
                         && currentObject.className.search('_Steel') === -1
                    )
                    {
                        contextMenu.push({
                            text: 'Update "' + buildingData.name + '" color slot',
                            callback: this.baseLayout.updateObjectColorSlot.bind(this.baseLayout)
                        });
                    }

                    if(buildingData.category === 'production')
                    {
                        contextMenu.push({separator: true});
                        contextMenu.push({
                            text: 'Update "' + buildingData.name + '" recipe',
                            callback: this.baseLayout.editPlayerProductionBuildingRecipe.bind(this.baseLayout)
                        });
                    }

                    if((buildingData.category === 'storage' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C' || currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C') && buildingData.maxFluid === undefined) //TODO: Handle fluid storage...
                    {
                        contextMenu.push({separator: true});
                        contextMenu.push({
                            text: 'Edit "' + buildingData.name + '" inventory',
                            callback: this.baseLayout.editPlayerStorageBuildingInventory.bind(this.baseLayout)
                        });
                        contextMenu.push({
                            text: 'Fill "' + buildingData.name + '" inventory',
                            callback: this.baseLayout.fillPlayerStorageBuildingInventory.bind(this.baseLayout)
                        });
                    }

                    if(
                            currentObject.className.search('/Game/FactoryGame/Buildable/Factory/ConveyorBelt') !== -1
                         || currentObject.className.search('/Game/FactoryGame/Buildable/Factory/ConveyorLift') !== -1
                    )
                    {
                        let usePool = this.baseLayout.availableBelts;
                            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/ConveyorLift') !== -1)
                            {
                                usePool = this.baseLayout.availableLifts;
                            }
                        let poolIndex   = usePool.indexOf(currentObject.className);

                        if(poolIndex > 0 || poolIndex < (usePool.length - 1))
                        {
                            contextMenu.push({separator: true});

                            if(poolIndex > 0)
                            {
                                let downgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                                    if(downgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Downgrade to "' + downgradeData.name + '"',
                                            callback: this.baseLayout.downgradeBelt.bind(this.baseLayout)
                                        });
                                    }
                            }
                            if(poolIndex < (usePool.length - 1))
                            {
                                let upgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex + 1]);
                                    if(upgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Upgrade to "' + upgradeData.name + '"',
                                            callback: this.baseLayout.upgradeBelt.bind(this.baseLayout)
                                        });
                                    }
                            }
                        }
                    }

                    if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPole') !== -1)
                    {
                        let usePool         = this.baseLayout.availablePowerPoles;
                            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') !== -1)
                            {
                                usePool = this.baseLayout.availablePowerPolesWall;
                            }
                            if(currentObject.className.search('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') !== -1)
                            {
                                usePool = this.baseLayout.availablePowerPolesWallDouble;
                            }
                        let poolIndex   = usePool.indexOf(currentObject.className);

                        if(poolIndex > 0 || poolIndex < (usePool.length - 1))
                        {
                            contextMenu.push({separator: true});

                            if(poolIndex > 0)
                            {
                                let downgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                                    if(downgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Downgrade to "' + downgradeData.name + '"',
                                            callback: this.baseLayout.downgradePowerPole.bind(this.baseLayout)
                                        });
                                    }
                            }
                            if(poolIndex < (usePool.length - 1))
                            {
                                let upgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex + 1]);
                                    if(upgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Upgrade to "' + upgradeData.name + '"',
                                            callback: this.baseLayout.upgradePowerPole.bind(this.baseLayout)
                                        });
                                    }
                            }
                        }
                    }

                    if(
                            (this.marker.options.haveWaste === undefined || this.baseLayout.useDebug === true)
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/StoragePlayer/Build_StorageIntegrated.Build_StorageIntegrated_C'
                         && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C'
                         && buildingData.className !== '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C'
                    )
                    {
                        contextMenu.push({separator: true});
                        contextMenu.push({
                            text: 'Delete "' + buildingData.name + '"',
                            callback: this.baseLayout.deleteGenericBuilding.bind(this.baseLayout)
                        });
                    }
            }
        }

        contextMenu.push({separator: true});
        contextMenu.push({
            text: 'Advanced Debug',
            callback: this.baseLayout.advancedDebugObject.bind(this.baseLayout)
        });

        return contextMenu;
    }
}
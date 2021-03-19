import Building_SpaceElevator                   from '../Building/SpaceElevator.js';
import Building_Conveyor                        from '../Building/Conveyor.js';
import Building_Light                           from '../Building/Light.js';
import Building_Pipeline                        from '../Building/Pipeline.js';
import Building_PowerPole                       from '../Building/PowerPole.js';
import Building_PowerStorage                    from '../Building/PowerStorage.js';
import Building_PowerSwitch                     from '../Building/PowerSwitch.js';

import Modal_SpawnAround                        from '../Modal/SpawnAround.js';

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
                case '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C':
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
                case '/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C':
                    contextMenu.push({
                        text        : 'Update "' + buildingData.name + '" phase',
                        callback    : Building_SpaceElevator.updatePhase
                    });
                    break;
                case '/Game/FactoryGame/Resource/BP_ResourceNode.BP_ResourceNode_C':
                case '/Game/FactoryGame/Resource/BP_FrackingCore.BP_FrackingCore_C':
                case '/Game/FactoryGame/Resource/BP_FrackingSatellite.BP_FrackingSatellite_C':
                case '/Game/FactoryGame/Resource/BP_ResourceNodeGeyser.BP_ResourceNodeGeyser_C':
                    contextMenu.push({
                        text: 'Teleport player',
                        callback: this.baseLayout.teleportPlayer.bind(this.baseLayout)
                    });
                    break;
            }

            if(buildingData !== null && buildingData.className !== '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C')
            {
                    if(
                            currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation') === true
                         || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_') === true
                         || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_RampDouble') === true
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

                        if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal') === false && currentObject.className.search('_Corner_') === -1)
                        {
                            contextMenu.push({
                                text: 'Spawn around "' + buildingData.name + '"',
                                callback: Modal_SpawnAround.getHTML
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
                        && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/CeilingLight/Build_CeilingLight.Build_CeilingLight_C'
                        && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/Floodlight/Build_FloodlightWall.Build_FloodlightWall_C'
                        && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C'
                    )
                    {
                        contextMenu.push({
                            text: 'Turn "' + buildingData.name + '" ' + ((this.baseLayout.getBuildingIsOn(currentObject) === false) ? '<strong class="text-success">On' : '<strong class="text-danger">Off</strong>'),
                            callback: this.baseLayout.updateObjectProductionPausedStatus.bind(this.baseLayout)
                        });

                        if(buildingData.category !== 'light'&& currentObject.className !== '/Game/FactoryGame/Buildable/Factory/GeneratorGeoThermal/Build_GeneratorGeoThermal.Build_GeneratorGeoThermal_C')
                        {
                            contextMenu.push({
                                text: 'Update "' + buildingData.name + '" clock speed',
                                callback: this.baseLayout.updateObjectClockSpeed.bind(this.baseLayout)
                            });
                        }

                        contextMenu.push({separator: true});
                    }

                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerStorage/Build_PowerStorageMk1.Build_PowerStorageMk1_C')
                    {
                        contextMenu = Building_PowerStorage.addContextMenu(this.baseLayout, currentObject, contextMenu);
                    }
                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerSwitch/Build_PowerSwitch.Build_PowerSwitch_C')
                    {
                        contextMenu = Building_PowerSwitch.addContextMenu(this.baseLayout, currentObject, contextMenu);
                    }
                    if(buildingData.category === 'light')
                    {
                        contextMenu = Building_Light.addContextMenu(this.baseLayout, currentObject, contextMenu);
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
                         && (buildingData.mapUseSlotColor === undefined || buildingData.mapUseSlotColor !== false)
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

                    if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                    {
                        contextMenu.push({
                            text: 'Fill "' + buildingData.name + '" inventory',
                            callback: this.baseLayout.fillPlayerStorageBuildingInventoryModal.bind(this.baseLayout)
                        });
                    }

                    if((buildingData.category === 'storage' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C' || currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')) //TODO: Handle fluid storage...
                    {
                        let inventoryType = 'solid';
                            if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                let storage           = this.baseLayout.getObjectProperty(currentObject, 'mStorageInventory');
                                    if(storage !== null)
                                    {
                                        let storageObject = this.baseLayout.saveGameParser.getTargetObject(storage.pathName);
                                            if(storageObject !== null)
                                            {
                                                let mAdjustedSizeDiff = this.baseLayout.getObjectProperty(storageObject, 'mAdjustedSizeDiff');
                                                    if(mAdjustedSizeDiff !== null && mAdjustedSizeDiff === -31)
                                                    {
                                                        inventoryType = 'liquid';
                                                    }
                                            }

                                    }
                            }

                            if(inventoryType === 'solid')
                            {
                                contextMenu.push({separator: true});
                                contextMenu.push({
                                    text: 'Edit "' + buildingData.name + '" inventory',
                                    callback: this.baseLayout.editPlayerStorageBuildingInventory.bind(this.baseLayout)
                                });
                                contextMenu.push({
                                    text: 'Fill "' + buildingData.name + '" inventory',
                                    callback: this.baseLayout.fillPlayerStorageBuildingInventoryModal.bind(this.baseLayout)
                                });
                                contextMenu.push({
                                    text: 'Clear "' + buildingData.name + '" inventory',
                                    callback: this.baseLayout.clearPlayerStorageBuildingInventory.bind(this.baseLayout)
                                });
                            }
                    }

                    if(
                            currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorBelt') === true
                         || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true
                    )
                    {
                        let usePool = Building_Conveyor.availableConveyorBelts;
                            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
                            {
                                usePool = Building_Conveyor.availableConveyorLifts;
                            }
                        let poolIndex   = usePool.indexOf(currentObject.className);

                        if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
                        {
                            contextMenu.push({separator: true});

                            if(poolIndex > 0)
                            {
                                let downgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                                    if(downgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Downgrade to "' + downgradeData.name + '"',
                                            callback: Building_Conveyor.downgradeConveyor
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
                                            callback: Building_Conveyor.upgradeConveyor
                                        });
                                    }
                            }
                        }
                    }

                    if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPole') === true)
                    {
                        let usePool         = Building_PowerPole.availablePowerPoles;
                            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') === true)
                            {
                                usePool = Building_PowerPole.availablePowerPolesWall;
                            }
                            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') === true)
                            {
                                usePool = Building_PowerPole.availablePowerPolesWallDouble;
                            }
                        let poolIndex   = usePool.indexOf(currentObject.className);

                        if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
                        {
                            contextMenu.push({separator: true});

                            if(poolIndex > 0)
                            {
                                let downgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                                    if(downgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Downgrade to "' + downgradeData.name + '"',
                                            callback: Building_PowerPole.downgradePowerPole
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
                                            callback: Building_PowerPole.upgradePowerPole
                                        });
                                    }
                            }
                        }
                    }

                    if(
                            currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/Pipeline') === true
                         || currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipePump') === true
                    )
                    {
                        let usePool     = Building_Pipeline.availablePipelines;
                            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipePump') === true)
                            {
                                usePool = Building_Pipeline.availablePipePumps;
                            }
                        let poolIndex   = usePool.indexOf(currentObject.className);

                        if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
                        {
                            contextMenu.push({separator: true});

                            if(poolIndex > 0)
                            {
                                let downgradeData = this.baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                                    if(downgradeData !== null)
                                    {
                                        contextMenu.push({
                                            text: 'Downgrade to "' + downgradeData.name + '"',
                                            callback: Building_Pipeline.downgradePipeline
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
                                            callback: Building_Pipeline.upgradePipeline
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
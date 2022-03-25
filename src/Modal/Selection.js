/* global Infinity */
import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Modal_Statistics_Production              from '../Modal/Statistics/Production.js';
import Modal_Statistics_Storage                 from '../Modal/Statistics/Storage.js';

import Modal_PowerCircuits                      from '../Modal/PowerCircuits.js';

import Selection_Offset                         from '../Selection/Offset.js';
import Selection_Rotate                         from '../Selection/Rotate.js';
import Selection_Delete                         from '../Selection/Delete.js';
import Selection_Copy                           from '../Selection/Copy.js';

import Spawn_Fill                               from '../Spawn/Fill.js';

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';
import SubSystem_Foliage                        from '../SubSystem/Foliage.js';

import { translate }                            from '../Translate.js';

export default class Modal_Selection
{
    static cancel(baseLayout)
    {
        baseLayout.satisfactoryMap.leafletMap.selection.removeSelectedArea();
        baseLayout.satisfactoryMap.unpauseMap();
    }

    static getBoundaries(baseLayout, markers)
    {
        let maxObjectOffset = 0;
        let minX            = Infinity;
        let maxX            = -Infinity;
        let minY            = Infinity;
        let maxY            = -Infinity;
            for(let i = 0; i < markers.length; i++)
            {
                let currentObject = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                    if([
                        '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C',
                        '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C',
                        '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C'
                    ].includes(currentObject.className))
                    {
                        continue;
                    }

                let mSplineData = baseLayout.getObjectProperty(currentObject, 'mSplineData');
                    if(mSplineData !== null)
                    {
                        let splineMinX = Infinity;
                        let splineMaxX = -Infinity;
                        let splineMinY = Infinity;
                        let splineMaxY = -Infinity;

                        for(let j = 0; j < mSplineData.values.length; j++)
                        {
                            for(let k = 0; k < mSplineData.values[j].length; k++)
                            {
                                let currentValue = mSplineData.values[j][k];
                                    if(currentValue.name === 'Location')
                                    {
                                        splineMinX  = Math.min(splineMinX, currentObject.transform.translation[0] + currentValue.value.values.x);
                                        splineMaxX  = Math.max(splineMaxX, currentObject.transform.translation[0] + currentValue.value.values.x);
                                        splineMinY  = Math.min(splineMinY, currentObject.transform.translation[1] + currentValue.value.values.y);
                                        splineMaxY  = Math.max(splineMaxY, currentObject.transform.translation[1] + currentValue.value.values.y);
                                    }
                            }
                        }

                        minX    = Math.min(minX, ((splineMinX + splineMaxX) / 2));
                        maxX    = Math.max(maxX, ((splineMinX + splineMaxX) / 2));
                        minY    = Math.min(minY, ((splineMinY + splineMaxY) / 2));
                        maxY    = Math.max(maxY, ((splineMinY + splineMaxY) / 2));

                        continue;
                    }

                let objectOffset    = 0;
                let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
                    if(buildingData !== null && (buildingData.category === 'frame' || buildingData.category === 'foundation' || buildingData.category === 'roof'))
                    {
                        objectOffset = 400;
                    }

                    minX            = Math.min(minX, currentObject.transform.translation[0] - objectOffset);
                    maxX            = Math.max(maxX, currentObject.transform.translation[0] + objectOffset);
                    minY            = Math.min(minY, currentObject.transform.translation[1] - objectOffset);
                    maxY            = Math.max(maxY, currentObject.transform.translation[1] + objectOffset);
                    maxObjectOffset = Math.max(objectOffset, maxObjectOffset);
            }

        return {
            minX    : minX + maxObjectOffset,
            maxX    : maxX - maxObjectOffset,
            minY    : minY + maxObjectOffset,
            maxY    : maxY - maxObjectOffset,
            centerX : (minX + maxX) / 2,
            centerY : (minY + maxY) / 2
        };
    }

    /*
     * MODAL
     */
    static getHTML(baseLayout, markers)
    {
        let message                             = '';
        let haveFoundationsMaterialsCategory    = false;
        let haveWallsMaterialsCategory          = false;
        let haveRoofsMaterialsCategory          = false;
        let havePillarsMaterialsCategory        = false;
        let haveSkinsCategory                   = false;
        let haveExtractionCategory              = false;
        let haveLogisticCategory                = false;
        let haveConveyorsBelts                  = false;
        let havePowerPoleCategory               = false;
        let havePipelineCategory                = false;
        let haveProductionCategory              = false;
        let haveStorageCategory                 = false;
        let haveFluidStorageCategory            = false;
        let haveGeneratorCategory               = false;

            if(markers !== null && markers.length > 0)
            {
                let buildings = {};
                    for(let i = (markers.length - 1); i >= 0; i--)
                    {
                        if(markers[i].options.pathName !== undefined)
                        {
                            let currentObject = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                                if(currentObject !== null)
                                {
                                    if([
                                        '/Game/FactoryGame/Resource/BP_ResourceDeposit.BP_ResourceDeposit_C',
                                        '/Script/FactoryGame.FGItemPickup_Spawnable',
                                        '/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C'
                                    ].includes(currentObject.className))
                                    {
                                        let itemData        = baseLayout.getItemDataFromClassName(markers[i].options.itemId);
                                            if(itemData !== null)
                                            {
                                                if(buildings[currentObject.className + '_' + itemData.className] === undefined)
                                                {
                                                    buildings[currentObject.className + '_' + itemData.className] = {
                                                        name    : itemData.name,
                                                        total   : 0
                                                    };
                                                }
                                                buildings[currentObject.className + '_' + itemData.className].total += markers[i].options.itemQty;
                                            }
                                    }
                                    else
                                    {
                                        if(buildings[currentObject.className] === undefined)
                                        {
                                            if(currentObject.className === '/Game/FactoryGame/-Shared/Crate/BP_Crate.BP_Crate_C')
                                            {
                                                buildings[currentObject.className] = {name: 'Loot Crate', total: 1};
                                            }
                                            else
                                            {
                                                let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);
                                                    if(buildingData !== null)
                                                    {
                                                        buildings[currentObject.className] = {name: buildingData.name, total: 1};

                                                        if(buildingData.category === 'foundation')
                                                        {
                                                            haveFoundationsMaterialsCategory = true;
                                                        }
                                                        if(buildingData.category === 'wall')
                                                        {
                                                            haveWallsMaterialsCategory = true;
                                                        }
                                                        if(buildingData.category === 'roof')
                                                        {
                                                            haveRoofsMaterialsCategory = true;
                                                        }
                                                        if(buildingData.category === 'pillar')
                                                        {
                                                            havePillarsMaterialsCategory = true;
                                                        }
                                                        if(buildingData.category === 'extraction')
                                                        {
                                                            haveExtractionCategory = true;
                                                        }
                                                        if(buildingData.category === 'logistic')
                                                        {
                                                            haveLogisticCategory = true;

                                                            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorBelt'))
                                                            {
                                                                haveConveyorsBelts = true;
                                                            }
                                                        }
                                                        if(buildingData.category === 'powerPole')
                                                        {
                                                            havePowerPoleCategory = true;
                                                        }
                                                        if(buildingData.category === 'production')
                                                        {
                                                            haveProductionCategory = true;
                                                        }
                                                        if(buildingData.category === 'pipe')
                                                        {
                                                            havePipelineCategory = true;
                                                        }
                                                        if(buildingData.category === 'storage' || currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C')
                                                        {
                                                            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className))
                                                            {
                                                                haveFluidStorageCategory = true;
                                                            }
                                                            else
                                                            {
                                                                haveStorageCategory = true;
                                                            }
                                                        }
                                                        if(buildingData.category === 'generator')
                                                        {
                                                            haveGeneratorCategory = true;
                                                        }
                                                        if(buildingData.switchSkin !== undefined)
                                                        {
                                                            haveSkinsCategory = true;
                                                        }
                                                    }
                                            }
                                        }
                                        else
                                        {
                                            buildings[currentObject.className].total++;
                                        }
                                    }
                                }
                                else
                                {
                                    if(markers[i].options.pathName.includes('_vehicleTrackData') === false)
                                    {
                                        console.log('SELECTED MARKER DO NOT EXISTS', markers[i]);
                                    }
                                    markers.splice(i, 1);
                                }
                        }
                    }

                message += '<ul style="flex-wrap: wrap;display: flex;">';

                let buildingsList   = [];
                    for(let className in buildings)
                    {
                        buildingsList.push(buildings[className]);
                    }
                    buildingsList.sort((a, b) => (a.total > b.total) ? -1 : 1);

                for(let i = 0; i < buildingsList.length; i++)
                {
                    message += '<li style="flex: 0 0 33%;">' + buildingsList[i].total + ' ' + buildingsList[i].name + '</li>';
                }
                message += '</ul>';
            }

        let inputOptions = [];
            if(markers !== null && markers.length > 0)
            {
                inputOptions.push({text: 'Delete selected items', value: 'delete'});
                inputOptions.push({text: 'Update selected buildings color slot', value: 'colorSlot'});
                inputOptions.push({text: 'Update selected buildings custom color', value: 'customColor'});

                inputOptions.push({group: 'Positioning', text: 'Offset selected items position', value: 'offset'});
                inputOptions.push({group: 'Positioning', text: 'Rotate selected items position', value: 'rotate'});

                inputOptions.push({group: 'Blueprints', text: 'Add "Foundation 8m x 2m" helpers on selection boundaries', value: 'helpers'});
                inputOptions.push({group: 'Blueprints', text: 'Copy selected items', value: 'copy'});

                if (haveProductionCategory === true || haveExtractionCategory === true || haveGeneratorCategory === true)
                {
                    inputOptions.push({group: 'Power/Overclocking', text: 'Set selected machines clock speed', value: 'clockSpeed'});

                    inputOptions.push({ group: 'Power/Overclocking', text: 'Turn on selected machines', value: 'Building_PowerSwitch_turnOn' });
                    inputOptions.push({ group: 'Power/Overclocking', text: 'Turn off selected machines', value: 'Building_PowerSwitch_turnOff' });
                }
            }

            if(haveFoundationsMaterialsCategory === true)
            {
                inputOptions.push({group: 'Foundation Materials', text: 'Switch to "FICSIT Foundation"', value: 'switchMaterial|foundation|Ficsit'});
                inputOptions.push({group: 'Foundation Materials', text: 'Switch to "Concrete Foundation"', value: 'switchMaterial|foundation|Concrete'});
                inputOptions.push({group: 'Foundation Materials', text: 'Switch to "Grip Metal Foundation"', value: 'switchMaterial|foundation|GripMetal'});
                inputOptions.push({group: 'Foundation Materials', text: 'Switch to "Coated Concrete Foundation"', value: 'switchMaterial|foundation|ConcretePolished'});
                inputOptions.push({group: 'Foundation Materials', text: 'Switch to "Asphalt Foundation"', value: 'switchMaterial|foundation|Asphalt'});
            }

            if(haveWallsMaterialsCategory === true)
            {
                inputOptions.push({group: 'Wall Materials', text: 'Switch to "FICSIT Wall"', value: 'switchMaterial|wall|Ficsit'});
                inputOptions.push({group: 'Wall Materials', text: 'Switch to "Concrete Wall"', value: 'switchMaterial|wall|Concrete'});
                inputOptions.push({group: 'Wall Materials', text: 'Switch to "Steel Wall"', value: 'switchMaterial|wall|Steel'});
            }

            if(haveRoofsMaterialsCategory === true)
            {
                inputOptions.push({group: 'Roof Materials', text: 'Switch to "FICSIT Roof"', value: 'switchMaterial|roof|Ficsit'});
                inputOptions.push({group: 'Roof Materials', text: 'Switch to "Tar Roof"', value: 'switchMaterial|roof|Tar'});
                inputOptions.push({group: 'Roof Materials', text: 'Switch to "Metal Roof"', value: 'switchMaterial|roof|Metal'});
                inputOptions.push({group: 'Roof Materials', text: 'Switch to "Glass Roof"', value: 'switchMaterial|roof|Glass'});
            }

            if(havePillarsMaterialsCategory === true)
            {
                inputOptions.push({group: 'Pillar Materials', text: 'Switch to "Metal Pillar"', value: 'switchMaterial|pillar|Metal'});
                inputOptions.push({group: 'Pillar Materials', text: 'Switch to "Concrete Pillar"', value: 'switchMaterial|pillar|Concrete'});
                inputOptions.push({group: 'Pillar Materials', text: 'Switch to "Frame Pillar"', value: 'switchMaterial|pillar|Frame'});
            }

            if(haveSkinsCategory === true)
            {
                inputOptions.push({group: 'Skins', text: 'Switch to "Default" skin', value: 'switchSkin|Default'});
                inputOptions.push({group: 'Skins', text: 'Switch to "FICS*MAS" skin', value: 'switchSkin|Ficsmas'});
            }

            if(haveLogisticCategory === true)
            {
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Downgrade selected belts/lifts', value: 'Building_Conveyor_downgradeConveyor'});
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Upgrade selected belts/lifts', value: 'Building_Conveyor_upgradeConveyor'});
            }

            if(havePowerPoleCategory === true)
            {
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Downgrade selected power poles', value: 'Building_PowerPole_downgradePowerPole'});
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Upgrade selected power poles', value: 'Building_PowerPole_upgradePowerPole'});
            }

            if(havePipelineCategory === true)
            {
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Downgrade selected pipelines/pumps', value: 'Building_Pipeline_downgradePipeline'});
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Upgrade selected pipelines/pumps', value: 'Building_Pipeline_upgradePipeline'});
            }

            if(haveExtractionCategory === true)
            {
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Downgrade selected miners', value: 'Building_Miner_downgradeMiner'});
                inputOptions.push({group: 'Downgrade/Upgrade', text: 'Upgrade selected miners', value: 'Building_Miner_upgradeMiner'});
            }

            inputOptions.push({group: 'Foundations', text: 'Fill selection with...', value: 'fillArea'});

            if(haveProductionCategory === true)
            {
                inputOptions.push({group: 'Inventory', text: 'Fill selected machine inventories', value: 'Building_Production_fillInventory'});
                inputOptions.push({group: 'Inventory', text: 'Clear selected machine inventories', value: 'Building_Production_clearInventory'});
            }
            if(haveStorageCategory === true || haveFluidStorageCategory === true)
            {
                if(haveStorageCategory === true)
                {
                    inputOptions.push({group: 'Inventory', text: 'Fill selected storages inventories', value: 'fillStorage'});
                }
                if(haveFluidStorageCategory === true)
                {
                    inputOptions.push({group: 'Inventory', text: 'Fill selected fluid storages inventories', value: 'fillFluidStorage'});
                }

                inputOptions.push({group: 'Inventory', text: 'Clear selected storages inventories', value: 'clearStorage'});
            }

            if(haveConveyorsBelts)
            {
                inputOptions.push({group: 'Performance Test', text: 'Merge adjacent conveyor belts', value: 'Building_Conveyor_mergeConveyors'});
            }

            if(markers !== null && markers.length > 0)
            {
                inputOptions.push({group: 'Statistics', text: 'Show selected items production statistics', value: 'modalProductionStatistics'});
                inputOptions.push({group: 'Statistics', text: 'Show selected items storage statistics', value: 'modalStorageStatistics'});
                inputOptions.push({group: 'Statistics', text: 'Show selected power circuits statistics', value: 'modalPowerCircuitsStatistics'});
            }

            // Foliage
            inputOptions.push({group: 'Flora', text: 'Respawn flora', value: 'respawnFlora'});
            //inputOptions.push({group: 'Flora', text: 'Clear flora', value: 'clearFlora'});

        BaseLayout_Modal.form({
            title       : 'You have selected ' + ((markers !== null) ? markers.length : 0) + ' items',
            message     : message,
            onEscape    : function(){
                Modal_Selection.cancel.call(null, baseLayout);
            },
            container   : '#leafletMap',
            inputs      : [{
                name            : 'form',
                inputType       : 'select',
                inputOptions    : inputOptions
            }],
            callback    : function(form)
            {
                if(form === null || form.form === null)
                {
                    Modal_Selection.cancel(baseLayout);
                    return;
                }

                let callbackArguments   = form.form.split('|');
                let callbackName        = callbackArguments.shift();
                    callbackName        = 'callback' + callbackName[0].toUpperCase() + callbackName.slice(1);

                // Those callback needs access to the selection!
                if(['fillArea', 'respawnFlora'].includes(form.form) === false)
                {
                    Modal_Selection.cancel(baseLayout);
                }

                // Let's go!
                if(typeof Modal_Selection[callbackName] === "function")
                {
                    callbackArguments.unshift(markers);
                    callbackArguments.unshift(baseLayout);

                    return Modal_Selection[callbackName].apply(null, callbackArguments);
                }
                // Generic callback?
                else
                {
                    callbackName = callbackName.slice(8);

                    for(let i = 0; i < markers.length; i++)
                    {
                        let contextMenu = baseLayout.getContextMenu(markers[i]);
                            if(contextMenu !== false)
                            {
                                // Search for a className callback in contextmenu...
                                for(let j = 0; j < contextMenu.length; j++)
                                {
                                    if(contextMenu[j].className !== undefined && contextMenu[j].className === callbackName)
                                    {
                                        contextMenu[j].callback({relatedTarget: markers[i], baseLayout: baseLayout}, false);
                                        break;
                                    }
                                }
                            }
                    }

                    baseLayout.updateRadioactivityLayer();
                }
            }
        });
    }

    /*
     * CALLBACKS!
     */
    static callbackDelete(baseLayout, markers)
    {
        BaseLayout_Modal.confirm({
            title       : 'You have selected ' + markers.length + ' items',
            message     : 'Do you want a doggy bag with your mass-dismantling?<br /><em>(You\'ll just get a nice loot crate next to you)</em>',
            onEscape    : function(){
                Modal_Selection.cancel.call(null, baseLayout);
            },
            container   : '#leafletMap',
            buttons     : { confirm: {label: 'Yes'}, cancel: {label: 'No'} },
            callback    : function(result){
                return new Selection_Delete({
                    baseLayout  : baseLayout,
                    markers     : markers,
                    keepDeleted : result
                });
            }
        });
    }



    static callbackOffset(baseLayout, markers)
    {
        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
            onEscape    : function(){
                Modal_Selection.cancel.call(null, baseLayout);
            },
            container   : '#leafletMap',
            inputs      : [{
                label       : 'X',
                name        : 'offsetX',
                inputType   : 'coordinate',
                value       : 0
            },
            {
                label       : 'Y',
                name        : 'offsetY',
                inputType   : 'coordinate',
                value       : 0
            },
            {
                label       : 'Z',
                name        : 'offsetZ',
                inputType   : 'coordinate',
                value       : 0
            }],
            callback: function(form)
            {
                if(form === null || form.offsetX === null || form.offsetY === null || form.offsetZ === null)
                {
                    return;
                }

                return new Selection_Offset({
                    baseLayout  : baseLayout,
                    markers     : markers,
                    offsetX     : form.offsetX,
                    offsetY     : form.offsetY,
                    offsetZ     : form.offsetZ
                });
            }
        });
    }

    static callbackRotate(baseLayout, markers)
    {
        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            onEscape    : function(){
                Modal_Selection.cancel.call(null, baseLayout);
            },
            container   : '#leafletMap',
            inputs      : [{
                label       : 'Rotation (Angle between 0 and 360 degrees)',
                name        : 'angle',
                inputType   : 'number',
                value       : 0,
                min         : 0,
                max         : 360
            }],
            callback    : function(form)
            {
                if(form === null || form.angle === null)
                {
                    return;
                }

                return new Selection_Rotate({
                    baseLayout  : baseLayout,
                    markers     : markers,
                    angle       : form.angle
                });
            }
        });
    }

    static callbackHelpers(baseLayout, markers)
    {
        let playerColorsHelpers = baseLayout.buildableSubSystem.getPlayerColorSlots();
        let selectOptions       = [];

            for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
            {
                selectOptions.push({
                    fullWidth       : ((slotIndex === 0) ? true : false),
                    primaryColor    : 'rgb(' + playerColorsHelpers[slotIndex].primaryColor.r + ', ' + playerColorsHelpers[slotIndex].primaryColor.g + ', ' + playerColorsHelpers[slotIndex].primaryColor.b + ')',
                    secondaryColor  : 'rgb(' + playerColorsHelpers[slotIndex].secondaryColor.r + ', ' + playerColorsHelpers[slotIndex].secondaryColor.g + ', ' + playerColorsHelpers[slotIndex].secondaryColor.b + ')',
                    value           : slotIndex,
                    text            : ((slotIndex === 0) ? 'FICSIT Factory' : 'Swatch ' + slotIndex)
                });
            }

        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'slotIndex',
                inputType       : 'colorSlots',
                inputOptions    : selectOptions
            }],
            callback    : function(form)
            {
                if(form === null || form.slotIndex === null)
                {
                    return;
                }

                let boundaries  = Modal_Selection.getBoundaries(baseLayout, markers);
                let minZ        = Infinity;

                    // Try to find the minZ
                    for(let i = 0; i < markers.length; i++)
                    {
                        let currentObject       = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                        let currentObjectData   = baseLayout.getBuildingDataFromClassName(currentObject.className);

                            if(currentObjectData !== null && currentObject.className !== '/Game/FactoryGame/Buildable/Factory/PowerLine/Build_PowerLine.Build_PowerLine_C' && currentObject.className !== '/Game/FactoryGame/Events/Christmas/Buildings/PowerLineLights/Build_XmassLightsLine.Build_XmassLightsLine_C')
                            {
                                if(currentObjectData.category === 'frame' || currentObjectData.category === 'foundation' || currentObjectData.category === 'roof')
                                {
                                    minZ = Math.min(minZ, currentObject.transform.translation[2] - (currentObjectData.height * 100 / 2)); // GROUND BUILDING USE HALF AS CENTER
                                }
                                else
                                {
                                    minZ = Math.min(minZ, currentObject.transform.translation[2]); // OTHER ARE PLACED FROM BOTTOM
                                }
                            }
                    }

                // Add center
                let fakeFoundation  = {
                        type            : 1,
                        className       : "/Game/FactoryGame/Buildable/Building/Foundation/Build_Foundation_8x2_01.Build_Foundation_8x2_01_C",
                        pathName        : "Persistent_Level:PersistentLevel.Build_Foundation_8x2_01_C_XXX",
                        transform       : {
                            rotation        : [0, 0, 0, 1],
                            translation     : [boundaries.centerX, boundaries.centerY, minZ + 100]
                        },
                        properties      : [
                            { name: "mBuiltWithRecipe", type: "ObjectProperty", value: { levelName: "", pathName: "/Game/FactoryGame/Recipes/Buildings/Foundations/Recipe_Foundation_8x2_01.Recipe_Foundation_8x2_01_C" } },
                            { name: "mBuildTimeStamp", type: "FloatProperty", value: 0 }
                        ],
                        entity: {pathName: "Persistent_Level:PersistentLevel.BuildableSubsystem"}
                    };
                    fakeFoundation.pathName = baseLayout.generateFastPathName(fakeFoundation);

                baseLayout.buildableSubSystem.setObjectColorSlot(fakeFoundation, form.slotIndex);

                baseLayout.saveGameParser.addObject(fakeFoundation);
                let resultCenter = baseLayout.parseObject(fakeFoundation);
                    baseLayout.addElementToLayer(resultCenter.layer, resultCenter.marker);


                // Add corners...
                let corners = [
                    // TOP LEFT
                    [
                        (fakeFoundation.transform.translation[0] - (boundaries.centerX - boundaries.minX) - 800),
                        (fakeFoundation.transform.translation[1] - (boundaries.centerY - boundaries.minY) - 800)
                    ],
                    // TOP RIGHT
                    [
                        (fakeFoundation.transform.translation[0] + (boundaries.maxX - boundaries.centerX) + 800),
                        (fakeFoundation.transform.translation[1] - (boundaries.centerY - boundaries.minY) - 800)
                    ],
                    // BOTTOM LEFT
                    [
                        (fakeFoundation.transform.translation[0] - (boundaries.centerX - boundaries.minX) - 800),
                        (fakeFoundation.transform.translation[1] + (boundaries.maxY - boundaries.centerY) + 800)
                    ],
                    // BOTTOM RIGHT
                    [
                        (fakeFoundation.transform.translation[0] + (boundaries.maxX - boundaries.centerX) + 800),
                        (fakeFoundation.transform.translation[1] + (boundaries.maxY - boundaries.centerY) + 800)
                    ]
                ];

                for(let i = 0; i < corners.length; i++)
                {
                    let newFoundation                           = JSON.parse(JSON.stringify(fakeFoundation));
                        newFoundation.pathName                  = baseLayout.generateFastPathName(fakeFoundation);
                    let translationRotation                     = BaseLayout_Math.getPointRotation(corners[i], fakeFoundation.transform.translation, fakeFoundation.transform.rotation);
                        newFoundation.transform.translation[0]  = translationRotation[0];
                        newFoundation.transform.translation[1]  = translationRotation[1];

                        baseLayout.saveGameParser.addObject(newFoundation);

                        let result = baseLayout.parseObject(newFoundation);
                            baseLayout.addElementToLayer(result.layer, result.marker);
                }
            }
        });
    }

    static callbackCopy(baseLayout, markers)
    {
        return new Selection_Copy({
            baseLayout  : baseLayout,
            markers     : markers
        });
    }



    static callbackColorSlot(baseLayout, markers)
    {
        let playerColors        = baseLayout.buildableSubSystem.getPlayerColorSlots();
        let selectOptionsColors = [];
            for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
            {
                selectOptionsColors.push({
                    fullWidth       : ((slotIndex === 0) ? true : false),
                    primaryColor    : 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ')',
                    secondaryColor  : 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ')',
                    value           : slotIndex,
                    text            : ((slotIndex === 0) ? 'FICSIT Factory' : 'Swatch ' + slotIndex)
                });
            }
            selectOptionsColors.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ')',
                value           : 16,
                text            : 'FICSIT Foundation'
            });
            selectOptionsColors.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerColors[18].primaryColor.r + ', ' + playerColors[18].primaryColor.g + ', ' + playerColors[18].primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerColors[18].secondaryColor.r + ', ' + playerColors[18].secondaryColor.g + ', ' + playerColors[18].secondaryColor.b + ')',
                value           : 18,
                text            : 'Concrete Structure'
            });

        let playerCustomColor       = baseLayout.buildableSubSystem.getPlayerCustomColor();
            selectOptionsColors.push({
                fullWidth       : true,
                primaryColor    : 'rgb(' + playerCustomColor.primaryColor.r + ', ' + playerCustomColor.primaryColor.g + ', ' + playerCustomColor.primaryColor.b + ')',
                secondaryColor  : 'rgb(' + playerCustomColor.secondaryColor.r + ', ' + playerCustomColor.secondaryColor.g + ', ' + playerCustomColor.secondaryColor.b + ')',
                value           : 255,
                text            : 'Custom Swatch'
            });

        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'slotIndex',
                inputType       : 'colorSlots',
                inputOptions    : selectOptionsColors
            }],
            callback    : function(form)
            {
                if(form === null || form.slotIndex === null)
                {
                    return;
                }

                for(let i = 0; i < markers.length; i++)
                {
                    let contextMenu = baseLayout.getContextMenu(markers[i]);
                        if(contextMenu !== false)
                        {
                            // Search for a callback in contextmenu...
                            for(let j = 0; j < contextMenu.length; j++)
                            {
                                if(contextMenu[j].className !== undefined && contextMenu[j].className === 'Modal_Object_ColorSlot')
                                {
                                    let currentObject   = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                                        baseLayout.buildableSubSystem.setObjectColorSlot(currentObject, parseInt(form.slotIndex));
                                        markers[i].fire('mouseout'); // Trigger a redraw
                                }
                            }
                        }
                }
            }
        });
    }

    static callbackCustomColor(baseLayout, markers)
    {
        let customColor = baseLayout.buildableSubSystem.getPlayerCustomColor();

        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'primaryColor',
                inputType       : 'colorPicker',
                value           : customColor.primaryColor
            },
            {
                name            : 'secondaryColor',
                inputType       : 'colorPicker',
                value           : customColor.secondaryColor
            }],
            callback    : function(form)
            {
                if(form === null || form.primaryColor === null || form.secondaryColor === null)
                {
                    return;
                }

                for(let i = 0; i < markers.length; i++)
                {
                    let contextMenu = baseLayout.getContextMenu(markers[i]);
                        if(contextMenu !== false)
                        {
                            // Search for a callback in contextmenu...
                            for(let j = 0; j < contextMenu.length; j++)
                            {
                                if(contextMenu[j].className !== undefined && contextMenu[j].className === 'Modal_Object_CustomColor')
                                {
                                    let currentObject   = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                                        baseLayout.buildableSubSystem.setObjectCustomColor(currentObject, form.primaryColor, form.secondaryColor);
                                        markers[i].fire('mouseout'); // Trigger a redraw
                                }
                            }
                        }
                }
            }
        });
    }

    static callbackSwitchMaterial(baseLayout, markers, category, material)
    {
        for(let i = 0; i < markers.length; i++)
        {
            let contextMenu = baseLayout.getContextMenu(markers[i]);
                if(contextMenu !== false)
                {
                    // Search for a callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].className !== undefined && contextMenu[j].className === 'buildableSubSystem_switchObjectMaterial')
                        {
                            if(contextMenu[j].argument !== undefined && contextMenu[j].argument[0] === category && contextMenu[j].argument[1] === material)
                            {
                                baseLayout.buildableSubSystem.switchObjectMaterial({relatedTarget: markers[i], baseLayout: baseLayout}, [category, material]);
                            }
                        }
                    }
                }
        }
    }

    static callbackSwitchSkin(baseLayout, markers, skin)
    {
        for(let i = 0; i < markers.length; i++)
        {
            let contextMenu = baseLayout.getContextMenu(markers[i]);
                if(contextMenu !== false)
                {
                    // Search for a callback in contextmenu...
                    for(let j = 0; j < contextMenu.length; j++)
                    {
                        if(contextMenu[j].className !== undefined && contextMenu[j].className === 'buildableSubSystem_switchObjectSkin')
                        {
                            if(contextMenu[j].argument !== undefined && contextMenu[j].argument === skin)
                            {
                                baseLayout.buildableSubSystem.switchObjectSkin({relatedTarget: markers[i], baseLayout: baseLayout}, skin);
                            }
                        }
                    }
                }
        }
    }



    static callbackRespawnFlora(baseLayout)
    {
        if(baseLayout.satisfactoryMap.leafletMap.selection._areaSelected !== null)
        {
            return SubSystem_Foliage.respawn(baseLayout);
        }
    }

    static callbackClearFlora(baseLayout)
    {
        if(baseLayout.satisfactoryMap.leafletMap.selection._areaSelected !== null)
        {
            return SubSystem_Foliage.clear(baseLayout);
        }
    }



    static callbackFillArea(baseLayout)
    {
        if(baseLayout.satisfactoryMap.leafletMap.selection._areaSelected !== null)
        {
            let selection       = baseLayout.satisfactoryMap.leafletMap.selection._areaSelected;
            let inputOptions    = [];
                for(let i in baseLayout.buildingsData)
                {
                    if(baseLayout.buildingsData[i].category === 'foundation')
                    {
                        inputOptions.push({
                            dataContent : '<img src="' + baseLayout.buildingsData[i].image + '" style="width: 24px;" class="mr-1" /> ' + baseLayout.buildingsData[i].name,
                            value       : baseLayout.buildingsData[i].className,
                            text        : baseLayout.buildingsData[i].name
                        });
                    }
                }

            BaseLayout_Modal.form({
                title       : 'Fill selection with...',
                onEscape    : function(){
                    Modal_Selection.cancel.call(null, baseLayout);
                },
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'fillWith',
                    inputType       : 'selectPicker',
                    inputOptions    : inputOptions
                },{
                    name            : 'z',
                    label           : 'Altitude (In centimeters)',
                    inputType       : 'coordinate',
                    value           : 0,
                },
                {
                    label           : 'Use materials from your containers?',
                    name            : 'useOwnMaterials',
                    inputType       : 'toggle'
                }],
                callback: function(form)
                {
                    if(form === null || form.fillWith === null || form.z === null || form.useOwnMaterials === null)
                    {
                        Modal_Selection.cancel(baseLayout);
                        return;
                    }

                    return new Spawn_Fill({
                        selection       : selection,
                        z               : form.z,
                        fillWith        : form.fillWith,
                        useOwnMaterials : parseInt(form.useOwnMaterials),

                        baseLayout      : baseLayout
                    });
                }
            });
        }
    }



    static callbackClockSpeed(baseLayout, markers)
    {
        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            onEscape    : function(){
                Modal_Selection.cancel.call(null, baseLayout);
            },
            container   : '#leafletMap',
            inputs      : [
                {
                    label       : 'Clock speed (Percentage)',
                    name        : 'value',
                    inputType   : 'number',
                    value       : 100,
                    min         : 1,
                    max         : 250
                },
                {
                    label       : 'Use power shards from your containers?',
                    name        : 'useOwnPowershards',
                    inputType   : 'toggle'
                }
            ],
            callback: function(form)
            {
                if(form === null || form.value === null || form.useOwnPowershards === null)
                {
                    return;
                }

                for(let i = 0; i < markers.length; i++)
                {
                    let contextMenu = baseLayout.getContextMenu(markers[i]);
                        if(contextMenu !== false)
                        {
                            for(let j = 0; j < contextMenu.length; j++)
                            {
                                if(contextMenu[j].callback !== undefined && contextMenu[j].callback.name.includes('updateObjectClockSpeed'))
                                {
                                    let currentObject       = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                                    let currentClockSpeed   = baseLayout.getClockSpeed(currentObject) * 100;
                                    let newClockSpeed       = parseFloat(form.value);
                                    let clockSpeed          = Math.max(1, Math.min(newClockSpeed, 250));

                                    if(currentClockSpeed !== clockSpeed)
                                    {
                                        let totalPowerShards    = Math.ceil((clockSpeed - 100) / 50);

                                            if(totalPowerShards > 0 && clockSpeed > currentClockSpeed)
                                            {
                                                let potentialInventory = baseLayout.getObjectInventory(currentObject, 'mInventoryPotential', true);
                                                    if(potentialInventory !== null)
                                                    {
                                                        for(let k = 0; k < potentialInventory.properties.length; k++)
                                                        {
                                                            if(potentialInventory.properties[k].name === 'mInventoryStacks')
                                                            {
                                                                for(let m = 0; m < totalPowerShards; m++)
                                                                {
                                                                    if(parseInt(form.useOwnPowershards) === 1)
                                                                    {
                                                                        let result = baseLayout.removeFromStorage('/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C');
                                                                            if(result === false)
                                                                            {
                                                                                clockSpeed = Math.min(clockSpeed, 100 + (m * 50)); // Downgrade...
                                                                                break;
                                                                            }
                                                                    }

                                                                    potentialInventory.properties[k].value.values[m][0].value.itemName = '/Game/FactoryGame/Resource/Environment/Crystal/Desc_CrystalShard.Desc_CrystalShard_C';
                                                                    baseLayout.setObjectProperty(potentialInventory.properties[k].value.values[m][0].value, 'NumItems', 1, 'IntProperty');
                                                                }
                                                            }
                                                        }
                                                    }
                                            }

                                        baseLayout.setObjectProperty(currentObject, 'mCurrentPotential', clockSpeed / 100, 'FloatProperty');
                                        baseLayout.setObjectProperty(currentObject, 'mPendingPotential', clockSpeed / 100, 'FloatProperty');
                                    }
                                }
                            }
                        }
                }
            }
        });
    }



    static callbackFillStorage(baseLayout, markers)
    {
        BaseLayout_Modal.form({
            title       : 'You have selected ' + markers.length + ' items',
            onEscape    : function(){
                Modal_Selection.cancel.call(null, baseLayout);
            },
            container   : '#leafletMap',
            inputs      : [{
                name            : 'fillWith',
                inputType       : 'selectPicker',
                inputOptions    : baseLayout.generateInventoryOptions({className: '/Game/FactoryGame/Buildable/Factory/StorageContainerMk1/Build_StorageContainerMk1.Build_StorageContainerMk1_C'}, false)
            }],
            callback: function(form)
            {
                if(form === null || form.fillWith === null)
                {
                    Modal_Selection.cancel(baseLayout);
                    return;
                }

                for(let i = 0; i < markers.length; i++)
                {
                    let currentObject       = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                        if(currentObject !== null)
                        {
                            // Skip locomotive to avoid double freight wagons...
                            if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                            {
                                continue;
                            }
                            if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className))
                            {
                                continue;
                            }

                            baseLayout.fillPlayerStorageBuildingInventory(currentObject, form.fillWith);
                        }
                }
                baseLayout.updateRadioactivityLayer();
            }
        });
    }
    static callbackFillFluidStorage(baseLayout, markers)
    {
        for(let i = 0; i < markers.length; i++)
        {
            let currentObject       = baseLayout.saveGameParser.getTargetObject(markers[i].options.pathName);
                if(currentObject !== null)
                {
                    // Skip locomotive to avoid double freight wagons...
                    if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                    {
                        continue;
                    }
                    if(['/Game/FactoryGame/Buildable/Factory/StorageTank/Build_PipeStorageTank.Build_PipeStorageTank_C', '/Game/FactoryGame/Buildable/Factory/IndustrialFluidContainer/Build_IndustrialTank.Build_IndustrialTank_C', '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C'].includes(currentObject.className))
                    {
                        // Buffer only have the fluidBox, the fluid is handled with the pipe network ;)
                        baseLayout.fillPlayerStorageBuildingInventory(currentObject, null);
                    }
                }
        }
        baseLayout.updateRadioactivityLayer();
    }

    static callbackClearStorage(baseLayout, markers)
    {
        for(let i = 0; i < markers.length; i++)
        {
            baseLayout.clearPlayerStorageBuildingInventory({relatedTarget: markers[i]});
        }
        baseLayout.updateRadioactivityLayer();
    }

    static callbackModalProductionStatistics(baseLayout, markers)
    {
        let statisticsProduction = new Modal_Statistics_Production({
                baseLayout  : baseLayout,
                markers     : markers
            });

        $('#genericModal .modal-title').empty().html(translate('MAP\\MODAL\\Statistics - Production'));
        $('#genericModal .modal-body').empty().html(statisticsProduction.parse());
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
        }, 250);
    }

    static callbackModalStorageStatistics(baseLayout, markers)
    {
        let statisticsStorage = new Modal_Statistics_Storage({
                baseLayout  : baseLayout,
                markers     : markers
            });

        $('#genericModal .modal-title').empty().html(translate('MAP\\MODAL\\Statistics - Storage'));
        $('#genericModal .modal-body').empty().html(statisticsStorage.parse());
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
        }, 250);
    }

    static callbackModalPowerCircuitsStatistics(baseLayout, markers)
    {
        let modalPowerCircuits = new Modal_PowerCircuits({
                baseLayout  : baseLayout,
                markers     : markers
            });
            modalPowerCircuits.parse();
    }
}

L.Selection = L.Handler.extend({
    options: {
        color       : 'green',
        weight      : 2,
        dashArray   : '5, 5, 1, 5',
        selCursor   : 'crosshair',
        normCursor  : ''
    },

    initialize: function (map, options) {
        this._map           = map;
        this._currentForm   = 'polygon';

        this._areaSelected  = null;
        this._areaGhost     = null;

        L.setOptions(this, options);
    },

    setControl: function(control) {
        this.control = control;
    },

    addHooks: function()
    {
        this._map.on('mousedown', this._doMouseDown, this);
        this._map.on('mouseup', this._doMouseUp, this);
        this._map._container.style.cursor = this.options.selCursor;
        this._map.dragging.disable();
    },

    removeHooks: function()
    {
        this._map.off('mousemove', this._doMouseMove, this );
        this._map.off('mousedown', this._doMouseDown, this );
        this._map.off('mouseup', this._doMouseUp, this );
        this._map._container.style.cursor = this.options.normCursor;
        this._map.dragging.enable();
    },

    _doMouseUp: function()
    {
        let childNode = 1;
            switch(this._currentForm)
            {
                case 'circle':
                    childNode = 3;
                    if(this._areaStartPoint !== null && this._areaEndPoint !== null)
                    {
                        this._areaSelected = L.circle(this._areaStartPoint, { color: this.options.color, radius: this._map.distance(this._areaStartPoint, this._areaEndPoint) }).addTo(this._map);
                    }
                    break;
                case 'rectangle':
                    childNode = 2;
                    if(this._areaStartPoint !== null && this._areaEndPoint !== null)
                    {
                        this._areaSelected = L.rectangle([this._areaStartPoint, this._areaEndPoint], { color: this.options.color }).addTo(this._map);
                    }
                    break;
                default:
                    this._areaSelected = L.polygon(this._areaPoints, { color: this.options.color }).addTo(this._map);
                    break;
            }

        if(this._areaGhost !== null && this._map.hasLayer(this._areaGhost))
        {
            this._map.removeLayer(this._areaGhost);
            this._areaGhost = null;
        }

        setTimeout(function(){
            if(this._areaSelected !== null)
            {
                this.control._toggleSelection(this._currentForm, childNode);
            }
        }.bind(this), 100);

        this._map.off('mousemove', this._doMouseMove, this);
    },

    _doMouseDown: function()
    {
        this._areaPoints        = [];
        this._areaStartPoint    = null;
        this._areaEndPoint      = null;

        this._map.on('mousemove', this._doMouseMove, this);
    },

    _doMouseMove: function(e)
    {
        if(this._areaStartPoint === null)
        {
            this._areaStartPoint = e.latlng;
        }
        this._areaEndPoint = e.latlng;

        if(this._areaGhost !== null && this._map.hasLayer(this._areaGhost))
        {
            this._map.removeLayer(this._areaGhost);
        }

        switch(this._currentForm)
        {
            case 'circle':
                let radius = this._map.distance(this._areaStartPoint, this._areaEndPoint);
                    if(radius > 0)
                    {
                        this._areaGhost = L.circle(
                            this._areaStartPoint,
                            {
                                color: this.options.color,
                                weight: this.options.weight,
                                dashArray: this.options.dashArray,
                                radius: radius
                            }
                        ).addTo(this._map);
                    }
                break;
            case 'rectangle':
                this._areaGhost = L.rectangle(
                    [this._areaStartPoint, this._areaEndPoint],
                    {
                        color: this.options.color,
                        weight: this.options.weight,
                        dashArray: this.options.dashArray
                    }
                ).addTo(this._map);
                break;
            default:
                this._areaPoints.push(e.latlng);
                this._areaGhost = L.polygon(
                    this._areaPoints,
                    {
                        color: this.options.color,
                        weight: this.options.weight,
                        dashArray: this.options.dashArray
                    }
                ).addTo(this._map);
                break;
        }
    },

    removeSelectedArea: function()
    {
        if(this._areaSelected !== null)
        {
            this._map.removeLayer(this._areaSelected);
            this._areaSelected = null;
        }
    },

    isMarkerInsidePolygon: function(point, poly)
    {
        if(poly instanceof L.Circle)
        {
            let pointDistance   = this._map.distance([point.lat, point.lng], poly.getLatLng());
                if(pointDistance <= poly.getRadius())
                {
                    return true;
                }

            return false;
        }
        else
        {
            let polyPoints  = poly.getLatLngs()[0];
            let x           = point.lat, y = point.lng;

            let inside      = false;
                for(let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++)
                {
                    let xi = polyPoints[i].lat, yi = polyPoints[i].lng;
                    let xj = polyPoints[j].lat, yj = polyPoints[j].lng;

                    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                        if(intersect) inside = !inside;
                }

            return inside;
        }
    },

    getFeaturesSelected: function(baseLayout)
    {
        let layers_found = [];
            if(this._areaSelected !== null)
            {
                for(let layerId in baseLayout.playerLayers)
                {
                    if(layerId !== 'playerRadioactivityLayer' && layerId !== 'playerFogOfWar' && baseLayout.playerLayers[layerId].subLayer !== null && baseLayout.playerLayers[layerId].layerGroup.hasLayer(baseLayout.playerLayers[layerId].subLayer))
                    {
                        baseLayout.playerLayers[layerId].subLayer.eachLayer(function(layer){
                            let haveContextMenu = baseLayout.getContextMenu(layer);
                                if(haveContextMenu !== false)
                                {
                                    if(layer instanceof L.Marker)
                                    {
                                        if(this.isMarkerInsidePolygon(layer.getLatLng(), this._areaSelected))
                                        {
                                            layers_found.push(layer);
                                        }
                                    }
                                    else
                                    {
                                        if(this.isMarkerInsidePolygon(layer.getCenter(), this._areaSelected))
                                        {
                                            layers_found.push(layer);
                                        }
                                    }
                                }
                        }, this);
                    }
                }
            }

        if(layers_found.length === 0)
        {
            return null;
        }

        return layers_found;
    }

});
L.Map.addInitHook('addHandler', 'selection', L.Selection);

L.Control.Selection = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function(options)
    {
        L.Util.setOptions(this, options);
    },

    onAdd: function()
    {
        let className   = 'leaflet-control-zoom leaflet-bar';
        let container   = L.DomUtil.create('div', className);

        let link1       = L.DomUtil.create('a', 'leaflet-control-selection leaflet-bar-part', container);
            link1.innerHTML = '<i class="far fa-lasso"></i>';
            link1.href      = '#';
            link1.title     = 'Lasso Selection Tool';
            link1.dataset.hover     = 'tooltip';
            link1.dataset.placement = 'right';
        this._link1 = link1;

        L.DomEvent
            .on(link1, 'click', L.DomEvent.stopPropagation)
            .on(link1, 'click', L.DomEvent.preventDefault)
            .on(link1, 'click', this._toggleSelection, this)
            .on(link1, 'dbclick', L.DomEvent.stopPropagation);

        let link2       = L.DomUtil.create('a', 'leaflet-control-selection leaflet-bar-part', container);
            link2.innerHTML     = '<i class="far fa-rectangle-wide"></i>';
            link2.href          = '#';
            link2.title         = 'Rectangle Selection Tool';
            link2.dataset.hover     = 'tooltip';
            link2.dataset.placement = 'right';
        this._link2 = link2;

        L.DomEvent
            .on(link2, 'click', L.DomEvent.stopPropagation)
            .on(link2, 'click', L.DomEvent.preventDefault)
            .on(link2, 'click', this._toggleSelectRectangleAreaFeature, this)
            .on(link2, 'dbclick', L.DomEvent.stopPropagation);

        let link3       = L.DomUtil.create('a', 'leaflet-control-selection leaflet-bar-part', container);
            link3.innerHTML     = '<i class="far fa-circle"></i>';
            link3.href          = '#';
            link3.title         = 'Circle Selection Tool';
            link3.dataset.hover     = 'tooltip';
            link3.dataset.placement = 'right';
        this._link3 = link3;

        L.DomEvent
            .on(link3, 'click', L.DomEvent.stopPropagation)
            .on(link3, 'click', L.DomEvent.preventDefault)
            .on(link3, 'click', this._toggleSelectCircleAreaFeature, this)
            .on(link3, 'dbclick', L.DomEvent.stopPropagation);

        return container;
    },

    onRemove: function(map){},

    _toggleSelection: function(currentForm = 'polygon', childNode = 1)
    {
        this._map.selection._currentForm    = currentForm;
        this._selecting                     = !this._selecting;

        if(this._selecting)
        {
            L.DomUtil.addClass(this['_link' + childNode], 'leaflet-control-selection-on');
            this._map.selection.setControl(this);
            this._map.selection.enable();
        }
        else
        {
            L.DomUtil.removeClass(this['_link' + childNode], 'leaflet-control-selection-on');

            this._map.selection.disable();
            let selection = this._map.selection.getFeaturesSelected(this.options.baseLayout);
                Modal_Selection.getHTML(this.options.baseLayout, selection);
        }
    },
    _toggleSelectRectangleAreaFeature: function()
    {
        return this._toggleSelection('rectangle', 2);
    },
    _toggleSelectCircleAreaFeature: function()
    {
        return this._toggleSelection('circle', 3);
    }
});

L.control.selection = function(options){
    return new L.Control.Selection(options);
};
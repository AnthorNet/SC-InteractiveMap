import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_Conveyor
{
    static teleporter = {
        entry   : null,
        exit    : null,
    };

    static get availableConveyorBelts()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk1/Build_ConveyorBeltMk1.Build_ConveyorBeltMk1_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk2/Build_ConveyorBeltMk2.Build_ConveyorBeltMk2_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk3/Build_ConveyorBeltMk3.Build_ConveyorBeltMk3_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk4/Build_ConveyorBeltMk4.Build_ConveyorBeltMk4_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorBeltMk5/Build_ConveyorBeltMk5.Build_ConveyorBeltMk5_C'
        ];
    }

    static get availableConveyorLifts()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk1/Build_ConveyorLiftMk1.Build_ConveyorLiftMk1_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk2/Build_ConveyorLiftMk2.Build_ConveyorLiftMk2_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk3/Build_ConveyorLiftMk3.Build_ConveyorLiftMk3_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk4/Build_ConveyorLiftMk4.Build_ConveyorLiftMk4_C',
            '/Game/FactoryGame/Buildable/Factory/ConveyorLiftMk5/Build_ConveyorLiftMk5.Build_ConveyorLiftMk5_C'
        ];
    }

    /*
     * BELT LOOKUP, includes mods to avoid finding them everywhere
     */
    static isConveyorBelt(currentObject)
    {
        if(Building_Conveyor.availableConveyorBelts.includes(currentObject.className))
        {
            return true;
        }

        // Belts Mod
        if(
               (currentObject.className.startsWith('/CoveredConveyor') && currentObject.className.includes('lift') === false)
             || currentObject.className.startsWith('/Game/Conveyors_Mod/Build_BeltMk')
             || currentObject.className.startsWith('/UltraFastLogistics/Buildable/build_conveyorbeltMK')
             || currentObject.className.startsWith('/FlexSplines/Conveyor/Build_Belt')
        )
        {
            return true;
        }

        return false;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let haveSeparator = false;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorBelt') === true)
            {
                haveSeparator = true;
                contextMenu.push({
                    icon        : 'fa-object-group',
                    text        : 'Merge adjacent conveyor belts (Performance test)',
                    callback    : Building_Conveyor.mergeConveyors,
                    className   : 'Building_Conveyor_mergeConveyors'
                });

                let conveyorAny0 = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.ConveyorAny0');
                    if(conveyorAny0 !== null)
                    {
                        let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny0, 'mConnectedComponent');
                            if(mConnectedComponent === null)
                            {
                                contextMenu.push({
                                    icon        : 'fa-portal-exit',
                                    text        : 'Use input as teleporter exit',
                                    callback    : Building_Conveyor.storeTeleporterExit,
                                    className   : 'Building_Conveyor_storeTeleporterExit'
                                });
                            }
                    }

                let conveyorAny1 = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.ConveyorAny1');
                    if(conveyorAny1 !== null)
                    {
                        let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny1, 'mConnectedComponent');
                            if(mConnectedComponent === null)
                            {
                                contextMenu.push({
                                    icon        : 'fa-portal-enter',
                                    text        : 'Use output as teleporter entry',
                                    callback    : Building_Conveyor.storeTeleporterEntry,
                                    className   : 'Building_Conveyor_storeTeleporterEntry'
                                });
                            }
                    }
            }

        let usePool = Building_Conveyor.availableConveyorBelts;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
            {
                usePool = Building_Conveyor.availableConveyorLifts;
            }

        let poolIndex   = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
            {
                haveSeparator = true;

                if(poolIndex > 0)
                {
                    let downgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                        if(downgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-down-alt',
                                text        : 'Downgrade to "' + downgradeData.name + '"',
                                callback    : Building_Conveyor.downgradeConveyor,
                                className   : 'Building_Conveyor_downgradeConveyor'
                            });
                        }
                }
                if(poolIndex < (usePool.length - 1))
                {
                    let upgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex + 1]);
                        if(upgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-up-alt',
                                text        : 'Upgrade to "' + upgradeData.name + '"',
                                callback    : Building_Conveyor.upgradeConveyor,
                                className   : 'Building_Conveyor_upgradeConveyor'
                            });
                        }
                }
            }

            if(haveSeparator === true)
            {
                contextMenu.push('-');
            }

        return contextMenu;
    }

    /**
     * TELEPORT
     */

    static storeTeleporterEntry(marker)
    {
        let baseLayout      = marker.baseLayout;
        let conveyorAny1    = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.ConveyorAny1');
            if(conveyorAny1 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny1, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        Building_Conveyor.teleporter.entry = marker.relatedTarget.options.pathName + '.ConveyorAny1';
                    }
            }

        if(Building_Conveyor.teleporter.entry !== null && Building_Conveyor.teleporter.exit !== null)
        {
            Building_Conveyor.validateTeleporter(baseLayout);
        }
    }

    static storeTeleporterExit(marker)
    {
        let baseLayout      = marker.baseLayout;
        let conveyorAny0    = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.ConveyorAny0');
            if(conveyorAny0 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny0, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        Building_Conveyor.teleporter.exit = marker.relatedTarget.options.pathName + '.ConveyorAny0';
                    }
            }

        if(Building_Conveyor.teleporter.entry !== null && Building_Conveyor.teleporter.exit !== null)
        {
            Building_Conveyor.validateTeleporter(baseLayout);
        }
    }

    static validateTeleporter(baseLayout)
    {
        let conveyorAny0    = baseLayout.saveGameParser.getTargetObject(Building_Conveyor.teleporter.exit);
            if(conveyorAny0 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny0, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        baseLayout.setObjectProperty(conveyorAny0, 'mConnectedComponent', {pathName: Building_Conveyor.teleporter.entry}, 'ObjectProperty');
                    }
            }

        let conveyorAny1    = baseLayout.saveGameParser.getTargetObject(Building_Conveyor.teleporter.entry);
            if(conveyorAny1 !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny1, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        baseLayout.setObjectProperty(conveyorAny1, 'mConnectedComponent', {pathName: Building_Conveyor.teleporter.exit}, 'ObjectProperty');
                    }
            }

        BaseLayout_Modal.notification({
            message: 'Conveyor belts teleporter added!'
        });

        Building_Conveyor.teleporter.entry  = null;
        Building_Conveyor.teleporter.exit   = null;
    }

    /**
     * DOWNGRADE/UPGRADE
     */
    static downgradeConveyor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_Conveyor.availableConveyorBelts;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
            {
                usePool = Building_Conveyor.availableConveyorLifts;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex > 0)
            {
                currentObject.className = usePool[poolIndex - 1];
                baseLayout.updateBuiltWithRecipe(currentObject);
            }
    }

    static upgradeConveyor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_Conveyor.availableConveyorBelts;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorLift') === true)
            {
                usePool = Building_Conveyor.availableConveyorLifts;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex < (usePool.length - 1))
            {
                currentObject.className = usePool[poolIndex + 1];
                baseLayout.updateBuiltWithRecipe(currentObject);
            }
    }



    /**
     * TOOLTIP
     */
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        //tooltipOptions.direction    = 'bottom';
        tooltipOptions.opacity      = 0.8;

        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mapLayer        = 'playerUnknownLayer';
            if(buildingData !== null)
            {
                mapLayer = buildingData.mapLayer;
            }

        let marker          = baseLayout.getMarkerFromPathName(currentObject.pathName, mapLayer);
            if(marker !== null)
            {
                let slotColor           = baseLayout.buildableSubSystem.getObjectPrimaryColor(currentObject);

                marker.setStyle({color: 'rgb(' + slotColor.r + ', ' + slotColor.g + ', ' + slotColor.b + ')'});
                marker.setDashArray();
            }

        // Loop conveyor children to find ConveyorAny connections
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let conveyorAny = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                if(conveyorAny !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny, 'mConnectedComponent');
                        if(mConnectedComponent !== null)
                        {
                            if(mConnectedComponent.pathName.endsWith('.ConveyorAny0') || mConnectedComponent.pathName.endsWith('.ConveyorAny1'))
                            {
                                let connectedComponent  = baseLayout.saveGameParser.getTargetObject(mConnectedComponent.pathName.replace('.ConveyorAny0', '').replace('.ConveyorAny1', ''));
                                    if(connectedComponent !== null)
                                    {
                                        let connectedMarker     = baseLayout.getMarkerFromPathName(connectedComponent.pathName, mapLayer);
                                            if(connectedMarker !== null)
                                            {
                                                connectedMarker.setStyle({color: '#00FF00'});
                                                connectedMarker.setDashArray();
                                            }
                                    }
                            }
                        }
                }
        }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let mapLayer        = 'playerUnknownLayer';
            if(buildingData !== null)
            {
                mapLayer = buildingData.mapLayer;
            }

        let marker          = baseLayout.getMarkerFromPathName(currentObject.pathName, mapLayer);
            if(marker !== null)
            {
                if(buildingData !== null)
                {
                    marker.setStyle({color: buildingData.mapColor});
                }

                marker.removeDashArray();
            }



        // Loop conveyor children to find ConveyorAny connections
        for(let i = 0; i < currentObject.children.length; i++)
        {
            let conveyorAny = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                if(conveyorAny !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(conveyorAny, 'mConnectedComponent');
                        if(mConnectedComponent !== null)
                        {
                            if(mConnectedComponent.pathName.endsWith('.ConveyorAny0') || mConnectedComponent.pathName.endsWith('.ConveyorAny1'))
                            {
                                let connectedComponent  = baseLayout.saveGameParser.getTargetObject(mConnectedComponent.pathName.replace('.ConveyorAny0', '').replace('.ConveyorAny1', ''));
                                    if(connectedComponent !== null)
                                    {
                                        let connectedMarker     = baseLayout.getMarkerFromPathName(connectedComponent.pathName, mapLayer);
                                            if(connectedMarker !== null)
                                            {
                                                connectedMarker.setStyle({color: buildingData.mapColor});
                                                connectedMarker.removeDashArray();
                                            }
                                    }
                            }
                        }
                }
        }
    }




    /**
     * MERGING CONVEYORS
     */
    static _doMergeNextConveyor(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorBelt') === true)
            {
                let middleConveyorAny1          = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.ConveyorAny1');
                let middleConveyorSplineData    = BaseLayout_Math.extractSplineData(baseLayout, currentObject);
                let offsetDistance              = middleConveyorSplineData.distance * 100;

                    // Merge next belt
                    if(middleConveyorAny1 !== null)
                    {
                        let mConnectedComponentAny1 = baseLayout.getObjectProperty(middleConveyorAny1, 'mConnectedComponent');
                            if(mConnectedComponentAny1 !== null)
                            {
                                let nextConveyorAny0 = baseLayout.saveGameParser.getTargetObject(mConnectedComponentAny1.pathName);
                                    if(nextConveyorAny0 !== null)
                                    {
                                        let nextConveyor = baseLayout.saveGameParser.getTargetObject(nextConveyorAny0.outerPathName)
                                            if(nextConveyor !== null && nextConveyor.className === currentObject.className)
                                            {
                                                // Append spline data to middle
                                                let middleSplineData    = baseLayout.getObjectProperty(currentObject, 'mSplineData');
                                                let nextSplineData      = baseLayout.getObjectProperty(nextConveyor, 'mSplineData');
                                                    for(let i = 0; i < nextSplineData.values.length; i++)
                                                    {
                                                        let newSplineData = nextSplineData.values[i];
                                                            for(let j = 0; j < newSplineData.length; j++)
                                                            {
                                                                if(newSplineData[j].name === 'Location')
                                                                {
                                                                    newSplineData[j].value.values.x += nextConveyor.transform.translation[0] - currentObject.transform.translation[0];
                                                                    newSplineData[j].value.values.y += nextConveyor.transform.translation[1] - currentObject.transform.translation[1];
                                                                    newSplineData[j].value.values.z += nextConveyor.transform.translation[2] - currentObject.transform.translation[2];
                                                                }
                                                            }
                                                            middleSplineData.values.push(newSplineData);
                                                    }

                                                // Append extra items to middle
                                                if(nextConveyor.extra.items.length > 0)
                                                {
                                                    for(let i = (nextConveyor.extra.items.length - 1); i >= 0; i--)
                                                    {
                                                        nextConveyor.extra.items[i].position += offsetDistance;
                                                        currentObject.extra.items.unshift(nextConveyor.extra.items[i]);
                                                    }
                                                }

                                                // Delete nextConveyorAny0
                                                baseLayout.saveGameParser.deleteObject(nextConveyorAny0.pathName);

                                                // Switch nextConveyorAny1 to middleConveyorAny1
                                                let nextConveyorAny1 = baseLayout.saveGameParser.getTargetObject(nextConveyor.pathName + '.ConveyorAny1');
                                                    if(nextConveyorAny1 !== null)
                                                    {
                                                        let mNextConnectedComponentAny1     = baseLayout.getObjectProperty(nextConveyorAny1, 'mConnectedComponent');
                                                            if(mNextConnectedComponentAny1 !== null)
                                                            {
                                                                baseLayout.setObjectProperty(middleConveyorAny1, 'mConnectedComponent', mNextConnectedComponentAny1);

                                                                let inputConnectedComponent = baseLayout.saveGameParser.getTargetObject(mNextConnectedComponentAny1.pathName);
                                                                    if(inputConnectedComponent !== null)
                                                                    {
                                                                        baseLayout.setObjectProperty(inputConnectedComponent, 'mConnectedComponent', {
                                                                            pathName    : middleConveyorAny1.pathName
                                                                        });
                                                                    }

                                                            }

                                                        baseLayout.saveGameParser.deleteObject(nextConveyorAny1.pathName);
                                                    }

                                                // Delete nextConveyor!
                                                baseLayout.deleteGenericBuilding({baseLayout: baseLayout, relatedTarget: baseLayout.getMarkerFromPathName(nextConveyor.pathName, buildingData.layerId)})

                                                // Redraw middle conveyor!
                                                baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: JSON.parse(JSON.stringify(currentObject.transform)), object: currentObject});
                                                return true;
                                            }
                                    }
                            }
                    }
            }

        return false;
    }

    static _doMergeConveyors(marker)
    {
        let baseLayout          = marker.baseLayout;
        let haveMergedPrevious  = false;
        let haveMergedNext      = false;
        let mergesMade          = 0;

        do
        {
            let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
            let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/ConveyorBelt') === true)
            {
                    let middleConveyorAny0          = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.ConveyorAny0');
                        haveMergedPrevious          = false;

                        // Merge previous belt?
                        if(middleConveyorAny0 !== null)
                        {
                            let mConnectedComponent = baseLayout.getObjectProperty(middleConveyorAny0, 'mConnectedComponent');
                                if(mConnectedComponent !== null)
                                {
                                    let previousConveyorAny1 = baseLayout.saveGameParser.getTargetObject(mConnectedComponent.pathName);
                                        if(previousConveyorAny1 !== null)
                                        {
                                            let previousConveyor = baseLayout.saveGameParser.getTargetObject(previousConveyorAny1.outerPathName)
                                                if(previousConveyor !== null && previousConveyor.className === currentObject.className)
                                                {
                                                    // Find previous marker and pivot
                                                    let previousMarker = baseLayout.getMarkerFromPathName(previousConveyor.pathName, buildingData.layerId);
                                                        if(previousMarker !== null)
                                                        {
                                                            haveMergedPrevious = Building_Conveyor._doMergeNextConveyor({baseLayout: baseLayout, relatedTarget: previousMarker});
                                                            if(haveMergedPrevious === true)
                                                            {
                                                                marker = {baseLayout: baseLayout, relatedTarget: baseLayout.getMarkerFromPathName(previousConveyor.pathName, buildingData.layerId)};
                                                                mergesMade++;
                                                            }
                                                        }

                                                }
                                        }
                                }
                        }

                    // Merge next belt
                    haveMergedNext = Building_Conveyor._doMergeNextConveyor(marker);
                    if(haveMergedNext)
                    {
                        mergesMade++;
                    }
                }
        }
        while(haveMergedNext || haveMergedPrevious);

        return mergesMade;
    }

    static mergeConveyors(marker)
    {
        const baseLayout        = marker.baseLayout;
        const currentObject     = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        const buildingData      = baseLayout.getBuildingDataFromClassName(currentObject.className);
        const mergesMade        = Building_Conveyor._doMergeConveyors(marker);

        if(mergesMade > 0)
        {
            BaseLayout_Modal.notification({
                image   : buildingData.image,
                title   : 'Merge adjacent conveyor belts',
                message : `Are you nuts?!<br />Conveyor belts merged: ${mergesMade}.`
            });
        }
    }
}

if('undefined' !== typeof L) // Avoid worker error
{
    L.Conveyor = L.Polyline.extend({
        initialize: function(latlngs, options)
        {
            L.Polyline.prototype.initialize.call(this, latlngs, options);

            this.weight = options.weight;

            let self                = this;
                this.updateCallback = function()
                {
                    self._updateWeight(this);
                };
        },

        onAdd: function(map)
        {
            L.Polyline.prototype.onAdd.call(this, map);
            map.on('zoomend', this.updateCallback);
            this._updateWeight(map);
        },

        onRemove: function(map)
        {
            map.off('zoomend', this.updateCallback);
            L.Polyline.prototype.onRemove.call(this, map);
        },

        setDashArray()
        {
            // Check conveyor direction
            let flowDirection   = 1;
            let conveyorAny0    = this.baseLayout.saveGameParser.getTargetObject(this.options.pathName + '.ConveyorAny0'); //TODO: Dynamic?!
                if(conveyorAny0 !== null)
                {
                    let mDirection = this.baseLayout.getObjectProperty(conveyorAny0, 'mDirection');
                        if(mDirection.value === 'EFactoryConnectionDirection::FCD_INPUT')
                        {
                            flowDirection = -1;
                        }
                }

            // Flow animation
            this.options.currentDashOffset  = 0;
            this.options.dashArrayAnimation = setInterval(function(){
                this.options.currentDashOffset++;
                this.setStyle({
                    dashOffset: flowDirection * this.options.currentDashOffset * (this.options.weight / 4)
                });
            }.bind(this), 25);

            return this.setStyle({dashArray: (this.options.weight * 1.5) + " " + (this.options.weight  * 1.5)});
        },

        removeDashArray()
        {
            clearInterval(this.options.dashArrayAnimation);
            return this.setStyle({dashArray: null});
        },

        _updateWeight: function(map)
        {
            let currentWeight   = this._getWeight(map, this.weight);

            return this.setStyle({weight: currentWeight});
        },

        _getWeight: function(map, weight)
        {
            let position    = [window.SCIM.map.unproject([0, 0]), window.SCIM.map.unproject([10000, 0])];
            let meterWeight = map.latLngToContainerPoint(position[1]).x - map.latLngToContainerPoint(position[0]).x;

            return Math.max(2, (weight / 10000 * meterWeight));
        }
    });

    L.conveyor = function(latlngs, options)
    {
        return new L.Conveyor(latlngs, options || { weight: 100 });
    };

    (function(){
        let _originalFillStroke = L.Canvas.prototype._fillStroke;
            L.Canvas.include({
                _fillStroke: function(ctx, layer)
                {
                    //TODO: Wait for https://github.com/Leaflet/Leaflet/pull/7867
                    ctx.lineDashOffset = Number(layer.options.dashOffset || 0);

                    return _originalFillStroke.call(this, ctx, layer);
                }
            });
    })();
}
/* global L */

import Modal                                    from '../Modal.js';

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';

export default class Building_Light
{
    /**
     * STATE
     */
    static getControlData(baseLayout, currentObject)
    {
        let mLightControlData = baseLayout.getObjectProperty(currentObject, 'mLightControlData');
            if(mLightControlData === null)
            {
                currentObject.properties.push({
                    name    : "mLightControlData",
                    type    : "StructProperty",
                    value   : { type: "LightSourceControlData", values: [] }
                });

                mLightControlData = baseLayout.getObjectProperty(currentObject, 'mLightControlData');
            }

            return mLightControlData;
    }

    static getColorSlotIndex(baseLayout, currentObject)
    {
        let mLightControlData = Building_Light.getControlData(baseLayout, currentObject);
            if(mLightControlData !== null)
            {
                for(let i = 0; i < mLightControlData.values.length; i++)
                {
                    if(mLightControlData.values[i].name === 'ColorSlotIndex')
                    {
                        return mLightControlData.values[i].value;
                    }
                }
            }


        return 0;
    }

    static getIntensity(baseLayout, currentObject)
    {
        let mLightControlData = Building_Light.getControlData(baseLayout, currentObject);
            if(mLightControlData !== null)
            {
                for(let i = 0; i < mLightControlData.values.length; i++)
                {
                    if(mLightControlData.values[i].name === 'Intensity')
                    {
                        return Math.round(mLightControlData.values[i].value * 5);
                    }
                }
            }

        return 50;
    }

    static getIsTimeOfDayAware(baseLayout, currentObject)
    {
        let mLightControlData = Building_Light.getControlData(baseLayout, currentObject);
            if(mLightControlData !== null)
            {
                for(let i = 0; i < mLightControlData.values.length; i++)
                {
                    if(mLightControlData.values[i].name === 'IsTimeOfDayAware' && mLightControlData.values[i].value === 1)
                    {
                        return true;
                    }
                }
            }

        return false;
    }

    /**
     * HALO MARKER
     */
    static hasHalo(baseLayout, currentObject)
    {
        if(baseLayout.getBuildingIsOn(currentObject) === false)
        {
            return false;
        }

        return true;
    }

    static getHaloRadius(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/CeilingLight/Build_CeilingLight.Build_CeilingLight_C')
        {
            return 0.25;
        }

        return 0.12;
    }

    static getHaloGradient(baseLayout, currentObject)
    {
        let gradientStops                   = {};
        let intensity                       = Building_Light.getIntensity(baseLayout, currentObject);

        let buildableSubSystem              = new SubSystem_Buildable({baseLayout: baseLayout});
        let color                           = buildableSubSystem.getObjectLightColor(currentObject);

            gradientStops[0]              = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', 1)';

            if(intensity < 100)
            {
                gradientStops[intensity / 100]  = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', 0.2)';
            }

            gradientStops[1]            = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', 0)';

        return gradientStops;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);

        contextMenu.push({
            text: 'Update "' + buildingData.name + '" light color slot',
            callback: Building_Light.updateLightColorSlot
        });
        contextMenu.push({
            text: 'Update "' + buildingData.name + '" intensity',
            callback: Building_Light.updateIntensity
        });
        contextMenu.push({
            text: 'Turn "' + buildingData.name + '" night mode ' + ((Building_Light.getIsTimeOfDayAware(baseLayout, currentObject) === false) ? '<strong class="text-success">On' : '<strong class="text-danger">Off</strong>'),
            callback: Building_Light.updateState
        });
        contextMenu.push({separator: true});

        return contextMenu;
    }

    /**
     * TOOLTIP
     */

    /**
     * MODALS
     */
    static updateLightColorSlot(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let buildableSubSystem  = new SubSystem_Buildable({baseLayout: baseLayout});
        let slotIndex           = Building_Light.getColorSlotIndex(baseLayout, currentObject);
        let playerColors        = buildableSubSystem.getPlayerLightColorSlots();
        let selectOptions       = [];

        for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalLightColorSlots; slotIndex++)
        {
            selectOptions.push({
                primaryColor    : 'rgb(' + playerColors[slotIndex].r + ', ' + playerColors[slotIndex].g + ', ' + playerColors[slotIndex].b + ')',
                value           : slotIndex,
                text            : '#' + (slotIndex + 1)
            });
        }

        Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" light color slot',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'slotIndex',
                inputType       : 'colorSlots',
                inputOptions    : selectOptions,
                value           : slotIndex
            }],
            callback    : function(values)
            {
                if(values === null)
                {
                    return;
                }

                let mLightControlData   = Building_Light.getControlData(this, currentObject);
                    if(mLightControlData !== null)
                    {
                        let newSlotIndex = parseInt(values.slotIndex);

                        if(slotIndex === 0)
                        {
                            mLightControlData.values.push({name: "ColorSlotIndex", type: "IntProperty", value: newSlotIndex});
                        }
                        else
                        {
                            for(let i = 0; i < mLightControlData.values.length; i++)
                            {
                                if(mLightControlData.values[i].name === 'ColorSlotIndex')
                                {
                                    if(newSlotIndex === 0)
                                    {
                                        mLightControlData.values.splice(i, 1);
                                    }
                                    else
                                    {
                                        mLightControlData.values[i].value = newSlotIndex;
                                    }
                                }
                            }
                        }

                        if(marker.relatedTarget.options.haloMarker !== undefined)
                        {
                            this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.relatedTarget.options.haloMarker);
                        }
                        this.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
                    }
            }.bind(baseLayout)
        });
    }

    static updateIntensity(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.pauseMap();
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let intensity       = Building_Light.getIntensity(baseLayout, currentObject);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" intensity',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'intensity',
                    inputType   : 'number',
                    min         : 0,
                    max         : 100,
                    value       : Math.round(intensity)
                }],
                callback    : function(values)
                {
                    this.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }

                    let mLightControlData = Building_Light.getControlData(this, currentObject);
                        if(mLightControlData !== null)
                        {
                            let newIntensity = parseFloat(values.intensity);

                            if(intensity === 50)
                            {
                                mLightControlData.values.push({name: "Intensity", type: "FloatProperty", value: (newIntensity / 5)});
                            }
                            else
                            {
                                for(let i = 0; i < mLightControlData.values.length; i++)
                                {
                                    if(mLightControlData.values[i].name === 'Intensity')
                                    {
                                        if(newIntensity === 50)
                                        {
                                            mLightControlData.values.splice(i, 1);
                                        }
                                        else
                                        {
                                            mLightControlData.values[i].value = (newIntensity / 5);
                                        }
                                    }
                                }
                            }

                            if(marker.relatedTarget.options.haloMarker !== undefined)
                            {
                                this.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.relatedTarget.options.haloMarker);
                            }
                            this.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
                        }
                }.bind(baseLayout)
            });
    }

    static updateState(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let isTimeOfDayAware    = Building_Light.getIsTimeOfDayAware(baseLayout, currentObject);

            let mLightControlData = Building_Light.getControlData(baseLayout, currentObject);
                if(mLightControlData !== null)
                {
                    if(isTimeOfDayAware === false)
                    {
                        mLightControlData.values.push({name: "IsTimeOfDayAware", type: "BoolProperty", value: 1});
                    }
                    else
                    {
                        for(let i = 0; i < mLightControlData.values.length; i++)
                        {
                            if(mLightControlData.values[i].name === 'IsTimeOfDayAware')
                            {
                                mLightControlData.values.splice(i, 1);
                            }
                        }
                    }

                    if(marker.relatedTarget.options.haloMarker !== undefined)
                    {
                        baseLayout.playerLayers.playerLightsHaloLayer.subLayer.removeLayer(marker.relatedTarget.options.haloMarker);
                    }
                    baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: currentObject.transform, object: currentObject});
                }
    }
}

L.Canvas.include({
    _updateGradientCircle: function(layer)
    {
        if (!this._drawing || layer._empty()) { return; }

        var p   = layer._point,
            ctx = this._ctx,
            r   = Math.max(Math.round(layer._radius), 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2, false);

        let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            if(layer.options.gradient !== undefined)
            {
                for(let stop in layer.options.gradient)
                {
                    gradient.addColorStop(stop, layer.options.gradient[stop]);
                }
            }
            else
            {
                gradient.addColorStop(0, 'white');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
        ctx.fillStyle = gradient;
        ctx.fill();
    }
});
L.HaloCircle = L.Circle.extend({
    _updatePath: function()
    {
        this._renderer._updateGradientCircle(this);
    }
});
L.haloCircle = function (latlng, options) {
    return new L.HaloCircle(latlng, options);
};
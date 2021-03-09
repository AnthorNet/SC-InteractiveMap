/* global L */

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
    static hasHalo(currentObject)
    {


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

    /**
     * TOOLTIP
     */
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
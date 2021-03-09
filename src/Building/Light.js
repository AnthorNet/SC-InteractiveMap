/* global L */

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';

export default class Building_Light
{

    static getHaloCoordinates()
    {

    }

    static getHaloRadius(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/CeilingLight/Build_CeilingLight.Build_CeilingLight_C')
        {
            return 0.12;
        }

        return 0.075;
    }

}

L.Canvas.include({
    _updateGradientCircle: function(layer)
    {

        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.max(Math.round(layer._radius), 1),
            s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

        if (s !== 1) {
                ctx.save();
                ctx.scale(1, s);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

        let gradient = ctx.createRadialGradient(layer._point.x, layer._point.y, 0, layer._point.x, layer._point.y, r);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0');
        ctx.fillStyle = gradient;
        ctx.fill();

        if (s !== 1) {
                ctx.restore();
        }
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
/*
 {
            "name": "mLightControlData",
            "type": "StructProperty",
            "value": {
                "type": "LightSourceControlData",
                "values": [
                    {
                        "name": "ColorSlotIndex",
                        "type": "IntProperty",
                        "value": 6
                    },
                    {
                        "name": "Intensity",
                        "type": "FloatProperty",
                        "value": 6.311568737030029
                    },
                    {
                        "name": "IsTimeOfDayAware",
                        "type": "BoolProperty",
                        "value": 1
                    }
                ]
            }
        }
 */
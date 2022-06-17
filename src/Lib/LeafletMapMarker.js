L.MapMarker = L.CircleMarker.extend({
    options: {
        fillOpacity : 1,

        iconAnchor  : [48, 78],
        iconSize    : [50, 80]
    },

    setOpacity: function(opacity)
    {
        this.options.fillOpacity    = opacity;
        this.options.opacity        = opacity;

        return this.redraw();
    },

    onAdd: function(map)
    {
        this.on({mouseover: this.bringToFront});

        this._renderer._initPath(this);
        this._reset();
        this._renderer._addPath(this);
    },

    _updatePath: function()
    {
        let $this = this;
        if(this._renderer.mapMarkerImages[this.options.icon] === undefined)
        {
            let image           = new Image();
                image.onload    = function(){
                    $this._renderer.mapMarkerImages[$this.options.icon] = this;
                    $this._renderer._updateMapMarker($this);
                    return $this.redraw();
                };
                image.src       = this.options.icon;
        }
        else
        {
            return this._renderer._updateMapMarker(this);
        }
    },

    _project: function () {
        this._mRadius = 0.55;


        var map = this._map,
            crs = map.options.crs;

        var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

            this._point = map.latLngToLayerPoint(this._latlng);
            this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;

        return this._updateBounds();
    }
});

 export default function mapMarker(latlng, options){
    return new L.MapMarker(latlng, options);
};

L.Canvas.include({
    mapMarkerImages: {},

    _updateMapMarker: function(layer)
    {

        if (!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            r = Math.min(50, Math.max(Math.round(layer._radius), 1));

            //console.log(p, r)

            ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        var options = layer.options;

        if (options.fill) {
                ctx.globalAlpha = options.fillOpacity;
                ctx.fillStyle = options.fillColor || options.color;
                ctx.fill(options.fillRule || 'evenodd');
        }

        if (options.stroke && options.weight !== 0) {
                if (ctx.setLineDash) {
                        ctx.setLineDash(layer.options && layer.options._dashArray || []);
                }
                ctx.globalAlpha = options.opacity;
                ctx.lineWidth = options.weight;
                ctx.strokeStyle = options.color;
                ctx.lineCap = options.lineCap;
                ctx.lineJoin = options.lineJoin;
                ctx.stroke();
        }

        ctx.globalAlpha = options.fillOpacity;
        ctx.drawImage(this.mapMarkerImages[layer.options.icon], p.x - (r / 2), p.y - (r / 2), r, r);


        //ctx.moveTo(p.x + innerR, p.y);
        //ctx.arc(innerP.x, innerP.y / innerS, innerR, 0, Math.PI * 2, true);;
    }
});

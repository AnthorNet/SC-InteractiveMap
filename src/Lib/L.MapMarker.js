export default class Lib_MapMarker {} // Used for webpack importing...

if('undefined' !== typeof L) // Avoid worker error
{
    L.MapMarker = L.CircleMarker.extend({
        options: {
            radiusRatio : 0.6,

            riseOnHover : true,
            fillOpacity : 1,
            fillColor   : '#FFFFFF',
            color       : '#666666',

            iconAnchor  : [48, 78],
            iconSize    : [50, 80]
        },

        getRadius: function()
        {
            return Math.min(40, Math.max(Math.round(this._radius), 15));
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

        onRemove: function(map)
        {
            this.off({mouseover: this.bringToFront});

            this._renderer._removePath(this);
        },

        bringToFront: function () {
                    if (this._renderer) {
                            this._renderer._bringToFront(this);
                            this._renderer._updateMapMarker(this);
                    }
                    return this.redraw();
            },

        _updatePath: function(redraw = false)
        {
            let $this = this;
                if(this._renderer.mapMarkerImages[this.options.icon] === undefined)
                {
                    let image           = new Image();
                        image.onload    = function(){
                            $this._renderer.mapMarkerImages[$this.options.icon] = this;
                            return $this._updatePath(true);
                        };
                        image.src       = this.options.icon;

                    return;
                }
                else
                {
                    if(this.options.extraIcon !== undefined)
                    {
                        if(this._renderer.mapMarkerImages[this.options.extraIcon] === undefined)
                        {
                            let image           = new Image();
                                image.onload    = function(){
                                    $this._renderer.mapMarkerImages[$this.options.extraIcon] = this;
                                    return $this._updatePath(true);
                                };
                                image.src       = this.options.extraIcon;

                            return;
                        }
                    }
                }

            this._renderer._updateMapMarker(this);
            if(redraw === true)
            {
                this.redraw();
            }
            return;
        },

        _project: function () {
            let latlngRadius    = this._map.options.crs.unproject(this._map.options.crs.project(this._latlng).subtract([this.options.radiusRatio, 0]));
                this._point     = this._map.latLngToLayerPoint(this._latlng);
                this._radius    = this._point.x - this._map.latLngToLayerPoint(latlngRadius).x;

            let latlngOffset    = this._map.options.crs.unproject(this._map.options.crs.project(this._latlng).subtract(this.options.iconAnchor));
                this._offset    = [
                    Math.min(50, (this._point.x - this._map.latLngToLayerPoint(latlngOffset).x) / 75),
                    Math.min(83.333, -(this._point.y - this._map.latLngToLayerPoint(latlngOffset).y) / 75)
                ];

            return this._updateBounds();
        },

        _updateBounds: function () { //TODO: Calculate exact Bound based on offset, used for redraw
            let point       = new L.point(this._point.x - this._offset[0], this._point.y - this._offset[1]);
            let r           = this._radius,
                r2          = this._radiusY || r,
                w           = this._clickTolerance() + this._offset[0] , // Added offset to fake the lower part
                p           = [r + w, r2 + w];
            this._pxBounds  = new L.Bounds(point.subtract(p), point.add(p));
        },

        // Needed by the `Canvas` renderer for interactivity
        _containsPoint: function (p) {
            let point = new L.point(this._point.x - this._offset[0], this._point.y - this._offset[1]);
                return p.distanceTo(point) <= this.getRadius() + this._clickTolerance();
        }
    });

    L.mapMarker = function(latlng, options){
        return new L.MapMarker(latlng, options);
    };

    L.Canvas.include({
        mapMarkerImages : {},
        _updateMapMarker: function(layer)
        {
            if (!this._drawing || layer._empty()){ return; }

            var p       = layer._point,
                ctx     = this._ctx,
                radius  = layer.getRadius(),
                offset  = layer._offset;

            // Doing two passes so we can begin a new path
            for(let i = 0; i <= 1; i++)
            {
                ctx.beginPath();

                if(i === 0)
                {
                    // Central dot
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);

                    // Anchor line
                    let xLength = (p.x - offset[0]) - p.x;
                    let yLength = (p.y - offset[1]) - p.y;
                    let hLength = Math.sqrt(Math.pow(xLength,2) + Math.pow(yLength,2));

                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(
                        (p.x + (xLength * ((hLength - radius) / hLength))),
                        (p.y + (yLength * ((hLength - radius) / hLength)))
                    );
                }

                if(i === 1)
                {
                    // Main circle
                    ctx.arc(p.x - offset[0], p.y - offset[1], radius, 0, Math.PI * 2);

                    if(layer.options.fill)
                    {
                        ctx.globalAlpha = layer.options.fillOpacity;
                        ctx.fillStyle   = layer.options.fillColor || layer.options.color;
                        ctx.fill(layer.options.fillRule || 'evenodd');
                    }
                }

                if(layer.options.stroke && layer.options.weight !== 0)
                {
                    if(ctx.setLineDash)
                    {
                        ctx.setLineDash(layer.options && layer.options._dashArray || []);
                    }

                    ctx.globalAlpha = layer.options.opacity;
                    ctx.lineWidth   = layer.options.weight * (radius / 35);
                    ctx.strokeStyle = layer.options.color;
                    ctx.lineCap     = layer.options.lineCap;
                    ctx.lineJoin    = layer.options.lineJoin;
                    ctx.stroke();
                }

                ctx.globalAlpha = layer.options.fillOpacity;

                if(i === 1)
                {
                    if(layer.options.icon !== undefined)
                    {
                        let imageSize = radius * 1.4;
                            ctx.drawImage(
                                this.mapMarkerImages[layer.options.icon],
                                p.x - offset[0] - (imageSize / 2),
                                p.y - offset[1] - (imageSize / 2),
                                imageSize,
                                imageSize
                            );
                    }
                    if(layer.options.extraIcon !== undefined)
                    {
                        let imageSize = radius * 0.9;
                            ctx.drawImage(
                                this.mapMarkerImages[layer.options.extraIcon],
                                p.x - offset[0] + (imageSize / 4),
                                p.y - offset[1] + (imageSize / 3),
                                imageSize,
                                imageSize
                            );
                    }
                }
            }
        }
    });
}
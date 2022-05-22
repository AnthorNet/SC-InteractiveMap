/* global Infinity */

export default class Lib_LeafletPlugins {} // Used for webpack importing...

/**
 * Slider to control altitude shown
 */
L.Control.SliderControl = L.Control.extend({
    options: {
        position                            : 'topright',
        maxAltitude                         : Infinity,
        minAltitude                         : -Infinity,
        updateAltitudeLayersIsRunning       : false,
        updateAltitudeLayersIsRunningInputs : false
    },

    initialize: function(options)
    {
        L.Util.setOptions(this, options);
    },

    onAdd: function(map)
    {
        this.options.map    = map;
        let sliderContainer = L.DomUtil.create('div', 'slider altitudeSlider', this._container);
            $(sliderContainer).append('<div id="leaflet-slider"><input id="altitudeSlider" type="text" /></div>');

        $('#altitudeSliderInputs input[name=minAltitude]').val(Math.round(this.options.minAltitude / 100));
        $('#altitudeSliderInputs input[name=maxAltitude]').val(Math.round(this.options.maxAltitude / 100));
        $('#altitudeSliderInputs').show();

        $('#altitudeSliderInputs input').on('keyup change', function(){
            if(this.options.updateAltitudeLayersIsRunningInputs !== false)
            {
                clearTimeout(this.options.updateAltitudeLayersIsRunningInputs);
            }

            this.options.updateAltitudeLayersIsRunningInputs = setTimeout(function(){
                let minAltitude = parseFloat($('#altitudeSliderInputs input[name=minAltitude]').val()) * 100;
                let maxAltitude = parseFloat($('#altitudeSliderInputs input[name=maxAltitude]').val()) * 100;

                    if(!isNaN(minAltitude) && !isNaN(maxAltitude))
                    {
                        this.options.leafletSlider.slider('setValue', [minAltitude, maxAltitude], true);
                        this.options.leafletSlider.slider('refresh', { useCurrentValue: true });
                    }
            }.bind(this), 100);
        }.bind(this));

        return sliderContainer;
    },

    onRemove: function()
    {
        $('#leaflet-slider').remove();
        $(document).off("mouseup");
        $('#altitudeSliderInputs input').off('keyup change');
        $(".slider").off("mousedown");
    },

    startSlider: function()
    {
        if($.fn.slider)
        {
            this.options.leafletSlider  = $("#leaflet-slider").slider({
                orientation         : 'vertical',
                reversed            : true,
                range               : true,
                min                 : this.options.minAltitude,
                max                 : this.options.maxAltitude,
                value               : [this.options.minAltitude, this.options.maxAltitude],

                tooltip_split       : true,
                tooltip_position    : 'left',
                formatter           : function(value){
                    return 'Z: ' + Math.round(value / 100) + 'm';
                },

                step: 100
            });

            this.options.leafletSlider.on('slide', function(slideEvt){
                this.options.map.dragging.disable();

                if(this.options.updateAltitudeLayersIsRunning !== false)
                {
                    clearTimeout(this.options.updateAltitudeLayersIsRunning);
                }

                this.options.updateAltitudeLayersIsRunning = setTimeout(function(){
                    this.options.baseLayout.updateAltitudeLayers(slideEvt.value[0], slideEvt.value[1]);

                    $('#altitudeSliderInputs input[name=minAltitude]').val(Math.round(slideEvt.value[0] / 100));
                    $('#altitudeSliderInputs input[name=maxAltitude]').val(Math.round(slideEvt.value[1] / 100));

                    this.options.map.dragging.enable();
                }.bind(this), 10);
            }.bind(this));
        }
    },

    updateSliderAltitudes(minAltitude, maxAltitude)
    {
        this.options.minAltitude    = Math.floor(minAltitude);
        this.options.maxAltitude    = Math.ceil(maxAltitude);

        this.options.leafletSlider.slider('setAttribute', 'min', this.options.minAltitude);
        this.options.leafletSlider.slider('setAttribute', 'max', this.options.maxAltitude);
        this.options.leafletSlider.slider('refresh', { useCurrentValue: true });
    }
});

L.control.sliderControl = function(options)
{
    return new L.Control.SliderControl(options);
};

L.TileLayer.include({
    renderToCanvas: function(callback) {
        // Defer until we're done loading tiles
        if (this._loading) {
            return this.once('load', () => {
                this.renderToCanvas(callback);
            });
        }

        const map = this._map;
        if (!map) {
            return callback(new Error('Unable to render to canvas: No map!'));
        }

        if (this._tileZoom === undefined) {
            return callback(new Error('Unable to render to canvas: Zoom out of range!'));;
        }

        const zoom = this._clampZoom(map.getZoom());
        const layerScale = map.getZoomScale(zoom, this._tileZoom);
        const level = this._levels[this._tileZoom];
        const pixelOrigin = map._getNewPixelOrigin(map.getCenter(), zoom);
        const layerTranslate = level.origin.multiplyBy(layerScale).subtract(pixelOrigin);
        const mapTranslate = map.layerPointToContainerPoint([0, 0]);
        const tileSize = this.getTileSize();
        const scaledSize = tileSize.multiplyBy(layerScale);
        const canvasDimensions = map.getSize();

        // This canvas is the size of all the tiles that are currently visible, partial or otherwise:
        const canvas = document.createElement('canvas');
        canvas.width = canvasDimensions.x;
        canvas.height = canvasDimensions.y;
        const context = canvas.getContext('2d');

        // render all the tiles into the canvas:
        for (const key in this._tiles) {
            const tile = this._tiles[key];
            if (!tile.current) {
                console.warn(`Missing tile ${tile.coords}`, tile);
                continue;
            } else {
                const offset = this._getTilePos(tile.coords).multiplyBy(layerScale).add(layerTranslate).add(mapTranslate);
                context.drawImage(tile.el, 0, 0, tileSize.x, tileSize.y, offset.x, offset.y, scaledSize.x, scaledSize.y);
            }
        }

        return callback(null, canvas);
    }
});

const eachAsync = (arr, callback, done) => {
    let i = 0;
    const len = arr.length;
    let next = (err) => {
        if (err) {
            return done(err);
        }

        if (i < len) {
            callback(arr[i], () => {
                i++;
                requestAnimationFrame(() => next());
            });
        } else {
            done();
        }
    };

    return next();
}

L.Map.include({
    _renderOverlay: function() {
        if (!this._panes) {
            return null;
        }

        const overlay = this._panes.overlayPane.getElementsByTagName('canvas').item(0);
        if (!overlay) {
            return null;
        }

        const dimensions = this.getSize();
        const bounds = this.getPixelBounds(),
            origin = this.getPixelOrigin(),
            canvas = document.createElement('canvas');
        canvas.width = dimensions.x;
        canvas.height = dimensions.y;
        var ctx = canvas.getContext('2d');
        var pos = L.DomUtil.getPosition(overlay).subtract(bounds.min).add(origin);
        try {
            ctx.drawImage(overlay, pos.x, pos.y, canvas.width - (pos.x * 2), canvas.height - (pos.y * 2));
            return canvas;
        } catch(e) {
            console.error('Element could not be drawn on canvas', canvas); // eslint-disable-line no-console
        }
        return null;
    },

    renderToCanvas: function(callback) {
        const layers = [];
        const tileLayers = Object.values(this._layers).filter(l => l instanceof L.TileLayer);
        eachAsync(tileLayers, (layer, next) => {
            layer.renderToCanvas((err, canvas) => {
                if (err) {
                    return next(err);
                }
                layers.push(canvas);
                next();
            });
        }, (err) => {
            if (err) {
                return callback(err);
            }

            const overlay = this._renderOverlay();
            // if we have an overlay layer, draw it last
            if (overlay) {
                layers.push(overlay);
            }

            const dimensions = this.getSize();
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = dimensions.x;
            finalCanvas.height = dimensions.y;
            const ctx = finalCanvas.getContext('2d');

            // composite the layers in order
            layers.forEach((layer) => {
                ctx.drawImage(layer, 0, 0);
            });

            callback(null, finalCanvas);
        });
    }
});

L.Control.ExportControl = L.Control.extend({
    options: {
        position: 'topleft',
    },

    initialize: function(options)
    {
        L.Util.setOptions(this, options);
    },

    onAdd: function(map)
    {
        this.options.map = map;
        const className = 'leaflet-control-zoom leaflet-bar';
        const container = L.DomUtil.create('div', className);

        const button = L.DomUtil.create('a', 'leaflet-control-selection leaflet-bar-part', container);
        button.innerHTML = '<i class="far fa-camera"></i>';
        button.href = '#';
        button.title = 'Export current view as image';
        button.dataset.hover = 'tooltip';
        button.dataset.placement = 'right';

        L.DomEvent
            .on(button, 'click', L.DomEvent.stopPropagation)
            .on(button, 'click', L.DomEvent.preventDefault)
            .on(button, 'click', this._exportImage, this)
            .on(button, 'dbclick', L.DomEvent.stopPropagation);

        return container;
    },

    onRemove: function(){},

    _exportImage: function() {
        window.SCIM.exportImage();
    }
});

L.control.exportControl = function(options) {
    return new L.Control.ExportControl(options);
};
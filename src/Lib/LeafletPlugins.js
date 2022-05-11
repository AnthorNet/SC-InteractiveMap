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
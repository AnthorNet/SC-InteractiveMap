/* global iro */
import BaseLayout_Math                          from '../../BaseLayout/Math.js';

export default class Modal_Map_Presets
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;
        this.clipboard  = (this.baseLayout.localStorage !== null && this.baseLayout.localStorage.getItem('colorPresetsClipboard') !== null) ? JSON.parse(this.baseLayout.localStorage.getItem('colorPresetsClipboard')) : [];
    }

    parse(activePreset = 0)
    {
        $('#statisticsPlayerPresets').empty();

        let html    = [];
        let presets = this.baseLayout.gameStateSubSystem.getPlayerColorPresets();

            if(presets !== null)
            {
                for(let i = 0; i < presets.length; i++)
                {
                    if(i > 0)
                    {
                        html.push('<hr class="border-secondary">');
                    }

                    let style = [];
                        style.push('background: rgb(' + presets[i].primaryColor.r + ', ' + presets[i].primaryColor.g + ', ' + presets[i].primaryColor.b + ');');
                        style.push('position: relative;height: 32px;border-radius: 5px;margin: 2px;');
                        style.push(((i === activePreset) ? 'border: 3px solid #FFF;' : 'border: 1px solid #000;'));
                        style.push('cursor: pointer;');

                    html.push('<div class="row align-items-center">');
                        html.push('<div class="col-7"><h5 class="mb-0">' + presets[i].name + '</h5></div>');
                        html.push('<div class="col-3">');
                            html.push('<div class="d-flex flex-row selectColorPreset ' + ((i === activePreset) ? 'active ' : '') + 'align-items-center" style="' + style.join('') + '" data-preset="' + i + '">');
                            html.push('</div>');
                        html.push('</div>');
                        html.push('<div class="col-2 text-center">');
                            //html.push('<span class="btn btn-secondary mr-1 btn-copy" data-hover="tooltip" title="Copy preset"><i class="fas fa-copy"></i></span>');
                            html.push('<span class="btn btn-danger ml-1 btn-delete" data-hover="tooltip" title="Delete preset"><i class="fas fa-trash"></i></span>');
                        html.push('</div>');
                    html.push('</div>');
                }

                html.push('<div class="row mt-3">');
                    html.push('<div class="col-12">');
                        html.push('<div class="btn btn-success w-100 text-center btn-add"><i class="fas fa-plus mr-1"></i> Add a new color preset</div>');
                    html.push('</div>');
                html.push('</div>');

                $('#statisticsPlayerPresets').html('<div class="row">'
                    + '  <div class="col-7 align-self-center">' + html.join('') + '</div>'
                    + '  <div class="col-5">'
                    + '      <div class="row">'
                    + '          <div class="col-12">'
                    + '              <div id="presetColorPicker" class="text-center"></div>'
                    + '              <div class="row mt-3 no-gutters">'
                    + '                  <div class="input-group col-12">'
                    + '                      <div class="input-group-prepend">'
                    + '                          <span class="input-group-text" style="width: 70px">HEX</span>'
                    + '                      </div>'
                    + '                      <input type="text" class="form-control text-center" value="" id="presetColorInputHex">'
                    + '                  </div>'
                    + '              </div>'
                    + '              <div class="row mt-1 no-gutters">'
                    + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + presets[activePreset].primaryColor.r + '" min="0" max="255" id="presetColorInputR" /></div>'
                    + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + presets[activePreset].primaryColor.g + '" min="0" max="255" id="presetColorInputG" /></div></div>'
                    + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + presets[activePreset].primaryColor.b + '" min="0" max="255" id="presetColorInputB" /></div>'
                    + '              </div>'
                    + '          </div>'
                    + '      </div>'
                    + '      <div class="row">'
                    + '          <div class="col-12 mt-3">'
                    + '              <input type="text" class="form-control" value="' + presets[activePreset].name + '" id="presetColorInputName">'
                    + '          </div>'
                    + '      </div>'
                    + '  </div>'
                    + '</div>');

                let presetColorPicker      = new iro.ColorPicker('#presetColorPicker', {
                        width                       : 294,
                        display                     : 'inline-block',
                        color                       : 'rgb(' + presets[activePreset].primaryColor.r + ', ' + presets[activePreset].primaryColor.g + ', ' + presets[activePreset].primaryColor.b + ')',
                        borderWidth                 : 1,
                        borderColor                 : "#000000"
                    });
                    $('#presetColorInputHex').val(presetColorPicker.color.hexString);

                presetColorPicker.on('input:change', function(color){
                    $('#presetColorInputR').val(color.rgb.r);
                    $('#presetColorInputG').val(color.rgb.g);
                    $('#presetColorInputB').val(color.rgb.b).trigger('change');

                    $('#presetColorInputHex').val(color.hexString);
                });

                $('#presetColorInputR, #presetColorInputG, #presetColorInputB').on('change keyup input', () => {
                    let presetColorR               = parseInt($('#presetColorInputR').val()) || 0;
                    let presetColorG               = parseInt($('#presetColorInputG').val()) || 0;
                    let presetColorB               = parseInt($('#presetColorInputB').val()) || 0;

                        presetColorPicker.color.rgb = {r: presetColorR, g: presetColorG, b: presetColorB};
                        $('#presetColorInputHex').val(presetColorPicker.color.hexString);

                    let style                       = 'rgb(' + presetColorR + ', ' + presetColorG + ', ' + presetColorB + ')';
                        $('#statisticsPlayerPresets .selectColorPreset.active').css('background', style);
                        $('#statisticsPlayerPresets .selectColorPreset.active').closest('.row').find('h5').html($('#presetColorInputName').val());

                    this.baseLayout.gameStateSubSystem.setPlayerColorPreset(
                        parseInt($('#statisticsPlayerPresets .selectColorPreset.active').attr('data-preset')),
                        $('#presetColorInputName').val(),
                        {
                            r : BaseLayout_Math.RGBToLinearColor(presetColorR),
                            g : BaseLayout_Math.RGBToLinearColor(presetColorG),
                            b : BaseLayout_Math.RGBToLinearColor(presetColorB),
                        }
                    );
                });
                $('#presetColorInputHex').on('change keyup input', function(){
                    let hexColor                        = $(this).val();
                        if([...hexColor].length === 7)
                        {
                            try
                            {
                                presetColorPicker.color.hexString = hexColor;

                                $('#presetColorInputR').val(presetColorPicker.color.rgb.r);
                                $('#presetColorInputG').val(presetColorPicker.color.rgb.g);
                                $('#presetColorInputB').val(presetColorPicker.color.rgb.b).trigger('change');
                            }
                            catch(e){}; // Silently fail until a correct value is entered...
                        }
                });
                $('#presetColorInputName').on('change keyup input', function(){
                    $('#presetColorInputB').trigger('change');
                });

                $('#statisticsPlayerPresets .selectColorPreset').hover(
                    function(){
                        $(this).css('border', '3px solid #FFFFFF');
                    },
                    function(){
                        if($(this).hasClass('active') === false)
                        {
                            $(this).css('border', '1px solid #000000');
                        }
                    }
                );
                $('#statisticsPlayerPresets .selectColorPreset').on('click', function(){
                    $('#statisticsPlayerPresets .selectColorPreset').removeClass('active').css('border', '1px solid #000000');
                    $(this).addClass('active').css('border', '3px solid #FFFFFF');

                    let presetIndex                     = parseInt($(this).attr('data-preset'));
                        presetColorPicker.color.rgb     = {r: presets[presetIndex].primaryColor.r, g: presets[presetIndex].primaryColor.g, b: presets[presetIndex].primaryColor.b};

                    $('#presetColorInputR').val(presets[presetIndex].primaryColor.r);
                    $('#presetColorInputG').val(presets[presetIndex].primaryColor.g);
                    $('#presetColorInputB').val(presets[presetIndex].primaryColor.b);

                    $('#presetColorInputHex').val(presetColorPicker.color.hexString);

                    $('#presetColorInputName').val(presets[presetIndex].name);
                });

                $('#statisticsPlayerPresets .btn-delete').on('click', function(e){
                    this.baseLayout.gameStateSubSystem.deletePlayerColorPreset(
                        parseInt($(e.target).closest('.row').find('[data-preset]').attr('data-preset'))
                    );
                    this.parse();
                }.bind(this));

                $('#statisticsPlayerPresets .btn-add').on('click', function(e){
                    this.baseLayout.gameStateSubSystem.addPlayerColorPreset(
                        'New color preset',
                        {
                            r : BaseLayout_Math.RGBToLinearColor(250),
                            g : BaseLayout_Math.RGBToLinearColor(149),
                            b : BaseLayout_Math.RGBToLinearColor(73),
                        }
                    );
                    this.parse();
                }.bind(this));
            }
    }
}
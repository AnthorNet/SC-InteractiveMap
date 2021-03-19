/* global iro */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';

export default class Modal_LightColorSlots
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.buildableSubSystem = new SubSystem_Buildable({baseLayout: this.baseLayout});
    }

    parse()
    {
        $('#statisticsModalLightColorSlots').empty();

        let html            = [];
        let playerColors    = this.buildableSubSystem.getPlayerLightColorSlots();
            for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalLightColorSlots; slotIndex++)
            {
                if(slotIndex % 4 === 0)
                {
                    if(slotIndex > 0)
                    {
                        html.push('</div>');
                    }
                    html.push('<div class="d-flex flex-row">');
                }

                let style = 'background: rgb(' + playerColors[slotIndex].r + ', ' + playerColors[slotIndex].g + ', ' + playerColors[slotIndex].b + ');';

                if(slotIndex === 0)
                {
                    html.push('<div class="d-flex flex-row selectColorSlot active align-items-center" style="' + style + 'position: relative;width: 96px;height: 96px;border: 3px solid #FFFFFF;border-radius: 5px;margin: 2px;" data-slot="' + slotIndex + '"><div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">#' + (slotIndex + 1) + '</strong></div></div>');
                }
                else
                {
                    html.push('<div class="d-flex flex-row selectColorSlot align-items-center" style="' + style + 'position: relative;width: 96px;height: 96px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot="' + slotIndex + '"><div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">#' + (slotIndex + 1) + '</strong></div></div>');
                }
            }

        html.push('</div>');

        $('#statisticsModalLightColorSlots').html('<div class="row">'
                                           + '  <div class="col-5">' + html.join('') + '</div>'
                                           + '  <div class="col-7">'
                                           + '      <div class="row">'
                                           + '          <div class="col-12">'
                                           + '              <div id="lightColorPicker" class="text-center"></div>'
                                           + '              <div class="row mt-3 no-gutters">'
                                           + '                  <div class="input-group col-12">'
                                           + '                      <div class="input-group-prepend">'
                                           + '                          <span class="input-group-text" style="width: 70px">HEX</span>'
                                           + '                      </div>'
                                           + '                      <input type="text" class="form-control text-center" value="" id="lightColorInputHex" />'
                                           + '                  </div>'
                                           + '              </div>'
                                           + '              <div class="row mt-1 no-gutters">'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].r + '" min="0" max="255" id="lightColorInputR" /></div>'
                                           + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + playerColors[0].g + '" min="0" max="255" id="lightColorInputG" /></div></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].b + '" min="0" max="255" id="lightColorInputB" /></div>'
                                           + '              </div>'
                                           + '          </div>'
                                           + '      </div>'
                                           + '      <div class="row">'
                                           + '          <div class="col-12 mt-3">'
                                           + '              <button id="resetLightColorSlot" class="btn btn-secondary w-100">Reset to default color</button>'
                                           + '          </div>'
                                           + '      </div>'
                                           + '  </div>'
                                           + '</div>');

        let lightColorPicker      = new iro.ColorPicker('#lightColorPicker', {
                width                       : 294,
                display                     : 'inline-block',
                color                       : 'rgb(' + playerColors[0].r + ', ' + playerColors[0].g + ', ' + playerColors[0].b + ')',
                borderWidth                 : 1,
                borderColor                 : "#000000"
            });
            $('#lightColorInputHex').val(lightColorPicker.color.hexString);

        lightColorPicker.on('input:change', function(color){
            $('#lightColorInputR').val(color.rgb.r);
            $('#lightColorInputG').val(color.rgb.g);
            $('#lightColorInputB').val(color.rgb.b).trigger('change');

            $('#lightColorInputHex').val(color.hexString);
        });

        $('#lightColorInputR, #lightColorInputG, #lightColorInputB').on('change keyup input', function(){
            let lightColorR               = parseInt($('#lightColorInputR').val());
            let lightColorG               = parseInt($('#lightColorInputG').val());
            let lightColorB               = parseInt($('#lightColorInputB').val());

                lightColorPicker.color.rgb = {r: lightColorR, g: lightColorG, b: lightColorB};
                $('#lightColorInputHex').val(lightColorPicker.color.hexString);

            let style                       = 'rgb(' + lightColorR + ', ' + lightColorG + ', ' + lightColorB + ')';
                $('#statisticsModalLightColorSlots .selectColorSlot.active').css('background', style);

            let slotIndex                   = parseInt($('#statisticsModalLightColorSlots .selectColorSlot.active').attr('data-slot'));

            let mBuildableLightColorSlots   = this.buildableSubSystem.getLightColorSlots();
                if(mBuildableLightColorSlots !== null)
                {
                    mBuildableLightColorSlots.values[slotIndex].r   = BaseLayout_Math.RGBToLinearColor(lightColorR);
                    mBuildableLightColorSlots.values[slotIndex].g   = BaseLayout_Math.RGBToLinearColor(lightColorG);
                    mBuildableLightColorSlots.values[slotIndex].b   = BaseLayout_Math.RGBToLinearColor(lightColorB);

                    playerColors    = this.buildableSubSystem.getPlayerLightColorSlots(); // Refresh!
                }
        }.bind(this));
        $('#lightColorInputHex').on('change keyup input', function(){
            let hexColor                        = $(this).val();
                if([...hexColor].length === 7)
                {
                    try
                    {
                        lightColorPicker.color.hexString = hexColor;

                        $('#lightColorInputR').val(lightColorPicker.color.rgb.r);
                        $('#lightColorInputG').val(lightColorPicker.color.rgb.g);
                        $('#lightColorInputB').val(lightColorPicker.color.rgb.b).trigger('change');
                    }
                    catch(e){}; // Silently fail until a correct value is entered...
                }
        });

        $('#statisticsModalLightColorSlots .selectColorSlot').hover(
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
        $('#statisticsModalLightColorSlots .selectColorSlot').on('click', function(){
            $('#statisticsModalLightColorSlots .selectColorSlot').removeClass('active').css('border', '1px solid #000000');
            $(this).addClass('active').css('border', '3px solid #FFFFFF');

            let slotIndex                       = parseInt($(this).attr('data-slot'));
                lightColorPicker.color.rgb    = {r: playerColors[slotIndex].r, g: playerColors[slotIndex].g, b: playerColors[slotIndex].b};

            $('#lightColorInputR').val(playerColors[slotIndex].r);
            $('#lightColorInputG').val(playerColors[slotIndex].g);
            $('#lightColorInputB').val(playerColors[slotIndex].b).trigger('change');

            $('#lightColorInputHex').val(lightColorPicker.color.hexString);
        });
        $('#resetLightColorSlot').on('click', function(){
            let slotIndex                 = parseInt($('#statisticsModalLightColorSlots .selectColorSlot.active').attr('data-slot'));
            let lightColor                = this.buildableSubSystem.getDefaultLightColorSlot(slotIndex);

            lightColorPicker.color.rgb    = {r: lightColor.r, g: lightColor.g, b: lightColor.b};

            $('#lightColorInputR').val(lightColor.r);
            $('#lightColorInputG').val(lightColor.g);
            $('#lightColorInputB').val(lightColor.b).trigger('change');

            $('#lightColorInputHex').val(lightColorPicker.color.hexString);
        }.bind(this));
    }
}
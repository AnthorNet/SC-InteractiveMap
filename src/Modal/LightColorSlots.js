import iro                                      from '../Lib/iro.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_GameState                      from '../SubSystem/GameState.js';

import { translate }                            from '../Translate.js';

export default class Modal_LightColorSlots
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#genericModal .modal-title').empty().html(translate('GLOBAL\\Light color slots'));
        let html            = [];
        let playerColors    = this.baseLayout.gameStateSubSystem.getPlayerLightColorSlots();
            for(let slotIndex = 0; slotIndex < SubSystem_GameState.totalLightColorSlots; slotIndex++)
            {
                if(slotIndex % 3 === 0)
                {
                    if(slotIndex > 0)
                    {
                        html.push('</div>');
                    }
                    html.push('<div class="d-flex flex-row">');
                }

                let style = 'background: rgb(' + playerColors[slotIndex].r + ', ' + playerColors[slotIndex].g + ', ' + playerColors[slotIndex].b + ');';

                html.push('<div class="d-flex flex-row selectColorSlot ' + ((slotIndex === 0) ? 'active ' : '') + 'align-items-center" style="' + style + 'position: relative;width: 144px;height: 144px;' + ((slotIndex === 0) ? 'border: 3px solid #FFF;' : 'border: 1px solid #000;') + 'border-radius: 50%;margin: 2px;" data-slot="' + slotIndex + '">');
                html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">#' + (slotIndex + 1) + '</strong></div>');
                html.push('</div>');
            }

        html.push('</div>');

        $('#genericModal .modal-body').empty().html('<div class="row">'
                                           + '  <div class="col-5 align-self-center">' + html.join('') + '</div>'
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
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
        }, 250);

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

        $('#lightColorInputR, #lightColorInputG, #lightColorInputB').on('change keyup input', () => {
            let lightColorR               = parseInt($('#lightColorInputR').val()) || 0;
            let lightColorG               = parseInt($('#lightColorInputG').val()) || 0;
            let lightColorB               = parseInt($('#lightColorInputB').val()) || 0;

                lightColorPicker.color.rgb = {r: lightColorR, g: lightColorG, b: lightColorB};
                $('#lightColorInputHex').val(lightColorPicker.color.hexString);

            let style                       = 'rgb(' + lightColorR + ', ' + lightColorG + ', ' + lightColorB + ')';
                $('#genericModal .selectColorSlot.active').css('background', style);

            this.baseLayout.gameStateSubSystem.setPlayerLightColorSlot(
                parseInt($('#genericModal .selectColorSlot.active').attr('data-slot')),
                {
                    r : BaseLayout_Math.RGBToLinearColor(lightColorR),
                    g : BaseLayout_Math.RGBToLinearColor(lightColorG),
                    b : BaseLayout_Math.RGBToLinearColor(lightColorB),
                }
            );
            playerColors = this.baseLayout.gameStateSubSystem.getPlayerLightColorSlots(); // Refresh!
        });
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

        $('#genericModal .selectColorSlot').hover(
            function(){
                $(this).css('border', '3px solid #FFF');
            },
            function(){
                if($(this).hasClass('active') === false)
                {
                    $(this).css('border', '1px solid #000');
                }
            }
        );
        $('#genericModal .selectColorSlot').on('click', function(){
            $('#genericModal .selectColorSlot').removeClass('active').css('border', '1px solid #000');
            $(this).addClass('active').css('border', '3px solid #FFF');

            let slotIndex                       = parseInt($(this).attr('data-slot'));
                lightColorPicker.color.rgb    = {r: playerColors[slotIndex].r, g: playerColors[slotIndex].g, b: playerColors[slotIndex].b};

            $('#lightColorInputR').val(playerColors[slotIndex].r);
            $('#lightColorInputG').val(playerColors[slotIndex].g);
            $('#lightColorInputB').val(playerColors[slotIndex].b).trigger('change');

            $('#lightColorInputHex').val(lightColorPicker.color.hexString);
        });
        $('#resetLightColorSlot').on('click', () => {
            let slotIndex                 = parseInt($('#genericModal .selectColorSlot.active').attr('data-slot'));
            let lightColor                = this.baseLayout.gameStateSubSystem.getDefaultLightColorSlot(slotIndex);

            lightColorPicker.color.rgb    = {r: lightColor.r, g: lightColor.g, b: lightColor.b};

            $('#lightColorInputR').val(lightColor.r);
            $('#lightColorInputG').val(lightColor.g);
            $('#lightColorInputB').val(lightColor.b).trigger('change');

            $('#lightColorInputHex').val(lightColorPicker.color.hexString);
        });
    }
}
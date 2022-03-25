import iro                                      from '../Lib/iro.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';

import { translate }                            from '../Translate.js';

export default class Modal_ColorSlots
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#genericModal .modal-title').empty().html(translate('GLOBAL\\Color swatches'));
        let html            = [];
        let playerColors    = this.baseLayout.buildableSubSystem.getPlayerColorSlots();

        // Add factory slot
        html.push('<div class="d-flex flex-row mb-3">');
            html.push('<div class="d-flex flex-row selectColorSlot active align-items-center w-50" style="background: linear-gradient(135deg, rgb(' + playerColors[0].primaryColor.r + ', ' + playerColors[0].primaryColor.g + ', ' + playerColors[0].primaryColor.b + ') 0%,'
                          + 'rgb(' + playerColors[0].primaryColor.r + ', ' + playerColors[0].primaryColor.g + ', ' + playerColors[0].primaryColor.b + ') 50%,'
                          + 'rgb(' + playerColors[0].secondaryColor.r + ', ' + playerColors[0].secondaryColor.g + ', ' + playerColors[0].secondaryColor.b + ') 51%,'
                          + 'rgb(' + playerColors[0].secondaryColor.r + ', ' + playerColors[0].secondaryColor.g + ', ' + playerColors[0].secondaryColor.b + ') 100%);position: relative;height: 48px;border: 3px solid #FFF;border-radius: 5px;margin: 2px;" data-slot="0">');
            html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">FICSIT Factory</strong></div>');
            html.push('</div>');
            html.push('<div class="d-flex flex-row selectColorSlot align-items-center w-50" style="background: linear-gradient(135deg, rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ') 0%,'
                          + 'rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ') 50%,'
                          + 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ') 51%,'
                          + 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ') 100%);position: relative;height: 48px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot="17">');
            html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">FICSIT Pipe</strong></div>');
            html.push('</div>');
        html.push('</div>');

        for(let slotIndex = 1; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
        {
            if((slotIndex - 1) % 5 === 0)
            {
                if(slotIndex > 1)
                {
                    html.push('</div>');
                }
                html.push('<div class="d-flex flex-row">');
            }

            let style = 'background: linear-gradient(135deg, rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ') 0%,'
                      + 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ') 50%,'
                      + 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ') 51%,'
                      + 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ') 100%);';

            html.push('<div class="d-flex flex-row selectColorSlot align-items-center" style="' + style + 'position: relative;width: 85px;height: 85px;border: 1px solid #000;border-radius: 50%;margin: 2px;" data-slot="' + slotIndex + '">');
            html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">Swatch ' + slotIndex + '</strong></div>');
            html.push('</div>');
        }
        html.push('</div>');

        // Add hidden slots
        html.push('<div class="d-flex flex-row mt-3">');
            html.push('<div class="d-flex flex-row selectColorSlot align-items-center w-50" style="background: linear-gradient(135deg, rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ') 0%,'
                          + 'rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ') 50%,'
                          + 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ') 51%,'
                          + 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ') 100%);position: relative;height: 48px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot="16">');
            html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">FICSIT Foundation</strong></div>');
            html.push('</div>');
            html.push('<div class="d-flex flex-row selectColorSlot align-items-center w-50" style="background: linear-gradient(135deg, rgb(' + playerColors[18].primaryColor.r + ', ' + playerColors[18].primaryColor.g + ', ' + playerColors[18].primaryColor.b + ') 0%,'
                          + 'rgb(' + playerColors[18].primaryColor.r + ', ' + playerColors[18].primaryColor.g + ', ' + playerColors[18].primaryColor.b + ') 50%,'
                          + 'rgb(' + playerColors[18].secondaryColor.r + ', ' + playerColors[18].secondaryColor.g + ', ' + playerColors[18].secondaryColor.b + ') 51%,'
                          + 'rgb(' + playerColors[18].secondaryColor.r + ', ' + playerColors[18].secondaryColor.g + ', ' + playerColors[18].secondaryColor.b + ') 100%);position: relative;height: 48px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot="18">');
            html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">Concrete Structure</strong></div>');
            html.push('</div>');
        html.push('</div>');

        $('#genericModal .modal-body').empty().html('<div class="row">'
                                           + '  <div class="col-5 align-self-center">' + html.join('') + '</div>'
                                           + '  <div class="col-7">'
                                           + '      <div class="row">'
                                           + '          <div class="col-6">'
                                           + '              <div id="primaryColorPicker" class="text-center"></div>'
                                           + '              <div class="row mt-3 no-gutters">'
                                           + '                  <div class="input-group col-12">'
                                           + '                      <div class="input-group-prepend">'
                                           + '                          <span class="input-group-text" style="width: 70px">HEX</span>'
                                           + '                      </div>'
                                           + '                      <input type="text" class="form-control text-center" value="" id="primaryColorInputHex" />'
                                           + '                  </div>'
                                           + '              </div>'
                                           + '              <div class="row mt-1 no-gutters">'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].primaryColor.r + '" min="0" max="255" id="primaryColorInputR" /></div>'
                                           + '                  <div class="col-4 input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + playerColors[0].primaryColor.g + '" min="0" max="255" id="primaryColorInputG" /></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].primaryColor.b + '" min="0" max="255" id="primaryColorInputB" /></div>'
                                           + '              </div>'
                                           + '          </div>'
                                           + '          <div class="col-6">'
                                           + '              <div id="secondaryColorPicker" class="text-center"></div>'
                                           + '              <div class="row mt-3 no-gutters">'
                                           + '                  <div class="input-group col-12">'
                                           + '                      <div class="input-group-prepend">'
                                           + '                          <span class="input-group-text" style="width: 70px">HEX</span>'
                                           + '                      </div>'
                                           + '                      <input type="text" class="form-control text-center" value="" id="secondaryColorInputHex" />'
                                           + '                  </div>'
                                           + '              </div>'
                                           + '              <div class="row mt-1 no-gutters">'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].secondaryColor.r + '" min="0" max="255" id="secondaryColorInputR" /></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + playerColors[0].secondaryColor.g + '" min="0" max="255" id="secondaryColorInputG" /></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].secondaryColor.b + '" min="0" max="255" id="secondaryColorInputB" /></div>'
                                           + '              </div>'
                                           + '          </div>'
                                           + '      </div>'
                                           + '      <div class="row">'
                                           + '          <div class="col-12 mt-3">'
                                           + '              <button id="resetColorSlot" class="btn btn-secondary w-100">Reset to default color</button>'
                                           + '          </div>'
                                           + '      </div>'
                                           + '  </div>'
                                           + '</div>');
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
        }, 250);

        let primaryColorPicker      = new iro.ColorPicker('#primaryColorPicker', {
                width                       : 294,
                display                     : 'inline-block',
                color                       : 'rgb(' + playerColors[0].primaryColor.r + ', ' + playerColors[0].primaryColor.g + ', ' + playerColors[0].primaryColor.b + ')',
                borderWidth                 : 1,
                borderColor                 : "#000000"
            });
            $('#primaryColorInputHex').val(primaryColorPicker.color.hexString);
        let secondaryColorPicker    = new iro.ColorPicker('#secondaryColorPicker', {
                width                       : 294,
                display                     : 'inline-block',
                color                       : 'rgb(' + playerColors[0].secondaryColor.r + ', ' + playerColors[0].secondaryColor.g + ', ' + playerColors[0].secondaryColor.b + ')',
                borderWidth                 : 1,
                borderColor                 : "#000000"
            });
            $('#secondaryColorInputHex').val(secondaryColorPicker.color.hexString);

        primaryColorPicker.on('input:change', function(color){
            $('#primaryColorInputR').val(color.rgb.r);
            $('#primaryColorInputG').val(color.rgb.g);
            $('#primaryColorInputB').val(color.rgb.b).trigger('change');

            $('#primaryColorInputHex').val(color.hexString);
        });
        secondaryColorPicker.on('input:change', function(color){
            $('#secondaryColorInputR').val(color.rgb.r);
            $('#secondaryColorInputG').val(color.rgb.g);
            $('#secondaryColorInputB').val(color.rgb.b).trigger('change');

            $('#secondaryColorInputHex').val(color.hexString);
        });

        $('#primaryColorInputR, #primaryColorInputG, #primaryColorInputB, #secondaryColorInputR, #secondaryColorInputG, #secondaryColorInputB').on('change keyup input', () => {
            let primaryColorR               = parseInt($('#primaryColorInputR').val()) || 0;
            let primaryColorG               = parseInt($('#primaryColorInputG').val()) || 0;
            let primaryColorB               = parseInt($('#primaryColorInputB').val()) || 0;

            let secondaryColorR             = parseInt($('#secondaryColorInputR').val()) || 0;
            let secondaryColorG             = parseInt($('#secondaryColorInputG').val()) || 0;
            let secondaryColorB             = parseInt($('#secondaryColorInputB').val()) || 0;

                primaryColorPicker.color.rgb    = {r: primaryColorR, g: primaryColorG, b: primaryColorB};
                secondaryColorPicker.color.rgb  = {r: secondaryColorR, g: secondaryColorG, b: secondaryColorB};
                $('#primaryColorInputHex').val(primaryColorPicker.color.hexString);
                $('#secondaryColorInputHex').val(secondaryColorPicker.color.hexString);

            let style                       = 'linear-gradient(135deg, rgb(' + primaryColorR + ', ' + primaryColorG + ', ' + primaryColorB + ') 0%, rgb(' + primaryColorR + ', ' + primaryColorG + ', ' + primaryColorB + ') 50%, rgb(' + secondaryColorR + ', ' + secondaryColorG + ', ' + secondaryColorB + ') 51%, rgb(' + secondaryColorR + ', ' + secondaryColorG + ', ' + secondaryColorB + ') 100%)';
                $('#genericModal .selectColorSlot.active').css('background', style);

            this.baseLayout.buildableSubSystem.setPlayerColorSlot(
                parseInt($('#genericModal .selectColorSlot.active').attr('data-slot')),
                {
                    r : BaseLayout_Math.RGBToLinearColor(primaryColorR),
                    g : BaseLayout_Math.RGBToLinearColor(primaryColorG),
                    b : BaseLayout_Math.RGBToLinearColor(primaryColorB),
                },
                {
                    r : BaseLayout_Math.RGBToLinearColor(secondaryColorR),
                    g : BaseLayout_Math.RGBToLinearColor(secondaryColorG),
                    b : BaseLayout_Math.RGBToLinearColor(secondaryColorB),
                }
            );
            playerColors    = this.baseLayout.buildableSubSystem.getPlayerColorSlots(); // Refresh
        });
        $('#primaryColorInputHex').on('change keyup input', function(){
            let hexColor                        = $(this).val();
                if([...hexColor].length === 7)
                {
                    try
                    {
                        primaryColorPicker.color.hexString = hexColor;

                        $('#primaryColorInputR').val(primaryColorPicker.color.rgb.r);
                        $('#primaryColorInputG').val(primaryColorPicker.color.rgb.g);
                        $('#primaryColorInputB').val(primaryColorPicker.color.rgb.b).trigger('change');
                    }
                    catch(e){}; // Silently fail until a correct value is entered...
                }
        });
        $('#secondaryColorInputHex').on('change keyup input', function(){
            let hexColor                        = $(this).val();
                if([...hexColor].length === 7)
                {
                    try
                    {
                        secondaryColorPicker.color.hexString = hexColor;

                        $('#secondaryColorInputR').val(secondaryColorPicker.color.rgb.r);
                        $('#secondaryColorInputG').val(secondaryColorPicker.color.rgb.g);
                        $('#secondaryColorInputB').val(secondaryColorPicker.color.rgb.b).trigger('change');
                    }
                    catch(e){}; // Silently fail until a correct value is entered...
                }
        });

        $('#genericModal .selectColorSlot').hover(
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
        $('#genericModal .selectColorSlot').on('click', function(){
            $('#genericModal .selectColorSlot').removeClass('active').css('border', '1px solid #000000');
            $(this).addClass('active').css('border', '3px solid #FFFFFF');

            let slotIndex                       = parseInt($(this).attr('data-slot'));
                primaryColorPicker.color.rgb    = {r: playerColors[slotIndex].primaryColor.r, g: playerColors[slotIndex].primaryColor.g, b: playerColors[slotIndex].primaryColor.b};
                secondaryColorPicker.color.rgb  = {r: playerColors[slotIndex].secondaryColor.r, g: playerColors[slotIndex].secondaryColor.g, b: playerColors[slotIndex].secondaryColor.b};

            $('#primaryColorInputR').val(playerColors[slotIndex].primaryColor.r);
            $('#primaryColorInputG').val(playerColors[slotIndex].primaryColor.g);
            $('#primaryColorInputB').val(playerColors[slotIndex].primaryColor.b);

            $('#primaryColorInputHex').val(primaryColorPicker.color.hexString);

            $('#secondaryColorInputR').val(playerColors[slotIndex].secondaryColor.r);
            $('#secondaryColorInputG').val(playerColors[slotIndex].secondaryColor.g);
            $('#secondaryColorInputB').val(playerColors[slotIndex].secondaryColor.b);

            $('#secondaryColorInputHex').val(secondaryColorPicker.color.hexString);
        });
        $('#resetColorSlot').on('click', () => {
            let slotIndex                   = parseInt($('#genericModal .selectColorSlot.active').attr('data-slot'));
            let primaryColor                = this.baseLayout.buildableSubSystem.getDefaultPrimaryColorSlot(slotIndex);
            let secondaryColor              = this.baseLayout.buildableSubSystem.getDefaultSecondaryColorSlot(slotIndex);

            primaryColorPicker.color.rgb    = {r: primaryColor.r, g: primaryColor.g, b: primaryColor.b};
            secondaryColorPicker.color.rgb  = {r: secondaryColor.r, g: secondaryColor.g, b: secondaryColor.b};

            $('#primaryColorInputR').val(primaryColor.r);
            $('#primaryColorInputG').val(primaryColor.g);
            $('#primaryColorInputB').val(primaryColor.b);

            $('#secondaryColorInputR').val(secondaryColor.r);
            $('#secondaryColorInputG').val(secondaryColor.g);
            $('#secondaryColorInputB').val(secondaryColor.b).trigger('change');
        });
    }
}
/* global iro */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class BaseLayout_Map_ColorSlots
{
    static getTotalColorSlots(){ return 16; }

    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#statisticsModalColorSlots').empty();

        let html            = [];
        let playerColors    = this.baseLayout.getColorSlots(true);

            if(playerColors === null)
            {
                $('#statisticsModalColorSlots').html('<div class="row">'
                                           + '    <div class="col-12">'
                                           + '        <div class="alert alert-danger text-center">Please ensure you have unlocked the color gun in game to be able to edit your color slot from the interactive map.</div>'
                                           + '    </div>'
                                           + '</div>');
                return;
            }

        for(let slotIndex = 0; slotIndex < BaseLayout_Map_ColorSlots.getTotalColorSlots(); slotIndex++)
        {
            if(slotIndex % 4 === 0)
            {
                if(slotIndex > 0)
                {
                    html.push('</div>');
                }
                html.push('<div class="d-flex flex-row">');
            }

            let style = 'background: linear-gradient(135deg, rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ') 0%,'
                      + 'rgb(' + playerColors[slotIndex].primaryColor.r + ', ' + playerColors[slotIndex].primaryColor.g + ', ' + playerColors[slotIndex].primaryColor.b + ') 50%,'
                      + 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ') 51%,'
                      + 'rgb(' + playerColors[slotIndex].secondaryColor.r + ', ' + playerColors[slotIndex].secondaryColor.g + ', ' + playerColors[slotIndex].secondaryColor.b + ') 100%);';

            if(slotIndex === 0)
            {
                html.push('<div class="d-flex flex-row selectColorSlot active" style="' + style + 'position: relative;width: 96px;height: 96px;border: 3px solid #FFFFFF;border-radius: 5px;margin: 2px;" data-slot=' + slotIndex + '></div>');
            }
            else
            {
                html.push('<div class="d-flex flex-row selectColorSlot" style="' + style + 'position: relative;width: 96px;height: 96px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot=' + slotIndex + '></div>');
            }
        }
        html.push('</div>');

        $('#statisticsModalColorSlots').html('<div class="row">'
                                           + '  <div class="col-5">' + html.join('') + '</div>'
                                           + '  <div class="col-7">'
                                           + '      <div class="row">'
                                           + '          <div class="col-6">'
                                           + '              <div id="primaryColorPicker" class="text-center"></div>'
                                           + '              <div class="row mt-3 no-gutters">'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].primaryColor.r + '" min="0" max="255" id="primaryColorInputR" /></div>'
                                           + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + playerColors[0].primaryColor.g + '" min="0" max="255" id="primaryColorInputG" /></div></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].primaryColor.b + '" min="0" max="255" id="primaryColorInputB" /></div>'
                                           + '              </div>'
                                           + '          </div>'
                                           + '          <div class="col-6">'
                                           + '              <div id="secondaryColorPicker" class="text-center"></div>'
                                           + '              <div class="row mt-3 no-gutters">'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + playerColors[0].secondaryColor.r + '" min="0" max="255" id="secondaryColorInputR" /></div>'
                                           + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + playerColors[0].secondaryColor.g + '" min="0" max="255" id="secondaryColorInputG" /></div></div>'
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

        let primaryColorPicker      = new iro.ColorPicker('#primaryColorPicker', {
            width: 240,
            display: 'inline-block',
            color: 'rgb(' + playerColors[0].primaryColor.r + ', ' + playerColors[0].primaryColor.g + ', ' + playerColors[0].primaryColor.b + ')',
            borderWidth: 1,
            borderColor: "#000000"
        });
        let secondaryColorPicker    = new iro.ColorPicker('#secondaryColorPicker', {
            width: 240,
            display: 'inline-block',
            color: 'rgb(' + playerColors[0].secondaryColor.r + ', ' + playerColors[0].secondaryColor.g + ', ' + playerColors[0].secondaryColor.b + ')',
            borderWidth: 1,
            borderColor: "#000000"
        });

        primaryColorPicker.on('input:change', function(color){
            $('#primaryColorInputR').val(color.rgb.r);
            $('#primaryColorInputG').val(color.rgb.g);
            $('#primaryColorInputB').val(color.rgb.b).trigger('change');
        });
        secondaryColorPicker.on('input:change', function(color){
            $('#secondaryColorInputR').val(color.rgb.r);
            $('#secondaryColorInputG').val(color.rgb.g);
            $('#secondaryColorInputB').val(color.rgb.b).trigger('change');
        });

        $('#statisticsModalColorSlots input').on('change keyup input', function(){
            let primaryColorR               = parseInt($('#primaryColorInputR').val());
            let primaryColorG               = parseInt($('#primaryColorInputG').val());
            let primaryColorB               = parseInt($('#primaryColorInputB').val());

            let secondaryColorR             = parseInt($('#secondaryColorInputR').val());
            let secondaryColorG             = parseInt($('#secondaryColorInputG').val());
            let secondaryColorB             = parseInt($('#secondaryColorInputB').val());

            primaryColorPicker.color.rgb    = {r: primaryColorR, g: primaryColorG, b: primaryColorB};
            secondaryColorPicker.color.rgb  = {r: secondaryColorR, g: secondaryColorG, b: secondaryColorB};

            let style                       = 'linear-gradient(135deg, rgb(' + primaryColorR + ', ' + primaryColorG + ', ' + primaryColorB + ') 0%, rgb(' + primaryColorR + ', ' + primaryColorG + ', ' + primaryColorB + ') 50%, rgb(' + secondaryColorR + ', ' + secondaryColorG + ', ' + secondaryColorB + ') 51%, rgb(' + secondaryColorR + ', ' + secondaryColorG + ', ' + secondaryColorB + ') 100%)';
                $('#statisticsModalColorSlots .selectColorSlot.active').css('background', style);

            let buildableSubsystem = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.BuildableSubsystem');
            if(buildableSubsystem !== null)
                {
                    let slotIndex                   = parseInt($('#statisticsModalColorSlots .selectColorSlot.active').attr('data-slot'));

                    let mColorSlotsPrimary_Linear   = this.baseLayout.getObjectProperty(buildableSubsystem, 'mColorSlotsPrimary_Linear');
                        if(mColorSlotsPrimary_Linear !== null)
                        {
                            mColorSlotsPrimary_Linear.values[slotIndex].r   = BaseLayout_Math.RGBToLinearColor(primaryColorR);
                            mColorSlotsPrimary_Linear.values[slotIndex].g   = BaseLayout_Math.RGBToLinearColor(primaryColorG);
                            mColorSlotsPrimary_Linear.values[slotIndex].b   = BaseLayout_Math.RGBToLinearColor(primaryColorB);
                        }
                    let mColorSlotsSecondary_Linear = this.baseLayout.getObjectProperty(buildableSubsystem, 'mColorSlotsSecondary_Linear');
                        if(mColorSlotsSecondary_Linear !== null)
                        {
                            mColorSlotsSecondary_Linear.values[slotIndex].r = BaseLayout_Math.RGBToLinearColor(secondaryColorR);
                            mColorSlotsSecondary_Linear.values[slotIndex].g = BaseLayout_Math.RGBToLinearColor(secondaryColorG);
                            mColorSlotsSecondary_Linear.values[slotIndex].b = BaseLayout_Math.RGBToLinearColor(secondaryColorB);
                        }
                }

            playerColors = this.baseLayout.getColorSlots(true);
        }.bind(this));

        $('#statisticsModalColorSlots .selectColorSlot').hover(
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
        $('#statisticsModalColorSlots .selectColorSlot').on('click', function(){
            $('#statisticsModalColorSlots .selectColorSlot').removeClass('active').css('border', '1px solid #000000');
            $(this).addClass('active').css('border', '3px solid #FFFFFF');

            let slotIndex                       = parseInt($(this).attr('data-slot'));
                primaryColorPicker.color.rgb    = {r: playerColors[slotIndex].primaryColor.r, g: playerColors[slotIndex].primaryColor.g, b: playerColors[slotIndex].primaryColor.b};
                secondaryColorPicker.color.rgb  = {r: playerColors[slotIndex].secondaryColor.r, g: playerColors[slotIndex].secondaryColor.g, b: playerColors[slotIndex].secondaryColor.b};

            $('#primaryColorInputR').val(playerColors[slotIndex].primaryColor.r);
            $('#primaryColorInputG').val(playerColors[slotIndex].primaryColor.g);
            $('#primaryColorInputB').val(playerColors[slotIndex].primaryColor.b);

            $('#secondaryColorInputR').val(playerColors[slotIndex].secondaryColor.r);
            $('#secondaryColorInputG').val(playerColors[slotIndex].secondaryColor.g);
            $('#secondaryColorInputB').val(playerColors[slotIndex].secondaryColor.b);
        });
        $('#resetColorSlot').on('click', function(){
            let slotIndex                   = parseInt($('#statisticsModalColorSlots .selectColorSlot.active').attr('data-slot'));
            let primaryColor                = this.baseLayout.getDefaultPrimaryColorSlot(slotIndex);
            let secondaryColor              = this.baseLayout.getDefaultSecondaryColorSlot(slotIndex);

            primaryColorPicker.color.rgb    = {r: primaryColor.r, g: primaryColor.g, b: primaryColor.b};
            secondaryColorPicker.color.rgb  = {r: secondaryColor.r, g: secondaryColor.g, b: secondaryColor.b};

            $('#primaryColorInputR').val(primaryColor.r);
            $('#primaryColorInputG').val(primaryColor.g);
            $('#primaryColorInputB').val(primaryColor.b);

            $('#secondaryColorInputR').val(secondaryColor.r);
            $('#secondaryColorInputG').val(secondaryColor.g);
            $('#secondaryColorInputB').val(secondaryColor.b).trigger('change');
        }.bind(this));
    }
}
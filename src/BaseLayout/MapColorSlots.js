/* global iro */

export default class BaseLayout_Map_ColorSlots
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#statisticsModalColorSlots').empty();

        let html            = [];
        let playerColors    = this.baseLayout.getColorSlots(this.baseLayout.totalColorSlot);

        for(let slotIndex = 0; slotIndex < this.baseLayout.totalColorSlot; slotIndex++)
        {
            if(slotIndex % 4 === 0)
            {
                if(slotIndex > 0)
                {
                    html.push('</div>');
                }
                html.push('<div class="d-flex flex-row">');
            }

            let style = 'background: linear-gradient(135deg, rgb(' + playerColors[slotIndex].primaryColor.r * 255 + ', ' + playerColors[slotIndex].primaryColor.g * 255 + ', ' + playerColors[slotIndex].primaryColor.b * 255 + ') 0%, rgb(' + playerColors[slotIndex].primaryColor.r * 255 + ', ' + playerColors[slotIndex].primaryColor.g * 255 + ', ' + playerColors[slotIndex].primaryColor.b * 255 + ') 50%, rgb(' + playerColors[slotIndex].secondaryColor.r * 255 + ', ' + playerColors[slotIndex].secondaryColor.g * 255 + ', ' + playerColors[slotIndex].secondaryColor.b * 255 + ') 51%, rgb(' + playerColors[slotIndex].secondaryColor.r * 255 + ', ' + playerColors[slotIndex].secondaryColor.g * 255 + ', ' + playerColors[slotIndex].secondaryColor.b * 255 + ') 100%);';

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
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + Math.min(255, Math.floor(playerColors[0].primaryColor.r * 255)) + '" min="0" max="255" id="primaryColorInputR" /></div>'
                                           + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + Math.min(255, Math.floor(playerColors[0].primaryColor.g * 255)) + '" min="0" max="255" id="primaryColorInputG" /></div></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + Math.min(255, Math.floor(playerColors[0].primaryColor.b * 255)) + '" min="0" max="255" id="primaryColorInputB" /></div>'
                                           + '              </div>'
                                           + '          </div>'
                                           + '          <div class="col-6">'
                                           + '              <div id="secondaryColorPicker" class="text-center"></div>'
                                           + '              <div class="row mt-3 no-gutters">'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2" value="' + Math.min(255, Math.floor(playerColors[0].secondaryColor.r * 255)) + '" min="0" max="255" id="secondaryColorInputR" /></div>'
                                           + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + Math.min(255, Math.floor(playerColors[0].secondaryColor.g * 255)) + '" min="0" max="255" id="secondaryColorInputG" /></div></div>'
                                           + '                  <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2" value="' + Math.min(255, Math.floor(playerColors[0].secondaryColor.b * 255)) + '" min="0" max="255" id="secondaryColorInputB" /></div>'
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
            color: 'rgb(' + playerColors[0].primaryColor.r * 255 + ', ' + playerColors[0].primaryColor.g * 255 + ', ' + playerColors[0].primaryColor.b * 255 + ')',
            borderWidth: 1,
            borderColor: "#000000"
        });
        let secondaryColorPicker    = new iro.ColorPicker('#secondaryColorPicker', {
            width: 240,
            display: 'inline-block',
            color: 'rgb(' + playerColors[0].secondaryColor.r * 255 + ', ' + playerColors[0].secondaryColor.g * 255 + ', ' + playerColors[0].secondaryColor.b * 255 + ')',
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

                let mColorSlotsPrimary_Linear       = this.baseLayout.getObjectProperty(buildableSubsystem, 'mColorSlotsPrimary_Linear');
                let mColorSlotsSecondary_Linear     = this.baseLayout.getObjectProperty(buildableSubsystem, 'mColorSlotsSecondary_Linear');

                if(mColorSlotsPrimary_Linear !== null || mColorSlotsSecondary_Linear !== null)
                {
                    mColorSlotsPrimary_Linear.values[slotIndex].r   = primaryColorR / 255;
                    mColorSlotsPrimary_Linear.values[slotIndex].g   = primaryColorG / 255;
                    mColorSlotsPrimary_Linear.values[slotIndex].b   = primaryColorB / 255;

                    mColorSlotsSecondary_Linear.values[slotIndex].r = secondaryColorR / 255;
                    mColorSlotsSecondary_Linear.values[slotIndex].g = secondaryColorG / 255;
                    mColorSlotsSecondary_Linear.values[slotIndex].b = secondaryColorB / 255;
                }

                let primaryColorSlotDefault     = this.baseLayout.getDefaultPrimaryColorSlot(slotIndex);
                let secondaryColorSlotDefault   = this.baseLayout.getDefaultSecondaryColorSlot(slotIndex);
                let primaryColorSlotFound       = false;
                let secondaryColorSlotFound     = false;

                if(primaryColorR === primaryColorSlotDefault.r * 255 && primaryColorG === primaryColorSlotDefault.g * 255 && primaryColorB === primaryColorSlotDefault.b * 255)
                {
                    primaryColorSlotDefault = true;
                }
                else
                {
                    primaryColorSlotDefault = false;
                }

                if(secondaryColorR === secondaryColorSlotDefault.r * 255 && secondaryColorG === secondaryColorSlotDefault.g * 255 && secondaryColorB === secondaryColorSlotDefault.b * 255)
                {
                    secondaryColorSlotDefault = true;
                }
                else
                {
                    secondaryColorSlotDefault = false;
                }

                for(let i = buildableSubsystem.properties.length - 1; i >= 0; i--)
                {
                    if(buildableSubsystem.properties[i].name === 'mColorSlotsPrimary' && buildableSubsystem.properties[i].index === slotIndex)
                    {
                        if(primaryColorSlotDefault === false)
                        {
                            buildableSubsystem.properties[i].value.values.r = primaryColorR;
                            buildableSubsystem.properties[i].value.values.g = primaryColorG;
                            buildableSubsystem.properties[i].value.values.b = primaryColorB;
                        }
                        else
                        {
                            buildableSubsystem.properties.splice(i, 1);
                        }

                        primaryColorSlotFound = true;
                        continue;
                    }

                    if(buildableSubsystem.properties[i].name === 'mColorSlotsSecondary' && buildableSubsystem.properties[i].index === slotIndex)
                    {
                        if(secondaryColorSlotDefault === false)
                        {
                            buildableSubsystem.properties[i].value.values.r = secondaryColorR;
                            buildableSubsystem.properties[i].value.values.g = secondaryColorG;
                            buildableSubsystem.properties[i].value.values.b = secondaryColorB;
                        }
                        else
                        {
                            buildableSubsystem.properties.splice(i, 1);
                        }

                        secondaryColorSlotFound = true;
                        continue;
                    }

                    if(primaryColorSlotFound === true && secondaryColorSlotFound === true)
                    {
                        break;
                    }
                }

                if(primaryColorSlotFound === false && primaryColorSlotDefault === false)
                {
                    buildableSubsystem.properties.push({
                        name: 'mColorSlotsPrimary',
                        type: 'StructProperty',
                        index: slotIndex,
                        value: {
                            type: 'Color',
                            values: {
                                a: 255,
                                r: primaryColorR,
                                g: primaryColorG,
                                b: primaryColorB
                            }
                        }
                    });
                }
                if(secondaryColorSlotFound === false && secondaryColorSlotDefault === false)
                {
                    buildableSubsystem.properties.push({
                        name: 'mColorSlotsSecondary',
                        type: 'StructProperty',
                        index: slotIndex,
                        value: {
                            type: 'Color',
                            values: {
                                a: 255,
                                r: secondaryColorR,
                                g: secondaryColorG,
                                b: secondaryColorB
                            }
                        }
                    });
                }
            }

            playerColors = this.baseLayout.getColorSlots(this.baseLayout.totalColorSlot);
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

            let slotIndex                   = parseInt($(this).attr('data-slot'));
            primaryColorPicker.color.rgb    = {r: playerColors[slotIndex].primaryColor.r * 255, g: playerColors[slotIndex].primaryColor.g * 255, b: playerColors[slotIndex].primaryColor.b * 255};
            secondaryColorPicker.color.rgb  = {r: playerColors[slotIndex].secondaryColor.r * 255, g: playerColors[slotIndex].secondaryColor.g * 255, b: playerColors[slotIndex].secondaryColor.b * 255};

            $('#primaryColorInputR').val(Math.min(255, Math.floor(playerColors[slotIndex].primaryColor.r * 255)));
            $('#primaryColorInputG').val(Math.min(255, Math.floor(playerColors[slotIndex].primaryColor.g * 255)));
            $('#primaryColorInputB').val(Math.min(255, Math.floor(playerColors[slotIndex].primaryColor.b * 255)));

            $('#secondaryColorInputR').val(Math.min(255, Math.floor(playerColors[slotIndex].secondaryColor.r * 255)));
            $('#secondaryColorInputG').val(Math.min(255, Math.floor(playerColors[slotIndex].secondaryColor.g * 255)));
            $('#secondaryColorInputB').val(Math.min(255, Math.floor(playerColors[slotIndex].secondaryColor.b * 255)));
        });
        $('#resetColorSlot').on('click', function(){
            let slotIndex                   = parseInt($('#statisticsModalColorSlots .selectColorSlot.active').attr('data-slot'));
            let primaryColor                = this.baseLayout.getDefaultPrimaryColorSlot(slotIndex);
            let secondaryColor              = this.baseLayout.getDefaultSecondaryColorSlot(slotIndex);

            primaryColorPicker.color.rgb    = {r: primaryColor.r * 255, g: primaryColor.g * 255, b: primaryColor.b * 255};
            secondaryColorPicker.color.rgb  = {r: secondaryColor.r * 255, g: secondaryColor.g * 255, b: secondaryColor.b * 255};

            $('#primaryColorInputR').val(Math.min(255, Math.floor(primaryColor.r * 255)));
            $('#primaryColorInputG').val(Math.min(255, Math.floor(primaryColor.g * 255)));
            $('#primaryColorInputB').val(Math.min(255, Math.floor(primaryColor.b * 255)));

            $('#secondaryColorInputR').val(Math.min(255, Math.floor(secondaryColor.r * 255)));
            $('#secondaryColorInputG').val(Math.min(255, Math.floor(secondaryColor.g * 255)));
            $('#secondaryColorInputB').val(Math.min(255, Math.floor(secondaryColor.b * 255))).trigger('change');
        }.bind(this));
    }
}
/* global iro */
import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';

export default class Modal_ColorSlots
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.buildableSubSystem = new SubSystem_Buildable({baseLayout: this.baseLayout});
    }

    parse()
    {
        $('#genericModal .modal-title').empty().html(this.baseLayout.translate._('GLOBAL\\Color swatches'));
        let html            = [];
        let playerColors    = this.buildableSubSystem.getPlayerColorSlots();
            console.log(this.buildableSubSystem);
            for(let slotIndex = 0; slotIndex < SubSystem_Buildable.totalColorSlots; slotIndex++)
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

                html.push('<div class="d-flex flex-row selectColorSlot ' + ((slotIndex === 0) ? 'active ' : '') + ' align-items-center" style="' + style + 'position: relative;width: 96px;height: 96px;' + ((slotIndex === 0) ? 'border: 3px solid #FFF;' : 'border: 1px solid #000;') + 'border-radius: 50%;margin: 2px;" data-slot="' + slotIndex + '">');
                html.push('<div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">#' + (slotIndex + 1) + '</strong></div>');
                html.push('</div>');
            }

        html.push('</div>');

        // Add hidden slots
        html.push('<div class="d-flex flex-row mt-3">');
            html.push('<div class="d-flex flex-row selectColorSlot align-items-center" style="background: linear-gradient(135deg, rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ') 0%,'
                          + 'rgb(' + playerColors[16].primaryColor.r + ', ' + playerColors[16].primaryColor.g + ', ' + playerColors[16].primaryColor.b + ') 50%,'
                          + 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ') 51%,'
                          + 'rgb(' + playerColors[16].secondaryColor.r + ', ' + playerColors[16].secondaryColor.g + ', ' + playerColors[16].secondaryColor.b + ') 100%);position: relative;width: 196px;height: 48px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot="16"><div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">Foundations</strong></div></div>');
            html.push('<div class="d-flex flex-row selectColorSlot align-items-center" style="background: linear-gradient(135deg, rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ') 0%,'
                          + 'rgb(' + playerColors[17].primaryColor.r + ', ' + playerColors[17].primaryColor.g + ', ' + playerColors[17].primaryColor.b + ') 50%,'
                          + 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ') 51%,'
                          + 'rgb(' + playerColors[17].secondaryColor.r + ', ' + playerColors[17].secondaryColor.g + ', ' + playerColors[17].secondaryColor.b + ') 100%);position: relative;width: 196px;height: 48px;border: 1px solid #000000;border-radius: 5px;margin: 2px;" data-slot="17"><div class="w-100 text-center"><strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">Pipes</strong></div></div>');
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
                                           + '                  <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2" value="' + playerColors[0].primaryColor.g + '" min="0" max="255" id="primaryColorInputG" /></div></div>'
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
            let primaryColorR               = parseInt($('#primaryColorInputR').val());
            let primaryColorG               = parseInt($('#primaryColorInputG').val());
            let primaryColorB               = parseInt($('#primaryColorInputB').val());

            let secondaryColorR             = parseInt($('#secondaryColorInputR').val());
            let secondaryColorG             = parseInt($('#secondaryColorInputG').val());
            let secondaryColorB             = parseInt($('#secondaryColorInputB').val());

                primaryColorPicker.color.rgb    = {r: primaryColorR, g: primaryColorG, b: primaryColorB};
                secondaryColorPicker.color.rgb  = {r: secondaryColorR, g: secondaryColorG, b: secondaryColorB};
                $('#primaryColorInputHex').val(primaryColorPicker.color.hexString);
                $('#secondaryColorInputHex').val(secondaryColorPicker.color.hexString);

            let style                       = 'linear-gradient(135deg, rgb(' + primaryColorR + ', ' + primaryColorG + ', ' + primaryColorB + ') 0%, rgb(' + primaryColorR + ', ' + primaryColorG + ', ' + primaryColorB + ') 50%, rgb(' + secondaryColorR + ', ' + secondaryColorG + ', ' + secondaryColorB + ') 51%, rgb(' + secondaryColorR + ', ' + secondaryColorG + ', ' + secondaryColorB + ') 100%)';
                $('#genericModal .selectColorSlot.active').css('background', style);

            let slotIndex                   = parseInt($('#genericModal .selectColorSlot.active').attr('data-slot'));

            let mColorSlotsPrimary_Linear   = this.buildableSubSystem.getPrimaryColorSlots();
                if(mColorSlotsPrimary_Linear !== null)
                {
                    mColorSlotsPrimary_Linear.values[slotIndex].r   = BaseLayout_Math.RGBToLinearColor(primaryColorR);
                    mColorSlotsPrimary_Linear.values[slotIndex].g   = BaseLayout_Math.RGBToLinearColor(primaryColorG);
                    mColorSlotsPrimary_Linear.values[slotIndex].b   = BaseLayout_Math.RGBToLinearColor(primaryColorB);
                }
            let mColorSlotsSecondary_Linear = this.buildableSubSystem.getSecondaryColorSlots();
                if(mColorSlotsSecondary_Linear !== null)
                {
                    mColorSlotsSecondary_Linear.values[slotIndex].r = BaseLayout_Math.RGBToLinearColor(secondaryColorR);
                    mColorSlotsSecondary_Linear.values[slotIndex].g = BaseLayout_Math.RGBToLinearColor(secondaryColorG);
                    mColorSlotsSecondary_Linear.values[slotIndex].b = BaseLayout_Math.RGBToLinearColor(secondaryColorB);
                }

                playerColors    = this.buildableSubSystem.getPlayerColorSlots(); // Refresh
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
            let primaryColor                = this.buildableSubSystem.getDefaultPrimaryColorSlot(slotIndex);
            let secondaryColor              = this.buildableSubSystem.getDefaultSecondaryColorSlot(slotIndex);

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

/*
 * {
    "name": "mColorSlots_Data",
    "type": "ArrayProperty",
    "value": {
        "type": "StructProperty",
        "values": [
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.9529412388801575,
                            "g": 0.3019607365131378,
                            "b": 0.06666668504476547,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.11372549831867218,
                            "g": 0.13333329558372498,
                            "b": 0.26274511218070984,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.14901961386203766,
                            "g": 0.3921568989753723,
                            "b": 0.6549019813537598,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.33725491166114807,
                            "g": 0.250980406999588,
                            "b": 0.12156863510608673,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.8000000715255737,
                            "g": 0.2039215862751007,
                            "b": 0.07450980693101883,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.30588236451148987,
                            "g": 0.3137255012989044,
                            "b": 0.3803921937942505,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.125490203499794,
                            "g": 0.12941177189350128,
                            "b": 0.18431372940540314,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.2392157018184662,
                            "g": 0.3607843220233917,
                            "b": 0.29411765933036804,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.7450980544090271,
                            "g": 0.7647059559822083,
                            "b": 0.8078432083129883,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.11372549831867218,
                            "g": 0.13333334028720856,
                            "b": 0.26274511218070984,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.49803924560546875,
                            "g": 0.729411780834198,
                            "b": 0.2862745225429535,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.11372549831867218,
                            "g": 0.13333334028720856,
                            "b": 0.26274511218070984,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 1,
                            "g": 0.3490196168422699,
                            "b": 0.7921569347381592,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.11372549831867218,
                            "g": 0.13333334028720856,
                            "b": 0.26274511218070984,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.45098042488098145,
                            "g": 0.874509871006012,
                            "b": 0.8431373238563538,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.4901961088180542,
                            "g": 0.3294117748737335,
                            "b": 0.10196079313755035,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.32549020648002625,
                            "g": 0.3450980484485626,
                            "b": 0.3450980484485626,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.9568628072738647,
                            "g": 0.8431373238563538,
                            "b": 0.6823529601097107,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.5843137502670288,
                            "g": 0.3294117748737335,
                            "b": 0.9803922176361084,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.20000001788139343,
                            "g": 0.6392157077789307,
                            "b": 0.4862745404243469,
                            "a": 0.9803922176361084
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.9254902601242065,
                            "g": 0.8431373238563538,
                            "b": 0.32156863808631897,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.30588236451148987,
                            "g": 0.30980393290519714,
                            "b": 0.2666666805744171,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.4705882668495178,
                            "g": 0.09803922474384308,
                            "b": 0.41568630933761597,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.12941177189350128,
                            "b": 0.25882354378700256,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.22352942824363708,
                            "g": 0.22352942824363708,
                            "b": 0.22352942824363708,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.7843137979507446,
                            "g": 0.7921569347381592,
                            "b": 0.874509871006012,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1098039299249649,
                            "g": 0.1098039299249649,
                            "b": 0.1098039299249649,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.1882353127002716,
                            "g": 0.1882353127002716,
                            "b": 0.1882353127002716,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ],
            [
                {
                    "name": "PrimaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 0.9529412388801575,
                            "g": 0.3019607961177826,
                            "b": 0.06666667014360428,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "SecondaryColor",
                    "type": "StructProperty",
                    "value": {
                        "type": "LinearColor",
                        "values": {
                            "r": 1,
                            "g": 0,
                            "b": 0.9294118285179138,
                            "a": 1
                        }
                    }
                },
                {
                    "name": "Metallic",
                    "type": "FloatProperty",
                    "value": 0
                },
                {
                    "name": "Roughness",
                    "type": "FloatProperty",
                    "value": 0
                }
            ]
        ]
    },
    "structureName": "mColorSlots_Data",
    "structureType": "StructProperty",
    "structureSubType": "FactoryCustomizationColorSlot"
}
 */
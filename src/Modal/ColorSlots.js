import iro                                      from '../Lib/iro.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

import SubSystem_Buildable                      from '../SubSystem/Buildable.js';

export default class Modal_ColorSlots
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
    }

    parse()
    {
        $('#genericModal .modal-title').empty().hide();

        let headerTabs = [];
            headerTabs.push('<ul class="nav nav-tabs nav-fill card-header-tabs mb-n3 w-100" style="margin-right: 0.375rem;">');
            headerTabs.push('<li class="nav-item"><a class="nav-link active" data-type="swatches" href="#">' + this.baseLayout.translate._('GLOBAL\\Color swatches') + '</a></li>');
            headerTabs.push('<li class="nav-item"><a class="nav-link" data-type="presets" href="#">' + this.baseLayout.translate._('MAP\\Color presets') + '</a></li>');
            headerTabs.push('</ul>');

        $('#genericModal .modal-header').prepend(headerTabs.join(''));

        this.parseColorSlots();

        $('#genericModal .modal-header > ul').on('click', (e) => {
            let target = $(e.target).attr('data-type');
                switch(target)
                {
                    case 'swatches':
                        if($(e.target).hasClass('active') === false)
                        {
                            $('#genericModal .modal-header > ul .active').removeClass('active');
                            $(e.target).addClass('active');
                            this.parseColorSlots();
                        }
                        break;
                    case 'presets':
                        if($(e.target).hasClass('active') === false)
                        {
                            $('#genericModal .modal-header > ul .active').removeClass('active');
                            $(e.target).addClass('active');
                            this.parseColorPresets();
                        }
                        break;
                }
        });
        $('#genericModal').on('hide.bs.modal', function(){
            $('#genericModal .modal-header > ul').empty().remove();
            $('#genericModal .modal-title').show();
        });
    }

    parseColorSlots()
    {
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

    parseColorPresets(activePreset = 0)
    {
        $('#genericModal .modal-body').empty();

        let addButtonHtml = [];
            addButtonHtml.push('<div class="row mt-3">');
                addButtonHtml.push('<div class="col-12">');
                    addButtonHtml.push('<div class="btn btn-success w-100 text-center btn-add"><i class="fas fa-plus mr-1"></i> Add a new color preset</div>');
                addButtonHtml.push('</div>');
            addButtonHtml.push('</div>');

        let presets = this.baseLayout.gameStateSubSystem.getPlayerColorPresets();
            if(presets.length > 0)
            {
                let html    = [];
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

                html.push(addButtonHtml.join(''));

                $('#genericModal .modal-body').html('<div class="row">'
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
                        $('#genericModal .modal-body .selectColorPreset.active').css('background', style);
                        $('#genericModal .modal-body .selectColorPreset.active').closest('.row').find('h5').html($('#presetColorInputName').val());

                    this.baseLayout.gameStateSubSystem.setPlayerColorPreset(
                        parseInt($('#genericModal .modal-body .selectColorPreset.active').attr('data-preset')),
                        $('#presetColorInputName').val(),
                        {
                            r : BaseLayout_Math.RGBToLinearColor(presetColorR),
                            g : BaseLayout_Math.RGBToLinearColor(presetColorG),
                            b : BaseLayout_Math.RGBToLinearColor(presetColorB),
                            a : BaseLayout_Math.RGBToLinearColor(255),
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

                $('#genericModal .modal-body .selectColorPreset').hover(
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
                $('#genericModal .modal-body .selectColorPreset').on('click', function(){
                    $('#genericModal .modal-body .selectColorPreset').removeClass('active').css('border', '1px solid #000000');
                    $(this).addClass('active').css('border', '3px solid #FFFFFF');

                    let presetIndex                     = parseInt($(this).attr('data-preset'));
                        presetColorPicker.color.rgb     = {r: presets[presetIndex].primaryColor.r, g: presets[presetIndex].primaryColor.g, b: presets[presetIndex].primaryColor.b};

                    $('#presetColorInputR').val(presets[presetIndex].primaryColor.r);
                    $('#presetColorInputG').val(presets[presetIndex].primaryColor.g);
                    $('#presetColorInputB').val(presets[presetIndex].primaryColor.b);

                    $('#presetColorInputHex').val(presetColorPicker.color.hexString);

                    $('#presetColorInputName').val(presets[presetIndex].name);
                });

                $('#genericModal .modal-body .btn-delete').on('click', (e) => {
                    this.baseLayout.gameStateSubSystem.deletePlayerColorPreset(
                        parseInt($(e.target).closest('.row').find('[data-preset]').attr('data-preset'))
                    );

                    $(e.currentTarget).tooltip('dispose');
                    this.parseColorPresets();
                });
            }
            else
            {
                $('#genericModal .modal-body').html('<div class="row" style="height: 492px;"><div class="col-7 align-self-center">' + addButtonHtml.join('') + '</div></div>');
            }

        $('#genericModal .modal-body .btn-add').on('click', () => {
            this.baseLayout.gameStateSubSystem.addPlayerColorPreset(
                'New color preset',
                {
                    r : BaseLayout_Math.RGBToLinearColor(250),
                    g : BaseLayout_Math.RGBToLinearColor(149),
                    b : BaseLayout_Math.RGBToLinearColor(73),
                    a : BaseLayout_Math.RGBToLinearColor(255),
                }
            );

            let presets = this.baseLayout.gameStateSubSystem.getPlayerColorPresets();
                this.parseColorPresets(presets.length - 1);
        });
    }
}
import iro                                      from '../Lib/iro.js';

export default class BaseLayout_Modal
{
    static get defaultOptions()
    {
        return {
            container   : 'body',
            message     : '',
            closeButton : true,
            backdrop    : false
        };
    }

    static get templates()
    {
        return {
            modal           : '<div class="modal fade" tabindex="-1">'
                            + '    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">'
                            + '        <div class="modal-content">'
                            + '            <div class="modal-body"></div>'
                            + '        </div>'
                            + '    </div>'
                            + '</div>',
            modalHeader : '<div class="modal-header"><h5 class="modal-title"></h5></div>',
            modalFooter : '<div class="modal-footer"></div>',

            toastWrapper    : '<div id="toastWrapper" style="position: fixed; top: 86px; right: 10px;"></div>',
            toast           : '<div class="toast border-warning"><div class="toast-body"></div></div>',
            toastHeader     : '<div class="toast-header"><strong class="mr-auto"></strong></div>',

            button          : '<button type="button" class="btn"></button>',
            closeButton     : '<button type="button" class="close">&times;</button>',

            form            : '<form></form>',
            formGroup       : '<div class="form-group"></div>',
            input           : {
                text            : '<input class="form-control text-center" autocomplete="off" type="text">',
                textArea        : '<textarea class="form-control text-center" autocomplete="off" rows="5"></textarea>',
                toggle          : '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" value="1"><label class="custom-control-label">Toggle label</label></div>',
                select          : '<select class="form-control"></select>',
                selectPicker    : '<select class="form-control selectpicker"></select>',
                colorSlots      : '<select class="form-control"></select>',
                inventoryItem   : '<select class="form-control selectpicker"></select>',
                option          : '<option></option>',
                file            : '<div class="custom-file"><input type="file" class="custom-file-input" id="customFile"><label class="custom-file-label" for="customFile">Choose file</label></div>',
                colorPicker     : '<div class="row">'
                                + '    <div class="col-6">'
                                + '        <div class="colorPicker"></div>'
                                + '    </div>'
                                + '    <div class="col-6">'
                                + '        <div class="row mt-3 no-gutters">'
                                + '            <div class="input-group col-12">'
                                + '                <div class="input-group-prepend">'
                                + '                    <span class="input-group-text" style="width: 70px">HEX</span>'
                                + '                </div>'
                                + '                <input type="text" class="form-control text-center inputHex" value="">'
                                + '            </div>'
                                + '        </div>'
                                + '        <div class="row mt-1 no-gutters">'
                                + '            <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">R</span></div><input type="number" class="form-control pl-2 inputR" min="0" max="255"></div>'
                                + '            <div class="col-4 px-1"><div class="input-group"><div class="input-group-prepend"><span class="input-group-text">G</span></div><input type="number" class="form-control px-2 inputG" min="0" max="255"></div></div>'
                                + '            <div class="input-group col-4"><div class="input-group-prepend"><span class="input-group-text">B</span></div><input type="number" class="form-control pl-2 inputB" min="0" max="255"></div>'
                                + '        </div>'
                                + '    </div>'
                                + '</div>'
            }
        };
    }

    static modal(options)
    {
            options         = Object.assign({}, BaseLayout_Modal.defaultOptions, options);
        let modalContent    = $(BaseLayout_Modal.templates.modal);

        let modalBody       = modalContent.find('.modal-body');
            modalBody.html(options.message);

            // Buttons?
            if(Object.keys(options.buttons).length > 0)
            {
                let modalFooter = $(BaseLayout_Modal.templates.modalFooter);
                    for(let buttonKey in options.buttons)
                    {
                        if(options.buttons[buttonKey].element === undefined)
                        {
                            options.buttons[buttonKey].element = BaseLayout_Modal.prepareButton(buttonKey, options.buttons[buttonKey]);
                        }

                        modalFooter.append(options.buttons[buttonKey].element);
                    }

                    modalBody.after(modalFooter);
            }

            // Title?
            if(options.title)
            {
                modalBody.before(BaseLayout_Modal.templates.modalHeader);
                modalContent.find('.modal-title').html(options.title);
            }

            // Close button?
            if(options.closeButton === true)
            {
                let closeButton = $(BaseLayout_Modal.templates.closeButton);
                    if(options.title)
                    {
                        modalContent.find('.modal-header').append(closeButton);
                    }
                    else
                    {
                        closeButton.prependTo(modalBody);
                    }
            }

            // Events
            modalContent.one('hide.bs.modal', function(e){
                if(e.target === this)
                {
                    modalContent.off('escape.close.modal');
                    modalContent.off('click');
                    window.SCIM.map.unpauseMap();
                }
            });
            modalContent.one('hidden.bs.modal', function(e){
                if(e.target === this)
                {
                    modalContent.empty().remove();
                }
            });

            if(options.backdrop !== 'static')
            {
                modalContent.on('click.dismiss.bs.modal', function(e){
                    if(e.target !== e.currentTarget)
                    {
                        return;
                    }

                    modalContent.trigger('escape.close.modal');
                });
                modalContent.on('keyup', function(e){
                    if(e.which === 27)
                    {
                        modalContent.trigger('escape.close.modal');
                    }
                });
            }

            modalContent.on('escape.close.modal', function(e){
                if(options.onEscape)
                {
                    BaseLayout_Modal.processCallback(e, modalContent, options.onEscape);
                }
            });


            modalContent.on('click', '.modal-footer button:not(.disabled)', function(e){
                let callbackKey = $(this).data('modal-handler');
                    if(callbackKey !== undefined)
                    {
                        BaseLayout_Modal.processCallback(e, modalContent, options.buttons[callbackKey].callback);
                    }
            });

            modalContent.on('click', '.close-button', function (e) {
                BaseLayout_Modal.processCallback(e, modalContent, options.onEscape);
            });

            // Add it to the content!
            setTimeout(function(){
                window.SCIM.map.pauseMap();
            }, 150); // Give it some time when a new modal is spawn to avoid the map not being paused

            $(options.container).append(modalContent);
            modalContent.modal({
                backdrop: options.backdrop,
                keyboard: false
            });

            if(options.backdrop === 'static' && options.container !== 'body')
            {
                $('.modal-backdrop').css('z-index', -1); //TODO: Temp fix...
            }
    }

    static notification(options)
    {
        if($.fn.toast)
        {
            let toastWrapper    = $('body').find('#toastWrapper');
            let toastContent    = $(BaseLayout_Modal.templates.toast);
            let toastBody       = toastContent.find('.toast-body');
                toastBody.html(options.message);

                // Wrapper?
                if(toastWrapper.length === 0)
                {
                    toastWrapper = $(BaseLayout_Modal.templates.toastWrapper);
                    $('body').append(toastWrapper);
                }

                // Title?
                if(options.title || options.image)
                {
                    toastBody.before(BaseLayout_Modal.templates.toastHeader);

                    if(options.title)
                    {
                        toastContent.find('.toast-header > strong').html(options.title);
                    }

                    if(options.image)
                    {
                        toastContent.find('.toast-header').prepend('<img src="' + options.image + '" style="width: 24px;" class="rounded mr-2">');
                    }
                }

                toastWrapper.append(toastContent);
                toastContent.toast({delay: 5000}).toast('show');
                toastContent.on('hidden.bs.toast', function(){
                    toastContent.remove();

                    let toastWrapperCount    = $('body').find('#toastWrapper').find('.toast');
                        if(toastWrapperCount.length === 0)
                        {
                            toastWrapper.remove();
                        }
                });
        }
        else
        {
            alert(options.message);
        }
    }

    static alert(value)
    {
        if($.fn.modal)
        {
            let options                         = {};
                options.message                 = value;
                options.closeButton             = false;
                options.backdrop                = 'static';
                options.buttons                 = {ok: {label: 'Ok'}};
                options.buttons.ok.callback     = options.onEscape = function(){ return true; };

                return BaseLayout_Modal.modal(options);
        }
        else
        {
            alert(value);
        }
    }

    static confirm(options)
    {
        if(!$.isFunction(options.callback))
        {
            throw new Error('Modal.confirm requires a callback');
        }

        if(options.buttons === undefined){ options.buttons = {confirm: {}, cancel: {}}; }
        options.buttons.confirm         = Object.assign({label: 'Confirm', className: 'btn-success'}, options.buttons.confirm);
        options.buttons.cancel          = Object.assign({label: 'Cancel', className: 'btn-danger'}, options.buttons.cancel);

        options.closeButton             = false;
        options.backdrop                = 'static';

        options.buttons.cancel.callback = options.onEscape = function(){
            return options.callback.call(this, false);
        };

        options.buttons.confirm.callback = function(){
            return options.callback.call(this, true);
        };

        return BaseLayout_Modal.modal(options);
    }

    static form(options)
    {
        if(!$.isFunction(options.callback))
        {
            throw new Error('Modal.confirm requires a callback');
        }

        if(options.buttons === undefined){ options.buttons = {cancel: {}, confirm: {}}; }
        options.buttons.cancel          = Object.assign({label: 'Cancel', className: 'btn-danger'}, options.buttons.cancel);
        options.buttons.confirm         = Object.assign({label: 'Submit', className: 'btn-success'}, options.buttons.confirm);

        options.closeButton             = false;

        options.buttons.cancel.callback = function(){
            form.find('.selectpicker').selectpicker('destroy');

            if(options.onEscape)
            {
                options.onEscape();
            }
        };

        options.buttons.confirm.callback = function(){
            let values = {};

                for(let i = 0; i < options.inputs.length; i++)
                {
                    let input = options.inputs[i];

                        switch(input.inputType)
                        {
                            case 'inventoryItem':
                                values['QTY_' + input.name] = input.element.find('input[name=' + 'QTY_' + input.name + ']').val();
                            case 'select':
                            case 'selectPicker':
                            case 'colorSlots':
                            case 'inventoryItem':
                                values[input.name] = input.element.find('select').val();
                                break;
                            case 'toggle':
                                values[input.name] = 0;
                                if(input.element.find('input').is(':checked'))
                                {
                                    values[input.name] = 1;
                                }
                                break;
                            case 'textArea':
                                values[input.name] = input.element.find('textarea').val();
                                break;
                            case 'file':
                                values[input.name] = input.element.find('input').prop('files')[0];
                                break;
                            case 'colorPicker':
                                values[input.name] = {
                                    r: parseInt(input.element.find('.inputR').val()) || 0,
                                    g: parseInt(input.element.find('.inputG').val()) || 0,
                                    b: parseInt(input.element.find('.inputB').val()) || 0
                                };
                                break;
                            default:
                                values[input.name] = input.element.find('input').val();
                        }
                }

            form.find('.selectpicker').selectpicker('destroy');
            return options.callback.call(this, values);
        };

        // Create form
        let form    = $(BaseLayout_Modal.templates.form);
            form.on('submit', function(e)
            {
                e.preventDefault();
                e.stopPropagation();

                if(options.buttons.confirm !== undefined && options.buttons.confirm.element !== undefined)
                {
                    options.buttons.confirm.element.trigger('click');
                }
            });

        // Create inputs
        for(let i = 0; i < options.inputs.length; i++)
        {
            options.inputs[i].element = BaseLayout_Modal.prepareInput(options.inputs[i]);
            form.append(options.inputs[i].element);
        }

        if(options.message !== undefined)
        {
            form.prepend('<div class="mb-3">' + options.message + '</div>');
        }

        let selectPickers = form.find('.selectpicker');
            if(selectPickers.length > 0)
            {
                $(selectPickers).selectpicker({liveSearch: true, container: 'body'});

                let updateHeight = $(selectPickers).attr('data-height');
                    if(updateHeight === 'true')
                    {
                        $(selectPickers).on('loaded.bs.select changed.bs.select', function (e){
                            let button = $(e.target).next('button');
                                button.parent('.bootstrap-select').css('height', 'auto');
                            let height = parseInt(button.find('.filter-option-inner').outerHeight()) + parseInt(button.css('padding-top')) + parseInt(button.css('padding-bottom')) - 2;
                                button.css('height', height + 'px');
                        });
                    }
            }

        options.message = form;
        return BaseLayout_Modal.modal(options);
    }

    static prepareInput(options)
    {
        let input = $( ((BaseLayout_Modal.templates.input[options.inputType] !== undefined) ? BaseLayout_Modal.templates.input[options.inputType] : BaseLayout_Modal.templates.input['text']) );
            input.attr('name', options.name);

            if(options.multiple !== undefined && options.multiple === true)
            {
                input.attr('multiple','multiple');
            }
            if(options.inputHeight)
            {
                input.attr('data-height', 'true');
            }

            switch(options.inputType)
            {
                case 'select':
                case 'selectPicker':
                case 'colorSlots':
                case 'inventoryItem':
                    let optionGroups = {};
                        $.each(options.inputOptions, function(_, option){
                            let element     = input;
                            let optionEl    = $(BaseLayout_Modal.templates.input.option);

                                if(option.group)
                                {
                                    if(!optionGroups[option.group])
                                    {
                                        optionGroups[option.group] = $('<optgroup />').attr('label', option.group);
                                    }

                                    element = optionGroups[option.group];
                                }

                                optionEl.attr('value', option.value).text(option.text);

                                if(option.style !== undefined)
                                {
                                    optionEl.attr('style', option.style);
                                }
                                if(option.dataContent !== undefined)
                                {
                                    optionEl.attr('data-content', option.dataContent);
                                }

                                element.append(optionEl);
                        });

                    for(let group in optionGroups)
                    {
                        input.append(optionGroups[group]);
                    }

                    // Handle select array (multiple)
                    if(options.multiple !== undefined && options.multiple === true)
                    {
                        $.each(options.value, function(_, value){
                            input.find('option[value="' + value + '"]').prop('selected', true);
                        });
                    }
                    else
                    {
                        input.find('option[value="' + options.value + '"]').prop('selected', true);
                    }
                    break;
                case 'toggle':
                    input.removeAttr('name');
                    input.find('input').attr('name', options.name)
                                       .attr('id', options.name);
                    input.find('label').attr('for', options.name);

                    if(options.label !== undefined)
                    {
                        input.find('label').html(options.label);
                    }
                    if(options.value !== undefined && options.value === 1)
                    {
                        input.find('input').prop('checked', true);
                    }
                    break;
                case 'colorPicker':
                    input.ColorPicker = new iro.ColorPicker(input.find('.colorPicker')[0], {
                        width       : 294,
                        display     : 'inline-block',
                        color       : ((options.value instanceof Object && options.value.r !== undefined) ? 'rgb(' + options.value.r + ', ' + options.value.g + ', ' + options.value.b + ')' : options.value),
                        borderWidth : 1,
                        borderColor : "#000000"
                    });

                    input.find('.inputR').val(input.ColorPicker.color.rgb.r);
                    input.find('.inputG').val(input.ColorPicker.color.rgb.g);
                    input.find('.inputB').val(input.ColorPicker.color.rgb.b);
                    input.find('.inputHex').val(input.ColorPicker.color.hexString);

                    input.ColorPicker.on('input:change', function(color){
                        input.find('.inputR').val(color.rgb.r);
                        input.find('.inputG').val(color.rgb.g);
                        input.find('.inputB').val(color.rgb.b);

                        input.find('.inputHex').val(color.hexString);
                    });

                    input.find('.inputR, .inputG, .inputB').on('change keyup input', () => {
                        let primaryColorR               = parseInt(input.find('.inputR').val()) || 0;
                        let primaryColorG               = parseInt(input.find('.inputG').val()) || 0;
                        let primaryColorB               = parseInt(input.find('.inputB').val()) || 0;

                            input.ColorPicker.color.rgb = {r: primaryColorR, g: primaryColorG, b: primaryColorB};
                            input.find('.inputHex').val(input.ColorPicker.color.hexString);
                    });
                    input.find('.inputHex').on('change keyup input', function(){
                        let hexColor = $(this).val();
                            if([...hexColor].length === 7)
                            {
                                try
                                {
                                    input.ColorPicker.color.hexString = hexColor;

                                    input.find('.inputR').val(input.ColorPicker.color.rgb.r);
                                    input.find('.inputG').val(input.ColorPicker.color.rgb.g);
                                    input.find('.inputB').val(input.ColorPicker.color.rgb.b);
                                }
                                catch(e){}; // Silently fail until a correct value is entered...
                            }
                    });

                    break;
                case 'file':
                    input.find('.custom-file-input').on('change',function(){
                        let fileName = $(this).val().replace('C:\\fakepath\\', " ");
                            $(this).next('.custom-file-label').html(fileName);
                    });
                    break;
                default:
                    input.val(options.value);
            }

        // Add form group and label
        let group = $(BaseLayout_Modal.templates.formGroup);
            if(options.label !== undefined && ['inventoryItem', 'toggle'].includes(options.inputType) === false)
            {
                group.prepend('<label>' + options.label + '</label>');
            }

        // Custom fields
        if(options.inputType === 'coordinate')
        {
            input = $('<div class="input-group"></div>').append(input);
            input.prepend('<div class="input-group-prepend"><button class="btn btn-outline-secondary text-white" type="button">-8m</button><button class="btn btn-outline-secondary text-white" type="button">-4m</button><button class="btn btn-outline-secondary text-white" type="button">-1m</button></div>');
            input.append('<div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button">+1m</button><button class="btn btn-outline-secondary text-white" type="button">+4m</button><button class="btn btn-outline-secondary text-white" type="button">+8m</button></div>');

            input.find('.input-group-prepend > button:eq(0)').click(function(){
                let clicked = input.find('input');
                    clicked.val(parseFloat(clicked.val()) - 800);
            });
            input.find('.input-group-prepend > button:eq(1)').click(function(){
                let clicked = input.find('input');
                    clicked.val(parseFloat(clicked.val()) - 400);
            });
            input.find('.input-group-prepend > button:eq(2)').click(function(){
                let clicked = input.find('input');
                    clicked.val(parseFloat(clicked.val()) - 100);
            });
            input.find('.input-group-append > button:eq(0)').click(function(){
                let clicked = input.find('input');
                    clicked.val(parseFloat(clicked.val()) + 100);
            });
            input.find('.input-group-append > button:eq(1)').click(function(){
                let clicked = input.find('input');
                    clicked.val(parseFloat(clicked.val()) + 400);
            });
            input.find('.input-group-append > button:eq(2)').click(function(){
                let clicked = input.find('input');
                    clicked.val(parseFloat(clicked.val()) + 800);
            });
        }

        if(options.inputType === 'number')
        {
            input = $('<div class="input-group"></div>').append(input);
            input.prepend('<div class="input-group-prepend"><button class="btn btn-outline-secondary text-white" type="button">-</button></div>');
            input.append('<div class="input-group-append"><button class="btn btn-outline-secondary text-white" type="button">+</button></div>');

            input.find('.input-group-prepend > button').click(function(){
                let clicked = input.find('input');
                    clicked.val(Math.max(options.min, Math.min(options.max, parseInt(clicked.val()) - 1)));
            });
            input.find('.input-group-append > button').click(function(){
                let clicked = input.find('input');
                    clicked.val(Math.max(options.min, Math.min(options.max, parseInt(clicked.val()) + 1)));
            });
        }

        if(options.inputType === 'colorSlots')
        {
            let html            = [];
            let totalColorSlot  = options.inputOptions.length;
            let column          = 0;

            for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
            {
                if(column % 5 === 0)
                {
                    if(slotIndex > 0)
                    {
                        html.push('</div>');
                    }
                    html.push('<div class="d-flex flex-row justify-content-center mb-3">');
                }

                if(options.inputOptions[slotIndex].fullWidth !== undefined && options.inputOptions[slotIndex].fullWidth === true)
                {
                    column = 0;
                }
                else
                {
                    column++;
                }

                let backgroundStyle = 'background: ' + options.inputOptions[slotIndex].primaryColor + ';';
                    if(options.inputOptions[slotIndex].secondaryColor !== undefined)
                    {
                        backgroundStyle = 'background: linear-gradient(135deg, ' + options.inputOptions[slotIndex].primaryColor + ' 0%, ' + options.inputOptions[slotIndex].primaryColor + ' 50%, ' + options.inputOptions[slotIndex].secondaryColor + ' 51%, ' + options.inputOptions[slotIndex].secondaryColor + ' 100%);';
                    }

                let borderStyle     = 'border: 1px solid #000000;';
                let sizeStyle       = 'width: 96px;height: 96px;';
                let radiusStyle     = 'border-radius: 50%;';

                    if(options.inputOptions[slotIndex].value === options.value)
                    {
                        borderStyle     = 'border: 3px solid #FFFFFF;';
                    }
                    if(options.inputOptions[slotIndex].fullWidth !== undefined && options.inputOptions[slotIndex].fullWidth === true)
                    {
                        sizeStyle       = 'width: 495px;height: 48px;';
                        radiusStyle     = 'border-radius: 5px;';
                    }

                    html.push('<div class="d-flex flex-row modal-selectColorSlot align-items-center" style="position: relative;' + backgroundStyle + sizeStyle + borderStyle + radiusStyle + 'margin: 2px;" data-slot="' + options.inputOptions[slotIndex].value + '">');
                        html.push('<div class="w-100 text-center">');
                            html.push('<strong style="text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">' + options.inputOptions[slotIndex].text + '</strong>');
                        html.push('</div>');
                    html.push('</div>');
            }
            html.push('</div>');

            group.append(html.join(''));
            input.hide();

            group.find('.modal-selectColorSlot').click(function(){
                group.find('.modal-selectColorSlot').css('border', '1px solid #000000');
                $(this).css('border', '3px solid #FFFFFF');
                let newSlotIndex = $(this).attr('data-slot');
                    input.find('option[value="' + newSlotIndex + '"]').prop('selected', true);
            });
        }

        if(options.inputType === 'inventoryItem')
        {
            input = $('<div class="input-group"></div>').append(input);
            input.prepend('<div class="input-group-prepend"><span class="input-group-text text-center" style="width: 60px;display: inline-block;">' + options.label + '</span></div>');

            if(options.qty !== undefined)
            {
                let qty = $(BaseLayout_Modal.templates.input.text);
                    qty.attr('name', 'QTY_' + options.name);
                    qty.val(options.qty);
                    qty.css('min-width', '80px').css('width', '80px').css('flex-grow', '0');

                    input.find('.input-group-prepend').after(qty);
            }
        }

        return group.append(input);
    }

    static prepareButton(buttonKey, options)
    {
        let button = $(BaseLayout_Modal.templates.button);
            button.data('modal-handler', buttonKey);
            button.addClass( ((options.className !== undefined) ? options.className : 'btn-primary') );
            button.html(options.label);

            return button;
    }

    static processCallback(e, modalContent, callback)
    {
        e.stopPropagation();
        e.preventDefault();

        let preserveModal = $.isFunction(callback) && callback.call(modalContent, e) === false;
            if(!preserveModal)
            {
                modalContent.modal('hide');
            }
    }
}
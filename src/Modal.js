export default class Modal
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
            modal       : '<div class="modal fade" tabindex="-1" role="dialog">' +
                          '    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">' +
                          '        <div class="modal-content">' +
                          '            <div class="modal-body"></div>' +
                          '        </div>' +
                          '    </div>' +
                          '</div>',

            header      : '<div class="modal-header">' +
                          '    <h5 class="modal-title"></h5>' +
                          '</div>',
            footer      : '<div class="modal-footer"></div>',

            button      : '<button type="button" class="btn"></button>',
            closeButton : '<button type="button" class="close">&times;</button>',

            form        : '<form></form>',
            formGroup   : '<div class="form-group"></div>',
            input       : {
                text            : '<input class="form-control text-center" autocomplete="off" type="text">',
                toggle          : '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" value="1"><label class="custom-control-label">Toggle label</label></div>',
                select          : '<select class="form-control"></select>',
                selectPicker    : '<select class="form-control selectpicker"></select>',
                colorSlots      : '<select class="form-control"></select>',
                inventoryItem   : '<select class="form-control selectpicker"></select>',
                option          : '<option></option>',
            }
        };
    }

    static modal(options)
    {
            options         = Object.assign({}, Modal.defaultOptions, options);
        let modalContent    = $(Modal.templates.modal);

        let modalBody       = modalContent.find('.modal-body');
            modalBody.html(options.message);

            // Buttons?
            if(Object.keys(options.buttons).length > 0)
            {
                let footer = $(Modal.templates.footer);

                    for(let buttonKey in options.buttons)
                    {
                        if(options.buttons[buttonKey].element === undefined)
                        {
                            options.buttons[buttonKey].element = Modal.prepareButton(buttonKey, options.buttons[buttonKey]);
                        }

                        footer.append(options.buttons[buttonKey].element);
                    }

                    modalBody.after(footer);
            }

            // Title?
            if(options.title)
            {
                modalBody.before(Modal.templates.header);
                modalContent.find('.modal-title').html(options.title);
            }

            // Close button?
            if(options.closeButton === true)
            {
                let closeButton = $(Modal.templates.closeButton);
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
                }
            });
            modalContent.one('hidden.bs.modal', function(e){
                if(e.target === this)
                {
                    modalContent.remove();
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
                    Modal.processCallback(e, modalContent, options.onEscape);
                }
            });


            modalContent.on('click', '.modal-footer button:not(.disabled)', function(e){
                let callbackKey = $(this).data('modal-handler');
                    if(callbackKey !== undefined)
                    {
                        Modal.processCallback(e, modalContent, options.buttons[callbackKey].callback);
                    }
            });

            modalContent.on('click', '.close-button', function (e) {
                Modal.processCallback(e, modalContent, options.onEscape);
            });

            // Add it to the content!
            $(options.container).append(modalContent);
            modalContent.modal({
                backdrop: options.backdrop,
                keyboard: false
            });

            if(options.backdrop === 'static' && options.container !== 'body')
            {
                $('.modal-backdrop').css('z-index', -1); // Temp fix...
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

                return Modal.modal(options);
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

        return Modal.modal(options);
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

        options.buttons.cancel.callback = options.onEscape = function(){
            form.find('.selectpicker').selectpicker('destroy');
            return options.callback.call(this, null);
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
                            default:
                                values[input.name] = input.element.find('input').val();
                        }
                }

            form.find('.selectpicker').selectpicker('destroy');
            return options.callback.call(this, values);
        };

        // Create form
        let form    = $(Modal.templates.form);
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
            options.inputs[i].element = Modal.prepareInput(options.inputs[i]);
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
            }

        options.message = form;
        return Modal.modal(options);
    }

    static prepareInput(options)
    {
        let input = $( ((Modal.templates.input[options.inputType] !== undefined) ? Modal.templates.input[options.inputType] : Modal.templates.input['text']) );
            input.attr('name', options.name);

            switch(options.inputType)
            {
                case 'select':
                case 'selectPicker':
                case 'colorSlots':
                case 'inventoryItem':
                    let optionGroups = {};
                        $.each(options.inputOptions, function(_, option){
                            let element     = input;
                            let optionEl    = $(Modal.templates.input.option);

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

                    input.find('option[value="' + options.value + '"]').prop('selected', true);
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
                default:
                    input.val(options.value);
            }

        // Add form group and label
        let group = $(Modal.templates.formGroup);
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
            let html            = new Array();
            let totalColorSlot  = options.inputOptions.length;

            for(let slotIndex = 0; slotIndex < totalColorSlot; slotIndex++)
            {
                if(slotIndex % 4 === 0) //slotIndex === 0 || slotIndex === 4 || slotIndex === 8 || slotIndex === 12)
                {
                    if(slotIndex > 0)
                    {
                        html.push('</div>');
                    }
                    html.push('<div class="d-flex flex-row justify-content-center">');
                }

                let backgroundStyle = 'background: linear-gradient(135deg, ' + options.inputOptions[slotIndex].primaryColor + ' 0%, ' + options.inputOptions[slotIndex].primaryColor + ' 50%, ' + options.inputOptions[slotIndex].secondaryColor + ' 51%, ' + options.inputOptions[slotIndex].secondaryColor + ' 100%);';
                let borderStyle     = 'border: 1px solid #000000;';
                let sizeStyle       = 'width: 96px;height: 96px;';

                    if(slotIndex === options.value)
                    {
                        borderStyle     = 'border: 3px solid #FFFFFF;';
                    }
                    if(options.inputOptions[slotIndex].fullWidth !== undefined && options.inputOptions[slotIndex].fullWidth === true)
                    {
                        sizeStyle       = 'width: 396px;height: 48px;';
                    }

                    html.push('<div class="d-flex flex-row modal-selectColorSlot align-items-center" style="position: relative;' + backgroundStyle + sizeStyle + borderStyle + 'border-radius: 5px;margin: 2px;" data-slot="' + slotIndex + '">');
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
                let qty = $(Modal.templates.input.text);
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
        let button = $(Modal.templates.button);
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
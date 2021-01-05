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
                        let button = $(Modal.templates.button);
                            button.data('modal-handler', buttonKey);

                            if(options.buttons[buttonKey].className !== undefined)
                            {
                                button.addClass(options.buttons[buttonKey].className);
                            }
                            else
                            {
                                button.addClass('btn-primary');
                            }

                            button.html(options.buttons[buttonKey].label);
                            footer.append(button);
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
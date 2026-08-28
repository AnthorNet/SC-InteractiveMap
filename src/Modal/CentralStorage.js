/* global Intl, gtag */
export default class Modal_CentralStorage
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;

        if(typeof gtag === 'function')
        {
            gtag('event', 'CentralStorage', {event_category: 'Statistics'});
        }
    }

    parse()
    {
        $('#genericModal .modal-title').empty().html('Dimensional Depot');

        let mStoredItems    = this.baseLayout.centralStorageSubSystem.getStoredItems();
        let html            = [];

        if(mStoredItems !== null)
        {
            for(let i = 0; i < mStoredItems.values.length; i++)
            {
                html.push(this.getInventoryLine(mStoredItems.values[i], i));
            }
        }

        $('#genericModal .modal-body').empty().html(html.join(''));
        setTimeout(() => {
            $('#genericModal').modal('show').modal('handleUpdate');

            $('#genericModal .modal-body input').on('change keyup', (e) => {
                let div     = $(e.target).closest('table').parent()
                let index   = div.attr('data-depot-id');
                let value   = $(e.target).val();

                    for(let i = 0; i < mStoredItems.values[index].length; i++)
                    {
                        if(mStoredItems.values[index][i].name === 'Amount' || mStoredItems.values[index][i].name === 'amount')
                        {
                            mStoredItems.values[index][i].value = parseInt(value);
                        }
                    }
                setTimeout(() => {
                    div.find('.progress-bar').css('width', (parseInt(value) / parseInt($(e.target).attr('max')) * 100) + '%');
                }, 250);
            });
        }, 250);
    }

    getInventoryLine(value, index)
    {
        let html            = [];
        let itemClassName   = null;
        let itemAmount      = 0;
        let maxStack        = 50 * this.baseLayout.centralStorageSubSystem.getMaxStack();

            for(let i = 0; i < value.length; i++)
            {
                if(value[i].name === 'ItemClass')
                {
                    itemClassName = value[i].value.pathName;
                }
                if(value[i].name === 'Amount' || value[i].name === 'amount')
                {
                    itemAmount = value[i].value;
                }
            }

            if(itemClassName !== null)
            {
                let currentItem = this.baseLayout.getItemDataFromClassName(itemClassName);
                    if(currentItem.stack !== undefined)
                    {
                        maxStack = currentItem.stack * this.baseLayout.centralStorageSubSystem.getMaxStack();
                    }

                html.push('<div data-depot-id="' + index + '" data-classname="' + currentItem.className + '">');
                    html.push('<table class="w-100">');
                    html.push('<tr>');
                        html.push('<td class="align-middle" width="88">');
                            html.push('<img src="' + currentItem.image + '" class="img-fluid" style="width: 64px;">');
                        html.push('</td>');
                        html.push('<td class="align-middle">');
                            html.push('<strong style="font-size: 120%;">' + currentItem.name + '</strong>');
                        html.push('</td>');
                        html.push('<td class="align-middle text-right" width="200">');
                            html.push('<div class="input-group"><input type="number" class="form-control text-center" value="' + itemAmount + '" min="0" max="' + maxStack + '"><span class="input-group-text" id="basic-addon2"> / ' + maxStack + '</span></div>');
                        html.push('</td>');
                    html.push('</tr>');
                    html.push('</table>');

                    let currentProgress = Math.min(100, Math.round(itemAmount / maxStack * 10000) / 100);
                        html.push('<div class="progress rounded-sm mt-2" style="height: 15px;"><div class="progress-bar bg-warning" style="width: ' + currentProgress + '%"></div></div>');

                    html.push('<hr class="bg-warning" />');
                html.push('</div>');
            }

        return html.join('');
    }
}
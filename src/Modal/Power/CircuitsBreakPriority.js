/* global Intl, gtag */
import BaseLayout_Tooltip                       from '../../BaseLayout/Tooltip.js';

import Building_PowerSwitch                     from '../../Building/PowerSwitch.js';

export default class Modal_Power_CircuitsBreakPriority
{
    constructor(options)
    {
        this.baseLayout = options.baseLayout;

        if(typeof gtag === 'function')
        {
            gtag('event', 'PowerCircuitsBreakPriority', {event_category: 'Statistics'});
        }
    }

    parse()
    {
        $('#genericModal .modal-title').empty().html('Circuit Break Priority');

        let html    = [];
            html.push('<div class="row">');
                html.push('<div class="col" style="max-width: 80%;">');
                    html.push('<div class="row">');
                        html.push('<div class="col pb-3">');
                            html.push(this.getPriorityCard(1));
                        html.push('</div>');
                        html.push('<div class="col pl-0 pb-3">');
                            html.push(this.getPriorityCard(2));
                        html.push('</div>');
                        html.push('<div class="col pl-0 pb-3">');
                            html.push(this.getPriorityCard(3));
                        html.push('</div>');
                        html.push('<div class="col pl-0 pb-3">');
                            html.push(this.getPriorityCard(4));
                        html.push('</div>');
                    html.push('</div>');
                    html.push('<div class="row">');
                        html.push('<div class="col">');
                            html.push(this.getPriorityCard(5));
                        html.push('</div>');
                        html.push('<div class="col pl-0">');
                            html.push(this.getPriorityCard(6));
                        html.push('</div>');
                        html.push('<div class="col pl-0">');
                            html.push(this.getPriorityCard(7));
                        html.push('</div>');
                        html.push('<div class="col pl-0">');
                            html.push(this.getPriorityCard(8));
                        html.push('</div>');
                    html.push('</div>');
                html.push('</div>');
                html.push('<div class="col pl-0" style="max-width: 20%;">');
                    html.push(this.getPriorityCard(0));
                html.push('</div>');
            html.push('</div>');


        $('#genericModal .modal-body').empty().html(html.join(''));
        setTimeout(() => {
            $('#genericModal').modal('show').modal('handleUpdate');

            $('#genericModal .modal-body ul[data-priority] > li')
                .on('dragstart', (e) => {
                    event.dataTransfer.setData('text/plain', $(e.target).attr('data-pathName'));
                    $(e.target).addClass('bg-warning');
                })
                .on('dragend', (e) => {
                    $(e.target).removeClass('bg-warning');
                });

            $('#genericModal .modal-body ul[data-priority]')
                .on('dragover', (e) => {
                    e.preventDefault();
                })
                .on('dragenter', (e) => {
                    $('#genericModal .modal-body .card').removeClass('border-warning');
                    $(e.currentTarget).closest('.card').addClass('border-warning');
                })
                .on('dragleave', (e) => {
                    if($(e.target).hasClass('list-group-item') === false)
                    {
                        $(e.target).closest('.card').removeClass('border-warning');
                    }
                })
                .on('drop', (e) => {
                    e.preventDefault();
                    $('#genericModal .modal-body .card').removeClass('border-warning');

                    let currentSwitch = this.baseLayout.saveGameParser.getTargetObject(event.dataTransfer.getData('text/plain'));
                        if(currentSwitch !== null)
                        {
                            let oldPriority = Building_PowerSwitch.getPriorityGroup(this.baseLayout, currentSwitch);
                            let newPriority = parseInt($(e.currentTarget).attr('data-priority'));

                            if(oldPriority !== newPriority)
                            {
                                for (let i = 0; i < this.baseLayout.circuitSubSystem.prioritySwitches[oldPriority].length; i++)
                                {
                                    if(this.baseLayout.circuitSubSystem.prioritySwitches[oldPriority][i] === currentSwitch.pathName)
                                    {
                                        this.baseLayout.circuitSubSystem.prioritySwitches[oldPriority].splice(i, 1);
                                        break;
                                    }
                                }

                                this.baseLayout.circuitSubSystem.prioritySwitches[newPriority].push(currentSwitch.pathName);

                                Building_PowerSwitch.setPriorityGroup(this.baseLayout, currentSwitch, newPriority);

                                let modalPowerCircuitsBreakPriority = new Modal_Power_CircuitsBreakPriority({
                                    baseLayout      : this.baseLayout
                                });
                                modalPowerCircuitsBreakPriority.parse();
                            }
                        }
                });

                $('#genericModal .modal-body ul[data-priority] li img').on('click', (e) => {
                    e.preventDefault();

                    let currentSwitch = this.baseLayout.saveGameParser.getTargetObject($(e.currentTarget).closest('li').attr('data-pathName'));
                        if(currentSwitch !== null)
                        {
                            let switchOn = Building_PowerSwitch.isOn(this.baseLayout, currentSwitch);
                                if(switchOn === true)
                                {
                                    this.baseLayout.deleteObjectProperty(currentSwitch, 'mIsSwitchOn');
                                    $(e.currentTarget).attr('src', this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_OnOffSwitch_Off.png?v=' + this.baseLayout.scriptVersion);
                                }
                                else
                                {
                                    this.baseLayout.setObjectProperty(currentSwitch, 'mIsSwitchOn', 1, 'Bool');
                                    $(e.currentTarget).attr('src', this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_OnOffSwitch_On.png?v=' + this.baseLayout.scriptVersion);
                                }
                        }
                });
        }, 250);
    }

    getPriorityCard(priority)
    {
        let html    = [];
            html.push('<div class="card border-secondary h-100">');
                html.push('<div class="card-header p-2">' + ((priority !== 0) ? 'Priority Group ' + priority : 'Undefined') + '</div>');
                html.push('<ul class="list-group list-group-flush h-100" style="min-height: 150px;" data-priority="' + priority + '">');

                for(let i = 0; i < this.baseLayout.circuitSubSystem.prioritySwitches[priority].length; i++)
                {
                    let currentSwitch = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.circuitSubSystem.prioritySwitches[priority][i]);
                        if(currentSwitch !== null)
                        {
                            html.push('<li class="list-group-item p-2 small" draggable="true" data-pathName="' + currentSwitch.pathName + '" style="cursor: grab;">');

                            let switchTag = Building_PowerSwitch.getSign(this.baseLayout, currentSwitch);
                                html.push('<span>' + ((switchTag !== null) ? switchTag : 'Unnamed Switch') + '</span>');

                            let switchOn = Building_PowerSwitch.isOn(this.baseLayout, currentSwitch);
                                html.push('<span class="float-right">');
                                if(switchOn === true)
                                {
                                    html.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_OnOffSwitch_On.png?v=' + this.baseLayout.scriptVersion + '" style="cursor: pointer;" />');
                                }
                                else
                                {
                                    html.push('<img src="' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_OnOffSwitch_Off.png?v=' + this.baseLayout.scriptVersion + '" style="cursor: pointer;" />');
                                }
                                html.push('</span>');


                            html.push('</li>');
                        }
                }

                html.push('</ul>');
            html.push('</div>');

        return html.join('');
    }
}
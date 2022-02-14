/* global Intl */
import Building_Locomotive                      from '../../Building/Locomotive.js';

export default class Modal_Train_Timetable
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.locomotive         = options.locomotive;

        this.trainIdentifier    = this.baseLayout.railroadSubSystem.getObjectIdentifier(this.locomotive);
        this.timeTable          = this.baseLayout.getObjectProperty(this.trainIdentifier, 'TimeTable');

        if(this.timeTable !== null)
        {
            this.timeTable = this.baseLayout.saveGameParser.getTargetObject(this.timeTable.pathName);
        }
    }

    parse()
    {
        if(this.timeTable !== null)
        {
            $('#genericModal .modal-title').empty().html('Timetable - ' + Building_Locomotive.getTrainName(this.baseLayout, this.locomotive, this.trainIdentifier.pathName));
            let html = [];
                html.push('<div class="row">');
                    html.push('<div class="col-6" style="max-height: 512px;overflow-y: scroll;">');
                        html.push(this.getTimeTableList());
                    html.push('</div>');
                    html.push('<div class="col-6">');
                        html.push(this.baseLayout.mapSubSystem.getMinimap(this.getTimeTablePoints()));
                    html.push('</div>');
                html.push('</div>');

            $('#genericModal .modal-body').empty().html(html.join(''));
            setTimeout(function(){
                $('#genericModal').modal('show').modal('handleUpdate');
            }, 250);

            $('#genericModal .modal-body table tr[data-stop]').hover(function(){
                let stop = $(this).attr('data-stop');
                    $('#genericModal .modal-body .img-thumbnail span[data-stop=' + stop + ']')
                        .css('border-color', '#FF0000')
                        .css('z-index', 2)
            }, function(){
                let stop = $(this).attr('data-stop');
                    $('#genericModal .modal-body .img-thumbnail span[data-stop=' + stop + ']')
                        .css('border-color', '#777777')
                        .css('z-index', 1)
            });
        }
    }

    getTimeTableList()
    {
        let html = [];
        let mStops = this.baseLayout.getObjectProperty(this.timeTable, 'mStops');
            if(mStops !== null)
            {
                let mCurrentStop    = this.baseLayout.getObjectProperty(this.timeTable, 'mCurrentStop', 0);

                html.push('<table class="table table-hover mb-0">');
                    for(let j = 0; j < mStops.values.length; j++)
                    {
                        let trainStationIdentifier  = null;
                        let trainStationRules       = null;
                            for(let k = 0; k < mStops.values[j].length; k++)
                            {
                                if(mStops.values[j][k].name === 'Station' && mStops.values[j][k].value.pathName !== undefined)
                                {
                                    trainStationIdentifier = this.baseLayout.saveGameParser.getTargetObject(mStops.values[j][k].value.pathName);
                                }
                                if(mStops.values[j][k].name === 'DockingRuleSet')
                                {
                                    trainStationRules = mStops.values[j][k].value.values;
                                }
                            }

                        html.push('<tr data-stop="'+ j + '">');
                            html.push('<td width="1" class="text-right"><h6>' + (j + 1) + '.</h6></td>');
                            html.push('<td>');
                                if(trainStationIdentifier !== null)
                                {
                                    let mStation        = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStation');
                                    let mStationName    = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStationName');
                                    let isDocked        = false;

                                        if(mStation !== null)
                                        {
                                            let currentStation      = this.baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                                            let mDockingLocomotive  = this.baseLayout.getObjectProperty(currentStation, 'mDockingLocomotive');
                                                if(mDockingLocomotive !== null)
                                                {
                                                    if(this.locomotive.pathName === mDockingLocomotive.pathName)
                                                    {
                                                        isDocked = true;
                                                    }
                                                }
                                        }

                                        html.push('<h6 class="mb-0">');
                                            html.push(((mStationName !== null) ? mStationName : trainStationIdentifier.pathName));

                                            if(isDocked === true)
                                            {
                                                html.push(' <sup class="badge badge-warning">Docked</sup>');
                                            }
                                            if(j === mCurrentStop)
                                            {
                                                html.push(' <sup class="badge badge-warning">Next stop</sup>');
                                            }

                                        html.push('</h3>');
                                }
                                if(trainStationRules !== null)
                                {
                                    trainStationRules = {properties: trainStationRules};

                                    html.push('<em><small>');

                                        let DockingDefinition = this.baseLayout.getObjectProperty(trainStationRules, 'DockingDefinition');
                                            switch(DockingDefinition.value)
                                            {
                                                case 'ETrainDockingDefinition::TDD_LoadUnloadOnce':
                                                    html.push('One load/unload has been completed');
                                                    break;
                                                case 'ETrainDockingDefinition::TDD_FullyLoadUnload':
                                                    html.push('Freight Wagon is fully loaded/unloaded');
                                                    break;
                                                default:
                                                    html.push(DockingDefinition.value);
                                            }
                                        let IsDurationAndRule = this.baseLayout.getObjectProperty(trainStationRules, 'IsDurationAndRule');
                                            if(IsDurationAndRule === 1)
                                            {
                                                html.push(' <strong>AND</strong> ');
                                            }
                                            else
                                            {
                                                html.push(' <strong>OR</strong> ');
                                            }
                                        let DockForDuration = this.baseLayout.getObjectProperty(trainStationRules, 'DockForDuration');
                                            html.push('wait for ' + new Intl.NumberFormat(this.baseLayout.language).format(DockForDuration) + ' seconds.');


                                        let LoadFilterDescriptors = this.baseLayout.getObjectProperty(trainStationRules, 'LoadFilterDescriptors');
                                            if(LoadFilterDescriptors.values.length > 0)
                                            {
                                                let loadFilter = [];
                                                    for(let i = 0; i < LoadFilterDescriptors.values.length; i++)
                                                    {
                                                        let currentPathName = LoadFilterDescriptors.values[i].pathName;
                                                            if(currentPathName === '')
                                                            {
                                                                loadFilter.push('None');
                                                            }
                                                            else
                                                            {
                                                                let currentItem = this.baseLayout.getItemDataFromClassName(currentPathName);
                                                                    if(currentItem !== null)
                                                                    {
                                                                        loadFilter.push(currentItem.name);
                                                                    }
                                                                    else
                                                                    {
                                                                        loadFilter.push(currentPathName.split('.').pop());
                                                                    }
                                                            }
                                                    }

                                                    if(loadFilter.length > 0)
                                                    {
                                                        html.push('<br /><strong>Load Only:</strong> ' + loadFilter.join(', '));
                                                    }
                                            }
                                        let UnloadFilterDescriptors = this.baseLayout.getObjectProperty(trainStationRules, 'UnloadFilterDescriptors');
                                            if(UnloadFilterDescriptors.values.length > 0)
                                            {
                                                let unloadFilter = [];
                                                    for(let i = 0; i < UnloadFilterDescriptors.values.length; i++)
                                                    {
                                                        let currentPathName = UnloadFilterDescriptors.values[i].pathName;
                                                            if(currentPathName === '')
                                                            {
                                                                unloadFilter.push('None');
                                                            }
                                                            else
                                                            {
                                                                let currentItem = this.baseLayout.getItemDataFromClassName(currentPathName);
                                                                    if(currentItem !== null)
                                                                    {
                                                                        unloadFilter.push(currentItem.name);
                                                                    }
                                                                    else
                                                                    {
                                                                        unloadFilter.push(currentPathName.split('.').pop());
                                                                    }
                                                            }
                                                    }

                                                    if(unloadFilter.length > 0)
                                                    {
                                                        html.push('<br /><strong>Unload Only:</strong> ' + unloadFilter.join(', '));
                                                    }
                                            }

                                    html.push('</small></em>');
                                }
                            html.push('</td>');
                        html.push('</tr>');
                    }
                html.push('</table>');
            }

        return html.join('');
    }

    getTimeTablePoints()
    {
        let points  = [];
        let mStops  = this.baseLayout.getObjectProperty(this.timeTable, 'mStops');
            if(mStops !== null)
            {
                for(let j = 0; j < mStops.values.length; j++)
                {
                    for(let k = 0; k < mStops.values[j].length; k++)
                    {
                        if(mStops.values[j][k].name === 'Station' && mStops.values[j][k].value.pathName !== undefined)
                        {
                            let trainStationIdentifier = this.baseLayout.saveGameParser.getTargetObject(mStops.values[j][k].value.pathName);
                                if(trainStationIdentifier !== null)
                                {
                                    let mStation = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStation');
                                        if(mStation !== null)
                                        {
                                            let currentStation = this.baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                                                if(currentStation !== null)
                                                {
                                                    points.push(currentStation.transform.translation);
                                                }
                                        }
                                }
                        }
                    }
                }
            }

        points.push(points[0]); // Close loop
        return points;
    }
}
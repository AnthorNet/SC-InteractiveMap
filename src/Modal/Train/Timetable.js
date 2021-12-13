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
                            html.push('<td width="1" class="text-right">' + (j + 1) + '.</td>');
                            html.push('<td>');
                            if(trainStationIdentifier !== null)
                            {
                                let mStationName = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStationName');
                                    if(mStationName !== null)
                                    {
                                        html.push(mStationName);
                                    }
                                    else
                                    {
                                        html.push(trainStationIdentifier.pathName);
                                    }

                                    if(j === mCurrentStop)
                                    {
                                        html.push(' <sup class="badge badge-warning">Next stop</sup>');
                                    }
                            }
                            html.push('</td>');

                            if(trainStationRules !== null)
                            {
                                //console.log(trainStationRules);
                            }
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
/* global Intl */

import SubSystem_Railroad                       from '../../SubSystem/Railroad.js';

import Building_Locomotive                      from '../../Building/Locomotive.js';

export default class Modal_Train_Timetable
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.locomotive             = options.locomotive;

        let railroadSubSystem       = new SubSystem_Railroad({baseLayout: this.baseLayout});
            this.trainIdentifier    = railroadSubSystem.getObjectIdentifier(this.locomotive);
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
                        html.push('<div class="img-thumbnail" style="width: 512px;height: 512px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/backgroundGame_512.jpg?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;">');
                        html.push(this.getTimeTableIcons());
                        html.push('</div>');
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

    getTimeTableIcons()
    {
        let html = [];
        let mStops = this.baseLayout.getObjectProperty(this.timeTable, 'mStops');
            if(mStops !== null)
            {
                let mCurrentStop    = this.baseLayout.getObjectProperty(this.timeTable, 'mCurrentStop', 0);

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
                                                        let iconSize        = 20;
                                                        let xMax            = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundWest) + Math.abs(this.baseLayout.satisfactoryMap.mappingBoundEast);
                                                        let yMax            = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundNorth) + Math.abs(this.baseLayout.satisfactoryMap.mappingBoundSouth);

                                                        let x               = ((xMax - this.baseLayout.satisfactoryMap.mappingBoundEast) + currentStation.transform.translation[0]) * (512 / xMax);
                                                        let y               = (((yMax - this.baseLayout.satisfactoryMap.mappingBoundNorth) + currentStation.transform.translation[1]) * (512 / yMax)) - 512;

                                                        let style           = 'text-align: center;border: 2px solid #777777;line-height:' + (iconSize - 4) + 'px;border-radius: 4px;font-size: 12px;z-index: 1;';

                                                            if(j === mCurrentStop)
                                                            {

                                                            }

                                                        html.push('<span data-stop="' + j + '" style="position: absolute;margin-top: ' + (y - (iconSize / 2)) + 'px;margin-left: ' + (x - (iconSize / 2)) + 'px;width: ' + iconSize + 'px;height:' + iconSize + 'px;' + style + '" class="bg-warning">');
                                                        html.push(new Intl.NumberFormat(this.baseLayout.language).format(j + 1));
                                                        html.push('</span>');
                                                    }
                                            }
                                    }
                            }
                        }
                    }
            }

        return html.join('');
    }
}
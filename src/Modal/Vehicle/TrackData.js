/* global Intl */

import Building_Vehicle                         from '../../Building/Vehicle.js';

export default class Modal_Vehicle_TrackData
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.vehicle            = options.vehicle;
    }

    parse()
    {
        if(this.timeTable !== null)
        {
            $('#genericModal .modal-title').empty().html('Track Data - ' + Building_Vehicle.getName(this.baseLayout, this.vehicle));
            let html = [];
                html.push('<div class="row">');
                    html.push('<div class="col-6" style="max-height: 512px;overflow-y: scroll;">');
                        html.push(this.getTrackDataList());
                    html.push('</div>');
                    html.push('<div class="col-6">');
                        html.push('<div class="img-thumbnail" style="width: 512px;height: 512px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/backgroundGame_512.jpg?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;">');
                        html.push(this.getTrackDataIcons());
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

    getTrackDataList()
    {
        let html = [];
        let trackData = Building_Vehicle.getTrackData(this.baseLayout, this.vehicle);
            if(trackData !== null)
            {
                html.push('<table class="table table-hover mb-0">');

                for(let i = 0; i < (trackData.length - 1); i++)
                {
                    html.push('<tr data-stop="'+ i + '">');
                        html.push('<td width="1" class="text-right">' + (i + 1) + '.</td>');
                        html.push('<td>');
                            html.push('[' + Math.round(trackData[i][0]) + ', ' + Math.round(trackData[i][1]) + ']');
                        html.push('</td>');
                    html.push('</tr>');
                }

                html.push('</table>');
            }

        return html.join('');
    }

    getTrackDataIcons()
    {
        let html = [];
        let trackData = Building_Vehicle.getTrackData(this.baseLayout, this.vehicle);
            if(trackData !== null)
            {
                for(let i = 0; i < (trackData.length - 1); i++)
                {
                    let iconSize        = 20;
                    let xMax            = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundWest) + Math.abs(this.baseLayout.satisfactoryMap.mappingBoundEast);
                    let yMax            = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundNorth) + Math.abs(this.baseLayout.satisfactoryMap.mappingBoundSouth);

                    let x               = ((xMax - this.baseLayout.satisfactoryMap.mappingBoundEast) + trackData[i][0]) * (512 / xMax);
                    let y               = (((yMax - this.baseLayout.satisfactoryMap.mappingBoundNorth) + trackData[i][1]) * (512 / yMax)) - 512;

                    let style           = 'text-align: center;border: 2px solid #777777;line-height:' + (iconSize - 4) + 'px;border-radius: 4px;font-size: 12px;z-index: 1;';

                    html.push('<span data-stop="' + i + '" style="position: absolute;margin-top: ' + (y - (iconSize / 2)) + 'px;margin-left: ' + (x - (iconSize / 2)) + 'px;width: ' + iconSize + 'px;height:' + iconSize + 'px;' + style + '" class="bg-warning">');
                    html.push(new Intl.NumberFormat(this.baseLayout.language).format(i + 1));
                    html.push('</span>');
                }
            }

        return html.join('');
    }
}
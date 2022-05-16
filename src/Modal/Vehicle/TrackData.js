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

            let trackData   = Building_Vehicle.getTrackData(this.baseLayout, this.vehicle);
            let html        = [];
                html.push('<div class="row">');
                    html.push('<div class="col-6" style="max-height: 512px;overflow-y: scroll;">');
                        html.push(this.getTrackDataList(trackData));
                    html.push('</div>');
                    html.push('<div class="col-6">');
                        html.push(this.baseLayout.mapSubSystem.getMinimap(trackData));
                    html.push('</div>');
                html.push('</div>');

            $('#genericModal .modal-body').empty().html(html.join(''));
            setTimeout(function(){
                $('#genericModal').modal('show').modal('handleUpdate');
            }, 250);

            $('#genericModal .modal-body table tr[data-stop]').hover(function(){
                let stop = $(this).attr('data-stop');
                    $('#genericModal .modal-body .img-minimap span[data-stop=' + stop + ']')
                        .css('border-color', '#FF0000')
                        .css('z-index', 2)
            }, function(){
                let stop = $(this).attr('data-stop');
                    $('#genericModal .modal-body .img-minimap span[data-stop=' + stop + ']')
                        .css('border-color', '#777777')
                        .css('z-index', 1)
            });
            $('#genericModal .modal-body table tr[data-stop] .text-danger').click((e) => {
                let stop = $(e.target).parent().parent().attr('data-stop');
                    Building_Vehicle.removeTrackDataPoint(this.baseLayout, this.vehicle, parseInt(stop));

                    return this.parse();
            });
        }
    }

    getTrackDataList(trackData)
    {
        let html = [];

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
                        html.push('<td class="text-right">');
                            if(i > 0 && i < (trackData.length - 2))
                            {
                                html.push('<i class="fas fa-trash-alt text-danger" style="cursor: pointer;"></i>');
                            }
                        html.push('</td>');
                    html.push('</tr>');
                }

                html.push('</table>');
            }

        return html.join('');
    }
}
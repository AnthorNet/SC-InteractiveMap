/* global gtag, Intl */
import Building_Locomotive                      from '../Building/Locomotive.js';

export default class Modal_Trains
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        if(options.markers === undefined)
        {
            this.markers = [];
            for(let layerId in this.baseLayout.playerLayers)
            {
                let layerLength = this.baseLayout.playerLayers[layerId].elements.length;

                    for(let i = 0; i < layerLength; i++)
                    {
                        if(this.baseLayout.playerLayers[layerId].elements[i].options.pathName !== undefined)
                        {
                            this.markers.push(this.baseLayout.playerLayers[layerId].elements[i]);
                        }
                    }
            }
        }
        else
        {
            this.markers =  options.markers;
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Trains', {event_category: 'Modal'});
        }
    }

    parse()
    {
        let html    = [];
        let trains  = this.baseLayout.railroadSubSystem.getTrains();

        for(let i = 0; i < trains.length; i++)
        {
            let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trains[i]);
                if(currentIdentifier !== null)
                {
                    if(['/Script/FactoryGame.FGTrain', '/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C'].includes(currentIdentifier.className))
                    {
                        let haveTimetable   = this.baseLayout.getObjectProperty(currentIdentifier, 'TimeTable');
                            if(haveTimetable !== null && haveTimetable.pathName !== undefined)
                            {
                                let currentTimetable = this.baseLayout.saveGameParser.getTargetObject(haveTimetable.pathName);
                                    if(currentTimetable !== null)
                                    {
                                        html.push(this.getCurrentTimeTable(currentIdentifier, currentTimetable));
                                    }
                            }
                    }
                }
        }

        $('#statisticsModalTrains').empty().html(html.join(''));
        $('#statisticsModalTrains .fa-search-location').on('click', (e) => {
            let x = parseFloat($(e.currentTarget).attr('data-x'));
            let y = parseFloat($(e.currentTarget).attr('data-y'));

            let position    = this.baseLayout.satisfactoryMap.unproject([x, y]);
                this.baseLayout.satisfactoryMap.leafletMap.setView(position, 9);
        });
    }

    getCurrentTrainFromIdentifier(currentIdentifier)
    {
        let FirstVehicle = this.baseLayout.getObjectProperty(currentIdentifier, 'FirstVehicle');
            if(FirstVehicle !== null)
            {
                let FirstVehicleTarget  = this.baseLayout.saveGameParser.getTargetObject(FirstVehicle.pathName);
                    if(FirstVehicleTarget !== null && FirstVehicleTarget.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                    {
                        return FirstVehicleTarget;
                    }
            }
        let LastVehicle = this.baseLayout.getObjectProperty(currentIdentifier, 'LastVehicle');
            if(LastVehicle !== null)
            {
                let LastVehicleTarget  = this.baseLayout.saveGameParser.getTargetObject(LastVehicle.pathName);
                    if(LastVehicleTarget !== null && LastVehicleTarget.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
                    {
                        return LastVehicleTarget;
                    }
            }

        return null;
    }

    getCurrentTimeTable(currentIdentifier, currentTimetable)
    {
        let html = [];
        let mStops = this.baseLayout.getObjectProperty(currentTimetable, 'mStops');
            if(mStops !== null)
            {
                let currentTrain    = this.getCurrentTrainFromIdentifier(currentIdentifier);
                let haveName        = this.baseLayout.getObjectProperty(currentIdentifier, 'mTrainName');
                    if(haveName === null)
                    {
                        let buildingData = this.baseLayout.getBuildingDataFromClassName(currentTrain.className);
                            if(buildingData !== null)
                            {
                                haveName = buildingData.name;
                            }
                            else
                            {
                                haveName = currentIdentifier.pathName.split('.');
                                haveName = haveName.pop();
                            }
                    }

                html.push('<div class="card">');
                html.push('<div class="card-header">');
                html.push('<span class="float-right"><i class="fas fa-search-location" style="cursor: pointer;font-size: 24px;" data-x="' + currentTrain.transform.translation[0] + '" data-y="' + currentTrain.transform.translation[1] + '"></i></span>');
                html.push('<strong>' + haveName + '</strong>');
                html.push('</div>');
                html.push('<table class="table">');

                let firstStop       = Building_Locomotive.getNextStop(this.baseLayout, currentTrain, 0);
                let lastStop        = Building_Locomotive.getNextStop(this.baseLayout, currentTrain, (mStops.values.length - 1));
                let isAutoPilotOn   = Building_Locomotive.isAutoPilotOn(this.baseLayout, currentTrain);

                    if(firstStop !== null && lastStop !== null)
                    {
                        let firstStopStationIdentifier  = this.baseLayout.saveGameParser.getTargetObject(firstStop.pathName);
                        let lastStopStationIdentifier   = this.baseLayout.saveGameParser.getTargetObject(lastStop.pathName);
                            if(firstStopStationIdentifier !== null && lastStopStationIdentifier !== null)
                            {
                                let firstStopStationName    = this.baseLayout.getObjectProperty(firstStopStationIdentifier, 'mStationName');
                                let lastStopStationName     = this.baseLayout.getObjectProperty(lastStopStationIdentifier, 'mStationName');
                                    if(firstStopStationName !== null && lastStopStationName !== null)
                                    {
                                        html.push('<tr><td colspan="2" width="50%">Route:</td><td colspan="2" class="pl-3 text-right">' + firstStopStationName + ' <i class="fas fa-chevron-left"></i><i class="fas fa-train"></i><i class="fas fa-chevron-right"></i> ' + lastStopStationName + ' </td></tr>');
                                    }
                            }
                    }
                    if(isAutoPilotOn === true)
                    {
                        let nextStop = Building_Locomotive.getNextStop(this.baseLayout, currentTrain);
                            if(nextStop !== null)
                            {
                                let mStationName = this.baseLayout.getObjectProperty(nextStop, 'mStationName');
                                    if(mStationName !== null)
                                    {
                                        html.push('<tr><td colspan="2" width="50%">Next stop:</td><td colspan="2" class="pl-3 text-right">' + mStationName + '</td></tr>');
                                    }
                            }
                    }

                html.push('<tr>');

                    if(isAutoPilotOn === true)
                    {
                        html.push('<td width="25%">Auto-pilot:</td><td class="pl-3 text-right text-success">On</td>');
                    }
                    else
                    {
                        html.push('<td width="25%">Auto-pilot:</td><td class="pl-3 text-right text-danger">Off</td>');
                    }



                let velocity = Building_Locomotive.getVelocity(this.baseLayout, currentTrain);
                    if(velocity !== null)
                    {
                        html.push('<td width="25%">Current speed:</td><td class="pl-3 text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(Math.round(velocity)) + ' km/h</td>');
                    }
                    else
                    {
                        html.push('<td></td><td></td>');
                    }

                html.push('</tr>');

                let freightWagons   = Building_Locomotive.getFreightWagons(this.baseLayout, currentTrain);
                    if(freightWagons.length > 0)
                    {
                        html.push('<tr><td colspan="2" width="25%">Freight wagons:</td><td colspan="2" class="pl-3 text-right">' + new Intl.NumberFormat(this.baseLayout.language).format(freightWagons.length) + ' </td></tr>');
                    }

                html.push('</table>');
                html.push('</div>');
            }

        return html.join('');
    }
}
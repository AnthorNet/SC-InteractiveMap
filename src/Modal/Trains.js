/* global gtag */
export default class Modal_Trains
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;

        if(options.markersSelected === undefined)
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
            this.markers =  options.markersSelected;
        }

        if(typeof gtag === 'function')
        {
            gtag('event', 'Trains', {event_category: 'Modal'});
        }
    }

    parse()
    {
        $('#statisticsModalTrains').empty();
        let html = [];

        for(let i = 0; i < this.baseLayout.saveGameParser.trainIdentifiers.length; i++)
        {
            let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(this.baseLayout.saveGameParser.trainIdentifiers[i]);
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
                                        let mStops = this.baseLayout.getObjectProperty(currentTimetable, 'mStops');
                                            if(mStops !== null)
                                            {
                                                let mCurrentStop    = this.baseLayout.getObjectProperty(currentTimetable, 'mCurrentStop');
                                                let haveName        = this.baseLayout.getObjectProperty(currentIdentifier, 'mTrainName');
                                                    if(haveName === null)
                                                    {
                                                        haveName = currentIdentifier.pathName.split('.');
                                                        haveName = haveName.pop();
                                                    }

                                                html.push('<div class="card">');
                                                html.push('<div class="card-header"><strong>' + haveName + '</strong></div>');
                                                html.push('<ul class="list-group list-group-flush">');
                                                    for(let j = 0; j < mStops.values.length; j++)
                                                    {
                                                        for(let k = 0; k < mStops.values[j].length; k++)
                                                        {
                                                            if(mStops.values[j][k].name === 'Station' && mStops.values[j][k].value.pathName !== undefined)
                                                            {
                                                                let trainStationIdentifier = this.baseLayout.saveGameParser.getTargetObject(mStops.values[j][k].value.pathName);
                                                                    if(trainStationIdentifier !== null)
                                                                    {
                                                                        let mStationName = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStationName');
                                                                            if(mStationName !== null)
                                                                            {
                                                                                if(j === mCurrentStop)
                                                                                {
                                                                                    html.push('<li class="list-group-item">' + mStationName + ' <span class="badge badge-warning">Next stop</span></li>');
                                                                                }
                                                                                else
                                                                                {
                                                                                    html.push('<li class="list-group-item">' + mStationName + '</li>');
                                                                                }
                                                                            }
                                                                    }
                                                            }
                                                        }
                                                    }
                                                html.push('</ul>');
                                                html.push('</div>');
                                            }
                                    }
                            }
                    }
                }
        }

        $('#statisticsModalTrains').html(html.join(''));
    }
}
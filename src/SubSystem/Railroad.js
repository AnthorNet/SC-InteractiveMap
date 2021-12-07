export default class SubSystem_Railroad
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.railroadSubSystem      = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.RailroadSubsystem');
    }

    getTrainStations()
    {
        let trainStations = [];
            if(this.railroadSubSystem !== null)
            {
                let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrainStationIdentifiers');
                    if(mTrainStationIdentifiers !== null)
                    {
                        for(let i = 0; i < mTrainStationIdentifiers.values.length; i++)
                        {
                            trainStations.push(mTrainStationIdentifiers.values[i].pathName);
                        }
                    }
            }

        return trainStations;
    }

    getTrains()
    {
        let trains = [];
            if(this.railroadSubSystem !== null)
            {
                let mTrains = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrains');
                    if(mTrains !== null)
                    {
                        for(let i = 0; i < mTrains.values.length; i++)
                        {
                            trains.push(mTrains.values[i].pathName);
                        }
                    }
            }

        return trains;
    }

    getObjectIdentifier(currentObject)
    {
        let trainStations = this.getTrainStations();
            for(let i = 0; i < trainStations.length; i ++)
            {
                let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trainStations[i]);
                    if(currentIdentifier !== null)
                    {
                        let mStation = this.baseLayout.getObjectProperty(currentIdentifier, 'mStation')
                            if(mStation !== null)
                            {
                                if(mStation.pathName === currentObject.pathName)
                                {
                                    return currentIdentifier;
                                }
                            }
                    }
            }

        //TODO: Improve locomotive detection if in middle
        let trains = this.getTrains();
            for(let i = 0; i < trains.length; i ++)
            {
                let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trains[i])
                    if(currentIdentifier !== null)
                    {
                        let FirstVehicle    = this.baseLayout.getObjectProperty(currentIdentifier, 'FirstVehicle');
                            if(FirstVehicle !== null)
                            {
                                if(FirstVehicle.pathName === currentObject.pathName)
                                {
                                    return currentIdentifier;
                                }
                            }
                        let LastVehicle     = this.baseLayout.getObjectProperty(currentIdentifier, 'LastVehicle');
                            if(LastVehicle !== null)
                            {
                                if(LastVehicle.pathName === currentObject.pathName)
                                {
                                    return currentIdentifier;
                                }
                            }
                    }
            }


        return null;
    }

    deleteObjectIdentifier(currentObject)
    {
        let currentIdentifier = this.getObjectIdentifier(currentObject);
            if(currentIdentifier !== null)
            {
                let timeTable = this.baseLayout.getObjectProperty(currentObject, 'TimeTable');
                    if(timeTable !== null)
                    {
                        this.baseLayout.saveGameParser.deleteObject(timeTable.pathName);
                    }

                this.baseLayout.saveGameParser.deleteObject(currentObject.pathName);

                if(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrain'].includes(currentIdentifier.className))
                {
                    let mTrains = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrains');
                        if(mTrains !== null)
                        {
                            for(let i = 0; i < mTrains.values.length; i ++)
                            {
                                if(mTrains.values[i].pathName === currentIdentifier.pathName)
                                {
                                    mTrains.values.splice(i, 1);
                                    return;
                                }
                            }
                        }
                }
                if(currentIdentifier.className === '/Script/FactoryGame.FGTrainStationIdentifier')
                {
                    let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrainStationIdentifiers');
                        if(mTrainStationIdentifiers !== null)
                        {
                            for(let i = 0; i < mTrainStationIdentifiers.values.length; i ++)
                            {
                                if(mTrainStationIdentifiers.values[i].pathName === currentIdentifier.pathName)
                                {
                                    mTrainStationIdentifiers.values.splice(i, 1);
                                    return;
                                }
                            }
                        }
                }
            }
    }

    addObjectIdentifier(currentIdentifier)
    {
        if(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrain'].includes(currentIdentifier.className))
        {
            let mTrains = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrains');
                if(mTrains !== null)
                {
                    for(let i = 0; i < mTrains.values.length; i ++) // Avoid duplicate!
                    {
                        if(mTrains.values[i].pathName === currentIdentifier.pathName)
                        {
                            return;
                        }
                    }
                    mTrains.values.push({pathName: currentIdentifier.pathName});
                }
                else
                {
                    this.baseLayout.setObjectProperty(
                        this.railroadSubSystem,
                        'mTrains',
                        {
                            type    : 'ObjectProperty',
                            values  : [{pathName: currentIdentifier.pathName}]
                        },
                        'ArrayProperty'
                    );
                }
        }
        if(currentIdentifier.className === '/Script/FactoryGame.FGTrainStationIdentifier')
        {
            let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrainStationIdentifiers');
                if(mTrainStationIdentifiers !== null)
                {
                    for(let i = 0; i < mTrainStationIdentifiers.values.length; i ++)
                    {
                        if(mTrainStationIdentifiers.values[i].pathName === currentIdentifier.pathName) // Avoid duplicate!
                        {
                            return;
                        }
                    }
                    mTrainStationIdentifiers.values.push({pathName: currentIdentifier.pathName});
                }
                else
                {
                    this.baseLayout.setObjectProperty(
                        this.railroadSubSystem,
                        'mTrainStationIdentifiers',
                        {
                            type    : 'ObjectProperty',
                            values  : [{pathName: currentIdentifier.pathName}]
                        },
                        'ArrayProperty'
                    );
                }
        }
    }
}
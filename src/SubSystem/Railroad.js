export default class SubSystem_Railroad
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.railroadSubSystem      = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.RailroadSubsystem');
    }

    getTrainStations()
    {
        if(this.railroadSubSystem !== null)
        {
            let mTrainStationIdentifiers = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrainStationIdentifiers');
                if(mTrainStationIdentifiers !== null)
                {
                    return mTrainStationIdentifiers.values;
                }
        }

        return [];
    }

    getTrains()
    {
        if(this.railroadSubSystem !== null)
        {
            let mTrains = this.baseLayout.getObjectProperty(this.railroadSubSystem, 'mTrains');
                if(mTrains !== null)
                {
                    return mTrains.values;
                }
        }

        return [];
    }

    getObjectIdentifier(currentObject)
    {
        let trainStations = this.getTrainStations();
            for(let i = (trainStations.length - 1); i >= 0; i--)
            {
                let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trainStations[i].pathName)
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
                    else
                    {
                        console.log('Remove ghost identifier', trainStations[i].pathName);
                        trainStations.splice(i, 1);
                    }
            }

        //TODO: Improve locomotive detection if in middle
        let trains = this.getTrains();
            for(let i = (trains.length - 1); i >= 0; i--)
            {
                let currentIdentifier = this.baseLayout.saveGameParser.getTargetObject(trains[i].pathName)
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
                    else
                    {
                        console.log('Remove ghost identifier', trains[i].pathName);
                        trains.splice(i, 1);
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
                    let trains = this.getTrains();
                        for(let i = 0; i < trains.length; i ++)
                        {
                            if(trains[i].pathName === currentIdentifier.pathName)
                            {
                                trains.splice(i, 1);
                                return;
                            }
                        }
                }
                if(currentIdentifier.className === '/Script/FactoryGame.FGTrainStationIdentifier')
                {
                    let trainStations = this.getTrainStations();
                        for(let i = 0; i < trainStations.length; i ++)
                        {
                            if(trainStations[i].pathName === currentIdentifier.pathName)
                            {
                                trainStations.splice(i, 1);
                                return;
                            }
                        }
                }
            }
    }

    addObjectIdentifier(currentIdentifier)
    {
        if(['/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C', '/Script/FactoryGame.FGTrain'].includes(currentIdentifier.className))
        {
            let trains = this.getTrains();
                for(let i = 0; i < trains.length; i ++) // Avoid duplicate!
                {
                    if(trains[i].pathName === currentIdentifier.pathName)
                    {
                        return;
                    }
                }
                trains.push({pathName: currentIdentifier.pathName});
        }
        if(currentIdentifier.className === '/Script/FactoryGame.FGTrainStationIdentifier')
        {
            let trainStations = this.getTrainStations();
                for(let i = 0; i < trainStations.length; i ++)
                {
                    if(trainStations[i].pathName === currentIdentifier.pathName) // Avoid duplicate!
                    {
                        return;
                    }
                }
                trainStations.push({pathName: currentIdentifier.pathName});
        }
    }
}
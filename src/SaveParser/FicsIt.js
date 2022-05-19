import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Building_TrainStation                    from '../Building/TrainStation.js';

export default class SaveParser_FicsIt
{
    static callADA(baseLayout, currentObject, pastingBlueprint = false)
    {
        if(pastingBlueprint === false)
        {
            switch(currentObject.className)
            {
                case '/Game/FactoryGame/-Shared/Blueprint/BP_RailroadSubsystem.BP_RailroadSubsystem_C':
                    return SaveParser_FicsIt.fixRailroadSubsystem(baseLayout, currentObject);
                case '/Script/FactoryGame.FGTrainStationIdentifier':
                    return SaveParser_FicsIt.fixTrainStationIdentifier(baseLayout, currentObject);
                case '/Game/FactoryGame/Buildable/Vehicle/Train/-Shared/BP_Train.BP_Train_C':
                case '/Script/FactoryGame.FGTrain':
                    return SaveParser_FicsIt.fixTrainIdentifier(baseLayout, currentObject);
                case '/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C':
                    return SaveParser_FicsIt.fixRailroadTrackIntegrated(baseLayout, currentObject);
                //case '/Script/FactoryGame.FGPipeConnectionFactory':
                //case '/Script/FactoryGame.FGPipeConnectionComponent':
                //    return SaveParser_FicsIt.fixPipeConnectionFactory(baseLayout, currentObject);

                case '/Script/FactoryGame.FGDroneStationInfo':
                    return SaveParser_FicsIt.checkPairedStation(baseLayout, currentObject);
                case '/Game/FactoryGame/Buildable/Factory/DroneStation/Build_DroneStation.Build_DroneStation_C':
                    return SaveParser_FicsIt.checkDroneStation(baseLayout, currentObject);
                case '/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C':
                    return SaveParser_FicsIt.checkDroneTransport(baseLayout, currentObject);
            }
        }

        /*
        if(pastingBlueprint === true)
        {
            // Fix old translation Array to object
            if(currentObject.transform !== undefined)
            {
                if(currentObject.transform.translation !== undefined && currentObject.transform.translation.x === undefined)
                {
                    currentObject.transform.translation = {
                        x: currentObject.transform.translation[0],
                        y: currentObject.transform.translation[1],
                        z: currentObject.transform.translation[2]
                    };
                }
            }
        }
        /**/

        switch(currentObject.className)
        {
            case '/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x1_02.Build_Ramp_Diagonal_8x1_02_C':
                return SaveParser_FicsIt.fixRampsRotation(baseLayout, currentObject, '/Game/FactoryGame/Recipes/Buildings/Ramps/Recipe_Ramp_Diagonal_8x1_02.Recipe_Ramp_Diagonal_8x1_02_C');
            case '/Game/FactoryGame/Buildable/Building/Ramp/Build_Ramp_Diagonal_8x2_02.Build_Ramp_Diagonal_8x2_02_C':
                return SaveParser_FicsIt.fixRampsRotation(baseLayout, currentObject, '/Game/FactoryGame/Recipes/Buildings/Ramps/Recipe_Ramp_Diagonal_8x2_02.Recipe_Ramp_Diagonal_8x2_02_C');

            case '/Game/FactoryGame/Buildable/Building/Foundation/Build_PillarTop.Build_PillarTop_C':
                return SaveParser_FicsIt.convertPillarTop(baseLayout, currentObject);

            case '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Door_8x4_02.Build_Wall_Door_8x4_02_C':
                return SaveParser_FicsIt.convertRightDoorWall(baseLayout, currentObject, '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Door_8x4_03.Build_Wall_Door_8x4_03_C');
            case '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Door_8x4_02_Steel.Build_Wall_Door_8x4_02_Steel_C':
                return SaveParser_FicsIt.convertRightDoorWall(baseLayout, currentObject, '/Game/FactoryGame/Buildable/Building/Wall/Build_Wall_Door_8x4_03_Steel.Build_Wall_Door_8x4_03_Steel_C');
        }

        return currentObject;
    }

    /*
     * Each time the game is loaded, it creates a new BP_RailroadSubsystem_C,
     * leaving a lot of empty one in the save...
     */
    static fixRailroadSubsystem(baseLayout, currentObject)
    {
        if(currentObject.children !== undefined)
        {
            for(let j = (currentObject.children.length - 1); j >= 0; j--)
            {
                let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[j].pathName);
                    if(currentChildren !== null && currentChildren.className === '/Script/FactoryGame.FGPowerConnectionComponent')
                    {
                        if(currentChildren.properties.length === 0)
                        {
                            console.log('Removing ghost "' + currentChildren.className + '"', currentChildren.pathName);
                            baseLayout.saveGameParser.deleteObject(currentChildren.pathName);
                            currentObject.children.splice(j, 1);
                        }
                    }
            }
        }

        return currentObject;
    }

    /*
     * Some train stations identifier are left behind, and the map show them as a pink icon at [0,0]
     */
    static fixTrainStationIdentifier(baseLayout, currentObject)
    {
        let trainStation = baseLayout.railroadSubSystem.getTrainStations();
            if(trainStation.includes(currentObject.pathName) === false)
            {
                console.log('Removing ghost "' + currentObject.className + '"', currentObject.pathName);
                baseLayout.saveGameParser.deleteObject(currentObject.pathName);
                return null; // Trigger continue;
            }

        return currentObject;
    }

    /*
     * Some trains identifier are left behind, and the map show them as a pink icon at [0,0]
     */
    static fixTrainIdentifier(baseLayout, currentObject)
    {
        let trains = baseLayout.railroadSubSystem.getTrains();
            if(trains.includes(currentObject.pathName) === false)
            {
                console.log('Removing ghost "' + currentObject.className + '"', currentObject.pathName);
                baseLayout.saveGameParser.deleteObject(currentObject.pathName);
                return null; // Trigger continue;
            }

        return currentObject;
    }

    /*
     * Some integrated railway track were left behind
     * DO NOT WORK, IT REMOVES PLATFORM INTEGRATED...
     */
    static fixRailroadTrackIntegrated(baseLayout, currentObject)
    {
        //return currentObject; // Skip until a better solution is found...


        let trainStation = baseLayout.railroadSubSystem.getTrainStations();
            for(let i = 0; i < trainStation.length; i++)
            {
                let currentTrainStationIdentifier = baseLayout.saveGameParser.getTargetObject(trainStation[i]);
                    if(currentTrainStationIdentifier !== null)
                    {
                        let mStation = baseLayout.getObjectProperty(currentTrainStationIdentifier, 'mStation');
                            if(mStation !== null)
                            {
                                let currentTrainStation = baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                                    if(currentTrainStation !== null)
                                    {
                                        let completeTrainStation = Building_TrainStation.getCompleteTrainStation(baseLayout, currentTrainStation);
                                            for(let j = 0; j < completeTrainStation.length; j++)
                                            {
                                                let mRailroadTrack = baseLayout.getObjectProperty(completeTrainStation[j], 'mRailroadTrack');
                                                    if(mRailroadTrack !== null && mRailroadTrack.pathName === currentObject.pathName)
                                                    {
                                                        return currentObject;
                                                    }
                                            }
                                    }
                            }
                    }
            }

        console.log('Removing ghost "' + currentObject.className + '"', currentObject.pathName);
        baseLayout.saveGameParser.deleteObject(currentObject.pathName);
        return null; // Trigger continue;
    }

    /*
     * Fix FGPipeConnectionFactory with a pipe network id but no pipe connected or no real network...
     * TODO: IT seems that forcing the ga   me to recreate a faulty pipe network could make it crash?
     */
    /*
    static fixPipeConnectionFactory(baseLayout, currentObject)
    {
        let mPipeNetworkID = baseLayout.getObjectProperty(currentObject, 'mPipeNetworkID');
            if(mPipeNetworkID !== null)
            {
                if(currentObject.properties.length === 1)
                {
                    let parentObject = baseLayout.saveGameParser.getTargetObject(currentObject.outerPathName);
                        if(parentObject !== null)
                        {
                            let pipeNetwork = baseLayout.pipeNetworkSubSystem.getObjectPipeNetwork(parentObject);
                                if(pipeNetwork !== null)
                                {
                                    console.log('Removing ghost mPipeNetworkID "' + mPipeNetworkID + '"', currentObject.pathName);
                                    baseLayout.deleteObjectProperty(currentObject, 'mPipeNetworkID');
                                    baseLayout.saveGameParser.deleteObject(pipeNetwork);
                                }
                        }
                }
            }
        return currentObject;
    }
    */


    /*
     * Update 5 changed the old corner up ramps default angle,
     * trying to find them when they don't have the recipe in properties
     */
    static fixRampsRotation(baseLayout, currentObject, newRecipe)
    {
        let mBuiltWithRecipe    = baseLayout.getObjectProperty(currentObject, 'mBuiltWithRecipe');
            if(mBuiltWithRecipe === null)
            {
                currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, 90);
                currentObject.properties.push({
                    name    : 'mBuiltWithRecipe',
                    type    : 'ObjectProperty',
                    value   : {levelName: '', pathName: newRecipe}
                });
            }

        return currentObject;
    }

    /*
     * Update 5 removed Pillar Top in favor of Pillar base
     */
    static convertPillarTop(baseLayout, currentObject)
    {
        currentObject.className             = '/Game/FactoryGame/Buildable/Building/Foundation/Build_PillarBase.Build_PillarBase_C';
        let eulerAngle                      = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
            eulerAngle.roll                 = BaseLayout_Math.clampEulerAxis(eulerAngle.roll + 180);
        currentObject.transform.rotation    = BaseLayout_Math.getEulerToQuaternion(eulerAngle);
        baseLayout.updateBuiltWithRecipe(currentObject);

        return currentObject;
    }

    /*
     * Update 5 removed Right Door Wall in favor of Side Door Wall
     */
    static convertRightDoorWall(baseLayout, currentObject, newClassName)
    {
        currentObject.className             = newClassName;
        currentObject.transform.rotation    = BaseLayout_Math.getNewQuaternionRotate(currentObject.transform.rotation, 180);
        baseLayout.updateBuiltWithRecipe(currentObject);

        return currentObject;
    }

    /**
     * Some old blueprint were keeping the paired station when is was not existing in the pasted save
     */
    static checkPairedStation(baseLayout, currentObject)
    {
        let mPairedStation = baseLayout.getObjectProperty(currentObject, 'mPairedStation');
            if(mPairedStation !== null)
            {
                let currentPairedStation = baseLayout.saveGameParser.getTargetObject(mPairedStation.pathName);
                    if(currentPairedStation === null)
                    {
                        console.log('Removing ghost mPairedStation "' + mPairedStation.pathName + '"', currentObject.pathName);
                        baseLayout.deleteObjectProperty(currentObject, 'mPairedStation');
                    }
            }

        return currentObject;
    }

    /**
     * Remove not existing drones from old blueprints
     */
    static checkDroneStation(baseLayout, currentObject)
    {
        let mDockedDrone = baseLayout.getObjectProperty(currentObject, 'mDockedDrone');
            if(mDockedDrone !== null)
            {
                let currentDockedDrone = baseLayout.saveGameParser.getTargetObject(mDockedDrone.pathName);
                    if(currentDockedDrone === null)
                    {
                        console.log('Removing ghost mDockedDrone "' + mDockedDrone.pathName + '"', currentObject.pathName);
                        baseLayout.deleteObjectProperty(currentObject, 'mDockedDrone');
                    }
            }

        return currentObject;
    }

    /**
     * Fix drone transport making the game crashing
     */
    static checkDroneTransport(baseLayout, currentObject)
    {
        let mCurrentTripDestinationStation = baseLayout.getObjectProperty(currentObject, 'mCurrentTripDestinationStation');
            if(mCurrentTripDestinationStation !== null)
            {
                let currentTripDestinationStation = baseLayout.saveGameParser.getTargetObject(mCurrentTripDestinationStation.pathName);
                    if(currentTripDestinationStation === null)
                    {
                        console.log('Removing ghost "' + currentObject.className + '"', currentObject.pathName);
                        baseLayout.saveGameParser.deleteObject(currentObject.pathName);
                        return null; // Trigger continue;
                    }
            }

        let mHomeStation = baseLayout.getObjectProperty(currentObject, 'mHomeStation');
            if(mHomeStation !== null)
            {
                let currentHomeStation = baseLayout.saveGameParser.getTargetObject(mHomeStation.pathName);
                    if(currentHomeStation === null)
                    {
                        console.log('Removing ghost "' + currentObject.className + '"', currentObject.pathName);
                        baseLayout.saveGameParser.deleteObject(currentObject.pathName);
                        return null; // Trigger continue;
                    }
            }

        let mCurrentAction = baseLayout.getObjectProperty(currentObject, 'mCurrentAction');
            if(mCurrentAction !== null)
            {
                let currentAction = baseLayout.saveGameParser.getTargetObject(mCurrentAction.pathName);
                    if(currentAction === null)
                    {
                        console.log('Removing ghost mCurrentAction "' + mCurrentAction.pathName + '"', currentObject.pathName);
                        baseLayout.deleteObjectProperty(currentObject, 'mCurrentAction');
                    }
            }

        let mActionsToExecute = baseLayout.getObjectProperty(currentObject, 'mActionsToExecute');
            if(mActionsToExecute !== null)
            {
                for(let i = 0; i < mActionsToExecute.values.length; i++)
                {
                    let currentActionsToExecute = baseLayout.saveGameParser.getTargetObject(mActionsToExecute.values[i].pathName);
                        if(currentActionsToExecute === null)
                        {
                            console.log('Removing ghost mActionsToExecute "' + mActionsToExecute.values[i].pathName + '"', currentObject.pathName);
                            baseLayout.deleteObjectProperty(currentObject, 'mActionsToExecute');
                            break;
                        }
                }
            }

        return currentObject;
    }
}
import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class SaveParser_FicsIt
{
    static callADA(baseLayout, currentObject)
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
            }

        return currentObject;
    }

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
}
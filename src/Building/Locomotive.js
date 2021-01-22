export default class Building_Locomotive
{
    static getFreightWagons(baseLayout, currentObject)
    {
        let includedPathName    = [currentObject.pathName];
        let freightWagons       = [];

        if(currentObject.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C')
        {
            if(currentObject.extra !== undefined)
            {
                if(currentObject.extra.previousPathName !== undefined && currentObject.extra.previousPathName !== '')
                {
                    let adjacentPreviousWagon   = baseLayout.saveGameParser.getTargetObject(currentObject.extra.previousPathName);
                        while(adjacentPreviousWagon !== null)
                        {
                            includedPathName.push(adjacentPreviousWagon.pathName);

                            if(adjacentPreviousWagon.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                freightWagons.push(adjacentPreviousWagon);
                            }

                            adjacentPreviousWagon = Building_Locomotive.getAdjacentWagon(baseLayout, adjacentPreviousWagon, includedPathName);
                        }
                }
                if(currentObject.extra.nextPathName !== undefined && currentObject.extra.nextPathName !== '')
                {
                    let adjacentNextWagon       = baseLayout.saveGameParser.getTargetObject(currentObject.extra.nextPathName);
                        while(adjacentNextWagon !== null)
                        {
                            includedPathName.push(adjacentNextWagon.pathName);

                            if(adjacentNextWagon.className === '/Game/FactoryGame/Buildable/Vehicle/Train/Wagon/BP_FreightWagon.BP_FreightWagon_C')
                            {
                                freightWagons.push(adjacentNextWagon);
                            }

                            adjacentNextWagon = Building_Locomotive.getAdjacentWagon(baseLayout, adjacentNextWagon, includedPathName);
                        }
                }
            }
        }

        return freightWagons;
    }

    static getAdjacentWagon(baseLayout, currentObject, includedPathName)
    {
        if(currentObject.extra !== undefined)
        {
            if(currentObject.extra.previousPathName !== undefined && currentObject.extra.previousPathName !== '' && includedPathName.includes(currentObject.extra.previousPathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.previousPathName);
            }
            if(currentObject.extra.nextPathName !== undefined && currentObject.extra.nextPathName !== '' && includedPathName.includes(currentObject.extra.nextPathName) === false)
            {
                return baseLayout.saveGameParser.getTargetObject(currentObject.extra.nextPathName);
            }
        }

        return null;
    }
}
import Building_Vehicle                         from '../Building/Vehicle.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Building_VehiclePath
{
    static get availableVehiclePath()
    {
        return [
            '/Game/FactoryGame/Buildable/Vehicle/VehiclePath/Build_VehiclePath_Universal.Build_VehiclePath_Universal_C',
            '/Game/FactoryGame/Buildable/Vehicle/Tractor/Build_VehiclePath_Tractor.Build_VehiclePath_Tractor_C',
            '/Game/FactoryGame/Buildable/Vehicle/Truck/Build_VehiclePath_Truck.Build_VehiclePath_Truck_C',
            '/Game/FactoryGame/Buildable/Vehicle/Explorer/Build_VehiclePath_Explorer.Build_VehiclePath_Explorer_C',
            '/Game/FactoryGame/Buildable/Vehicle/GolfCart/Build_VehiclePath_FactoryCart.Build_VehiclePath_FactoryCart_C'
        ];
    }

    static isVehiclePath(currentObject)
    {
        if(Building_VehiclePath.availableVehiclePath.includes(currentObject.className))
        {
            return true;
        }

        return false;
    }

    /*
     * ADD
     */
    static add(baseLayout, currentObject)
    {
        baseLayout.setupSubLayer('playerVehiclesPathLayer');

        let splineData      = BaseLayout_Math.extractSplineData(baseLayout, currentObject, 'mSplinePoints');
        let vehiclePath     = L.conveyor(
                splineData.points,
                {
                    pathName    : currentObject.pathName,
                    weight      : 300,
                    color       : Building_Vehicle.trackDataColor,
                    opacity     : 0.3,
                    dashArray   : '15 5'
                }
            );

        baseLayout.bindMouseEvents(vehiclePath);

        baseLayout.playerLayers.playerVehiclesPathLayer.distance += splineData.distance;
        baseLayout.playerLayers.playerVehiclesPathLayer.elements.push(vehiclePath);

        if(baseLayout.playerLayers.playerVehiclesPathLayer.filtersCount !== undefined)
        {
            if(baseLayout.playerLayers.playerVehiclesPathLayer.filtersCount[currentObject.className] === undefined)
            {
                baseLayout.playerLayers.playerVehiclesPathLayer.filtersCount[currentObject.className] = {distance: 0};
            }
            baseLayout.playerLayers.playerVehiclesPathLayer.filtersCount[currentObject.className].distance += splineData.distance;
        }

        return {layer: 'playerVehiclesPathLayer', marker: vehiclePath};
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        return contextMenu;
    }
}
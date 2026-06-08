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

    static getConnectedPaths(baseLayout, currentObject)
    {
        let mStartNode  = baseLayout.getObjectProperty(currentObject, 'mStartNode');
        let mEndNode    = baseLayout.getObjectProperty(currentObject, 'mEndNode');
        if(mStartNode !== null || mEndNode !== null)
        {
            let connectedPaths = [];
                if(mStartNode !== null)
                {
                    let startNode = baseLayout.saveGameParser.getTargetObject(mStartNode.pathName);
                        if(startNode !== null)
                        {
                            let mArrivingConnections = baseLayout.getObjectProperty(startNode, 'mArrivingConnections');
                                if(mArrivingConnections !== null)
                                {
                                    for(let i = 0; i < mArrivingConnections.values.length; i++)
                                    {
                                        if(connectedPaths.includes(mArrivingConnections.values[i].pathName) === false)
                                        {
                                            connectedPaths.push(mArrivingConnections.values[i].pathName);
                                        }
                                    }
                                }

                            let mLeavingConnections = baseLayout.getObjectProperty(startNode, 'mLeavingConnections');
                                if(mLeavingConnections !== null)
                                {
                                    for(let i = 0; i < mLeavingConnections.values.length; i++)
                                    {
                                        if(connectedPaths.includes(mLeavingConnections.values[i].pathName) === false)
                                        {
                                            connectedPaths.push(mLeavingConnections.values[i].pathName);
                                        }
                                    }
                                }
                        }
                }

                if(mEndNode !== null)
                {
                    let endNode = baseLayout.saveGameParser.getTargetObject(mEndNode.pathName);
                        if(endNode !== null)
                        {
                            let mArrivingConnections = baseLayout.getObjectProperty(endNode, 'mArrivingConnections');
                                if(mArrivingConnections !== null)
                                {
                                    for(let i = 0; i < mArrivingConnections.values.length; i++)
                                    {
                                        if(connectedPaths.includes(mArrivingConnections.values[i].pathName) === false)
                                        {
                                            connectedPaths.push(mArrivingConnections.values[i].pathName);
                                        }
                                    }
                                }

                            let mLeavingConnections = baseLayout.getObjectProperty(endNode, 'mLeavingConnections');
                                if(mLeavingConnections !== null)
                                {
                                    for(let i = 0; i < mLeavingConnections.values.length; i++)
                                    {
                                        if(connectedPaths.includes(mLeavingConnections.values[i].pathName) === false)
                                        {
                                            connectedPaths.push(mLeavingConnections.values[i].pathName);
                                        }
                                    }
                                }
                        }
                }

            return connectedPaths;
        }

        return null;
    }

    /*
     * ADD
     */
    static add(baseLayout, currentObject)
    {
        baseLayout.setupSubLayer('playerVehiclesPathLayer');

        let splineData      = BaseLayout_Math.extractSplineData(baseLayout, currentObject, 'mSplinePoints');
            if(splineData !== null)
            {
                let vehiclePath     = L.conveyor(
                    splineData.points,
                    {
                        pathName    : currentObject.pathName,
                        weight      : 300,
                        color       : Building_Vehicle.trackDataColor,
                        opacity     : 0.3
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
            else
            {
                // No spline, so we're just taking both ends and make a straight line!
                let mStartNode  = baseLayout.getObjectProperty(currentObject, 'mStartNode');
                let mEndNode    = baseLayout.getObjectProperty(currentObject, 'mEndNode');
                    if(mStartNode !== null && mEndNode !== null)
                    {
                        let startNode = baseLayout.saveGameParser.getTargetObject(mStartNode.pathName);
                        let endNode = baseLayout.saveGameParser.getTargetObject(mEndNode.pathName);
//                            console.log(currentObject, startNode, endNode)
                    }
            }


    }

    static delete(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        /*
        let mStartNode      = baseLayout.getObjectProperty(currentObject, 'mStartNode');
            if(mStartNode !== null)
            {
                let startNode = baseLayout.saveGameParser.getTargetObject(mStartNode.pathName);
                    if(startNode !== null)
                    {
                        let mArrivingConnections = baseLayout.getObjectProperty(startNode, 'mArrivingConnections');
                            if(mArrivingConnections !== null)
                            {
                                for(let i = 0; i < mArrivingConnections.values.length; i++)
                                {
                                    if(connectedPaths.includes(mArrivingConnections.values[i].pathName) === false)
                                    {
                                        connectedPaths.push(mArrivingConnections.values[i].pathName);
                                    }
                                }
                            }

                        let mLeavingConnections = baseLayout.getObjectProperty(endNode, 'mLeavingConnections');
                            if(mLeavingConnections !== null)
                            {
                                for(let i = 0; i < mLeavingConnections.values.length; i++)
                                {
                                    if(connectedPaths.includes(mLeavingConnections.values[i].pathName) === false)
                                    {
                                        connectedPaths.push(mLeavingConnections.values[i].pathName);
                                    }
                                }
                            }
                    }
            }
            */
            return baseLayout.deleteGenericBuilding(marker);
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-trash-alt',
            text        : 'Delete (Experimental)',
            callback    : function(marker){
                return Building_VehiclePath.delete(marker);
            }
        });

        return contextMenu;
    }

    /**
     * TOOLTIP
     */
    static bindTooltip(baseLayout, currentObject, tooltipOptions)
    {
        tooltipOptions.direction    = 'bottom';

        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerVehiclesPathLayer');
            if(marker !== null)
            {
                marker.setStyle({color: '#0000FF', opacity: 0.8});
            }
        let connectedPaths = Building_VehiclePath.getConnectedPaths(baseLayout, currentObject);
            if(connectedPaths !== null)
            {
                for(let i = 0; i < connectedPaths.length; i++)
                {
                    if(connectedPaths[i] !== currentObject.pathName)
                    {
                        let connectedPath = baseLayout.saveGameParser.getTargetObject(connectedPaths[i]);
                            if(connectedPath !== null)
                            {
                                let marker = baseLayout.getMarkerFromPathName(connectedPaths[i], 'playerVehiclesPathLayer');
                                    if(marker !== null)
                                    {
                                        marker.setStyle({color: '#00FF00', opacity: 0.8});
                                    }
                            }
                    }
                }
            }
    }
    static unbindTooltip(baseLayout, currentObject)
    {
        let marker = baseLayout.getMarkerFromPathName(currentObject.pathName, 'playerVehiclesPathLayer');
            if(marker !== null)
            {
                marker.setStyle({color: Building_Vehicle.trackDataColor, opacity: 0.3});
            }
        let connectedPaths = Building_VehiclePath.getConnectedPaths(baseLayout, currentObject);
            if(connectedPaths !== null)
            {
                for(let i = 0; i < connectedPaths.length; i++)
                {
                    if(connectedPaths[i] !== currentObject.pathName)
                    {
                        let connectedPath = baseLayout.saveGameParser.getTargetObject(connectedPaths[i]);
                            if(connectedPath !== null)
                            {
                                let marker = baseLayout.getMarkerFromPathName(connectedPaths[i], 'playerVehiclesPathLayer');
                                    if(marker !== null)
                                    {
                                        marker.setStyle({color: Building_Vehicle.trackDataColor, opacity: 0.3});
                                    }
                            }
                    }
                }
            }
    }
}
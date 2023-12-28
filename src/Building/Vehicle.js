import Modal_Vehicle_TrackData                  from '../Modal/Vehicle/TrackData.js';

export default class Building_Vehicle
{
    static get availableVehicles()
    {
        return [
            '/Game/FactoryGame/Buildable/Vehicle/Tractor/BP_Tractor.BP_Tractor_C',
            '/Game/FactoryGame/Buildable/Vehicle/Truck/BP_Truck.BP_Truck_C',
            '/Game/FactoryGame/Buildable/Vehicle/Explorer/BP_Explorer.BP_Explorer_C',
            '/Game/FactoryGame/Buildable/Vehicle/Cyberwagon/Testa_BP_WB.Testa_BP_WB_C',
            '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_Golfcart.BP_Golfcart_C',
            '/Game/FactoryGame/Buildable/Vehicle/Golfcart/BP_GolfcartGold.BP_GolfcartGold_C'
        ];
    }

    /*
     * BELT/LIFT LOOKUP, includes mods to avoid finding them everywhere
     */
    static isVehicle(currentObject)
    {
        if(Building_Vehicle.availableVehicles.includes(currentObject.className))
        {
            return true;
        }

        // Vehicles Mod
        if(currentObject.className === '/x3_mavegrag/Vehicles/Trucks/TruckMk1/BP_X3Truck_Mk1.BP_X3Truck_Mk1_C')
        {
            return true;
        }

        return false;
    }

    static getName(baseLayout, currentObject)
    {
        return currentObject.pathName.replace('Persistent_Level:PersistentLevel.', '');
    }

    static getTargetList(baseLayout, currentObject)
    {
        let mTargetList     = baseLayout.getObjectProperty(currentObject, 'mTargetList'); // Update 5
            if(mTargetList === null) //TODO:OLD
            {
                mTargetList = baseLayout.getObjectProperty(currentObject, 'mTargetNodeLinkedList');
            }

        return mTargetList;
    }

    static getTrackData(baseLayout, currentObject)
    {
        let mTargetList     = Building_Vehicle.getTargetList(baseLayout, currentObject);
            if(mTargetList !== null)
            {
                let targetNode = baseLayout.saveGameParser.getTargetObject(mTargetList.pathName);
                    if(targetNode !== null)
                    {
                        let mFirst  = baseLayout.getObjectProperty(targetNode, 'mFirst');
                        let mLast   = baseLayout.getObjectProperty(targetNode, 'mLast');

                            if(mFirst !== null && mLast !== null)
                            {
                                let firstNode   = baseLayout.saveGameParser.getTargetObject(mFirst.pathName);
                                let lastNode    = baseLayout.saveGameParser.getTargetObject(mLast.pathName);

                                    if(firstNode !== null && lastNode !== null)
                                    {
                                        let currentTrack        = [];
                                        let checkCurrentNode    = firstNode;
                                            while(checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName)
                                            {
                                                currentTrack.push(checkCurrentNode.transform.translation);

                                                let mNext               = baseLayout.getObjectProperty(checkCurrentNode, 'mNext');
                                                    checkCurrentNode    = null;
                                                    if(mNext !== null)
                                                    {
                                                        checkCurrentNode = baseLayout.saveGameParser.getTargetObject(mNext.pathName);
                                                    }
                                            }

                                        currentTrack.push(lastNode.transform.translation);
                                        currentTrack.push(firstNode.transform.translation); // Close the loop!

                                        return currentTrack;
                                    }
                            }
                    }
            }

        return null;
    }

    static removeTrackDataPoint(baseLayout, currentObject, dataPoint)
    {
        let mTargetList     = Building_Vehicle.getTargetList(baseLayout, currentObject);
            if(mTargetList !== null)
            {
                let targetNode = baseLayout.saveGameParser.getTargetObject(mTargetList.pathName);
                    if(targetNode !== null)
                    {
                        let mFirst  = baseLayout.getObjectProperty(targetNode, 'mFirst');
                        let mLast   = baseLayout.getObjectProperty(targetNode, 'mLast');

                            if(mFirst !== null && mLast !== null)
                            {
                                let firstNode   = baseLayout.saveGameParser.getTargetObject(mFirst.pathName);
                                let lastNode    = baseLayout.saveGameParser.getTargetObject(mLast.pathName);

                                    if(firstNode !== null && lastNode !== null)
                                    {
                                        let currentTrack        = [];
                                        let previousNode        = null;
                                        let checkCurrentNode    = firstNode;
                                            while(checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName)
                                            {
                                                currentTrack.push(checkCurrentNode.transform.translation);

                                                let mNext               = baseLayout.getObjectProperty(checkCurrentNode, 'mNext');
                                                    if(mNext !== null)
                                                    {
                                                        if(currentTrack.length === (dataPoint + 1))
                                                        {
                                                            // Replace next on previsous node
                                                            let mNextPreviousNode           = baseLayout.getObjectProperty(previousNode, 'mNext');
                                                                mNextPreviousNode.pathName  = mNext.pathName;

                                                            // Delete current node from the save
                                                            baseLayout.saveGameParser.deleteObject(checkCurrentNode.pathName);

                                                            return true;
                                                        }

                                                        previousNode        = checkCurrentNode;
                                                        checkCurrentNode    = baseLayout.saveGameParser.getTargetObject(mNext.pathName);
                                                    }
                                                    else
                                                    {
                                                        checkCurrentNode    = null;
                                                    }
                                            }
                                    }
                            }
                    }
            }

        return false;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let vehicleTrack   = Building_Vehicle.getTrackData(baseLayout, currentObject);
            if(vehicleTrack !== null)
            {
                contextMenu.push({
                    icon        : 'fa-truck-loading',
                    text        : 'See track data',
                    callback    : function(){
                        let modalTrackData = new Modal_Vehicle_TrackData({baseLayout: baseLayout, vehicle: currentObject});
                            modalTrackData.parse();
                    }
                });
                contextMenu.push('-');
            }

        let mFuelInventory = baseLayout.getObjectProperty(currentObject, 'mFuelInventory');
            if(mFuelInventory !== null)
            {
                contextMenu.push({
                    icon        : 'fa-box-full',
                    text        : baseLayout.translate._('Fill fuel'),
                    callback    : function(marker){
                        return baseLayout.fillPlayerStorageBuildingInventoryModal(marker, 'mFuelInventory');
                    }
                });
                contextMenu.push({
                    icon        : 'fa-box-open',
                    text        : baseLayout.translate._('Clear fuel'),
                    callback    : function(marker){
                        return baseLayout.clearPlayerStorageBuildingInventory(marker, 'mFuelInventory');
                    }
                });
                contextMenu.push('-');
            }

        return contextMenu;
    }
}


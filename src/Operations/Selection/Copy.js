/**
 * @typedef { import("./types").CopyData } Data
 * @typedef { import("./types").CopyOperation } Operation
 * @typedef { Operation["1"] } OperationFn
 */

import { getPathNameRoot, getPathNameComponent } from "../../Data/GameObject.js"

import cloneDeep from "../../Lib/lodash/cloneDeep.js";

const name = "copy selection";
export default name;

/**
 * @type {Operation}
 */
export const copySelection = [name, copySelectionFn];

// Need some extra linked properties?
//TODO: Check mPairedStation?
const extraPropertyNames = ["mRailroadTrack", "mInfo", "mStationDrone", "mSignPoles"];

const trainAndStations = new Set([
    "/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainStation.Build_TrainStation_C",
    "/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStation.Build_TrainDockingStation_C",
    "/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C",
    "/Game/FactoryGame/Buildable/Vehicle/Train/Locomotive/BP_Locomotive.BP_Locomotive_C",
]);

/**
 * @type {OperationFn}
 */
function copySelectionFn({ markers }) {
    const availablePathName = new Set();
    const trainTimeTables = new Set();

    const clipboardData = generateClipboardData(markers, availablePathName, trainTimeTables);

    const clipboard = {
        saveVersion: header.saveVersion,
        buildVersion: header.buildVersion,
        data: clipboardData,
        pipes: new Map(),
        hiddenConnections: new Map(),
    };

    for (const data of clipboard.data) {
        if (
            data.parent.className ===
            "/Game/FactoryGame/Buildable/Factory/Train/SwitchControl/Build_RailroadSwitchControl.Build_RailroadSwitchControl_C"
        ) {
            const mControlledConnection = getObjectPropertyValue(
                data.parent,
                "mControlledConnection"
            );
            if (mControlledConnection === null) {
                continue;
            }

            const testPathName = getPathNameRoot(mControlledConnection.pathName);

            if (!availablePathName.has(testPathName)) {
                clipboard.data.delete(data);
            }
        }

        if (data.children !== undefined) {
            for (const child of data.children) {
                const component = getPathNameComponent(child.pathName);

                const mConnectedComponent = getObjectPropertyValue(
                    child,
                    "mConnectedComponent"
                );
                if (mConnectedComponent !== null) {
                    // Remove belt/hyper pipe connection for objects that aren't in the loop...
                    if (
                        availableBeltConnection.has(component) ||
                        availableHyperPipeConnection.has(component)
                    ) {
                        const testPathName = getPathNameRoot(mConnectedComponent.pathName);

                        if (!availablePathName.has(testPathName)) {
                            deleteObjectProperty(child, "mConnectedComponent");
                        }
                    }

                    // Handle pipes circuits
                    if (availablePipeConnection.has(component)) {
                        const testPathName = getPathNameRoot(mConnectedComponent.pathName);

                        if (!availablePathName.has(testPathName)) {
                            deleteObjectProperty(child, "mConnectedComponent");

                            if (
                                child.className ===
                                "/Script/FactoryGame.FGPipeConnectionFactory"
                            ) {
                                deleteObjectProperty(child, "mPipeNetworkID");
                            }
                        } // mPipeNetworkID
                        else {
                            const pipeNetworkId = getObjectPropertyValue(
                                child,
                                "mPipeNetworkID"
                            );
                            if (pipeNetworkId !== null) {
                                const pipeNetwork = pipeNetworks.get(pipeNetworkId);
                                if (pipeNetwork !== undefined) {
                                    const currentPipeNetwork = getGameObject(pipeNetwork);
                                    if (!clipboard.pipes.has(pipeNetworkId)) {
                                        clipboard.pipes.set(pipeNetworkId, {
                                            fluid: getObjectPropertyValue(
                                                currentPipeNetwork,
                                                "mFluidDescriptor"
                                            ),
                                            interface: [],
                                        });
                                    }

                                    // Check if that pathName is in the current pipe network
                                    if (currentPipeNetwork !== null) {
                                        const mFluidIntegrantScriptInterfaces =
                                            getObjectPropertyValue(
                                                currentPipeNetwork,
                                                "mFluidIntegrantScriptInterfaces"
                                            );
                                        if (mFluidIntegrantScriptInterfaces !== null) {
                                            for (const mFluidIntegrantScriptInterfacesValues of mFluidIntegrantScriptInterfaces
                                                .values.length) {
                                                if (
                                                    mFluidIntegrantScriptInterfacesValues.pathName ===
                                                        child.pathName &&
                                                    clipboard.pipes
                                                        .get(pipeNetworkId)
                                                        .interface.includes(
                                                            child.pathName
                                                        ) === false
                                                ) {
                                                    clipboard.pipes
                                                        .get(pipeNetworkId)
                                                        .interface.push(child.pathName);
                                                }

                                                if (
                                                    mFluidIntegrantScriptInterfacesValues.pathName ===
                                                        child.outerPathName &&
                                                    clipboard.pipes
                                                        .get(pipeNetworkId)
                                                        .interface.includes(
                                                            child.outerPathName
                                                        ) === false
                                                ) {
                                                    clipboard.pipes
                                                        .get(pipeNetworkId)
                                                        .interface.push(
                                                            child.outerPathName
                                                        );
                                                }

                                                if (
                                                    mFluidIntegrantScriptInterfacesValues.pathName ===
                                                        mConnectedComponent.pathName &&
                                                    clipboard.pipes
                                                        .get(pipeNetworkId)
                                                        .interface.includes(
                                                            mConnectedComponent.pathName
                                                        ) === false
                                                ) {
                                                    clipboard.pipes
                                                        .get(pipeNetworkId)
                                                        .interface.push(
                                                            mConnectedComponent.pathName
                                                        );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Remove railway connection for objects that aren't in the loop...
                const mConnectedComponents = getObjectPropertyValue(
                    child,
                    "mConnectedComponents"
                );
                if (mConnectedComponents !== null && availableRailwayConnection.has(component)) {
                    for (let n = mConnectedComponents.values.length - 1; n >= 0; n--) {
                        const testPathName = getPathNameRoot(
                            mConnectedComponents.values[n].pathName
                        );

                        if (!availablePathName.has(testPathName)) {
                            mConnectedComponents.values.splice(n, 1);
                        }
                    }
                }

                // Remove platform connection for objects that aren't in the loop...
                const mConnectedTo = getObjectPropertyValue(child, "mConnectedTo");
                if (mConnectedTo !== null && availablePlatformConnection.has(component)) {
                    const testPathName = getPathNameRoot(mConnectedTo.pathName);

                    if (!availablePathName.has(testPathName)) {
                        deleteObjectProperty(child, "mConnectedTo");
                    }
                }
            }
        }
    }

    // Grab wires when needed, or delete power connection...
    for (const data of clipboard.data) {
        if (data.children !== undefined) {
            for (const child of data.children) {
                const component = getPathNameComponent(child.pathName);
                if (availablePowerConnection.has(component)) {
                    const mWires = getObjectPropertyValue(child, "mWires");
                    if (mWires !== null) {
                        for (let m = (mWires.values.length - 1); m >= 0; m--) {
                            let keepPowerLine = true;
                            const currentPowerline = getGameObject(mWires.values[m].pathName);

                            if (currentPowerline !== null && currentPowerline.extra !== undefined) {
                                const testSourcePathName = getPathNameRoot(currentPowerline.extra.source.pathName);

                                if (!availablePathName.has(testSourcePathName)) {
                                    keepPowerLine = false;
                                }

                                const testTargetPathName = getPathNameRoot(currentPowerline.extra.target.pathName);

                                if (!availablePathName.has(testTargetPathName)) {
                                    keepPowerLine = false;
                                }
                            } else {
                                keepPowerLine = false;
                            }

                            if (!keepPowerLine) {
                                mWires.values.splice(m, 1);
                            } else {
                                if (!availablePathName.has(currentPowerline.pathName)) {
                                    clipboard.data.add({
                                        parent: currentPowerline,
                                        children: new Set(),
                                    });
                                    availablePathName.add(currentPowerline.pathName);
                                }
                            }
                        }
                    }

                    const mHiddenConnections = getObjectPropertyValue(child, "mHiddenConnections");
                    if (mHiddenConnections !== null) {
                        for (const mHiddenConnection of mHiddenConnections.values) {
                            const currentHiddenConnection = getGameObject(
                                mHiddenConnection.pathName
                            );
                            if (currentHiddenConnection !== null) {
                                const newHiddenConnection = cloneDeep(currentHiddenConnection);
                                const mCurrentHiddenConnections = getObjectPropertyValue(
                                    newHiddenConnection,
                                    "mHiddenConnections"
                                );

                                if (mCurrentHiddenConnections !== null) {
                                    for (
                                        let n = mCurrentHiddenConnections.values.length - 1;
                                        n >= 0;
                                        n--
                                    ) {
                                        const testSourcePathName = getPathNameRoot(
                                            mCurrentHiddenConnections.values[n]
                                        );

                                        if (availablePathName.has(testSourcePathName) === false) {
                                            mCurrentHiddenConnections.values.splice(n, 1);
                                        }
                                    }
                                }

                                if (
                                    !clipboard.hiddenConnections.has(newHiddenConnection.pathName)
                                ) {
                                    const isFromParent = getPathNameRoot(newHiddenConnection.pathName);

                                    // Avoid pushing hiddenConnection when they are already available as a child (Double Power Pole)
                                    if (isFromParent !== data.parent.pathName) {
                                        clipboard.hiddenConnections.set(
                                            newHiddenConnection.pathName,
                                            newHiddenConnection
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Handle timetable and remove not copied from them!
    for (const trainTimeTable of trainTimeTables) {
        const timeTable = getGameObject(trainTimeTable);
        if (timeTable !== null) {
            const newTimeTable = cloneDeep(timeTable);
            const mStops = getObjectPropertyValue(newTimeTable, "mStops");
            if (mStops !== null) {
                for (let j = mStops.values.length - 1; j >= 0; j--) {
                    for (let k = mStops.values[j].length - 1; k >= 0; k--) {
                        if (
                            mStops.values[j] !== undefined &&
                            mStops.values[j][k].name === "Station"
                        ) {
                            if (
                                !availablePathName.has(mStops.values[j][k].value.pathName)
                            ) {
                                mStops.values.splice(j, 1);
                            }
                        }
                    }
                }
            }

            clipboard.data.add({
                parent: newTimeTable,
                children: new Set(),
            });
            availablePathName.add(newTimeTable.pathName);
        }
    }

    if (useDebug === true) {
        console.log("COPY", clipboard);
    }

    // Store boundaries
    const boundaries = getBoundaries(markers);
    clipboard.minX = boundaries.minX;
    clipboard.maxX = boundaries.maxX;
    clipboard.minY = boundaries.minY;
    clipboard.maxY = boundaries.maxY;

    postMessage({
        command: "copy-complete",
        clipboard
    })
}

function generateClipboardData(markers, availablePathName, trainTimeTables) {
    const clipboardData = new Set();

    for (const marker of markers) {
        if (availablePathName.has(marker.options.pathName)) {
            continue; // Skip duplicates...
        }

        const gameObject = getGameObject(marker.options.pathName);
        const buildingData = getBuildingDataFromClassName(gameObject.className);

        // Filter not wanted
        if (!shouldCopy(gameObject, buildingData)) {
            continue;
        }

        const newGameObject = copyGameObject(gameObject);

        copyExtraProperties(gameObject, clipboardData, availablePathName);

        handleCopyVehicleWaypoints(gameObject, newGameObject);
        handleCopyTrainsAndStations(
            newGameObject,
            clipboardData,
            availablePathName,
            trainTimeTables
        );

        // Add object
        clipboardData.add(newGameObject);
        availablePathName.add(newGameObject.parent.pathName);
    }

    return clipboardData;
}

function shouldCopy(gameObject, buildingData) {
    // We use that to actually map the caves
    if (
        useDebug === true &&
        gameObject.className === "/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C"
    ) {
        console.log([
            Math.round(gameObject.transform.translation[0]),
            Math.round(gameObject.transform.translation[1]),
        ]);
    }

    if (buildingData !== null) {
        if (
            [
                "/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C",
                "/Game/FactoryGame/Buildable/Factory/SpaceElevator/Build_SpaceElevator.Build_SpaceElevator_C",
                "/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C", // Skip them and grab them from the drone station...
            ].includes(buildingData.className)
        ) {
            return false;
        }
        if (
            gameObject.className !==
                "/Game/FactoryGame/Buildable/Factory/Train/Track/Build_RailroadTrackIntegrated.Build_RailroadTrackIntegrated_C" &&
            gameObject.className.includes("Integrated")
        ) {
            return false;
        }
    } else {
        if (
            gameObject.className !== "/Script/FactoryGame.FGItemPickup_Spawnable" &&
            gameObject.className !==
                "/Game/FactoryGame/Resource/BP_ItemPickup_Spawnable.BP_ItemPickup_Spawnable_C" &&
            gameObject.className !==
                "/Game/FactoryGame/Equipment/Decoration/BP_Decoration.BP_Decoration_C" &&
            gameObject.className !==
                "/Game/FactoryGame/Equipment/PortableMiner/BP_PortableMiner.BP_PortableMiner_C" &&
            gameObject.className !== "/Game/FactoryGame/Equipment/Beacon/BP_Beacon.BP_Beacon_C" &&
            gameObject.className.startsWith("/Game/FactoryGame/Character/Creature/Wildlife/") ===
                false
        ) {
            return false;
        }
    }
    return true;
}

function copyChildren(gameObject) {
    const children = new Set();

    if (gameObject.children !== undefined) {
        for (const child of gameObject.children) {
            children.add(cloneDeep(getGameObject(child.pathName)));
        }
    }

    return children;
}

function resetDroneTransport(gameObject) {
    setObjectProperty(gameObject.parent, {
        name: "mCurrentDockingState",
        type: "StructProperty",
        value: {
            type: "DroneDockingStateInfo",
            values: [
                {
                    name: "State",
                    type: "EnumProperty",
                    value: {
                        name: "EDroneDockingState",
                        value: "EDroneDockingState::DS_DOCKED",
                    },
                },
            ],
        },
    });
    deleteObjectProperty(gameObject.parent, "mCurrentAction");
    deleteObjectProperty(gameObject.parent, "mActionsToExecute");
}

function copyGameObject(gameObject) {
    return {
        parent: cloneDeep(gameObject),
        children: copyChildren(gameObject),
    };
}

function copyExtraProperties(gameObject, clipboardData, availablePathName) {
    for (const extraPropertyName of extraPropertyNames) {
        const extraProperty = getObjectPropertyValue(gameObject, extraPropertyName);

        if (extraProperty === null) {
            continue;
        }

        if (extraProperty.pathName !== undefined && extraProperty.values === undefined) {
            extraProperty.values = [{ pathName: extraProperty.pathName }];
        }

        for (const extraPropertyValue of extraProperty.values) {
            const extraPropertyObject = getGameObject(extraPropertyValue.pathName);

            if (extraPropertyObject === null) {
                continue;
            }

            const extraPropertyNewObject = copyGameObject(extraPropertyObject);

            // Removes drone action to reset it
            if (
                extraPropertyNewObject.className ===
                "/Game/FactoryGame/Buildable/Factory/DroneStation/BP_DroneTransport.BP_DroneTransport_C"
            ) {
                resetDroneTransport(extraPropertyNewObject);
            }

            clipboardData.add(extraPropertyNewObject);
            availablePathName.add(extraPropertyNewObject.parent.pathName);
        }
    }
}

function handleCopyVehicleWaypoints(gameObject, newGameObject) {
    // Does vehicle have a list of waypoints?
    const mTargetList =
        getObjectPropertyValue(gameObject, "mTargetList") ?? // Update 5
        getObjectPropertyValue(gameObject, "mTargetNodeLinkedList"); //TODO:OLD

    if (mTargetList === null) {
        return;
    }

    const linkedList = getGameObject(mTargetList.pathName);

    if (linkedList === null) {
        return;
    }

    const mFirst = getObjectPropertyValue(linkedList, "mFirst");
    const mLast = getObjectPropertyValue(linkedList, "mLast");

    newGameObject.linkedList = linkedList;

    if (mFirst === null || mLast === null) {
        return;
    }

    const firstNode = getGameObject(mFirst.pathName);
    const lastNode = getGameObject(mLast.pathName);

    if (firstNode === null || lastNode === null) {
        return;
    }

    let checkCurrentNode = firstNode;
    newGameObject.targetPoints = [];

    while (checkCurrentNode !== null && checkCurrentNode.pathName !== lastNode.pathName) {
        newGameObject.targetPoints.push(checkCurrentNode);

        const mNext = getObjectPropertyValue(checkCurrentNode, "mNext");

        checkCurrentNode = null;
        if (mNext !== null) {
            checkCurrentNode = getGameObject(mNext.pathName);
        }
    }

    newGameObject.targetPoints.push(lastNode);
}

// Handle train/station
function handleCopyTrainsAndStations(
    newGameObject,
    clipboardData,
    availablePathName,
    trainTimeTables
) {
    if (!trainAndStations.has(newGameObject.parent.className)) {
        return;
    }

    const trainIdentifier = getRailroadObjectIdentifier(newGameObject.parent);

    if (trainIdentifier !== null) {
        return;
    }

    const trainIdentifierNewObject = {
        parent: cloneDeep(trainIdentifier),
    };
    const haveTimeTable = getObjectPropertyValue(trainIdentifierNewObject.parent, "TimeTable");

    if (haveTimeTable) {
        trainTimeTables.add(haveTimeTable);
    }

    clipboardData.add(trainIdentifierNewObject);
    availablePathName.add(trainIdentifierNewObject.parent.pathName);
}

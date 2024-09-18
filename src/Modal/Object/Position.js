import BaseLayout_Math                          from '../../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import Building                                 from '../../Building.js';
import Building_Pipeline                        from '../../Building/Pipeline.js';
import Building_RailroadTrack                   from '../../Building/RailroadTrack.js';

import SubSystem_ConveyorChainActor             from '../../SubSystem/ConveyorChainActor.js';

export default class Modal_Object_Position
{
    static getHTML(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let teleportPlayer      = false;
        let canHaveScale3D      = !(Building.isConveyorBelt(currentObject) || Building_Pipeline.isPipeline(currentObject) || Building_RailroadTrack.isRailroadTrack(currentObject));

        // Switch player object
        if(currentObject.className === '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C')
        {
            let mOwnedPawn = baseLayout.players[marker.relatedTarget.options.pathName].getOwnedPawn();
                if(mOwnedPawn !== null)
                {
                    teleportPlayer  = true;
                    currentObject   = mOwnedPawn;
                }
        }

        let currentRotation     = BaseLayout_Math.getQuaternionToEuler(currentObject.transform.rotation);
        let currentRotationYaw  = Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.yaw) * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision
            if(buildingData !== null && buildingData.mapCorrectedAngle !== undefined)
            {
                currentRotationYaw += buildingData.mapCorrectedAngle;
                currentRotationYaw  = BaseLayout_Math.clampEulerAxis(currentRotationYaw);
            }

        let inputs              = [
            {
                label       : 'X',
                name        : 'x',
                inputType   : 'coordinate',
                value       : currentObject.transform.translation[0]
            },
            {
                label       : 'Y',
                name        : 'y',
                inputType   : 'coordinate',
                value       : currentObject.transform.translation[1]
            },
            {
                label       : 'Z',
                name        : 'z',
                inputType   : 'coordinate',
                value       : currentObject.transform.translation[2]
            },
            {
                label       : 'Pitch (Angle between 0 and 360 degrees)',
                name        : 'pitch',
                inputType   : 'number',
                min         : 0,
                max         : 360,
                value       : Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.pitch) * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision
            },
            {
                label       : 'Roll (Angle between -180 and 180 degrees)',
                name        : 'roll',
                inputType   : 'number',
                min         : -180,
                max         : 180,
                value       : Math.round(BaseLayout_Math.normalizeEulerAxis(currentRotation.roll) * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision
            },
            {
                label       : 'Rotation (Angle between 0 and 360 degrees)',
                name        : 'yaw',
                inputType   : 'number',
                min         : 0,
                max         : 360,
                value       : currentRotationYaw
            }
        ];

        if(canHaveScale3D === true)
        {
            inputs.push({
                label       : 'Scale X',
                name        : 'scaleX',
                inputType   : 'number',
                min         : 0.1,
                max         : 10,
                value       : ((currentObject.transform.scale3d !== undefined) ? currentObject.transform.scale3d[0] : 1)
            });
            inputs.push({
                label       : 'Scale Y',
                name        : 'scaleY',
                inputType   : 'number',
                min         : 0.1,
                max         : 10,
                value       : ((currentObject.transform.scale3d !== undefined) ? currentObject.transform.scale3d[1] : 1)
            });
            inputs.push({
                label       : 'Scale Z',
                name        : 'scaleZ',
                inputType   : 'number',
                min         : 0.1,
                max         : 10,
                value       : ((currentObject.transform.scale3d !== undefined) ? currentObject.transform.scale3d[2] : 1)
            });
        }

        BaseLayout_Modal.form({
            title       : "Position",
            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
            container   : '#leafletMap',
            inputs      : inputs,
            callback    : function(values)
            {
                values.x        = parseFloat(values.x);
                values.y        = parseFloat(values.y);
                values.z        = parseFloat(values.z);

                values.pitch    = parseFloat(values.pitch);
                values.roll     = parseFloat(values.roll);
                values.yaw      = parseFloat(values.yaw);

                if(buildingData !== null && buildingData.mapCorrectedAngle !== undefined)
                {
                    values.yaw -= buildingData.mapCorrectedAngle;
                    values.yaw  = BaseLayout_Math.clampEulerAxis(values.yaw);
                }

                if(baseLayout.history !== null)
                {
                    baseLayout.history.add({
                        name: 'Undo: Update position',
                        values: [{
                            pathName: marker.relatedTarget.options.pathName,
                            callback: 'refreshMarkerPosition',
                            properties: {transform: JSON.parse(JSON.stringify(currentObject.transform))}
                        }]
                    });
                }

                let newTransform = JSON.parse(JSON.stringify(currentObject.transform));
                    if(isNaN(values.x) === false)
                    {
                        newTransform.translation[0] = values.x;
                    }
                    if(isNaN(values.y) === false)
                    {
                        newTransform.translation[1] = values.y;
                    }
                    if(isNaN(values.z) === false)
                    {
                        newTransform.translation[2] = values.z;
                    }

                    if(isNaN(values.roll) === false && isNaN(values.pitch) === false && isNaN(values.yaw) === false)
                    {
                        newTransform.rotation = BaseLayout_Math.getEulerToQuaternion({roll: values.roll, pitch: values.pitch, yaw: values.yaw});
                    }

                    if(canHaveScale3D === true)
                    {
                        values.scaleX   = parseFloat(values.scaleX);
                        values.scaleY   = parseFloat(values.scaleY);
                        values.scaleZ   = parseFloat(values.scaleZ);

                        if(isNaN(values.scaleX) === false)
                        {
                            if(newTransform.scale3d === undefined)
                            {
                                newTransform.scale3d = [];
                            }
                            newTransform.scale3d[0] = values.scaleX;
                        }
                        if(isNaN(values.scaleY) === false)
                        {
                            if(newTransform.scale3d === undefined)
                            {
                                newTransform.scale3d = [];
                            }
                            newTransform.scale3d[1] = values.scaleY;
                        }
                        if(isNaN(values.scaleZ) === false)
                        {
                            if(newTransform.scale3d === undefined)
                            {
                                newTransform.scale3d = [];
                            }
                            newTransform.scale3d[2] = values.scaleZ;
                        }
                    }

                let mConveyorChainActor = baseLayout.getObjectProperty(currentObject, 'mConveyorChainActor');
                    if(mConveyorChainActor !== null)
                    {
                        let conveyorChainActorSubsystem = new SubSystem_ConveyorChainActor({baseLayout: baseLayout, pathName: mConveyorChainActor.pathName});
                            conveyorChainActorSubsystem.killMe();
                    }

                if(teleportPlayer !== false)
                {
                    baseLayout.players[marker.relatedTarget.options.pathName].teleportTo(newTransform, 0);
                }
                else
                {
                    baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: newTransform, object: currentObject});
                    baseLayout.updateRadioactivityLayer();
                }
            }
        });
    }
}
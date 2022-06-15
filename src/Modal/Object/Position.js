import BaseLayout_Math                          from '../../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

export default class Modal_Object_Position
{
    static getHTML(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let teleportPlayer      = false;

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
        let currentRotationYaw  = Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.yaw) * 1000) / 1000
            if(buildingData !== null && buildingData.mapCorrectedAngle !== undefined)
            {
                currentRotationYaw += buildingData.mapCorrectedAngle;
                currentRotationYaw  = BaseLayout_Math.clampEulerAxis(currentRotationYaw);
            }

        BaseLayout_Modal.form({
            title       : "Position",
            message     : 'Negative offset will move X to the West, Y to the North, and Z down.<br /><strong>NOTE:</strong> A foundation is 800 wide.',
            container   : '#leafletMap',
            inputs      : [
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
                    value       : Math.round(BaseLayout_Math.clampEulerAxis(currentRotation.pitch) * 1000) / 1000
                },
                {
                    label       : 'Roll (Angle between -180 and 180 degrees)',
                    name        : 'roll',
                    inputType   : 'number',
                    min         : -180,
                    max         : 180,
                    value       : Math.round(BaseLayout_Math.normalizeEulerAxis(currentRotation.roll) * 1000) / 1000
                },
                {
                    label       : 'Rotation (Angle between 0 and 360 degrees)',
                    name        : 'yaw',
                    inputType   : 'number',
                    min         : 0,
                    max         : 360,
                    value       : currentRotationYaw
                }
            ],
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
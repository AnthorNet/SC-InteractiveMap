import BaseLayout_Math                          from '../../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

import cloneDeep                                from '../../Lib/cloneDeep.js'

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
            let mOwnedPawn = baseLayout.players.get(marker.relatedTarget.options.pathName).getOwnedPawn();
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
            callback    : function(form)
            {
                if(form !== null && form.x !== null && form.y !== null && form.z !== null && form.pitch !== null && form.roll !== null && form.yaw !== null)
                {
                    form.x                                  = parseFloat(form.x);
                    form.y                                  = parseFloat(form.y);
                    form.z                                  = parseFloat(form.z);
                    form.pitch                              = parseFloat(form.pitch);
                    form.roll                               = parseFloat(form.roll);
                    form.yaw                                = parseFloat(form.yaw);

                    if(buildingData !== null && buildingData.mapCorrectedAngle !== undefined)
                    {
                        form.yaw -= buildingData.mapCorrectedAngle;
                        form.yaw  = BaseLayout_Math.clampEulerAxis(form.yaw);
                    }

                    if(baseLayout.history !== null)
                    {
                        baseLayout.history.add({
                            name: 'Undo: Update position',
                            values: [{
                                pathName: marker.relatedTarget.options.pathName,
                                callback: 'refreshMarkerPosition',
                                properties: {transform: cloneDeep(currentObject.transform)}
                            }]
                        });
                    }

                        let newTransform = cloneDeep(currentObject.transform);
                            if(isNaN(form.x) === false)
                            {
                                newTransform.translation[0] = form.x;
                            }
                            if(isNaN(form.y) === false)
                            {
                                newTransform.translation[1] = form.y;
                            }
                            if(isNaN(form.z) === false)
                            {
                                newTransform.translation[2] = form.z;
                            }
                            if(isNaN(form.roll) === false && isNaN(form.pitch) === false && isNaN(form.yaw) === false)
                            {
                                newTransform.rotation = BaseLayout_Math.getEulerToQuaternion({roll: form.roll, pitch: form.pitch, yaw: form.yaw});
                            }

                    if(teleportPlayer !== false)
                    {
                        baseLayout.players.get(marker.relatedTarget.options.pathName).teleportTo(newTransform, 0);
                    }
                    else
                    {
                        baseLayout.refreshMarkerPosition({marker: marker.relatedTarget, transform: cloneDeep(newTransform), object: currentObject});
                        baseLayout.updateRadioactivityLayer();
                    }
                }
            }
        });
    }
}
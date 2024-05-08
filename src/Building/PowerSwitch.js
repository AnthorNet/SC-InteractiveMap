import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_PowerSwitch
{
    static isOn(baseLayout, currentObject)
    {
        let mIsSwitchOn = baseLayout.getObjectProperty(currentObject, 'mIsSwitchOn');
            if(mIsSwitchOn !== null && mIsSwitchOn === 1)
            {
                return true;
            }

        return false;
    }

    static getSign(baseLayout, currentObject)
    {
        let mBuildingTag = baseLayout.getObjectProperty(currentObject, 'mBuildingTag');
            if(mBuildingTag !== null && mBuildingTag !== '')
            {
                return mBuildingTag;
            }

        return null;
    }

    /**
     * PRIORITY GROUP
     */
    static getPriorityGroup(baseLayout, currentObject)
    {
        let currentPriority = 0;
        let mPriority = baseLayout.getObjectProperty(currentObject, 'mPriority');
            if(mPriority !== null)
            {
                currentPriority = mPriority;
            }

        return currentPriority;
    }

    static setPriorityGroup(baseLayout, currentObject, priority)
    {
        if(priority === 0)
        {
            baseLayout.deleteObjectProperty(currentObject, 'mPriority');
        }
        else
        {
            baseLayout.setObjectProperty(currentObject, 'mPriority', priority, 'Int');
        }
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-power-off',
            text        : 'Turn ' + ((Building_PowerSwitch.isOn(baseLayout, currentObject) === false) ? '<strong class="text-success">On' : '<strong class="text-danger">Off</strong>'),
            callback    : Building_PowerSwitch.updateState
        });

        contextMenu.push({
            icon        : 'fa-pen',
            text        : 'Update name',
            callback    : Building_PowerSwitch.updateSign
        });
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateSign(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let currentSign     = Building_PowerSwitch.getSign(baseLayout, currentObject);

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" sign',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mBuildingTag',
                    inputType   : 'text',
                    value       : currentSign
                }],
                callback    : function(values)
                {
                    if(values.mBuildingTag !== '')
                    {
                        baseLayout.setObjectProperty(currentObject, 'mHasBuildingTag', 1, 'Bool');
                        baseLayout.setObjectProperty(currentObject, 'mBuildingTag', values.mBuildingTag, 'Str');
                    }
                    else
                    {
                        baseLayout.deleteObjectProperty(currentObject, 'mHasBuildingTag');
                        baseLayout.deleteObjectProperty(currentObject, 'mBuildingTag');
                    }
                }
            });
    }

    static updateState(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let isOn            = Building_PowerSwitch.isOn(baseLayout, currentObject);

            if(isOn === true)
            {
                baseLayout.deleteObjectProperty(currentObject, 'mIsSwitchOn');
            }
            else
            {
                baseLayout.setObjectProperty(currentObject, 'mIsSwitchOn', 1, 'Bool');
            }
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject)
    {
        let content             = [];
        let objectCircuitA      = null;
        let objectCircuitB      = null;

        let powerConnection1    = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection1');
            if(powerConnection1 !== null)
            {
                objectCircuitA = baseLayout.circuitSubSystem.getObjectCircuit(powerConnection1);
            }
        let powerConnection2    = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PowerConnection2');
            if(powerConnection2 !== null)
            {
                objectCircuitB = baseLayout.circuitSubSystem.getObjectCircuit(powerConnection2);
            }

        // SIGN
        let mBuildingTag = Building_PowerSwitch.getSign(baseLayout, currentObject);
            if(mBuildingTag !== null)
            {
                content.push('<div style="position: absolute;margin-top: 5px;margin-left: 15px;width: 390px;font-size: 10px;line-height: 16px;" class="text-warning">' + mBuildingTag + '</div>');
                content.push('<div style="position: absolute;margin-top: 1px;margin-left: 450px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_OnOffSwitch_On.png?v=' + baseLayout.scriptVersion + '" /></div>');
            }

        // HANDLE
        let mIsSwitchOn = Building_PowerSwitch.isOn(baseLayout, currentObject);
            if(mIsSwitchOn === true)
            {
                content.push('<div style="position: absolute;margin-top: 220px;margin-left: 13px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerSwitch_HandleOn.png?v=' + baseLayout.scriptVersion + '" /></div>');
            }
            else
            {
                content.push('<div style="position: absolute;margin-top: 130px;margin-left: 13px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerSwitch_HandleOff.png?v=' + baseLayout.scriptVersion + '" /></div>');
            }

        // LIGHT / STATE
        if(mIsSwitchOn === true)
        {
            content.push('<div style="position: absolute;margin-top: 46px;margin-left: 50px; width: 70px;height: 30px;color: #FFFFFF;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center" style="line-height: 1;font-size: 9px;">');
            content.push('<strong>OPERATIONAL</strong>');
            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 35px;margin-left: 5px;" class="flash"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_IndicatorPanel_Light_Operational.png?v=' + baseLayout.scriptVersion + '" /></div>');
        }
        else
        {
            content.push('<div style="position: absolute;margin-top: 46px;margin-left: 50px; width: 70px;height: 30px;color: #FFFFFF;">');
            content.push('<div class="d-flex h-100"><div class="justify-content-center align-self-center w-100 text-center" style="line-height: 1;font-size: 8px;">');
            content.push('POWER SWITCH<br />IS OFF');
            content.push('</div></div>');
            content.push('</div>');

            content.push('<div style="position: absolute;margin-top: 35px;margin-left: 5px;" class="flash"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_IndicatorPanel_Light_Caution.png?v=' + baseLayout.scriptVersion + '" /></div>');
        }

        // CIRCUIT A
        content.push('<div style="position: absolute;margin-top: 81px;margin-left: 114px;color: #FFFFFF;transform: rotate(-90deg);-webkit-transform-origin: 50%  51%;width: 100px;line-height: 20px;text-align: right;font-size: 12px;">');
            if(objectCircuitA !== null)
            {
                content.push('<strong>Power Grid A (#' + objectCircuitA.circuitId + ')</strong>');
            }
            else
            {
                content.push('<strong>Power Grid A</strong>');
            }
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 35px;margin-left: 175px; width: 315px;height: 130px;color: #5b5b5b;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
        if(objectCircuitA !== null)
        {
            content.push(baseLayout.circuitSubSystem.getStatisticsGraph(objectCircuitA.circuitId));
        }
        content.push('</div>');

        // CIRCUIT B
        content.push('<div style="position: absolute;margin-top: 235px;margin-left: 115px;color: #FFFFFF;transform: rotate(-90deg);-webkit-transform-origin: 50%  51%;width: 100px;line-height: 20px;font-size: 12px;">');
            if(objectCircuitB !== null)
            {
                content.push('<strong>Power Grid B (#' + objectCircuitB.circuitId + ')</strong>');
            }
            else
            {
                content.push('<strong>Power Grid B</strong>');
            }
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 173px;margin-left: 175px; width: 315px;height: 130px;color: #5b5b5b;' + BaseLayout_Tooltip.genericUIBackgroundStyle(baseLayout) + '">');
        if(objectCircuitB !== null)
        {
            content.push(baseLayout.circuitSubSystem.getStatisticsGraph(objectCircuitB.circuitId));
        }
        content.push('</div>');

        return '<div style="width: 500px;height: 322px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_PowerSwitch_BG.png?v=' + baseLayout.scriptVersion + ');margin: -7px;">' + content.join('') + '</div>';
    }
}
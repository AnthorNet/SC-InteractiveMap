import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_DroneStation
{
    /**
     * STATE
     */
    static getInformation(baseLayout, currentObject)
    {
        let mInfo = baseLayout.getObjectProperty(currentObject, 'mInfo');
            if(mInfo !== null)
            {
                let stationInfo = baseLayout.saveGameParser.getTargetObject(mInfo.pathName);
                    if(stationInfo !== null)
                    {
                        return stationInfo;
                    }
            }

        return null;
    }

    static getSign(baseLayout, currentObject)
    {
        let stationInfo = Building_DroneStation.getInformation(baseLayout, currentObject);
            if(stationInfo !== null)
            {
                let mBuildingTag = baseLayout.getObjectProperty(stationInfo, 'mBuildingTag');
                    if(mBuildingTag !== null && mBuildingTag !== '')
                    {
                        return mBuildingTag;
                    }
            }

        return null;
    }

    /**
     * CONTEXT MENU
     */

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content         = [];

        // HEADER
        let mBuildingTag    = Building_DroneStation.getSign(baseLayout, currentObject);
            content.push('<div style="position: absolute;margin-top: 21px;margin-left: 200px;width: 390px;font-size: 10px;line-height: 16px;" class="text-warning">');
            if(mBuildingTag !== null)
            {
                content.push('<strong>' + mBuildingTag + '</strong> ');
            }
            content.push('<span class="small">(' + buildingData.name + ')</span></div>');

        // BATTERY
        content.push('<div style="position: absolute;margin-top: 291px;margin-left:118px;">');
            content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mBatteryInventory'), 1, 42));
        content.push('</div>');
        content.push('<div style="position: absolute;margin-top: 342px;margin-left: 109px; width: 60px;' + BaseLayout_Tooltip.styleLabels + '"><strong>BATTERY</strong></div>');

        // INPUT INVENTORY
        content.push('<div style="position: absolute;margin-top: 155px;margin-left: 205px;color: #FFFFFF;font-size: 12px;line-height: 20px;">');
        content.push('Outgoing:');
        content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mInputInventory'), ((buildingData.maxSlot !== undefined) ? buildingData.maxSlot : null), 28, 'small', null, 6));
        content.push('</div>');

        // OUTPUT INVENTORY
        content.push('<div style="position: absolute;margin-top: 155px;margin-left: 400px;color: #FFFFFF;font-size: 12px;line-height: 20px;">');
        content.push('Incoming:');
        content.push(baseLayout.setInventoryTableSlot(baseLayout.getObjectInventory(currentObject, 'mOutputInventory'), ((buildingData.maxSlot !== undefined) ? buildingData.maxSlot : null), 28, 'small', null, 6));
        content.push('</div>');

        // STAND BY
        content.push(BaseLayout_Tooltip.getStandByPanel(baseLayout, currentObject, 322, 525, 349, 455));

        return '<div style="width: 600px;height: 397px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_DroneStation_BG.png?v=' + baseLayout.scriptVersion + ') no-repeat #7b7b7b;margin: -7px;">' + content.join('') + '</div>';
    }
}
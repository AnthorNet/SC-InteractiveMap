import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class SubSystem_Overclocking
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
    }

    getClockSpeed(currentObject)
    {
        let currentPotential = this.baseLayout.getObjectProperty(currentObject, 'mCurrentPotential');
            if(currentPotential !== null)
            {
                return currentPotential;
            }

        let pendingPotential = this.baseLayout.getObjectProperty(currentObject, 'mPendingPotential');
            if(pendingPotential !== null)
            {
                return pendingPotential;
            }

       return 1;
    }

    getProductionBoost(currentObject)
    {
        let currentPotential = this.baseLayout.getObjectProperty(currentObject, 'mCurrentProductionBoost');
            if(currentPotential !== null)
            {
                return currentPotential;
            }

        let pendingPotential = this.baseLayout.getObjectProperty(currentObject, 'mPendingProductionBoost');
            if(pendingPotential !== null)
            {
                return pendingPotential;
            }

       return 1;
    }

    /*
     * TOOLTIP PANELS
     */
    getOverclockingPanel(currentObject, top = 312, left = 34)
    {
        if(this.baseLayout.unlockSubSystem.haveOverclocking() === true)
        {
            let content                 = [];
            let clockSpeed              = this.getClockSpeed(currentObject);
            let potentialInventory      = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

                content.push('<div style="position: absolute;margin-top: ' + (parseInt(top) + 2) + 'px;margin-left: ' + (parseInt(left) + 2) + 'px; width: 318px;height: 97px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ManufacutringMenu_OverclockBackground.png?v=' + this.baseLayout.scriptVersion + ')">');
                content.push('<table style="margin: 10px;width: 298px;"><tr>');
                content.push('<td><span class="text-small">Clockspeed:</span><br /><strong class="lead text-warning">' + +(Math.round(clockSpeed * 10000) / 100) + ' %</strong></td>');

                if(potentialInventory !== null)
                {
                    for(let i = 0; i < 3; i++)
                    {
                        content.push('<td width="62">');
                        content.push('<div class="text-center"><table class="mr-auto ml-auto"><tr><td>' + this.baseLayout.setInventoryTableSlot(
                            [((potentialInventory[i] === undefined) ? null : potentialInventory[i])],
                            null,
                            56,
                            '',
                            this.baseLayout.itemsData.Desc_CrystalShard_C.image
                        ) + '</td></tr></table></div>');
                        content.push('</td>');
                    }
                }

                content.push('</tr><tr>');
                content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + Math.min(100, (clockSpeed * 10000) / 100) + '%"></div></div></td>');

                if(potentialInventory !== null)
                {
                    for(let i = 0; i < 3; i++)
                    {
                        let potentialProgress = Math.min(100, ((clockSpeed * 10000) / 100 - (100 + (i * 50))) * 2);
                            content.push('<td><div class="progress rounded-sm" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + potentialProgress + '%"></div></div></td>');
                    }
                }

                content.push('</tr></table>');
                content.push('</div>');

            return content.join('');
        }

        return '<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px; width: 322px;height: 105px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/OverclockPanelLocked.png?v=' + this.baseLayout.scriptVersion + ');"></div>';
    }

    getProductionAmplifierPanel(currentObject, top = 312, left = 366)
    {
        if(this.baseLayout.unlockSubSystem.haveProductionBoost() === true)
        {
            let content                 = [];
            let productionBoost         = this.getProductionBoost(currentObject);
            let potentialInventory      = this.baseLayout.getObjectInventory(currentObject, 'mInventoryPotential');

                content.push('<div style="position: absolute;margin-top: ' + (parseInt(top) + 2) + 'px;margin-left: ' + (parseInt(left) + 2) + 'px; width: 96px;height: 97px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ManufacutringMenu_ProductionBoostBackground.png?v=' + this.baseLayout.scriptVersion + ')">');
                content.push('<table style="margin: 5px;width: 86px;">');
                content.push('<tr><td>');
                    content.push('<div style="position: relative;background: #FFFFFF;border: 1px solid #000000;border-radius: 5px;overflow: hidden;padding: 5px;">');

                        let inventoryImage = '<div class="text-center"><table class="mr-auto ml-auto"><tr><td>' + this.baseLayout.setInventoryTableSlot(
                                [((potentialInventory[3] === undefined) ? null : potentialInventory[3])],
                                null,
                                40,
                                '',
                                this.baseLayout.toolsData.Desc_WAT1_C.image
                            ) + '</td></tr></table></div>';

                        if(potentialInventory[3] !== undefined && potentialInventory[3] !== null)
                        {
                            content.push('<div style="position: absolute;top: 50%;left: 50%;margin-top: -150px;margin-left: -150px;width: 300px;height: 300px;background-image: linear-gradient(135deg, #9f6d9f 23.81%, #855b85 23.81%, #855b85 25%, #bd82bd 25%, #bd82bd 48.81%, #855b85 48.81%, #855b85 50%, #9f6d9f 50%, #9f6d9f 73.81%, #855b85 73.81%, #855b85 75%, #bd82bd 75%, #bd82bd 98.81%, #855b85 98.81%, #855b85 100%);background-size: 30px 30px;animation: productionBoost 20s linear infinite;">');
                            content.push('</div>');
                            content.push('<div style="animation: interference 4s infinite;">' + inventoryImage + '</div>');
                        }
                        else
                        {
                            content.push(inventoryImage);
                        }



                    content.push('</div>');
                content.push('</td></tr>');

                content.push('<tr><td style="' + BaseLayout_Tooltip.defaultTextStyle + 'text-align: center;line-height: 10px;"><span style="font-size: 70%;">Output Multiplier:</span><br /><strong style="color: #a671a6;font-size: 120%;">x' + productionBoost + '</strong></td></tr>');

                content.push('</table>');
                content.push('</div>');

            return content.join('');
        }

        return '<div style="position: absolute;margin-top: ' + top + 'px;margin-left: ' + left + 'px; width: 100px;height: 105px;background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/ProductionAmplifierPanelLocked.png?v=' + this.baseLayout.scriptVersion + ');"></div>';
    }
}
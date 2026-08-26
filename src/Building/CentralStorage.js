import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_CentralStorage
{
    static getCurrentStorage(baseLayout, currentObject)
    {
        let mStorageInventory = baseLayout.getObjectProperty(currentObject, 'mStorageInventory');
            if(mStorageInventory !== null)
            {
                let mStorageObject = baseLayout.saveGameParser.getTargetObject(mStorageInventory.pathName);
                    if(mStorageObject !== null)
                    {
                        let mInventoryStacks = baseLayout.getObjectProperty(mStorageObject, 'mInventoryStacks');
                            if(mInventoryStacks !== null)
                            {
                                let currentItem = mInventoryStacks.values[0][0].value.itemName.pathName;
                                    if(currentItem !== '')
                                    {
                                        let currentAmount = mInventoryStacks.values[0][0].value.properties[0].value;
                                            return {
                                                currentItem     : currentItem,
                                                currentAmount   : currentAmount
                                            };
                                    }
                            }
                        }
            }


        return null;
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject)
    {
        let content             = [];
        let storageContent      = Building_CentralStorage.getCurrentStorage(baseLayout, currentObject);

        if(storageContent !== null)
        {
            content.push('<div style="position: absolute;margin-top: 170px;margin-left: 66px; width: 188px;height: 250px;">');

                let currentItem         = baseLayout.getItemDataFromClassName(storageContent.currentItem);
                    content.push('<table class="mx-auto"><tr><td><div style="animation: interference 4s infinite;">' + baseLayout.getInventoryImage({
                        category        : currentItem.category,
                        name            : currentItem.name,
                        image           : currentItem.image,
                        qty             : storageContent.currentAmount
                    }, 96) + '</div></td></tr></table>');

                // Progression
                let uploadRate      = baseLayout.centralStorageSubSystem.getUploadRate();
                let mUploadTimer    = baseLayout.getObjectProperty(currentObject, 'mUploadTimer');
                let uploadProgress  = mUploadTimer / (60 / uploadRate) * 100;
                    content.push('<div style="padding: 0 30px;"><div class="progress rounded-sm mx-2 mt-2" style="height: 10px;"><div class="progress-bar bg-warning" style="width: ' + uploadProgress + '%"></div></div></div>');

            content.push('</div>');

            // Working light
            content.push('<div style="position: absolute;margin-top: 0px;margin-left: 60px; width: 200px;height: 90px;"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_CentralStorage_LightWeak.png?v=' + baseLayout.scriptVersion + '" /></div>');
            content.push('<div style="position: absolute;margin-top: 0px;margin-left: 60px; width: 200px;height: 90px;" class="blink"><img src="' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_CentralStorage_LightStrong.png?v=' + baseLayout.scriptVersion + '" /></div>');
        }

        // Upload rate
        content.push('<div style="position: absolute;margin-top: 370px;margin-left: 66px; width: 188px;height: 48px;text-align: center;color: #FFFFFF;">');
        content.push('Depot Upload Rate:<br />' + baseLayout.centralStorageSubSystem.getUploadRate() + ' per min');
        content.push('</div>');

        return '<div style="width: 320px;height: 470px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/TXUI_CentralStorage_BG.png?v=' + baseLayout.scriptVersion + ') no-repeat;margin: -7px;">' + content.join('') + '</div>';
    }
}
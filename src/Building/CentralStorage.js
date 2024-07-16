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

        content.push('<strong class="text-danger">Work in Progress</strong><br />');
        content.push('<br />');

        if(storageContent !== null)
        {
            let currentItem         = baseLayout.getItemDataFromClassName(storageContent.currentItem);
                content.push('<table class="mx-auto"><tr><td>' + baseLayout.getInventoryImage(currentItem, 96) + '</td></tr></table>');
                content.push('<br />');
        }

        content.push('Depot Upload Rate: ' + baseLayout.centralStorageSubSystem.getUploadRate() + ' per min');

        return '<div class="d-flex" style="border: 25px solid #7f7f7f;border-image: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/genericTooltipBackground.png?v=' + baseLayout.scriptVersion + ') 25 repeat;background: #7f7f7f;margin: -7px;' + BaseLayout_Tooltip.defaultTextStyle + '">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="margin: -10px 0;">\
                        ' + content.join('') + '\
                    </div>\
                </div>';
    }
}
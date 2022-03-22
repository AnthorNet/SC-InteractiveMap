/* global Intl */

import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Modal_Selection                          from '../Modal/Selection.js';

export default class SubSystem_Foliage
{
    static respawn(baseLayout)
    {
        let selection           = baseLayout.satisfactoryMap.leafletMap.selection._areaSelected;
        const objectsIterator   = baseLayout.saveGameParser.getObjectsIterator();
        let restoredFoliage     = 0;

            for(const object of objectsIterator)
            {
                if(object.className === '/Script/FactoryGame.FGFoliageRemoval')
                {
                    if(BaseLayout_Math.isPointInsideSelection(baseLayout, selection, object.transform.translation[0], object.transform.translation[1]) === true)
                    {
                        baseLayout.saveGameParser.deleteObject(object.pathName);
                    }
                    else
                    {
                        let mRemovedInstances = baseLayout.getObjectPropertyValue(object, 'mRemovedInstances');
                            if(mRemovedInstances !== null && mRemovedInstances.values.length > 0)
                            {
                                for(let i = (mRemovedInstances.values.length - 1); i >= 0; i--)
                                {
                                    for(let j = (mRemovedInstances.values[i].value.values.length - 1); j >= 0; j--)
                                    {
                                        if(mRemovedInstances.values[i].value.values[j][0].name === 'Transform')
                                        {
                                            let translationX    = null;
                                            let translationY    = null;
                                                for(let k = 0; k < mRemovedInstances.values[i].value.values[j][0].value.values.length; k++)
                                                {
                                                    if(mRemovedInstances.values[i].value.values[j][0].value.values[k].name === 'Translation')
                                                    {
                                                        translationX = mRemovedInstances.values[i].value.values[j][0].value.values[k].value.values.x;
                                                        translationY = mRemovedInstances.values[i].value.values[j][0].value.values[k].value.values.y;

                                                    }
                                                }

                                            if(translationX !== null && translationY !== null)
                                            {
                                                if(BaseLayout_Math.isPointInsideSelection(baseLayout, selection, translationX, translationY) === true)
                                                {
                                                    mRemovedInstances.values[i].value.values.splice(j, 1);
                                                    restoredFoliage++;
                                                }
                                            }
                                        }
                                    }

                                    if(mRemovedInstances.values[i].value.values.length === 0)
                                    {
                                        mRemovedInstances.values.splice(i, 1);
                                    }
                                }
                                if(mRemovedInstances.values.length === 0)
                                {
                                    baseLayout.saveGameParser.deleteObject(object.pathName);
                                }
                            }
                    }
                }
            }

        if(restoredFoliage > 0)
        {
            BaseLayout_Modal.notification({
                image   : baseLayout.itemsData.get('Desc_Leaves_C').image,
                title   : 'Respawn flora',
                message : new Intl.NumberFormat(baseLayout.language).format(restoredFoliage) + ' foliages were restored.'
            });
        }

        Modal_Selection.cancel(baseLayout);
    }
}
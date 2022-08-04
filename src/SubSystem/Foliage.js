/* global Intl */

import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Modal_Selection                          from '../Modal/Selection.js';

export default class SubSystem_Foliage
{
    static respawn(baseLayout)
    {
        let selection       = baseLayout.satisfactoryMap.leafletMap.selection._areaSelected;
        let objects         = baseLayout.saveGameParser.getObjects();
        let restoredFoliage = 0;

            for(let pathName in objects)
            {
                if(objects[pathName].className === '/Script/FactoryGame.FGFoliageRemoval')
                {
                    if(BaseLayout_Math.isPointInsideSelection(baseLayout, selection, objects[pathName].transform.translation[0], objects[pathName].transform.translation[1]) === true)
                    {
                        baseLayout.saveGameParser.deleteObject(pathName);
                        restoredFoliage++;
                    }
                    else
                    {
                        // UPDATE 6
                        let mRemovalLocations   = baseLayout.getObjectProperty(objects[pathName], 'mRemovalLocations');
                            if(mRemovalLocations !== null && mRemovalLocations.values.length > 0)
                            {
                                for(let i = (mRemovalLocations.values.length - 1); i >= 0; i--)
                                {
                                    if(BaseLayout_Math.isPointInsideSelection(baseLayout, selection, mRemovalLocations.values[i].x, mRemovalLocations.values[i].y) === true)
                                    {
                                        mRemovalLocations.values.splice(i, 1);
                                        restoredFoliage++;
                                    }

                                }
                            }

                        /*
                        let mByteRemovalIndices     = baseLayout.getObjectProperty(objects[pathName], 'mByteRemovalIndices');
                            if(mByteRemovalIndices !== null)
                            {
                                console.log('mByteRemovalIndices', mByteRemovalIndices)
                            }
                        let mShortRemovalIndices     = baseLayout.getObjectProperty(objects[pathName], 'mShortRemovalIndices');
                            if(mShortRemovalIndices !== null)
                            {
                                console.log('mShortRemovalIndices', mShortRemovalIndices)
                            }
                        let mLongRemovalIndices     = baseLayout.getObjectProperty(objects[pathName], 'mLongRemovalIndices');
                            if(mLongRemovalIndices !== null)
                            {
                                console.log('mLongRemovalIndices', mLongRemovalIndices)
                            }
                        */

                        // UPDATE 5
                        let mRemovedInstances = baseLayout.getObjectProperty(objects[pathName], 'mRemovedInstances');
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
                                    baseLayout.saveGameParser.deleteObject(pathName);
                                }
                            }
                    }
                }
            }

        if(restoredFoliage > 0)
        {
            BaseLayout_Modal.notification({
                image   : baseLayout.itemsData.Desc_Leaves_C.image,
                title   : 'Respawn flora',
                message : new Intl.NumberFormat(baseLayout.language).format(restoredFoliage) + ' foliages were restored.'
            });
        }

        Modal_Selection.cancel(baseLayout);
    }
}
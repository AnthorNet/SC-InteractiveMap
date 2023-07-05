/* global Intl */
import SubSystem                                from '../SubSystem.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Modal_Selection                          from '../Modal/Selection.js';

export default class SubSystem_Foliage extends SubSystem
{
    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.FoliageRemovalSubsystem';
        super(options);
    }

    respawn()
    {
        if(this.subSystem !== null)
        {
            let selection           = this.baseLayout.satisfactoryMap.leafletMap.selection._areaSelected;
            let restoredFoliage     = 0;
            let checkedProperties   = ['mSaveData', 'mUnresolvedSaveData'];

                for(let i = 0; i < checkedProperties.length; i++)
                {
                    let currentCheckedProperty = this.baseLayout.getObjectProperty(this.subSystem, checkedProperties[i]);
                        if(currentCheckedProperty !== null && currentCheckedProperty.values.length > 0)
                        {
                            //console.log(currentCheckedProperty);
                            for(let j = (currentCheckedProperty.values.length - 1); j >= 0; j--)
                            {
                                //console.log(currentCheckedProperty.values[j]);
                                for(let k = (currentCheckedProperty.values[j].valueMap.length - 1); k >= 0; k--)
                                {
                                    //console.log(currentCheckedProperty.values[j].valueMap[k])
                                    for(let l = (currentCheckedProperty.values[j].valueMap[k].value.values.length - 1); l >= 0; l--)
                                    {
                                        //console.log(currentCheckedProperty.values[j].valueMap[k].value.values[l])

                                        let RemovedLocationsIndex        = null;
                                        let RemovedLocationLookupIndex   = null;
                                        for(let m = (currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap.length - 1); m >= 0; m--)
                                        {
                                            if(currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[m].name === 'RemovedLocations')
                                            {
                                                RemovedLocationsIndex = m;
                                            }
                                            if(currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[m].name === 'RemovedLocationLookup')
                                            {
                                                RemovedLocationLookupIndex = m;
                                            }
                                        }

                                        if(RemovedLocationsIndex !== null)
                                        {
                                            //console.log(currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[RemovedLocationsIndex].value.values)
                                            for(let n = (currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[RemovedLocationsIndex].value.values.length - 1); n >= 0; n--)
                                            {
                                                //console.log(currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[RemovedLocationsIndex].value.values[n])

                                                let currentVector = currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[RemovedLocationsIndex].value.values[n];
                                                    if(BaseLayout_Math.isPointInsideSelection(this.baseLayout, selection, currentVector.x, currentVector.y) === true)
                                                    {
                                                        currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[RemovedLocationsIndex].value.values.splice(n, 1);

                                                        if(RemovedLocationLookupIndex !== null)
                                                        {
                                                            currentCheckedProperty.values[j].valueMap[k].value.values[l].valueMap[RemovedLocationLookupIndex].value.values.splice(n, 1);
                                                        }

                                                        restoredFoliage++;
                                                    }
                                            }

                                        }
                                    }
                                }
                            }

                        }
                }

            if(restoredFoliage > 0)
            {
                BaseLayout_Modal.notification({
                    image   : this.baseLayout.itemsData.Desc_Leaves_C.image,
                    title   : 'Respawn flora',
                    message : new Intl.NumberFormat(this.baseLayout.language).format(restoredFoliage) + ' foliages were restored.'
                });
            }

            Modal_Selection.cancel(this.baseLayout);
            return;
        }

        return this.respawnOld();
    }

    respawnOld()
    {
        let selection       = this.baseLayout.satisfactoryMap.leafletMap.selection._areaSelected;
        let objects         = this.baseLayout.saveGameParser.getObjects();
        let restoredFoliage = 0;

            for(let pathName in objects)
            {
                if(objects[pathName].className === '/Script/FactoryGame.FGFoliageRemoval')
                {
                    if(BaseLayout_Math.isPointInsideSelection(this.baseLayout, selection, objects[pathName].transform.translation[0], objects[pathName].transform.translation[1]) === true)
                    {
                        this.baseLayout.saveGameParser.deleteObject(pathName);
                        restoredFoliage++;
                    }
                    else
                    {
                        // UPDATE 6
                        let mRemovalLocations   = this.baseLayout.getObjectProperty(objects[pathName], 'mRemovalLocations');
                            if(mRemovalLocations !== null && mRemovalLocations.values.length > 0)
                            {
                                for(let i = (mRemovalLocations.values.length - 1); i >= 0; i--)
                                {
                                    if(BaseLayout_Math.isPointInsideSelection(this.baseLayout, selection, mRemovalLocations.values[i].x, mRemovalLocations.values[i].y) === true)
                                    {
                                        mRemovalLocations.values.splice(i, 1);
                                        restoredFoliage++;
                                    }

                                }
                            }

                        /*
                        let mByteRemovalIndices     = this.baseLayout.getObjectProperty(objects[pathName], 'mByteRemovalIndices');
                            if(mByteRemovalIndices !== null)
                            {
                                console.log('mByteRemovalIndices', mByteRemovalIndices)
                            }
                        let mShortRemovalIndices     = this.baseLayout.getObjectProperty(objects[pathName], 'mShortRemovalIndices');
                            if(mShortRemovalIndices !== null)
                            {
                                console.log('mShortRemovalIndices', mShortRemovalIndices)
                            }
                        let mLongRemovalIndices     = this.baseLayout.getObjectProperty(objects[pathName], 'mLongRemovalIndices');
                            if(mLongRemovalIndices !== null)
                            {
                                console.log('mLongRemovalIndices', mLongRemovalIndices)
                            }
                        */
                    }
                }
            }

        if(restoredFoliage > 0)
        {
            BaseLayout_Modal.notification({
                image   : this.baseLayout.itemsData.Desc_Leaves_C.image,
                title   : 'Respawn flora',
                message : new Intl.NumberFormat(this.baseLayout.language).format(restoredFoliage) + ' foliages were restored.'
            });
        }

        Modal_Selection.cancel(this.baseLayout);
    }
}
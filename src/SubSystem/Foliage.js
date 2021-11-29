import BaseLayout_Math                          from '../BaseLayout/Math.js';

import Modal_Selection                          from '../Modal/Selection.js';

export default class SubSystem_Foliage
{
    static getSelectionFoliage(baseLayout)
    {
        let selection   = baseLayout.satisfactoryMap.leafletMap.selection._areaSelected;
        let objects     = baseLayout.saveGameParser.getObjects();
        let foliage     = [];

            for(let pathName in objects)
            {
                if(objects[pathName].className === '/Script/FactoryGame.FGFoliageRemoval')
                {
                    if(BaseLayout_Math.isPointInsideSelection(baseLayout, selection, objects[pathName].transform.translation[0], objects[pathName].transform.translation[1]) === true)
                    {
                        foliage.push(objects[pathName]);
                    }
                }
            }

        Modal_Selection.cancel(baseLayout);

        return foliage;
    }

    static respawn(baseLayout)
    {
        let foliageObjects = SubSystem_Foliage.getSelectionFoliage(baseLayout);
            for(let i = 0; i < foliageObjects.length; i++)
            {
                this.setObjectProperty(foliageObjects[i], 'mRemovedInstances', {type: "RemovedInstanceArray", values: []}, 'StructProperty');
            }
    }

    static clear(baseLayout)
    {
        let foliageObjects = SubSystem_Foliage.getSelectionFoliage(baseLayout);
            for(let i = 0; i < foliageObjects.length; i++)
            {
                console.log(foliageObjects[i]);
                let mRemovedInstances = baseLayout.getObjectProperty(foliageObjects[i], 'mRemovedInstances');
                    if(mRemovedInstances !== null)
                    {
                        console.log(mRemovedInstances);
                    }
            }
    }
}
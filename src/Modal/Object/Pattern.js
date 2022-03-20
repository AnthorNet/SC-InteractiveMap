import BaseLayout_Modal                         from '../../BaseLayout/Modal.js';

export default class Modal_Object_Pattern
{
    static getHTML(marker)
    {
        let baseLayout              = marker.baseLayout;
        let currentObject           = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData            = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let currentPattern          = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject, 'PatternDesc');

        let availablePatterns       = [];
            availablePatterns.push({
                dataContent : '<img src="/img/gameUpdate5/IconDesc_PatternRemover_256.png" style="width: 64px;" class="py-2 mr-1" /> No pattern',
                value       : 'NULL',
                text        : 'No pattern'
            });
            if(baseLayout.detailedModels !== null)
            {
                for(const [pathName, model] of baseLayout.detailedModels)
                {
                    if(model !== undefined && model.patternImage !== undefined)
                    {
                        availablePatterns.push({
                            group       : model.patternGroup,
                            dataContent : '<img src="' + model.patternImage + '" style="width: 64px;" class="py-2 mr-1" /> ' + model.patternGroup + ' - ' + model.patternName,
                            value       : pathName,
                            text        : model.patternGroup + ' - ' + model.patternName
                        })
                    }
                }
            }


        BaseLayout_Modal.form({
            title       : 'Update "<strong>' + buildingData.name + '</strong>" pattern',
            container   : '#leafletMap',
            inputs      : [{
                name            : 'PatternDesc',
                inputHeight     : true,
                inputType       : 'selectPicker',
                inputOptions    : availablePatterns,
                value           : ((currentPattern !== null) ? currentPattern.value.pathName : '')
            }],
            callback    : function(values)
            {
                if(values !== null)
                {
                    let mCustomizationData      = baseLayout.buildableSubSystem.getObjectCustomizationData(currentObject);
                        if(mCustomizationData !== null)
                        {
                            // Delete
                            for(let i = (mCustomizationData.values.length - 1); i >= 0; i--)
                            {
                                if(mCustomizationData.values[i].name === 'PatternDesc')
                                {
                                    mCustomizationData.values.splice(i, 1);
                                }
                            }

                            // Push
                            if(values.PatternDesc !== 'NULL')
                            {
                                mCustomizationData.values.push({name: 'PatternDesc', type: 'ObjectProperty', value: {levelName: '', pathName: values.PatternDesc}});
                            }
                        }

                    // Redraw!
                    let result = baseLayout.parseObject(currentObject);
                        baseLayout.deleteMarkerFromElements(result.layer, marker.relatedTarget);
                        baseLayout.addElementToLayer(result.layer, result.marker);
                }
            }
        });
    }
}
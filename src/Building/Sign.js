/* global Sentry */

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Building_Sign
{
    static getBackgroundColor(baseLayout, currentObject)
    {
        let mBackgroundColor = baseLayout.getObjectProperty(currentObject, 'mBackgroundColor');
            if(mBackgroundColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mBackgroundColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mBackgroundColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mBackgroundColor.values.b) + ')';
            }

        return '#000000';
    }

    static getAuxilaryColor(baseLayout, currentObject)
    {
        let mAuxilaryColor = baseLayout.getObjectProperty(currentObject, 'mAuxilaryColor');
            if(mAuxilaryColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mAuxilaryColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mAuxilaryColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mAuxilaryColor.values.b) + ')';
            }

        return '#000000';
    }

    static getForegroundColor(baseLayout, currentObject)
    {
        let mForegroundColor = baseLayout.getObjectProperty(currentObject, 'mForegroundColor');
            if(mForegroundColor !== null)
            {
                return 'rgb(' + BaseLayout_Math.linearColorToRGB(mForegroundColor.values.r) + ', ' + BaseLayout_Math.linearColorToRGB(mForegroundColor.values.g) + ', ' + BaseLayout_Math.linearColorToRGB(mForegroundColor.values.b) + ')';
            }

        return '#FA9549';
    }

    static getIcon(baseLayout, currentObject)
    {
        let mPrefabIconElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabIconElementSaveData');
            if(mPrefabIconElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabIconElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabIconElementSaveData.values[i];
                    let elementName     = null;
                    let iconId          = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                elementName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'IconID')
                            {
                                iconId = currentValues[j].value;
                            }
                        }
                        
                        if(elementName !== null && iconId !== null && elementName === 'Icon')
                        {
                            return baseLayout.getIconSrcFromId(iconId);
                        }
                }
            }

        return baseLayout.getIconSrcFromId(194);
    }

    static getOtherIcon(baseLayout, currentObject)
    {
        let mPrefabIconElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabIconElementSaveData');
            if(mPrefabIconElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabIconElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabIconElementSaveData.values[i];
                    let elementName     = null;
                    let iconId          = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                elementName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'IconID')
                            {
                                iconId = currentValues[j].value;
                            }
                        }
                        
                        if(elementName !== null && iconId !== null && elementName === 'Other_Icon')
                        {
                            return baseLayout.getIconSrcFromId(iconId);
                        }
                }
            }

        return baseLayout.getIconSrcFromId(194);
    }

    static getLabel(baseLayout, currentObject)
    {
        let mPrefabTextElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabTextElementSaveData');
            if(mPrefabTextElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabTextElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabTextElementSaveData.values[i];
                    let elementName     = null;
                    let text            = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                elementName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'Text')
                            {
                                text = currentValues[j].value;
                            }
                        }
                        
                        if(elementName !== null && text !== null && elementName === 'Other_Text')
                        {
                            return text;
                        }
                }
            }

        return 'Shennanigans';
    }

    static getText(baseLayout, currentObject)
    {
        let mPrefabTextElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabTextElementSaveData');
            if(mPrefabTextElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabTextElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabTextElementSaveData.values[i];
                    let elementName     = null;
                    let text            = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                elementName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'Text')
                            {
                                text = currentValues[j].value;
                            }
                        }
                        
                        if(elementName !== null && text !== null && elementName === 'Name')
                        {
                            return text;
                        }
                }
            }

        return 'Shennanigans';
    }

    static getOtherText(baseLayout, currentObject)
    {
        let mPrefabTextElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabTextElementSaveData');
            if(mPrefabTextElementSaveData !== null)
            {
                for(let i = 0; i < mPrefabTextElementSaveData.values.length; i++)
                {
                    let currentValues   = mPrefabTextElementSaveData.values[i];
                    let elementName     = null;
                    let text            = null;
                        for(let j = 0; j < currentValues.length; j++)
                        {
                            if(currentValues[j].name === 'ElementName')
                            {
                                elementName = currentValues[j].value;
                            }
                            if(currentValues[j].name === 'Text')
                            {
                                text = currentValues[j].value;
                            }
                        }
                        
                        if(elementName !== null && text !== null && elementName === 'Other_0')
                        {
                            return text;
                        }
                }
            }
            
        return 'Other Text';
    }

    static getLayoutTemplate(baseLayout, currentObject)
    {
        let mActivePrefabLayout = baseLayout.getObjectProperty(currentObject, 'mActivePrefabLayout');
            if(mActivePrefabLayout !== null)
            {
                switch(mActivePrefabLayout.pathName)
                {
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_2.BPW_Sign2x1_2_C':                    
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <img src="{{ICON_SRC}}" style="width: 96px;" class="mr-3">'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 40px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    <tr>'
                             + '</table>';
                     
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_4.BPW_Sign2x1_4_C':                   
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <img src="{{ICON_SRC}}" style="width: 192px;" class="mr-3">'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 28px;"><strong>{{TEXT}}</strong></div>'
                             + '            <div style="font-size: 16px;"><strong>{{OTHER_TEXT}}</strong></div>'
                             + '        </td>'
                             + '    <tr>'
                             + '</table>';
                        
                    default:
                        if(typeof Sentry !== 'undefined')
                        {
                            Sentry.setContext('currentObject', currentObject);
                            Sentry.captureMessage('Missing sign layout: ' + mActivePrefabLayout.pathName);
                        }
                }
            }

        return '<div><strong>{{TEXT}}</strong></div>';
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject);
        let backgroundColor = Building_Sign.getBackgroundColor(baseLayout, currentObject);
        let foregroundColor = Building_Sign.getForegroundColor(baseLayout, currentObject);

            layoutTemplate  = layoutTemplate.replace('{{ICON_SRC}}', Building_Sign.getIcon(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{OTHER_ICON_SRC}}', Building_Sign.getOtherIcon(baseLayout, currentObject));
            
            layoutTemplate  = layoutTemplate.replace('{{LABEL}}', Building_Sign.getLabel(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{TEXT}}', Building_Sign.getText(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{OTHER_TEXT}}', Building_Sign.getOtherText(baseLayout, currentObject));

            layoutTemplate  = layoutTemplate.replace('{{BACKGROUND_COLOR}}', backgroundColor);
            layoutTemplate  = layoutTemplate.replace('{{FOREGROUND_COLOR}}', foregroundColor);


        return '<div class="d-flex" style="border-radius: 5px;background: #828382;margin: -7px;padding: 6px">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="border-radius: 5px;background: ' + backgroundColor + ';color: ' + foregroundColor + ';padding: 20px;">\
                        ' + layoutTemplate + '\
                    </div>\
                </div>';
    }
}
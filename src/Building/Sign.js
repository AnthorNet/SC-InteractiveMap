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
    
    static getPatternIcon(baseLayout, iconId)
    {
        switch(iconId)
        {
            case 332:
                return baseLayout.staticUrl + '/img/patternIcons/TXUI_MIcon_Arrow_Left.png';
        }
        
        return null;
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
                            let patternIcon = Building_Sign.getPatternIcon(baseLayout, iconId);
                                if(patternIcon !== null)
                                {
                                    return [patternIcon];
                                }
                            
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
                            let patternIcon = Building_Sign.getPatternIcon(baseLayout, iconId);
                                if(patternIcon !== null)
                                {
                                    return [patternIcon];
                                }
                            
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
                            return text.replace('\n', '<br />');
                        }
                }
            }

        return 'Shennanigans';
    }
    
    static getFilterShadow(size, shadowColor)
    {
        if(shadowColor !== null)
        {
            return 'filter: drop-shadow(' + size + 'px 0px ' + shadowColor + ');background-position: -100%;margin-left: -100%;';
        }
        
        return '';
    }
    
    static getImageTemplate(name, size, shadowColor = null)
    {
        return   '<div style="display: flex;align-items: center;justify-content: center;">'
               + '    <div style="width: ' + size + 'px;height: ' + size + 'px;overflow: hidden;">'
               + '        <span style="display: block;width: ' + size + 'px;height: 100%;background-size: contain;background-image: url(' + name + ');' + Building_Sign.getFilterShadow(size, shadowColor) + '"></span>'
               + '    </div>'
               + '</div>';
    }
    
    
   
    static getLayoutTemplate(baseLayout, currentObject, shadowColor = null, otherShadowColor = null)
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
                             + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 96, shadowColor) + '</div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 40px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                     
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_4.BPW_Sign2x1_4_C':                   
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 128, shadowColor) + '</div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 28px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                     
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_5.BPW_Sign2x1_5_C':                  
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 196, shadowColor)
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_6.BPW_Sign4x1_6_C':
                        return '<table style="width: 200px;height: 40px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 40, otherShadowColor) + '</div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 40px; height: 40px;" class="mr-3">'
                             + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, shadowColor)
                             + '            </div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                     
                    default:
                        console.log('Missing sign layout: ' + mActivePrefabLayout.pathName);
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
        let backgroundColor     = Building_Sign.getBackgroundColor(baseLayout, currentObject);
        let foregroundColor     = Building_Sign.getForegroundColor(baseLayout, currentObject);
        let shadowColor         = null;
        let otherShadowColor    = null;

        let iconSrc = Building_Sign.getIcon(baseLayout, currentObject);
            if(Array.isArray(iconSrc))
            {
                iconSrc             = iconSrc[0];
                shadowColor         = foregroundColor;
            }
        let otherIconSrc = Building_Sign.getOtherIcon(baseLayout, currentObject);
            if(Array.isArray(otherIconSrc))
            {
                otherIconSrc        = otherIconSrc[0];
                otherShadowColor    = foregroundColor;
            }
        
        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject, shadowColor, otherShadowColor);
            layoutTemplate  = layoutTemplate.replace('{{ICON_SRC}}', iconSrc);
            layoutTemplate  = layoutTemplate.replace('{{OTHER_ICON_SRC}}', otherIconSrc);
            
            layoutTemplate  = layoutTemplate.replace('{{LABEL}}', Building_Sign.getLabel(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{TEXT}}', Building_Sign.getText(baseLayout, currentObject));

            layoutTemplate  = layoutTemplate.replace('{{BACKGROUND_COLOR}}', backgroundColor);
            layoutTemplate  = layoutTemplate.replace('{{FOREGROUND_COLOR}}', foregroundColor);


        return '<div class="d-flex" style="border-radius: 5px;background: #828382;margin: -7px;padding: 6px">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="border-radius: 5px;background: ' + backgroundColor + ';color: ' + foregroundColor + ';padding: 10px;">\
                        ' + layoutTemplate + '\
                    </div>\
                </div>';
    }
    
    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let buildingData = baseLayout.getBuildingDataFromClassName(currentObject.className);

            contextMenu.push({
                text: 'Update "' + buildingData.name + '" status',
                callback: Building_Sign.updateStatus
            });
            contextMenu.push({separator: true});

        return contextMenu;
    }

    
}
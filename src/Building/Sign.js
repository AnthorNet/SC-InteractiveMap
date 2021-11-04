/* global Sentry */
import Modal                                    from '../Modal.js';

import BaseLayout_Math                          from '../BaseLayout/Math.js';

export default class Building_Sign
{
    static get getMonochromeIcons(){
        return {
            329: ['Arrow Down', '/img/patternIcons/TXUI_MIcon_Arrow_Down.png'],
            330: ['Arrow Down Left', '/img/patternIcons/TXUI_MIcon_Arrow_DownLeft.png'],
            331: ['Arrow Down Right', '/img/patternIcons/TXUI_MIcon_Arrow_DownRight.png'],
            332: ['Arrow Left', '/img/patternIcons/TXUI_MIcon_Arrow_Left.png'],
            333: ['Arrow Up Left', '/img/patternIcons/TXUI_MIcon_Arrow_UpLeft.png'],
            334: ['Arrow Up', '/img/patternIcons/TXUI_MIcon_Arrow_Up.png'],
            335: ['Arrow Up Right', '/img/patternIcons/TXUI_MIcon_Arrow_UpRight.png'],
            336: ['Arrow Right', '/img/patternIcons/TXUI_MIcon_Arrow_Right.png'],
            
            337: ['Drop', '/img/patternIcons/TXUI_MIcon_Drop.png'],
            338: ['Radiation', '/img/patternIcons/TXUI_MIcon_Radiation.png'],
            339: ['Thumb Up', '/img/patternIcons/TXUI_MIcon_ThumbUp.png'],
            340: ['Thumb Down', '/img/patternIcons/TXUI_MIcon_ThumbDown.png'],
            341: ['Stop X', '/img/patternIcons/TXUI_MIcon_Stop_X.png'],
            
            342: ['Road Arrow Down', '/img/patternIcons/TXUI_MIcon_RoadArrow_Down.png'],
            343: ['Road Arrow Turn Around', '/img/patternIcons/TXUI_MIcon_RoadArrow_TurnAround.png'],
            344: ['Road Arrow Turn Left', '/img/patternIcons/TXUI_MIcon_RoadArrow_TurnLeft.png'],
            345: ['Road Arrow Turn Right', '/img/patternIcons/TXUI_MIcon_RoadArrow_TurnRight.png'],
            346: ['Road Arrow Up', '/img/patternIcons/TXUI_MIcon_RoadArrow_Up.png'],
            
            347: ['Storage Crate', '/img/patternIcons/TXUI_MIcon_Crate.png'],
            348: ['Exit Door', '/img/patternIcons/TXUI_MIcon_Exit.png'],
            349: ['Factory', '/img/patternIcons/TXUI_MIcon_Factory.png'],
            350: ['Home House', '/img/patternIcons/TXUI_MIcon_Home.png'],
            351: ['Player Pioneer', '/img/patternIcons/TXUI_MIcon_Pioneer.png'],
            352: ['Power', '/img/patternIcons/TXUI_MIcon_Power.png'],
            
            353: ['Vehicle Tractor', '/img/patternIcons/TXUI_MIcon_Tractor.png'],
            354: ['Vehicle Explorer', '/img/patternIcons/TXUI_MIcon_Explorer.png'],
            355: ['Vehicle Truck', '/img/patternIcons/TXUI_MIcon_Truck.png'],
            356: ['Vehicle Train', '/img/patternIcons/TXUI_MIcon_Train.png'],
            357: ['Vehicle Factory Cart', '/img/patternIcons/TXUI_MIcon_FactoryCart.png'],
            358: ['Vehicle Drone', '/img/patternIcons/TXUI_MIcon_Drone.png'],
            
            362: ['Warning', '/img/patternIcons/TXUI_MIcon_Warning.png'],
            
            598: ['FICSIT Check Mark', '/img/patternIcons/ficsit_checkmark_64.png']
        };
    }
    
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
    
    static getMonochromeIcon(baseLayout, iconId)
    {
        if(Building_Sign.getMonochromeIcons[iconId] !== undefined)
        {
            return baseLayout.staticUrl + Building_Sign.getMonochromeIcons[iconId][1];
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
                            let patternIcon = Building_Sign.getMonochromeIcon(baseLayout, iconId);
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
                            let patternIcon = Building_Sign.getMonochromeIcon(baseLayout, iconId);
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
                        
                        if(elementName !== null && text !== null && elementName === 'Label')
                        {
                            return text.replace('\n', '<br />');
                        }
                }
            }

        return 'A';
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
    
    static getImageTemplate(name, size, shadowColor)
    {
        return   '<div style="display: flex;align-items: center;justify-content: center;">'
               + '    <div style="width: ' + size + 'px;height: ' + size + 'px;overflow: hidden;">'
               + '        <span style="display: block;width: ' + size + 'px;height: 100%;background-size: contain;background-image: url(\'' + name + '\');' + Building_Sign.getFilterShadow(size, shadowColor) + '"></span>'
               + '    </div>'
               + '</div>';
    }
    
    
   
    static getLayoutTemplate(baseLayout, currentObject, shadowColor, otherShadowColor)
    {
        let mActivePrefabLayout = baseLayout.getObjectProperty(currentObject, 'mActivePrefabLayout');
            if(mActivePrefabLayout !== null)
            {
                switch(mActivePrefabLayout.pathName)
                {
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_0.BPW_Sign1x1_0_C':
                        return '<table style="width: 200px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                             + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((shadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                             + '            </div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                     case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_1.BPW_Sign1x1_1_C':
                        return '<table style="width: 200px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 172, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign1x1_2.BPW_Sign1x1_2_C':                    
                        return '<table style="width: 200px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    
                    
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_2.BPW_Sign2x1_2_C':                    
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 96, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
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
                             + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 128, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
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
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 196, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_12.BPW_Sign2x1_12_C':
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td width="50%">'
                             + '            ' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 160, ((otherShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                             + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((shadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                             + '            </div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_13.BPW_Sign2x1_13_C':
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td width="50%">'
                             + '            ' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 160, ((otherShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    
                    
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_0.BPW_Sign2x3_0_C':
                        return '<table style="width: 200px;height: 300px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 200px; height: 200px;">'
                             + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 160, ((shadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                             + '            </div>'
                             + '        </td>'
                             + '    </tr>'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_1.BPW_Sign2x3_1_C':
                        return '<table style="width: 200px;height: 300px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 172, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x3_2.BPW_Sign2x3_2_C':
                        return '<table style="width: 200px;height: 300px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 200, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '    </tr>'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;">'
                             + '                <span style="display: inline-block;border-radius: 5px;background: {{FOREGROUND_COLOR}};color: {{BACKGROUND_COLOR}};font-size: 30px;padding: 5px;"><strong>{{LABEL}}</strong></span>'
                             + '            </div>'
                             + '        </td>'
                             + '    </tr>'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 30px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    
                    
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_1.BPW_Sign4x1_1_C':
                        return '<table style="width: 200px;height: 50px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_2.BPW_Sign4x1_2_C': // Same in game but left aligned...
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_3.BPW_Sign4x1_3_C':
                        return '<table style="width: 200px;height: 50px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, ((shadowColor === true) ? '{{FOREGROUND_COLOR}}' : null))
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_4.BPW_Sign4x1_4_C':
                        return '<table style="width: 200px;height: 50px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;">'
                             + '                <span style="display: inline-block;border-radius: 5px;background: {{FOREGROUND_COLOR}};color: {{BACKGROUND_COLOR}};font-size: 20px;padding: 5px;"><strong>{{LABEL}}</strong></span>'
                             + '            </div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_5.BPW_Sign4x1_5_C':
                        return '<table style="width: 200px;height: 50px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 40px; height: 40px;" class="mr-3">'
                             + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, ((shadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
                             + '            </div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 20px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    </tr>'
                             + '</table>';
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign4x1_6.BPW_Sign4x1_6_C':
                        return '<table style="width: 200px;height: 50px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <div class="mr-3">' + Building_Sign.getImageTemplate('{{OTHER_ICON_SRC}}', 36, ((otherShadowColor === true) ? '{{FOREGROUND_COLOR}}' : null)) + '</div>'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="display: flex;align-items: center;justify-content: center;border-radius: 5px;background: {{FOREGROUND_COLOR}};width: 40px; height: 40px;" class="mr-3">'
                             + '                ' + Building_Sign.getImageTemplate('{{ICON_SRC}}', 32, ((shadowColor === true) ? '{{BACKGROUND_COLOR}}' : null))
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
        let shadowColor         = false;
        let otherShadowColor    = false;

        let iconSrc = Building_Sign.getIcon(baseLayout, currentObject);
            if(Array.isArray(iconSrc))
            {
                iconSrc             = iconSrc[0];
                shadowColor         = true;
            }
        let otherIconSrc = Building_Sign.getOtherIcon(baseLayout, currentObject);
            if(Array.isArray(otherIconSrc))
            {
                otherIconSrc        = otherIconSrc[0];
                otherShadowColor    = true;
            }
        
        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject, shadowColor, otherShadowColor);
            layoutTemplate  = layoutTemplate.replace('{{ICON_SRC}}', iconSrc);
            layoutTemplate  = layoutTemplate.replace('{{OTHER_ICON_SRC}}', otherIconSrc);
            
            layoutTemplate  = layoutTemplate.replace('{{LABEL}}', Building_Sign.getLabel(baseLayout, currentObject));
            layoutTemplate  = layoutTemplate.replace('{{TEXT}}', Building_Sign.getText(baseLayout, currentObject));

            layoutTemplate  = layoutTemplate.replace(/{{BACKGROUND_COLOR}}/g, backgroundColor);
            layoutTemplate  = layoutTemplate.replace(/{{FOREGROUND_COLOR}}/g, foregroundColor);


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
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let layoutTemplate  = Building_Sign.getLayoutTemplate(baseLayout, currentObject);

            if(layoutTemplate.includes('{{TEXT}}'))
            {
                contextMenu.push({
                    text: 'Update "' + buildingData.name + '" text',
                    callback: Building_Sign.updateText
                });
            }
            if(layoutTemplate.includes('{{LABEL}}'))
            {
                contextMenu.push({
                    text: 'Update "' + buildingData.name + '" label',
                    callback: Building_Sign.updateLabel
                });
            }
            
            contextMenu.push({separator: true});

        return contextMenu;
    }

    /**
     * MODALS
     */
    static updateText(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.satisfactoryMap.pauseMap();
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : Building_Sign.getText(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    this.satisfactoryMap.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }

                    let mPrefabTextElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabTextElementSaveData');
                        if(mPrefabTextElementSaveData !== null)
                        {
                            for(let i = 0; i < mPrefabTextElementSaveData.values.length; i++)
                            {
                                let currentValues   = mPrefabTextElementSaveData.values[i];
                                let elementName     = null;
                                let text            = null;
                                let textKey         = 0;
                                    for(let j = 0; j < currentValues.length; j++)
                                    {
                                        if(currentValues[j].name === 'ElementName')
                                        {
                                            elementName = currentValues[j].value;
                                        }
                                        if(currentValues[j].name === 'Text')
                                        {
                                            text    = currentValues[j].value;
                                            textKey = j;
                                        }
                                    }

                                    if(elementName !== null && text !== null && elementName === 'Name')
                                    {
                                        mPrefabTextElementSaveData.values[i][textKey].value = values.mPrefabTextElementSaveData;
                                        return;
                                    }
                            }
                        }
                }.bind(baseLayout)
            });
    }
    
    static updateLabel(marker)
    {
        let baseLayout      = marker.baseLayout;
            baseLayout.satisfactoryMap.pauseMap();
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData    = baseLayout.getBuildingDataFromClassName(currentObject.className);

            Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" text',
                container   : '#leafletMap',
                inputs      : [{
                    name        : 'mPrefabTextElementSaveData',
                    inputType   : 'textArea',
                    value       : Building_Sign.getLabel(baseLayout, currentObject)
                }],
                callback    : function(values)
                {
                    this.satisfactoryMap.unpauseMap();

                    if(values === null)
                    {
                        return;
                    }

                    let mPrefabTextElementSaveData = baseLayout.getObjectProperty(currentObject, 'mPrefabTextElementSaveData');
                        if(mPrefabTextElementSaveData !== null)
                        {
                            for(let i = 0; i < mPrefabTextElementSaveData.values.length; i++)
                            {
                                let currentValues   = mPrefabTextElementSaveData.values[i];
                                let elementName     = null;
                                let text            = null;
                                let textKey         = 0;
                                    for(let j = 0; j < currentValues.length; j++)
                                    {
                                        if(currentValues[j].name === 'ElementName')
                                        {
                                            elementName = currentValues[j].value;
                                        }
                                        if(currentValues[j].name === 'Text')
                                        {
                                            text    = currentValues[j].value;
                                            textKey = j;
                                        }
                                    }

                                    if(elementName !== null && text !== null && elementName === 'Label')
                                    {
                                        mPrefabTextElementSaveData.values[i][textKey].value = values.mPrefabTextElementSaveData;
                                        return;
                                    }
                            }
                        }
                }.bind(baseLayout)
            });
    }
}
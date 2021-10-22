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
                            return text.replace('\n', '<br />');
                        }
                }
            }

        return 'Shennanigans';
    }

    /*
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
    */
   
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
                             + '            <img src="{{ICON_SRC}}" style="width: 128px;" class="mr-3">'
                             + '        </td>'
                             + '        <td>'
                             + '            <div style="font-size: 28px;"><strong>{{TEXT}}</strong></div>'
                             + '        </td>'
                             + '    <tr>'
                             + '</table>';
                     
                    case '/Game/FactoryGame/Interface/UI/InGame/Signs/SignLayouts/BPW_Sign2x1_5.BPW_Sign2x1_5_C':                  
                        return '<table style="width: 400px;height: 200px;">'
                             + '    <tr>'
                             + '        <td>'
                             + '            <img src="{{ICON_SRC}}" style="width: 196px;">'
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
            //layoutTemplate  = layoutTemplate.replace('{{OTHER_TEXT}}', Building_Sign.getOtherText(baseLayout, currentObject));

            layoutTemplate  = layoutTemplate.replace('{{BACKGROUND_COLOR}}', backgroundColor);
            layoutTemplate  = layoutTemplate.replace('{{FOREGROUND_COLOR}}', foregroundColor);


        return '<div class="d-flex" style="border-radius: 5px;background: #828382;margin: -7px;padding: 6px">\
                    <div class="justify-content-center align-self-center w-100 text-center" style="border-radius: 5px;background: ' + backgroundColor + ';color: ' + foregroundColor + ';padding: 20px;">\
                        ' + layoutTemplate + '\
                    </div>\
                </div>';
    }
}


/*
 * $icon-width: 60px;
$icon-height: 60px;

.icon {
  width: $icon-width;
  height: $icon-height;
  overflow: hidden;
}

.icon > span {
  filter: drop-shadow($icon-width 0px blue);
  background-position: -100% 0;
  margin-left: -100%;
  display: block;
  width: $icon-width; // +1px for chrome bug??
  height: 100%;
  background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgOTAgOTAiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDkwIDkwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTYxLjUxMSwyNi4xNWMtMC43MTQtMS43MzgtMS43MjMtMy4yOTgtMy4wMjYtNC42NzkgICBjLTEuMzAzLTEuMzY2LTIuODA5LTIuNDUyLTQuNTE1LTMuMjU5Yy0xLjc1NC0wLjgyMi0zLjYwMS0xLjI4OC01LjU0LTEuMzk2Yy0wLjI4LTAuMDMxLTAuNTUyLTAuMDQ3LTAuODE0LTAuMDQ3ICAgYy0wLjAxOCwwLTAuMDMxLDAtMC4wNDcsMGMtMC4zMjcsMC4wMTYtMC41NzQsMC4wMjMtMC43NDUsMC4wMjNjLTEuOTcxLDAuMTA4LTMuODQxLDAuNTc0LTUuNjA5LDEuMzk3ICAgYy0xLjcwOCwwLjgwNy0zLjIxMiwxLjg5My00LjUxNywzLjI1OWMtMS4zMTgsMS4zODEtMi4zMjcsMi45NDgtMy4wMjYsNC43MDJ2LTAuMDIzYy0wLjc0NCwxLjgxNS0xLjExOCwzLjcxNi0xLjExOCw1LjcwMiAgIGMtMC4wMTUsMi4wNjQsMC41MzcsNC4xODIsMS42NTQsNi4zNTVjMC41NzQsMS4xMzMsMS4yOTUsMi4yNSwyLjE2NCwzLjM1MmMwLjQ4MiwwLjYwNSwxLjAwMiwxLjIxLDEuNTYsMS44MTYgICBjMC4wMzEsMC4wMTYsMC4wNTUsMC4wMzksMC4wNzEsMC4wN2MwLjUyNywwLjQ5NiwwLjg5MiwwLjk3OCwxLjA5MywxLjQ0M2MwLjEwOCwwLjIzMywwLjE3OSwwLjUyLDAuMjEsMC44NjIgICBjMC4wNDYsMC4zNzEsMC4wNjksMC44MjIsMC4wNjksMS4zNXYxLjA0OGMwLDAuNjIsMC4xMTcsMS4yMTgsMC4zNDksMS43OTJjMC4yMzQsMC41NDMsMC41NiwxLjAyNCwwLjk3OCwxLjQ0M2gwLjAyNSAgIGMwLjQxOCwwLjQxOSwwLjg5MiwwLjc0NSwxLjQyLDAuOTc3aDAuMDIzYzAuNTU4LDAuMjQ5LDEuMTQ4LDAuMzczLDEuNzY5LDAuMzczaDcuMjg3YzAuNjIsMCwxLjIwOS0wLjEyNCwxLjc2OS0wLjM3MyAgIGMwLjU0My0wLjIzMSwxLjAyMy0wLjU1OCwxLjQ0My0wLjk3N2MwLjQxOC0wLjQxOSwwLjc0My0wLjksMC45NzgtMS40NDNjMC4yNDgtMC41NzQsMC4zNzEtMS4xNzIsMC4zNzEtMS43OTJ2LTEuMDQ4ICAgYzAtMC41MjcsMC4wMjMtMC45NzksMC4wNzEtMS4zNWMwLjAyOS0wLjM0MiwwLjA5Mi0wLjYzNywwLjE4Ni0wLjg4NWMwLjEwOC0wLjIzMywwLjI2NC0wLjQ3MywwLjQ2Ni0wLjcyMnYtMC4wMjMgICBjMC4xODctMC4yMzMsMC40MDMtMC40NjYsMC42NTEtMC42OTljMC4wMTYtMC4wMTYsMC4wMzEtMC4wMywwLjA0Ny0wLjA0NmMwLjU3NC0wLjYwNSwxLjEwMy0xLjIxLDEuNTgzLTEuODE2ICAgYzAuODY4LTEuMTAyLDEuNTkxLTIuMjE5LDIuMTY1LTMuMzUyYzEuMTE3LTIuMTczLDEuNjY3LTQuMjkxLDEuNjUyLTYuMzU1QzYyLjYwNSwyOS44NTksNjIuMjQsMjcuOTY2LDYxLjUxMSwyNi4xNXogICAgTTgxLjc4NSw0My4xNDJjMCw2Ljg3NS0xLjc1MywxMy4wMi01LjI2MSwxOC40MzZjLTEuMzgxLDIuMTQxLTMuMDMyLDQuMTY3LTQuOTU4LDYuMDc1Yy02Ljc1LDYuNzk3LTE0LjkxMywxMC4xOTUtMjQuNDg2LDEwLjE5NSAgIGMtNi40NTcsMC0xMi4yOTItMS41NDQtMTcuNTA1LTQuNjMyYy0wLjI0OSwwLjI5NS0wLjU2LDAuNTI3LTAuOTMyLDAuNjk4bC0xNi4xMzEsNy42NThjLTAuNTEyLDAuMjMzLTEuMDQ3LDAuMzAzLTEuNjA2LDAuMjEgICBjLTAuNTU5LTAuMDk0LTEuMDQtMC4zNDItMS40NDMtMC43NDVjLTAuNDA0LTAuNDAzLTAuNjUyLTAuODg2LTAuNzQ2LTEuNDQzYy0wLjA5My0wLjU2LTAuMDIzLTEuMDk0LDAuMjEtMS42MDVsNy42NTgtMTYuMjcxICAgYzAuMTQtMC4zMTEsMC4zMzQtMC41NzQsMC41ODMtMC43OTJjLTMuMTk3LTUuMjYxLTQuNzk2LTExLjE4OC00Ljc5Ni0xNy43ODRjMC05LjYyMSwzLjM3Ni0xNy44MDcsMTAuMTI1LTI0LjU1OCAgIGMwLjUyOC0wLjUyNywxLjA3MS0xLjA0LDEuNjMtMS41MzZjMi4yMDQtMS45NTYsNC41MzktMy41Nyw3LjAwNi00Ljg0MkMzNS45NDUsOS42OTIsNDEuMjYsOC40MzYsNDcuMDgsOC40MzYgICBjOS41NzMsMCwxNy43MzYsMy4zODIsMjQuNDg2LDEwLjE0OGM2LjQyNiw2LjM3OCw5LjgyNCwxNC4wMjksMTAuMTk1LDIyLjk1MkM4MS43NzgsNDIuMDYzLDgxLjc4NSw0Mi41OTksODEuNzg1LDQzLjE0MnogICAgTTUxLjM4NiwyNS4yNjZjLTAuNzE0LTAuMzI2LTEuNDU5LTAuNTEzLTIuMjM1LTAuNTU5Yy0wLjQ4LTAuMDMxLTAuODc2LTAuMjI1LTEuMTg4LTAuNTgzYy0wLjMxMS0wLjM0LTAuNDU3LTAuNzUyLTAuNDQxLTEuMjMzICAgYzAuMDMxLTAuNDY2LDAuMjI1LTAuODU0LDAuNTgyLTEuMTY1YzAuMzU3LTAuMzEsMC43NjktMC40NTcsMS4yMzQtMC40NDFjMS4yMjYsMC4wNzcsMi4zOTcsMC4zOCwzLjUxNSwwLjkwNyAgIGMxLjA2OSwwLjQ5NywyLjAxOCwxLjE3OSwyLjg0LDIuMDQ5YzAuODA3LDAuODY5LDEuNDM1LDEuODU0LDEuODg0LDIuOTU2YzAuNDY2LDEuMTMzLDAuNjk5LDIuMzIsMC42OTksMy41NjIgICBjMCwwLjQ2NS0wLjE3MSwwLjg2OS0wLjUxMiwxLjIxYy0wLjMyNSwwLjMyNi0wLjcyMiwwLjQ4OS0xLjE4OCwwLjQ4OWMtMC40OCwwLTAuODg0LTAuMTYzLTEuMjEtMC40ODkgICBjLTAuMzQyLTAuMzQxLTAuNTEzLTAuNzQ2LTAuNTEzLTEuMjFjMC0wLjc5Mi0wLjE0Ni0xLjU1Mi0wLjQ0MS0yLjI4MWMtMC4yNzktMC42OTktMC42ODMtMS4zMjctMS4yMTEtMS44ODYgICBTNTIuMDY3LDI1LjU5MSw1MS4zODYsMjUuMjY2eiBNNTcuNzg3LDM1LjM2OGMwLDAuNTEyLTAuMTg4LDAuOTU0LTAuNTYsMS4zMjZjLTAuMzU2LDAuMzU3LTAuOCwwLjUzNi0xLjMyNiwwLjUzNiAgIGMtMC41MTIsMC0wLjk0Ni0wLjE3OS0xLjMwMy0wLjUzNmMtMC4zNzQtMC4zNzItMC41Ni0wLjgxNC0wLjU2LTEuMzI2YzAtMC41MTMsMC4xODYtMC45NTYsMC41Ni0xLjMyNyAgIGMwLjM1Ni0wLjM1NywwLjc5MS0wLjUzNiwxLjMwMy0wLjUzNmMwLjUyNiwwLDAuOTcsMC4xNzgsMS4zMjYsMC41MzZDNTcuNiwzNC40MTMsNTcuNzg3LDM0Ljg1NSw1Ny43ODcsMzUuMzY4eiBNNTEuODk3LDU0LjcxMSAgIEg0My40Yy0wLjcxMiwwLTEuMzE4LDAuMjU2LTEuODE1LDAuNzY5Yy0wLjUxMiwwLjQ5Ny0wLjc2OSwxLjA5NC0wLjc2OSwxLjc5MmMwLDAuNzE0LDAuMjQ5LDEuMzE5LDAuNzQ2LDEuODE1bDAuMDIzLDAuMDI0ICAgYzAuNDk3LDAuNDk2LDEuMTAzLDAuNzQ0LDEuODE1LDAuNzQ0aDguNDk3YzAuNzE1LDAsMS4zMTgtMC4yNDgsMS44MTUtMC43NDRjMC40OTctMC41MTMsMC43NDUtMS4xMjYsMC43NDUtMS44NCAgIGMwLTAuNjk4LTAuMjQ4LTEuMjk1LTAuNzQ1LTEuNzkydi0wLjAyM0M1My4yMDEsNTQuOTU5LDUyLjU5Niw1NC43MTEsNTEuODk3LDU0LjcxMXogTTQyLjcyNiw2Mi40MzhoLTAuMDIzICAgYy0wLjQ5NywwLjQ5Ny0wLjc0NSwxLjEwMy0wLjc0NSwxLjgxNnMwLjI1NywxLjMxOCwwLjc2OSwxLjgxNWMwLjQ5NywwLjQ5NywxLjEwMiwwLjc0NSwxLjgxNiwwLjc0NWg2LjEyMiAgIGMwLjY5NywwLDEuMjk1LTAuMjQ4LDEuNzkyLTAuNzQ1aDAuMDIyYzAuNDk3LTAuNDk3LDAuNzQ2LTEuMTAyLDAuNzQ2LTEuODE1cy0wLjI0OS0xLjMxOS0wLjc0Ni0xLjgxNiAgIGMtMC41MTItMC41MTItMS4xMTctMC43NjgtMS44MTQtMC43NjhoLTYuMTIyQzQzLjgyOCw2MS42NzEsNDMuMjIzLDYxLjkyNyw0Mi43MjYsNjIuNDM4eiIvPjwvZz48L3N2Zz4=);
}

 */

/*
class Color {
  constructor(r, g, b) {
    this.set(r, g, b);
  }
  
  toString() {
    return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
  }

  set(r, g, b) {
    this.r = this.clamp(r);
    this.g = this.clamp(g);
    this.b = this.clamp(b);
  }

  hueRotate(angle = 0) {
    angle = angle / 180 * Math.PI;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    this.multiply([
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.140,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072,
    ]);
  }

  grayscale(value = 1) {
    this.multiply([
      0.2126 + 0.7874 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 + 0.2848 * (1 - value),
      0.0722 - 0.0722 * (1 - value),
      0.2126 - 0.2126 * (1 - value),
      0.7152 - 0.7152 * (1 - value),
      0.0722 + 0.9278 * (1 - value),
    ]);
  }

  sepia(value = 1) {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }

  saturate(value = 1) {
    this.multiply([
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
    ]);
  }

  multiply(matrix) {
    const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
    const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
    const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
    this.r = newR;
    this.g = newG;
    this.b = newB;
  }

  brightness(value = 1) {
    this.linear(value);
  }
  contrast(value = 1) {
    this.linear(value, -(0.5 * value) + 0.5);
  }

  linear(slope = 1, intercept = 0) {
    this.r = this.clamp(this.r * slope + intercept * 255);
    this.g = this.clamp(this.g * slope + intercept * 255);
    this.b = this.clamp(this.b * slope + intercept * 255);
  }

  invert(value = 1) {
    this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
    this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
    this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
  }

  hsl() {
    // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;

        case g:
          h = (b - r) / d + 2;
          break;

        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: h * 100,
      s: s * 100,
      l: l * 100,
    };
  }

  clamp(value) {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }
    return value;
  }
}

class Solver {
  constructor(target, baseColor) {
    this.target = target;
    this.targetHSL = target.hsl();
    this.reusedColor = new Color(0, 0, 0);
  }

  solve() {
    const result = this.solveNarrow(this.solveWide());
    return {
      values: result.values,
      loss: result.loss,
      filter: this.css(result.values),
    };
  }

  solveWide() {
    const A = 5;
    const c = 15;
    const a = [60, 180, 18000, 600, 1.2, 1.2];

    let best = { loss: Infinity };
    for (let i = 0; best.loss > 25 && i < 3; i++) {
      const initial = [50, 20, 3750, 50, 100, 100];
      const result = this.spsa(A, a, c, initial, 1000);
      if (result.loss < best.loss) {
        best = result;
      }
    }
    return best;
  }

  solveNarrow(wide) {
    const A = wide.loss;
    const c = 2;
    const A1 = A + 1;
    const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
    return this.spsa(A, a, c, wide.values, 500);
  }

  spsa(A, a, c, values, iters) {
    const alpha = 1;
    const gamma = 0.16666666666666666;

    let best = null;
    let bestLoss = Infinity;
    const deltas = new Array(6);
    const highArgs = new Array(6);
    const lowArgs = new Array(6);

    for (let k = 0; k < iters; k++) {
      const ck = c / Math.pow(k + 1, gamma);
      for (let i = 0; i < 6; i++) {
        deltas[i] = Math.random() > 0.5 ? 1 : -1;
        highArgs[i] = values[i] + ck * deltas[i];
        lowArgs[i] = values[i] - ck * deltas[i];
      }

      const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
      for (let i = 0; i < 6; i++) {
        const g = lossDiff / (2 * ck) * deltas[i];
        const ak = a[i] / Math.pow(A + k + 1, alpha);
        values[i] = fix(values[i] - ak * g, i);
      }

      const loss = this.loss(values);
      if (loss < bestLoss) {
        best = values.slice(0);
        bestLoss = loss;
      }
    }
    return { values: best, loss: bestLoss };

    function fix(value, idx) {
      let max = 100;
      if (idx === 2) { // saturate
        max = 7500;
      } else if (
           idx === 4 // brightness
        || idx === 5 // contrast
      ) {
        max = 200;
      }

      if (idx === 3) { // hue-rotate
        if (value > max) {
          value %= max;
        } else if (value < 0) {
          value = max + value % max;
        }
      } else if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }
      return value;
    }
  }

  loss(filters) {
    // Argument is array of percentages.
    const color = this.reusedColor;
    color.set(0, 0, 0);

    color.invert(filters[0] / 100);
    color.sepia(filters[1] / 100);
    color.saturate(filters[2] / 100);
    color.hueRotate(filters[3] * 3.6);
    color.brightness(filters[4] / 100);
    color.contrast(filters[5] / 100);

    const colorHSL = color.hsl();
    return (
      Math.abs(color.r - this.target.r) +
      Math.abs(color.g - this.target.g) +
      Math.abs(color.b - this.target.b) +
      Math.abs(colorHSL.h - this.targetHSL.h) +
      Math.abs(colorHSL.s - this.targetHSL.s) +
      Math.abs(colorHSL.l - this.targetHSL.l)
    );
  }

  css(filters) {
    function fmt(idx, multiplier = 1) {
      return Math.round(filters[idx] * multiplier);
    }
    return `filter: invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%);`;
  }
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ]
    : null;
}

$(document).ready(() => {
  $('button.execute').click(() => {
    const rgb = hexToRgb($('input.target').val());
    if (rgb.length !== 3) {
      alert('Invalid format!');
      return;
    }

    const color = new Color(rgb[0], rgb[1], rgb[2]);
    const solver = new Solver(color);
    const result = solver.solve();

    let lossMsg;
    if (result.loss < 1) {
      lossMsg = 'This is a perfect result.';
    } else if (result.loss < 5) {
      lossMsg = 'The is close enough.';
    } else if (result.loss < 15) {
      lossMsg = 'The color is somewhat off. Consider running it again.';
    } else {
      lossMsg = 'The color is extremely off. Run it again!';
    }

    $('.realPixel').css('background-color', color.toString());
    $('.filterPixel').attr('style', result.filter);
    $('.filterDetail').text(result.filter);
    $('.lossDetail').html(`Loss: ${result.loss.toFixed(1)}. <b>${lossMsg}</b>`);
  });
});
*/
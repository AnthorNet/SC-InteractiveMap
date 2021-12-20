/* global gtag */
import Modal_Selection from '../Modal/Selection.js';

export default class Selection_RoundTranslation
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;
        this.markers                = options.markers;

        this.step                   = Number.parseFloat(options.step);
        this.offset                 = Number.parseFloat(options.offset);
        this.roundX                 = Boolean(options.roundX);
        this.roundY                 = Boolean(options.roundY);
        this.roundZ                 = Boolean(options.roundZ);

        this.selectionBoundaries    = (options.selectionBoundaries !== undefined) ? options.selectionBoundaries : null;
        this.useHistory             = false;

        if(typeof gtag === 'function')
        {
            gtag('event', 'RoundTranslation', {event_category: 'Selection'});
        }

        this.round();
    }

    round()
    {
        if (
            this.markers &&
            Number.isFinite(this.offset) &&
            Number.isFinite(this.step) &&
            (this.roundX || this.roundY || this.roundZ))
        {
            console.time('roundTranslationMultipleMarkers');
            let wires           = [];

            for(let i = 0; i < this.markers.length; i++)
            {
                if(this.markers[i].options.pathName !== undefined)
                {
                    let currentObject = this.baseLayout.saveGameParser.getTargetObject(this.markers[i].options.pathName);

                    if(currentObject !== null)
                    {
                        switch(currentObject.className)
                        {
                            case '/Game/FactoryGame/Character/Player/BP_PlayerState.BP_PlayerState_C':
                                // Find target
                                let mOwnedPawn = this.baseLayout.getObjectProperty(currentObject, 'mOwnedPawn');
                                    if(mOwnedPawn !== null)
                                    {
                                        let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mOwnedPawn.pathName);
                                        if(currentObjectTarget !== null)
                                        {
                                            this.roundTranslation(currentObjectTarget.transform.translation);
                                        }
                                    }
                                break;
                            case '/Game/FactoryGame/Buildable/Factory/TradingPost/Build_TradingPost.Build_TradingPost_C':
                                // HUB should also move hidden objects
                                let mHubTerminal = this.baseLayout.getObjectProperty(currentObject, 'mHubTerminal');
                                    if(mHubTerminal !== null)
                                    {
                                        let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mHubTerminal.pathName);
                                        if(currentObjectTarget !== null)
                                        {
                                            this.roundTranslation(currentObjectTarget.transform.translation);
                                        }
                                    }
                                let mWorkBench = this.baseLayout.getObjectProperty(currentObject, 'mWorkBench');
                                    if(mWorkBench !== null)
                                    {
                                        let currentObjectTarget = this.baseLayout.saveGameParser.getTargetObject(mWorkBench.pathName);
                                        if(currentObjectTarget !== null)
                                        {
                                            this.roundTranslation(currentObjectTarget.transform.translation);
                                        }
                                    }
                            default:
                                this.roundTranslation(currentObject.transform.translation);
                                break;
                        }

                        if(currentObject.children !== undefined)
                        {
                            for(let j = 0; j < currentObject.children.length; j++)
                            {
                                let currentObjectChildren = this.baseLayout.saveGameParser.getTargetObject(currentObject.children[j].pathName);
                                    if(currentObjectChildren !== null)
                                    {
                                        // Grab wires for redraw...
                                        for(let k = 0; k < this.baseLayout.availablePowerConnection.length; k++)
                                        {
                                            if(currentObjectChildren.pathName.endsWith(this.baseLayout.availablePowerConnection[k]))
                                            {
                                                for(let m = 0; m < currentObjectChildren.properties.length; m++)
                                                {
                                                    if(currentObjectChildren.properties[m].name === 'mWires')
                                                    {
                                                        for(let n = 0; n < currentObjectChildren.properties[m].value.values.length; n++)
                                                        {
                                                            if(wires.includes(currentObjectChildren.properties[m].value.values[n].pathName) === false)
                                                            {
                                                                wires.push(currentObjectChildren.properties[m].value.values[n].pathName);
                                                            }
                                                        }

                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                            }
                        }

                        // Delete and add again!
                        let result = this.baseLayout.parseObject(currentObject);
                        this.baseLayout.deleteMarkerFromElements(result.layer, this.markers[i], true);
                        this.baseLayout.addElementToLayer(result.layer, result.marker);
                    }
                }
            }

            for(let i = 0; i < wires.length; i++)
            {
                let currentObject   = this.baseLayout.saveGameParser.getTargetObject(wires[i]);
                let result          = this.baseLayout.parseObject(currentObject);
                let oldMarker       = this.baseLayout.getMarkerFromPathName(currentObject.pathName, result.layer);
                this.baseLayout.deleteMarkerFromElements(result.layer, oldMarker, true);
                this.baseLayout.addElementToLayer(result.layer, result.marker);
            }

            console.timeEnd('roundTranslationMultipleMarkers');
            this.baseLayout.updateRadioactivityLayer();
        }

        Modal_Selection.cancel(this.baseLayout);
    }

    roundTranslation(translation) {
        if (this.roundX) {
            translation[0] = Math.round(translation[0] / this.step) * this.step - (Math.sign(translation[0]) * this.offset);
        }
        if (this.roundY) {
            translation[1] = Math.round(translation[1] / this.step) * this.step - (Math.sign(translation[1]) * this.offset);
        }
        if (this.roundZ) {
            translation[2] = Math.round(translation[2] / this.step) * this.step - (Math.sign(translation[2]) * this.offset);
        }
    }
}
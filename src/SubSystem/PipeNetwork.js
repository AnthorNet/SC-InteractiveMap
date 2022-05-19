import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

import Building_Pipeline                        from '../Building/Pipeline.js';

export default class SubSystem_PipeNetwork
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
        this.networks       = {};
    }

    add(currentObject)
    {
        let mPipeNetworkID = this.baseLayout.getObjectProperty(currentObject, 'mPipeNetworkID');
            if(mPipeNetworkID !== null)
            {
                this.networks[mPipeNetworkID] = currentObject.pathName;
                return;
            }

        // IF the mPipeNetworkID don't exists, try to find it from one of the children
        let mFluidIntegrantScriptInterfaces = this.baseLayout.getObjectProperty(currentObject, 'mFluidIntegrantScriptInterfaces');
            mFluidIntegrantScriptInterfacesLoop:
            for(let j = 0; j < mFluidIntegrantScriptInterfaces.values.length; j++)
            {
                let currentInterface = this.baseLayout.saveGameParser.getTargetObject(mFluidIntegrantScriptInterfaces.values[j].pathName);
                    if(currentInterface !== null && currentInterface.children !== undefined)
                    {
                        for(let k = 0; k < currentInterface.children.length; k++)
                        {
                            let currentInterfaceChildren    = this.baseLayout.saveGameParser.getTargetObject(currentInterface.children[k].pathName);
                                mPipeNetworkID              = this.baseLayout.getObjectProperty(currentInterfaceChildren, 'mPipeNetworkID');
                                if(mPipeNetworkID !== null)
                                {
                                    this.networks[mPipeNetworkID] = currentObject.pathName;
                                    return;
                                }
                        }
                    }
            }
    }

    getNextId()
    {
        let newPipeNetworkID = Object.keys(this.networks);
            return (newPipeNetworkID.length > 0) ? (parseInt(newPipeNetworkID.reduce(function(a, b){ return parseInt(a) > parseInt(b) ? parseInt(a) : parseInt(b) })) + 1) : 1;
    }

    getObjectPipeNetwork(currentObject)
    {
        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                let currentChildren = this.baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                    if(currentChildren !== null)
                    {
                        let mPipeNetworkID = this.baseLayout.getObjectProperty(currentChildren, 'mPipeNetworkID');
                            if(mPipeNetworkID !== null && this.networks[mPipeNetworkID] !== undefined)
                            {
                                return this.baseLayout.saveGameParser.getTargetObject(this.networks[mPipeNetworkID]);
                            }
                    }
            }
        }

        return null;
    }

    updateFluid(marker)
    {
        let currentObject               = this.baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let currentObjectPipeNetwork    = this.getObjectPipeNetwork(currentObject);

            if(currentObjectPipeNetwork !== null)
            {
                let currentFluidDescriptor = this.baseLayout.getObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor');

                BaseLayout_Modal.form({
                    title       : 'Update pipe network fluid',
                    container   : '#leafletMap',
                    inputs      : [{
                        name            : 'mFluidDescriptor',
                        inputType       : 'selectPicker',
                        inputOptions    : this.baseLayout.generateInventoryOptions(currentObject),
                        value           : ((currentFluidDescriptor !== null) ? currentFluidDescriptor.pathName : 'NULL')
                    }],
                    callback    : (values) => {
                        if(values.mFluidDescriptor === 'NULL')
                        {
                            this.baseLayout.deleteObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor');
                        }
                        else
                        {
                            this.baseLayout.setObjectProperty(currentObjectPipeNetwork, 'mFluidDescriptor', {levelName: "", pathName: values.mFluidDescriptor}, 'ObjectProperty');
                        }

                        // Handle network inventories...
                        let mFluidIntegrantScriptInterfaces = this.baseLayout.getObjectProperty(currentObjectPipeNetwork, 'mFluidIntegrantScriptInterfaces');
                            if(mFluidIntegrantScriptInterfaces !== null)
                            {
                                for(let i = 0; i < mFluidIntegrantScriptInterfaces.values.length; i++)
                                {
                                    let currentObjectPathName = mFluidIntegrantScriptInterfaces.values[i].pathName.split('.');
                                    let endWith               = '.' + currentObjectPathName.pop();
                                        if(Building_Pipeline.availableConnections.includes(endWith) === false)
                                        {
                                                currentObjectPathName   = currentObjectPathName.join('.');
                                            let currentObject           = this.baseLayout.saveGameParser.getTargetObject(currentObjectPathName);
                                                if(currentObject !== null)
                                                {
                                                    if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Train/Station/Build_TrainDockingStationLiquid.Build_TrainDockingStationLiquid_C')
                                                    {
                                                        let mInventory = this.baseLayout.getObjectProperty(currentObject, 'mInventory');
                                                            if(mInventory !== null)
                                                            {
                                                                let currentObjectInventory = this.baseLayout.saveGameParser.getTargetObject(mInventory.pathName);
                                                                    if(currentObjectInventory !== null)
                                                                    {
                                                                        let mInventoryStacks = this.baseLayout.getObjectProperty(currentObjectInventory, 'mInventoryStacks');
                                                                            if(mInventoryStacks !== null)
                                                                            {
                                                                                if(values.mFluidDescriptor === 'NULL')
                                                                                {
                                                                                    mInventoryStacks.values[0][0].value.itemName = '';
                                                                                }
                                                                                else
                                                                                {
                                                                                    mInventoryStacks.values[0][0].value.itemName = values.mFluidDescriptor;
                                                                                }
                                                                            }
                                                                    }
                                                            }
                                                    }
                                                }
                                        }
                                }
                            }
                    }
                });
            }
    }
}
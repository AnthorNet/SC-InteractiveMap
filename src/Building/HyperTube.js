import BaseLayout_Math                          from '../BaseLayout/Math.js';
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';

export default class Building_HyperTube
{
    static clipboard = {entry: null, exit: null};

    static get availableConnections(){ return ['.PipeHyperConnection0', '.PipeHyperConnection1', '.PipeHyperStartConnection']; }

    /*
     * HYPERTUBE LOOKUP, includes mods to avoid finding them everywhere
     */
    static isHyperTube(currentObject)
    {
        if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PipeHyper'))
        {
            return true;
        }

        return false;
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PipeHyperStart/Build_PipeHyperStart.Build_PipeHyperStart_C')
        {
            let pipeHyperStartConnection = baseLayout.saveGameParser.getTargetObject(currentObject.pathName + '.PipeHyperStartConnection');
                if(pipeHyperStartConnection !== null)
                {
                    let mConnectedComponent = baseLayout.getObjectProperty(pipeHyperStartConnection, 'mConnectedComponent');
                        if(mConnectedComponent === null)
                        {
                            contextMenu.push({
                                icon        : 'fa-portal-exit',
                                text        : 'Use input as teleporter entry',
                                callback    : Building_HyperTube.storeTeleporterEntry,
                                className   : 'Building_Conveyor_storeTeleporterExit'
                            });
                        }
                }

            contextMenu.push('-');
        }

        return contextMenu;
    }

    /**
     * TELEPORT
     */
    static storeTeleporterEntry(marker)
    {
        let baseLayout                  = marker.baseLayout;
        let pipeHyperStartConnection    = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName + '.PipeHyperStartConnection');
            if(pipeHyperStartConnection !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(pipeHyperStartConnection, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        if(Building_HyperTube.clipboard.entry === null)
                        {
                            Building_HyperTube.clipboard.entry = marker.relatedTarget.options.pathName + '.PipeHyperStartConnection';
                        }
                        else
                        {
                            if(Building_HyperTube.clipboard.exit === null)
                            {
                                Building_HyperTube.clipboard.exit = marker.relatedTarget.options.pathName + '.PipeHyperStartConnection';
                            }
                        }
                    }
            }

        if(Building_HyperTube.clipboard.entry !== null && Building_HyperTube.clipboard.exit !== null)
        {
            Building_HyperTube.validateTeleporter(baseLayout);
        }
    }

    static validateTeleporter(baseLayout)
    {
        let pipeHyperStartConnectionEntry   = baseLayout.saveGameParser.getTargetObject(Building_HyperTube.clipboard.entry);
            if(pipeHyperStartConnectionEntry !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(pipeHyperStartConnectionEntry, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        baseLayout.setObjectProperty(pipeHyperStartConnectionEntry, 'mConnectedComponent', {pathName: Building_HyperTube.clipboard.exit}, 'Object');
                    }
            }

        let pipeHyperStartConnectionExit    = baseLayout.saveGameParser.getTargetObject(Building_HyperTube.clipboard.exit);
            if(pipeHyperStartConnectionExit !== null)
            {
                let mConnectedComponent = baseLayout.getObjectProperty(pipeHyperStartConnectionExit, 'mConnectedComponent');
                    if(mConnectedComponent === null)
                    {
                        baseLayout.setObjectProperty(pipeHyperStartConnectionExit, 'mConnectedComponent', {pathName: Building_HyperTube.clipboard.entry}, 'Object');
                    }
            }

        BaseLayout_Modal.notification({message: 'HyperTube teleporter added!'});

        Building_HyperTube.clipboard.entry  = null;
        Building_HyperTube.clipboard.exit   = null;
    }
}
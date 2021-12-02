import SubSystem_Event                          from '../SubSystem/Event.js';

export default class Building_TradingPost
{
    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            icon        : 'fa-gifts',
            text        : 'Reset FICS*MAS Calendar',
            callback    : Building_TradingPost.resetFicsmas
        });
        //contextMenu.push('-'); //TODO: Not needed until we get the position update...

        return contextMenu;
    }

    /**
     * MODALS
     */
    static resetFicsmas(marker)
    {
        let baseLayout          = marker.baseLayout;
        let eventSubSystem      = new SubSystem_Event({baseLayout: baseLayout});
            eventSubSystem.resetFicsmas();
    }
}
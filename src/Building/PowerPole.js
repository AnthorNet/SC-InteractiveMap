export default class Building_PowerPole
{
    static get availablePowerPoles()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/PowerPoleMk1/Build_PowerPoleMk1.Build_PowerPoleMk1_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleMk2/Build_PowerPoleMk2.Build_PowerPoleMk2_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleMk3/Build_PowerPoleMk3.Build_PowerPoleMk3_C'
        ];
    }

    static get availablePowerPolesWall()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall.Build_PowerPoleWall_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall_Mk2.Build_PowerPoleWall_Mk2_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_PowerPoleWall_Mk3.Build_PowerPoleWall_Mk3_C'
        ];
    }

    static get availablePowerPolesWallDouble()
    {
        return [
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble.Build_PowerPoleWallDouble_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble_Mk2.Build_PowerPoleWallDouble_Mk2_C',
            '/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_PowerPoleWallDouble_Mk3.Build_PowerPoleWallDouble_Mk3_C'
        ];
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        let usePool         = Building_PowerPole.availablePowerPoles;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') === true)
            {
                usePool = Building_PowerPole.availablePowerPolesWall;
            }
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') === true)
            {
                usePool = Building_PowerPole.availablePowerPolesWallDouble;
            }

        let poolIndex   = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && (poolIndex > 0 || poolIndex < (usePool.length - 1)))
            {
                if(poolIndex > 0)
                {
                    let downgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex - 1]);
                        if(downgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-down-alt',
                                text        : 'Downgrade to "' + downgradeData.name + '"',
                                callback    : Building_PowerPole.downgradePowerPole,
                                className   : 'Building_PowerPole_downgradePowerPole'
                            });
                        }
                }
                if(poolIndex < (usePool.length - 1))
                {
                    let upgradeData = baseLayout.getBuildingDataFromClassName(usePool[poolIndex + 1]);
                        if(upgradeData !== null)
                        {
                            contextMenu.push({
                                icon        : 'fa-level-up-alt',
                                text        : 'Upgrade to "' + upgradeData.name + '"',
                                callback    : Building_PowerPole.upgradePowerPole,
                                className   : 'Building_PowerPole_upgradePowerPole'
                            });
                        }
                }

                contextMenu.push('-');
            }

        return contextMenu;
    }

    /**
     * DOWNGRADE/UPGRADE
     */
    static downgradePowerPole(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_PowerPole.availablePowerPoles;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') === true)
            {
                usePool = Building_PowerPole.availablePowerPolesWall;
            }
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') === true)
            {
                usePool = Building_PowerPole.availablePowerPolesWallDouble;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex > 0)
            {
                currentObject.className = usePool[poolIndex - 1];
                baseLayout.updateBuiltWithRecipe(currentObject);
            }
    }

    static upgradePowerPole(marker)
    {
        let baseLayout      = marker.baseLayout;
        let currentObject   = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);

        let usePool         = Building_PowerPole.availablePowerPoles;
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWall/Build_') === true)
            {
                usePool = Building_PowerPole.availablePowerPolesWall;
            }
            if(currentObject.className.startsWith('/Game/FactoryGame/Buildable/Factory/PowerPoleWallDouble/Build_') === true)
            {
                usePool = Building_PowerPole.availablePowerPolesWallDouble;
            }

        let poolIndex       = usePool.indexOf(currentObject.className);
            if(poolIndex !== -1 && poolIndex < (usePool.length - 1))
            {
                currentObject.className = usePool[poolIndex + 1];
                baseLayout.updateBuiltWithRecipe(currentObject);
            }
    }
}
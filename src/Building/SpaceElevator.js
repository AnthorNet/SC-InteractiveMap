/* global Intl */
import BaseLayout_Modal                         from '../BaseLayout/Modal.js';
import BaseLayout_Tooltip                       from '../BaseLayout/Tooltip.js';

export default class Building_SpaceElevator
{
    static get availablePhases()
    {
        return {
            EGP_EarlyGame: {
                display : 'Establishing Phase',
                unlock  : 'Tier 1 & 2',
                cost    : null
            },
            EGP_MidGame: {
                display : 'Project Assemby: Platform',
                unlock  : 'Tier 3 & 4',
                cost    : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C" : 50
                }
            },
            EGP_LateGame: {
                display : 'Project Assemby: Framework',
                unlock  : 'Tier 5 & 6',
                cost    : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C" : 500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C" : 500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_3.Desc_SpaceElevatorPart_3_C" : 100
                }
            },
            EGP_EndGame: {
                display : 'Project Assemby: Systems',
                unlock  : 'Tier 7 & 8',
                cost    : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C" : 2500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_4.Desc_SpaceElevatorPart_4_C" : 500,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_5.Desc_SpaceElevatorPart_5_C" : 100
                }
            },
            EGP_FoodCourt: {
                display : 'Employee of the Planet',
                unlock  : 'A small reward in the AWESOME Shop',
                cost    : {
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_7.Desc_SpaceElevatorPart_7_C" : 4000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_6.Desc_SpaceElevatorPart_6_C" : 4000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_9.Desc_SpaceElevatorPart_9_C" : 1000,
                    "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_8.Desc_SpaceElevatorPart_8_C" : 1000
                }
            }
        };
    }

    static getManager(baseLayout)
    {
        return baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.GamePhaseManager');
    }

    static getCurrentPhase(baseLayout)
    {
        let phaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let mGamePhase          = baseLayout.getObjectProperty(phaseManager, 'mGamePhase');
                    if(mGamePhase !== null)
                    {
                        return mGamePhase.valueName;
                    }
                }

        return 'EGP_EarlyGame';
    }

    static getNextPhase(baseLayout)
    {
        let phaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let phaseIds            = Object.keys(Building_SpaceElevator.availablePhases);
                let currentPhase        = Building_SpaceElevator.getCurrentPhase(baseLayout);
                let currentPhaseIndex   = phaseIds.indexOf(currentPhase);
                    if(currentPhaseIndex !== -1 && phaseIds[currentPhaseIndex + 1] !== undefined)
                    {
                        return phaseIds[currentPhaseIndex + 1];
                    }
            }

        return null;
    }

    static getNextPhaseCost(baseLayout)
    {
        let itemsCost       = {};
        let nextPhase       = Building_SpaceElevator.getNextPhase(baseLayout);

            if(nextPhase !== null)
            {
                let phaseManager    = Building_SpaceElevator.getManager(baseLayout);
                    if(phaseManager !== null)
                    {
                        let mGamePhaseCosts = baseLayout.getObjectProperty(phaseManager, 'mGamePhaseCosts');
                            if(mGamePhaseCosts !== null)
                            {
                                for(let i = 0 ; i < mGamePhaseCosts.values.length; i++)
                                {
                                    let gamePhase   = null;
                                    let cost        = null;

                                        for(let j = 0 ; j < mGamePhaseCosts.values[i].length; j++)
                                        {
                                            if(mGamePhaseCosts.values[i][j].name === 'gamePhase')
                                            {
                                                gamePhase = mGamePhaseCosts.values[i][j].value.valueName;
                                            }
                                            if(mGamePhaseCosts.values[i][j].name === 'Cost')
                                            {
                                                cost = mGamePhaseCosts.values[i][j].value.values;
                                            }
                                        }

                                        if(gamePhase !== null && cost !== null && gamePhase === nextPhase)
                                        {
                                            for(let j = 0 ; j < cost.length; j++)
                                            {
                                                let itemClass   = null;
                                                let amount      = null;

                                                    for(let k = 0 ; k < cost[j].length; k++)
                                                    {
                                                        if(cost[j][k].name === 'ItemClass')
                                                        {
                                                            itemClass = cost[j][k].value.pathName;
                                                        }
                                                        if(cost[j][k].name === 'Amount')
                                                        {
                                                            amount = cost[j][k].value;
                                                        }
                                                    }

                                                    if(itemClass !== null && amount !== null)
                                                    {
                                                        itemsCost[itemClass] = amount;
                                                    }
                                            }

                                            return itemsCost;
                                        }
                                }
                            }
                        }
            }

        return null;
    }

    static updatePhase(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);

        let availablePhases     = Building_SpaceElevator.availablePhases;
        let phaseOptions        = [];
            for(let phaseId in availablePhases)
            {
                phaseOptions.push({
                    value           : phaseId,
                    text            : availablePhases[phaseId].display + ' (' + availablePhases[phaseId].unlock + ')'
                })
            }

            BaseLayout_Modal.form({
                title       : 'Update "<strong>' + buildingData.name + '</strong>" phase',
                container   : '#leafletMap',
                inputs      : [{
                    name            : 'mGamePhase',
                    inputType       : 'select',
                    value           : Building_SpaceElevator.getCurrentPhase(baseLayout),
                    inputOptions    : phaseOptions
                }],
                callback    : function(values)
                {
                    Building_SpaceElevator.initiate(baseLayout);

                    let phaseManager    = Building_SpaceElevator.getManager(baseLayout);
                        if(values.mGamePhase === 'EGP_EarlyGame')
                        {
                            baseLayout.deleteObjectProperty(phaseManager, 'mGamePhase');
                            baseLayout.deleteObjectProperty(phaseManager, 'mGamePhaseCosts');
                        }
                        else
                        {
                            let mGamePhase      = baseLayout.getObjectProperty(phaseManager, 'mGamePhase');
                                if(mGamePhase === null)
                                {
                                    phaseManager.properties.push({
                                        name: "mGamePhase",
                                        type: "ByteProperty",
                                        value: {enumName    : "EGamePhase", valueName: values.mGamePhase}
                                    });
                                }
                                else
                                {
                                    mGamePhase.valueName    = values.mGamePhase;
                                }
                        }
                }
            });
    }


    static initiate(baseLayout)
    {
        let phaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let mGamePhaseCosts = baseLayout.getObjectProperty(phaseManager, 'mGamePhaseCosts');
                    if(mGamePhaseCosts === null)
                    {
                        let availablePhases = Building_SpaceElevator.availablePhases;
                        let phaseCostValues = [];
                            for(let phaseId in availablePhases)
                            {
                                if(availablePhases[phaseId].cost !== null)
                                {
                                    let currentPhaseCost = [];
                                        for(let itemClass in availablePhases[phaseId].cost)
                                        {
                                            currentPhaseCost.push([
                                                {name: "ItemClass", type: "ObjectProperty", value: {levelName: "", pathName: itemClass}},
                                                {name: "amount", type: "IntProperty", value: availablePhases[phaseId].cost[itemClass]}
                                            ]);
                                        }

                                    phaseCostValues.push([
                                        {
                                            name    : "gamePhase",
                                            type    : "ByteProperty",
                                            value   : {enumName: "EGamePhase", valueName: phaseId}
                                        },
                                        {
                                            name                : "Cost",
                                            type                : "ArrayProperty",
                                            value               : {type: "StructProperty", values: currentPhaseCost},
                                            structureName       : "Cost",
                                            structureType       : "StructProperty",
                                            structureSubType    : "ItemAmount"
                                        }
                                    ]);
                                }
                            }

                        phaseManager.properties.push({
                            name                : "mGamePhaseCosts",
                            type                : "ArrayProperty",
                            value               : {
                                type    : "StructProperty",
                                values  : phaseCostValues
                            },
                            structureName       : "mGamePhaseCosts",
                            structureType       : "StructProperty",
                            structureSubType    : "PhaseCost"
                        })
                    }
            }
    }

    static reset(baseLayout)
    {
        let gamePhaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(gamePhaseManager !== null)
            {
                gamePhaseManager.properties = [];
            }
    }

    /**
     * CONTEXT MENU
     */
    static addContextMenu(baseLayout, currentObject, contextMenu)
    {
        contextMenu.push({
            text        : 'Update phase',
            callback    : Building_SpaceElevator.updatePhase
        });
        /*
        let nextPhase = Building_SpaceElevator.getNextPhase(baseLayout);
            if(nextPhase !== null)
            {
                contextMenu.push({
                    text        : 'Empty phase inventory',
                    callback    : Building_SpaceElevator.emptyPhase
                });
                contextMenu.push({
                    text        : 'Fill phase inventory',
                    callback    : Building_SpaceElevator.fillPhase
                });
            }
        */
        contextMenu.push('-');

        return contextMenu;
    }

    /**
     * TOOLTIP
     */
    static getTooltip(baseLayout, currentObject, buildingData)
    {
        let content             = [];
        let nextPhaseName       = Building_SpaceElevator.getNextPhase(baseLayout);
            if(nextPhaseName !== null)
            {
                let nextPhase   = Building_SpaceElevator.availablePhases[nextPhaseName];
                let sealStatus  = true;

                // Slots
                if(nextPhase.cost !== null)
                {
                    let itemsCost = Building_SpaceElevator.getNextPhaseCost(baseLayout);

                    content.push('<div style="position: absolute;margin-top: 180px;margin-left: 64px;width: 190px;height: 44px;color: #FFFFFF;display: flex;justify-content: center;">');
                    for(let itemClass in nextPhase.cost)
                    {
                        content.push('<div style="width: 44px; height: 44px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/SpaceElevator_Slot.png?v=' + baseLayout.scriptVersion + ') no-repeat;margin: 0 1px;text-align: center;">');
                            let itemData = baseLayout.getItemDataFromClassName(itemClass);
                                if(itemData !== null)
                                {
                                    content.push('<img src="' + itemData.image + '" style="width: 30px;height: 30px;padding-top: 6px;" />');
                                }

                            if(itemsCost !== null && itemsCost[itemClass] !== undefined)
                            {
                                content.push('<div style="font-size: 7px;">' + new Intl.NumberFormat(baseLayout.language).format(nextPhase.cost[itemClass] - itemsCost[itemClass]) + ' / ' + new Intl.NumberFormat(baseLayout.language).format(nextPhase.cost[itemClass]) + '</div>');

                                if(itemsCost[itemClass] > 0)
                                {
                                    sealStatus  = false;
                                }
                            }
                        content.push('</div>');
                    }
                    content.push('</div>');
                }

                // Header
                content.push('<div style="position: absolute;margin-top: 12px;margin-left: 328px;width: 160px;height: 98px;display: flex;align-items: center;"><div style="width: 100%;display: block;text-align: center;color: #5b5b5b;font-size: 12px;line-height: 12px;">');
                    //content.push('<div><strong>' + buildingData.name + '</strong></div>');
                    content.push('<div><strong class="text-warning">' + nextPhase.display + '</strong></div>');

                    content.push('<div style="padding-top: 5px;font-size: 9px;">Delivery will unlock:<br /><strong>' + nextPhase.unlock + '</strong></div>');

                    content.push('<div style="padding-top: 5px;font-size: 9px;">Status:</div>');
                    content.push('<div class="text-warning"><strong>');
                    if(sealStatus === true)
                    {
                        content.push('Seal Crate');
                    }
                    else
                    {
                        content.push('Load Crate');
                    }
                    content.push('</strong></div>');
                content.push('</div></div>');

                // Seal
                if(sealStatus === true)
                {
                    content.push('<div style="position :absolute;margin-top: 171px;margin-left: 333px;width: 75px; height: 36px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/SpaceElevator_Pusher.png?v=' + baseLayout.scriptVersion + ') no-repeat;"></div>');
                    content.push('<div style="position :absolute;margin-top: 194px;margin-left: 374px;width: 126px; height: 117px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/SpaceElevator_Seal.png?v=' + baseLayout.scriptVersion + ') no-repeat;" class="blink"></div>');
                }
            }

        return '<div style="width: 500px;height: 385px;background: url(' + baseLayout.staticUrl + '/js/InteractiveMap/img/SpaceElevator_BG.png?v=' + baseLayout.scriptVersion + ') no-repeat;margin: -7px;">' + content.join('') + '</div>';
    }
}
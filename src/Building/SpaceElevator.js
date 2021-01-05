/* global bootbox */

export default class Building_SpaceElevator
{
    static getManager(baseLayout)
    {
        return baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.GamePhaseManager');
    }

    /*
     * EGP_EarlyGame        = 0 UMETA( DisplayName = "Establishing Phase" ) Up to tier 2
     * EGP_MidGame          = 1 UMETA( DisplayName = "Development Phase" ), Up to tier 4
     * EGP_LateGame         = 2 UMETA( DisplayName = "Expansion Phase" ), Up to tier 6
     * EGP_EndGame          = 3 UMETA( DisplayName = "Retention Phase" ), Up to tier 7
     */
    static updatePhase(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let buildingData        = baseLayout.getBuildingDataFromClassName(currentObject.className);
        let phaseManager        = Building_SpaceElevator.getManager(baseLayout);

            Building_SpaceElevator.initiate(baseLayout);

            let mGamePhase          = baseLayout.getObjectProperty(phaseManager, 'mGamePhase');
            //let mGamePhaseCosts     = baseLayout.getObjectProperty(phaseManager, 'mGamePhaseCosts'); //TODO: Reset?

            bootbox.form({
                title: 'Update "<strong>' + buildingData.name + '</strong>" phase',
                container: '#leafletMap',
                inputs: [{
                    name: 'mGamePhase',
                    inputType: 'select',
                    inputOptions: [{
                            value       : 'EGP_EarlyGame',
                            text        : 'Establishing Phase (Tier 1 & 2)'
                        },
                        {
                            value       : 'EGP_MidGame',
                            text        : 'Development Phase (Tier 3 & 4)'
                        },
                        {
                            value       : 'EGP_LateGame',
                            text        : 'Expansion Phase (Tier 5 & 6)'
                        },
                        {
                            value       : 'EGP_EndGame',
                            text        : 'Retention Phase (Tier 7)'
                        }],
                    value: mGamePhase.valueName
                }],
                callback: function(values)
                {
                    if(values === null)
                    {
                        return;
                    }

                    mGamePhase.valueName = values.mGamePhase;
                }.bind(baseLayout)
            });
    }


    static initiate(baseLayout)
    {
        let phaseManager = Building_SpaceElevator.getManager(baseLayout);
            if(phaseManager !== null)
            {
                let mGamePhase          = baseLayout.getObjectProperty(phaseManager, 'mGamePhase');
                    if(mGamePhase === null)
                    {
                        phaseManager.properties.push({
                            name: "mGamePhase",
                            type: "ByteProperty",
                            value: {
                                enumName    : "EGamePhase",
                                valueName   : "EGP_EarlyGame"
                            }
                        });
                    }

                let mGamePhaseCosts     = baseLayout.getObjectProperty(phaseManager, 'mGamePhaseCosts'); //TODO: Reset?
                    if(mGamePhaseCosts === null)
                    {
                        phaseManager.properties.push({
                            name: "mGamePhaseCosts",
                            type: "ArrayProperty",
                            value: {
                                type: "StructProperty",
                                values: [
                                    [
                                        {
                                            name: "gamePhase",
                                            type: "ByteProperty",
                                            value: {
                                                enumName: "EGamePhase",
                                                valueName: "EGP_MidGame"
                                            }
                                        },
                                        {
                                            name: "Cost",
                                            type: "ArrayProperty",
                                            value: {
                                                type: "StructProperty",
                                                values: [
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 50
                                                        }
                                                    ]
                                                ]
                                            },
                                            structureName: "Cost",
                                            structureType: "StructProperty",
                                            structureSubType: "ItemAmount"
                                        }
                                    ],
                                    [
                                        {
                                            name: "gamePhase",
                                            type: "ByteProperty",
                                            value: {
                                                enumName: "EGamePhase",
                                                valueName: "EGP_LateGame"
                                            }
                                        },
                                        {
                                            name: "Cost",
                                            type: "ArrayProperty",
                                            value: {
                                                type: "StructProperty",
                                                values: [
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_3.Desc_SpaceElevatorPart_3_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 100
                                                        }
                                                    ]
                                                ]
                                            },
                                            structureName: "Cost",
                                            structureType: "StructProperty",
                                            structureSubType: "ItemAmount"
                                        }
                                    ],
                                    [
                                        {
                                            name: "gamePhase",
                                            type: "ByteProperty",
                                            value: {
                                                enumName: "EGamePhase",
                                                valueName: "EGP_EndGame"
                                            }
                                        },
                                        {
                                            name: "Cost",
                                            type: "ArrayProperty",
                                            value: {
                                                type: "StructProperty",
                                                values: [
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 2500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_4.Desc_SpaceElevatorPart_4_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            name: "ItemClass",
                                                            type: "ObjectProperty",
                                                            value: {
                                                                levelName: "",
                                                                pathName: "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_5.Desc_SpaceElevatorPart_5_C"
                                                            }
                                                        },
                                                        {
                                                            name: "amount",
                                                            type: "IntProperty",
                                                            value: 100
                                                        }
                                                    ]
                                                ]
                                            },
                                            structureName: "Cost",
                                            structureType: "StructProperty",
                                            structureSubType: "ItemAmount"
                                        }
                                    ]
                                ]
                            },
                            structureName: "mGamePhaseCosts",
                            structureType: "StructProperty",
                            structureSubType: "PhaseCost"
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
}
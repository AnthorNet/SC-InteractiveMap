export default class Building_SpaceElevator
{
    static initiatePhaseManager(baseLayout)
    {
        let phaseManager        = baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.GamePhaseManager');
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
                            "name": "mGamePhaseCosts",
                            "type": "ArrayProperty",
                            "value": {
                                "type": "StructProperty",
                                "values": [
                                    [
                                        {
                                            "name": "gamePhase",
                                            "type": "ByteProperty",
                                            "value": {
                                                "enumName": "EGamePhase",
                                                "valueName": "EGP_MidGame"
                                            }
                                        },
                                        {
                                            "name": "Cost",
                                            "type": "ArrayProperty",
                                            "value": {
                                                "type": "StructProperty",
                                                "values": [
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 50
                                                        }
                                                    ]
                                                ]
                                            },
                                            "structureName": "Cost",
                                            "structureType": "StructProperty",
                                            "structureSubType": "ItemAmount",
                                            "propertyGuid1": 0,
                                            "propertyGuid2": 0,
                                            "propertyGuid3": 0,
                                            "propertyGuid4": 0
                                        }
                                    ],
                                    [
                                        {
                                            "name": "gamePhase",
                                            "type": "ByteProperty",
                                            "value": {
                                                "enumName": "EGamePhase",
                                                "valueName": "EGP_LateGame"
                                            }
                                        },
                                        {
                                            "name": "Cost",
                                            "type": "ArrayProperty",
                                            "value": {
                                                "type": "StructProperty",
                                                "values": [
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_1.Desc_SpaceElevatorPart_1_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_3.Desc_SpaceElevatorPart_3_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 100
                                                        }
                                                    ]
                                                ]
                                            },
                                            "structureName": "Cost",
                                            "structureType": "StructProperty",
                                            "structureSubType": "ItemAmount",
                                            "propertyGuid1": 0,
                                            "propertyGuid2": 0,
                                            "propertyGuid3": 0,
                                            "propertyGuid4": 0
                                        }
                                    ],
                                    [
                                        {
                                            "name": "gamePhase",
                                            "type": "ByteProperty",
                                            "value": {
                                                "enumName": "EGamePhase",
                                                "valueName": "EGP_EndGame"
                                            }
                                        },
                                        {
                                            "name": "Cost",
                                            "type": "ArrayProperty",
                                            "value": {
                                                "type": "StructProperty",
                                                "values": [
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_2.Desc_SpaceElevatorPart_2_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 2500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_4.Desc_SpaceElevatorPart_4_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 500
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            "name": "ItemClass",
                                                            "type": "ObjectProperty",
                                                            "value": {
                                                                "levelName": "",
                                                                "pathName": "/Game/FactoryGame/Resource/Parts/SpaceElevatorParts/Desc_SpaceElevatorPart_5.Desc_SpaceElevatorPart_5_C"
                                                            }
                                                        },
                                                        {
                                                            "name": "amount",
                                                            "type": "IntProperty",
                                                            "value": 100
                                                        }
                                                    ]
                                                ]
                                            },
                                            "structureName": "Cost",
                                            "structureType": "StructProperty",
                                            "structureSubType": "ItemAmount",
                                            "propertyGuid1": 0,
                                            "propertyGuid2": 0,
                                            "propertyGuid3": 0,
                                            "propertyGuid4": 0
                                        }
                                    ]
                                ]
                            },
                            "structureName": "mGamePhaseCosts",
                            "structureType": "StructProperty",
                            "structureSubType": "PhaseCost",
                            "propertyGuid1": 0,
                            "propertyGuid2": 0,
                            "propertyGuid3": 0,
                            "propertyGuid4": 0
                        })
                    }
            }
    }
}
import SubSystem                                from '../SubSystem.js';

import Modal_CentralStorage                     from '../Modal/CentralStorage.js';

export default class SubSystem_CentralStorage extends SubSystem
{
    static get defaultUploadRate(){ return 30; }
    static get defaultMaxStack(){ return 1; }

    constructor(options)
    {
        options.pathName        = 'Persistent_Level:PersistentLevel.CentralStorageSubsystem';
        super(options);

        if(this.subSystem !== null)
        {
            $('#modalCentralStorage')
                .show()
                .on('click', () => {
                    let modalCentralStorage = new Modal_CentralStorage({
                            baseLayout      : this.baseLayout
                        });
                        modalCentralStorage.parse();
                });;
        }
    }

    getStoredItems()
    {
        return this.baseLayout.getObjectProperty(this.subSystem, 'mStoredItems');
    }

    getUploadRate()
    {
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralUploadBoost_04.Research_Alien_CentralUploadBoost_04_C'))
        {
            return 150;
        }
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralUploadBoost_03.Research_Alien_CentralUploadBoost_03_C'))
        {
            return 120;
        }
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralUploadBoost_02.Research_Alien_CentralUploadBoost_02_C'))
        {
            return 90;
        }
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralUploadBoost_01.Research_Alien_CentralUploadBoost_01_C'))
        {
            return 60;
        }

        return SubSystem_CentralStorage.defaultUploadRate;
    }

    getMaxStack()
    {
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralStackExpansion_04.Research_Alien_CentralStackExpansion_04_C'))
        {
            return 5;
        }
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralStackExpansion_03.Research_Alien_CentralStackExpansion_03_C'))
        {
            return 4;
        }
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralStackExpansion_02.Research_Alien_CentralStackExpansion_02_C'))
        {
            return 3;
        }
        if(this.baseLayout.schematicSubSystem.havePurchasedSchematics('/Game/FactoryGame/Schematics/Research/AlienTech_RS/Research_Alien_CentralStackExpansion_01.Research_Alien_CentralStackExpansion_01_C'))
        {
            return 2;
        }

        return SubSystem_CentralStorage.defaultMaxStack;
    }
}
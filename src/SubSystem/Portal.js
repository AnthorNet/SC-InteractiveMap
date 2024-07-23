import SubSystem                                from '../SubSystem.js';

export default class SubSystem_Portal
{
    constructor(options)
    {
        this.baseLayout             = options.baseLayout;

        this.portals                = [];
        this.satellites             = [];
    }

    add(currentObject)
    {
        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_Portal.Build_Portal_C')
        {
            if(this.portals.includes(currentObject.pathName) === false)
            {
                this.portals.push(currentObject.pathName);
            }
        }

        if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/Portal/Build_PortalSatellite.Build_PortalSatellite_C')
        {
            if(this.satellites.includes(currentObject.pathName) === false)
            {
                this.satellites.push(currentObject.pathName);
            }
        }
    }
}
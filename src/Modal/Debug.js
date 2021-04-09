import SubSystem_Circuit                        from '../SubSystem/Circuit.js';

export default class Modal_Debug
{
    static getHTML(marker)
    {
        let baseLayout          = marker.baseLayout;
        let currentObject       = baseLayout.saveGameParser.getTargetObject(marker.relatedTarget.options.pathName);
        let html                = [];
        let htmlChildren        = [];
        let childrenPathName    = [];
        let extraPathName       = [];

        //html.push('<div class="alert alert-danger">Be aware that manually editing the save can lead to unexpected errors.</div>');

        if(currentObject.children !== undefined)
        {
            for(let i = 0; i < currentObject.children.length; i++)
            {
                childrenPathName.push(currentObject.children[i].pathName);
            }
        }

        let extraProperties = ['mOwningSpawner', 'mInfo', 'mStationDrone'];
            for(let i = 0; i < extraProperties.length; i++)
            {
                let extraProperty = baseLayout.getObjectProperty(currentObject, extraProperties[i]);
                    if(extraProperty !== null)
                    {
                        extraPathName.push(extraProperty.pathName);
                    }
            }

        let circuitSubSystem    = new SubSystem_Circuit({baseLayout: baseLayout});
            if(currentObject.className === '/Game/FactoryGame/Buildable/Factory/PowerSwitch/Build_PowerSwitch.Build_PowerSwitch_C')
            {
                let objectCircuitA       = circuitSubSystem.getObjectCircuit(currentObject, 'PowerConnection1');
                    if(objectCircuitA !== null)
                    {
                        extraPathName.push(objectCircuitA.pathName);
                    }
                let objectCircuitB       = circuitSubSystem.getObjectCircuit(currentObject, 'PowerConnection2');
                    if(objectCircuitB !== null)
                    {
                        extraPathName.push(objectCircuitB.pathName);
                    }
            }
            else
            {
                let objectCircuit       = circuitSubSystem.getObjectCircuit(currentObject);
                    if(objectCircuit !== null)
                    {
                        extraPathName.push(objectCircuit.pathName);
                    }
            }

            html.push('<ul class="nav nav-tabs nav-fill" role="tablist">');
            html.push('<li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#advancedDebugObject-MAIN" role="tab">Main object</a></li>');

            if(currentObject.children !== undefined)
            {
                for(let i = 0; i < currentObject.children.length; i++)
                {
                    html.push('<li class="nav-item"><a class="nav-link" style="text-transform: none;" data-toggle="tab" href="#advancedDebugObject-' + currentObject.children[i].pathName.split('.').pop() + '" role="tab">.' + currentObject.children[i].pathName.split('.').pop() + '</a></li>');

                    let currentChildren = baseLayout.saveGameParser.getTargetObject(currentObject.children[i].pathName);
                        if(currentChildren !== null)
                        {
                            htmlChildren.push('<div class="tab-pane fade" id="advancedDebugObject-' + currentObject.children[i].pathName.split('.').pop() + '">');
                            htmlChildren.push('<textarea class="form-control updateObject" style="height: 75vh;" data-pathName="' + currentObject.children[i].pathName + '">' + JSON.stringify(currentChildren, null, 4) + '</textarea>');
                            //htmlChildren.push('<button class="btn btn-warning w-100" data-pathName="' + currentObject.children[i].pathName + '" disabled>Update</button>');
                            htmlChildren.push('</div>');

                            let mHiddenConnections = baseLayout.getObjectProperty(currentChildren, 'mHiddenConnections');
                                if(mHiddenConnections !== null)
                                {
                                    for(let j = 0; j < mHiddenConnections.values.length; j++)
                                    {
                                        if(childrenPathName.includes(mHiddenConnections.values[j].pathName) === false && extraPathName.includes(mHiddenConnections.values[j].pathName) === false)
                                        {
                                            extraPathName.push(mHiddenConnections.values[j].pathName);
                                        }
                                    }
                                }
                        }
                        else
                        {
                            console.log('Missing children: ' + currentObject.children[i].pathName);
                        }
                }
            }

            let currentObjectPipeNetworkPathName = baseLayout.getObjectPipeNetwork(currentObject);
                if(currentObjectPipeNetworkPathName !== null)
                {
                    extraPathName.push(currentObjectPipeNetworkPathName.pathName);
                }

            for(let j = 0; j < extraPathName.length; j++)
            {
                html.push('<li class="nav-item"><a class="nav-link" style="text-transform: none;" data-toggle="tab" href="#advancedDebugObject-' + extraPathName[j].replace(':', '-').replace('.', '-').replace('.', '-') + '" role="tab">' + extraPathName[j].replace('Persistent_Level:', '') + '</a></li>');
            }

            html.push('</ul>');

            html.push('<div class="tab-content">');
            html.push('<div class="tab-pane fade show active" id="advancedDebugObject-MAIN">');
            html.push('<textarea class="form-control updateObject" style="height: 75vh;" data-pathName="' + currentObject.pathName + '">' + JSON.stringify(currentObject, null, 4) + '</textarea>');
            //html.push('<button class="btn btn-warning w-100" data-pathName="' + currentObject.pathName + '" disabled>Update</button>');
            html.push('</div>');
            html.push(htmlChildren.join(''));

            for(let j = 0; j < extraPathName.length; j++)
            {
                let currentExtraObject = baseLayout.saveGameParser.getTargetObject(extraPathName[j]);
                    html.push('<div class="tab-pane fade" id="advancedDebugObject-' + extraPathName[j].replace(':', '-').replace('.', '-').replace('.', '-') + '">');
                    html.push('<textarea class="form-control updateObject" style="height: 75vh;" data-pathName="' + extraPathName[j] + '">' + JSON.stringify(currentExtraObject, null, 4) + '</textarea>');
                    //html.push('<button class="btn btn-warning w-100" data-pathName="' + extraPathName[j] + '" disabled>Update</button>');
                    html.push('</div>');
            }

            html.push('</div>');

        $('#genericModal .modal-title').empty().html('Advanced Debug - ' + marker.relatedTarget.options.pathName);
        $('#genericModal .modal-body').empty().html(html.join(''));
        setTimeout(function(){
            $('#genericModal').modal('show').modal('handleUpdate');
            $('textarea.updateObject').on('keyup', function(){
                $(this).next('button').attr('disabled', false);
            });
        }, 250);
    }
}
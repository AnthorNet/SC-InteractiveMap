/* global Intl, Infinity */
import BaseLayout_Math                          from '../../BaseLayout/Math.js';

import Building_Locomotive                      from '../../Building/Locomotive.js';

export default class Modal_Train_Timetable
{
    constructor(options)
    {
        this.baseLayout         = options.baseLayout;
        this.locomotive         = options.locomotive;

        this.trainIdentifier    = this.baseLayout.railroadSubSystem.getObjectIdentifier(this.locomotive);
        this.timeTable          = this.baseLayout.getObjectProperty(this.trainIdentifier, 'TimeTable');

        if(this.timeTable !== null)
        {
            this.timeTable = this.baseLayout.saveGameParser.getTargetObject(this.timeTable.pathName);
        }
    }

    parse()
    {
        if(this.timeTable !== null)
        {
            $('#genericModal .modal-title').empty().html('Timetable - ' + Building_Locomotive.getTrainName(this.baseLayout, this.locomotive, this.trainIdentifier.pathName));
            let html = [];
                html.push('<div class="row">');
                    html.push('<div class="col-6" style="max-height: 512px;overflow-y: scroll;">');
                        html.push(this.getTimeTableList());
                    html.push('</div>');
                    html.push('<div class="col-6">');
                        html.push(this.baseLayout.mapSubSystem.getMinimap(this.getTimeTableSplinePoints(), this.getTimeTableStationsPoints()));
                    html.push('</div>');
                html.push('</div>');

            $('#genericModal .modal-body').empty().html(html.join(''));
            setTimeout(function(){
                $('#genericModal').modal('show').modal('handleUpdate');
            }, 250);

            $('#genericModal .modal-body table tr[data-stop]').hover(function(){
                let stop = $(this).attr('data-stop');
                    $('#genericModal .modal-body .img-minimap span[data-stop=' + stop + ']')
                        .css('border-color', '#FF0000')
                        .css('z-index', 2)
            }, function(){
                let stop = $(this).attr('data-stop');
                    $('#genericModal .modal-body .img-minimap span[data-stop=' + stop + ']')
                        .css('border-color', '#777777')
                        .css('z-index', 1)
            });
        }
    }

    getTimeTableList()
    {
        let html = [];
        let mStops = this.baseLayout.getObjectProperty(this.timeTable, 'mStops');
            if(mStops !== null)
            {
                let mCurrentStop    = this.baseLayout.getObjectProperty(this.timeTable, 'mCurrentStop', 0);

                html.push('<table class="table table-hover mb-0">');
                    for(let j = 0; j < mStops.values.length; j++)
                    {
                        let trainStationIdentifier  = null;
                        let trainStationRules       = null;
                            for(let k = 0; k < mStops.values[j].length; k++)
                            {
                                if(mStops.values[j][k].name === 'Station' && mStops.values[j][k].value.pathName !== undefined)
                                {
                                    trainStationIdentifier = this.baseLayout.saveGameParser.getTargetObject(mStops.values[j][k].value.pathName);
                                }
                                if(mStops.values[j][k].name === 'DockingRuleSet')
                                {
                                    trainStationRules = mStops.values[j][k].value.values;
                                }
                            }

                        html.push('<tr data-stop="'+ j + '">');
                            html.push('<td width="1" class="text-right"><h6>' + (j + 1) + '.</h6></td>');
                            html.push('<td>');
                                if(trainStationIdentifier !== null)
                                {
                                    let mStation        = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStation');
                                    let mStationName    = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStationName');
                                    let isDocked        = false;

                                        if(mStation !== null)
                                        {
                                            let currentStation      = this.baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                                            let mDockingLocomotive  = this.baseLayout.getObjectProperty(currentStation, 'mDockingLocomotive');
                                                if(mDockingLocomotive !== null)
                                                {
                                                    if(this.locomotive.pathName === mDockingLocomotive.pathName)
                                                    {
                                                        isDocked = true;
                                                    }
                                                }
                                        }

                                        html.push('<h6 class="mb-0">');
                                            html.push(((mStationName !== null) ? mStationName : trainStationIdentifier.pathName));

                                            if(isDocked === true)
                                            {
                                                html.push(' <sup class="badge badge-warning">Docked</sup>');
                                            }
                                            if(j === mCurrentStop)
                                            {
                                                html.push(' <sup class="badge badge-warning">Next stop</sup>');
                                            }

                                        html.push('</h3>');
                                }
                                if(trainStationRules !== null)
                                {
                                    trainStationRules = {properties: trainStationRules};

                                    html.push('<em><small>');

                                        let DockingDefinition = this.baseLayout.getObjectProperty(trainStationRules, 'DockingDefinition');
                                            switch(DockingDefinition.value)
                                            {
                                                case 'ETrainDockingDefinition::TDD_LoadUnloadOnce':
                                                    html.push('One load/unload has been completed');
                                                    break;
                                                case 'ETrainDockingDefinition::TDD_FullyLoadUnload':
                                                    html.push('Freight Wagon is fully loaded/unloaded');
                                                    break;
                                                default:
                                                    html.push(DockingDefinition.value);
                                            }
                                        let IsDurationAndRule = this.baseLayout.getObjectProperty(trainStationRules, 'IsDurationAndRule');
                                            if(IsDurationAndRule === 1)
                                            {
                                                html.push(' <strong>AND</strong> ');
                                            }
                                            else
                                            {
                                                html.push(' <strong>OR</strong> ');
                                            }
                                        let DockForDuration = this.baseLayout.getObjectProperty(trainStationRules, 'DockForDuration');
                                            html.push('wait for ' + new Intl.NumberFormat(this.baseLayout.language).format(DockForDuration) + ' seconds.');


                                        let LoadFilterDescriptors = this.baseLayout.getObjectProperty(trainStationRules, 'LoadFilterDescriptors');
                                            if(LoadFilterDescriptors.values.length > 0)
                                            {
                                                let loadFilter = [];
                                                    for(let i = 0; i < LoadFilterDescriptors.values.length; i++)
                                                    {
                                                        let currentPathName = LoadFilterDescriptors.values[i].pathName;
                                                            if(currentPathName === '')
                                                            {
                                                                loadFilter.push('None');
                                                            }
                                                            else
                                                            {
                                                                let currentItem = this.baseLayout.getItemDataFromClassName(currentPathName);
                                                                    if(currentItem !== null)
                                                                    {
                                                                        loadFilter.push(currentItem.name);
                                                                    }
                                                                    else
                                                                    {
                                                                        loadFilter.push(currentPathName.split('.').pop());
                                                                    }
                                                            }
                                                    }

                                                    if(loadFilter.length > 0)
                                                    {
                                                        html.push('<br /><strong>Load Only:</strong> ' + loadFilter.join(', '));
                                                    }
                                            }
                                        let UnloadFilterDescriptors = this.baseLayout.getObjectProperty(trainStationRules, 'UnloadFilterDescriptors');
                                            if(UnloadFilterDescriptors.values.length > 0)
                                            {
                                                let unloadFilter = [];
                                                    for(let i = 0; i < UnloadFilterDescriptors.values.length; i++)
                                                    {
                                                        let currentPathName = UnloadFilterDescriptors.values[i].pathName;
                                                            if(currentPathName === '')
                                                            {
                                                                unloadFilter.push('None');
                                                            }
                                                            else
                                                            {
                                                                let currentItem = this.baseLayout.getItemDataFromClassName(currentPathName);
                                                                    if(currentItem !== null)
                                                                    {
                                                                        unloadFilter.push(currentItem.name);
                                                                    }
                                                                    else
                                                                    {
                                                                        unloadFilter.push(currentPathName.split('.').pop());
                                                                    }
                                                            }
                                                    }

                                                    if(unloadFilter.length > 0)
                                                    {
                                                        html.push('<br /><strong>Unload Only:</strong> ' + unloadFilter.join(', '));
                                                    }
                                            }

                                    html.push('</small></em>');
                                }
                            html.push('</td>');
                        html.push('</tr>');
                    }
                html.push('</table>');
            }

        return html.join('');
    }

    getTimeTableStationsPoints()
    {
        let points  = [];
        let mStops  = this.baseLayout.getObjectProperty(this.timeTable, 'mStops');
            if(mStops !== null)
            {
                for(let j = 0; j < mStops.values.length; j++)
                {
                    for(let k = 0; k < mStops.values[j].length; k++)
                    {
                        if(mStops.values[j][k].name === 'Station' && mStops.values[j][k].value.pathName !== undefined)
                        {
                            let trainStationIdentifier = this.baseLayout.saveGameParser.getTargetObject(mStops.values[j][k].value.pathName);
                                if(trainStationIdentifier !== null)
                                {
                                    let mStation = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStation');
                                        if(mStation !== null)
                                        {
                                            let currentStation = this.baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                                                if(currentStation !== null)
                                                {
                                                    points.push(currentStation.transform.translation);
                                                }
                                        }
                                }
                        }
                    }
                }
            }

        points.push(points[0]); // Close loop
        return points;
    }

    getTimeTableSplinePoints()
    {
        let points          = [];
        let startStation    = null;
        let prevStation     = null;

        let mStops          = this.baseLayout.getObjectProperty(this.timeTable, 'mStops');
            if(mStops !== null)
            {
                for(let j = 0; j < mStops.values.length; j++)
                {
                    for(let k = 0; k < mStops.values[j].length; k++)
                    {
                        if(mStops.values[j][k].name === 'Station' && mStops.values[j][k].value.pathName !== undefined)
                        {
                            let trainStationIdentifier = this.baseLayout.saveGameParser.getTargetObject(mStops.values[j][k].value.pathName);
                                if(trainStationIdentifier !== null)
                                {
                                    let mStation = this.baseLayout.getObjectProperty(trainStationIdentifier, 'mStation');
                                        if(mStation !== null)
                                        {
                                            let nextStation = this.baseLayout.saveGameParser.getTargetObject(mStation.pathName);
                                                if(nextStation !== null)
                                                {
                                                    if(prevStation !== null)
                                                    {
                                                        let stepPoints  = this.getPointsBetweenStations(prevStation, nextStation);
                                                            points      = points.concat(stepPoints);
                                                    }
                                                    else
                                                    {
                                                        startStation = nextStation;
                                                    }

                                                    prevStation = nextStation;
                                                }
                                        }
                                }
                        }
                    }
                }
            }

        // Close loop
        points = points.concat(this.getPointsBetweenStations(prevStation, startStation));
        //points.push(points[0]);

        return points;
    }

    /**
     * Find potential path from both tracks
     */
    getPointsBetweenStations(prevStation, nextStation)
    {
        let prevRailroadTrack = this.baseLayout.getObjectProperty(prevStation, 'mRailroadTrack');
        let nextRailroadTrack = this.baseLayout.getObjectProperty(nextStation, 'mRailroadTrack');

            if(prevRailroadTrack !== null && nextRailroadTrack !== null)
            {
                let startRailroadTrack  = this.baseLayout.saveGameParser.getTargetObject(prevRailroadTrack.pathName);
                let endRailroadTrack    = this.baseLayout.saveGameParser.getTargetObject(nextRailroadTrack.pathName);

                if(startRailroadTrack !== null && endRailroadTrack !== null)
                {
                        let availableEdges  = this.getRailroadGraphEdges(startRailroadTrack);
                        let graphNetwork    =   {};

                            for(let edgeKey in availableEdges)
                            {
                                let edges       = edgeKey.split('||');
                                let distance    = availableEdges[edgeKey];

                                    if(edges[1] !== startRailroadTrack.pathName)
                                    {
                                        if(graphNetwork[edges[0]] === undefined)
                                        {
                                            graphNetwork[edges[0]] = {};
                                        }
                                        graphNetwork[edges[0]][edges[1]] = distance;
                                    }
                            }

                        let shortestPath = this.findShortestPath(graphNetwork, startRailroadTrack, endRailroadTrack);
                            if(shortestPath.distance != Infinity)
                            {
                                let points          = [];
                                    for(let i = 0; i < shortestPath.path.length; i++)
                                    {
                                        let currentTrack = this.baseLayout.saveGameParser.getTargetObject(shortestPath.path[i]);
                                            if(currentTrack !== null)
                                            {
                                                let splineData = BaseLayout_Math.extractSplineData(this.baseLayout, currentTrack);
                                                    if(splineData !== null)
                                                    {
                                                        let splineDataPoints = [];
                                                            for(let j = 0; j < splineData.pointsCoordinates.length; j++)
                                                            {
                                                                splineDataPoints.push(splineData.pointsCoordinates[j]);
                                                            }

                                                            if(i > 0)
                                                            {
                                                                if(splineDataPoints[splineDataPoints.length - 1][0] === points[points.length - 1][0] && splineDataPoints[splineDataPoints.length - 1][1] === points[points.length - 1][1])
                                                                {
                                                                    splineDataPoints.reverse();
                                                                }
                                                            }

                                                            for(let j = 0; j < splineDataPoints.length; j++)
                                                            {
                                                                points.push(splineDataPoints[j]);
                                                            }
                                                    }
                                            }
                                    }
                                    if(points.length > 0)
                                    {
                                        return points;
                                    }
                            }
                }
            }

        return [];
    }

    getRailroadGraphEdges(startRailroadTrack, connectionType  = 'TrackConnection1', currentGraph = {}, alreadyChecked = [])
    {
        let currentRailroad = startRailroadTrack;
            while(alreadyChecked.includes(currentRailroad.pathName) === false)
            {
                let trackConnection = this.baseLayout.saveGameParser.getTargetObject(currentRailroad.pathName + '.' + connectionType);
                    if(trackConnection !== null)
                    {
                            alreadyChecked.push(currentRailroad.pathName);
                        let mConnectedComponents = this.baseLayout.getObjectProperty(trackConnection, 'mConnectedComponents');
                            if(mConnectedComponents !== null)
                            {
                                let haveNewComponent = false;
                                    // Loop components searching for a new path to follow
                                    for(let i = 0; i < mConnectedComponents.values.length; i++)
                                    {
                                        let splittedComponent   = mConnectedComponents.values[i].pathName.split('.');
                                            connectionType      = (splittedComponent.pop() === 'TrackConnection1') ? 'TrackConnection0' : 'TrackConnection1';
                                        let newRailwayPathName  = splittedComponent.join('.');
                                        let graphKey            = currentRailroad.pathName + '||' + newRailwayPathName

                                            // That railway isn't in the path yet!
                                            if(currentGraph[graphKey] === undefined && newRailwayPathName !== startRailroadTrack.pathName)
                                            {
                                                let newRailroad = this.baseLayout.saveGameParser.getTargetObject(newRailwayPathName);
                                                    if(newRailroad !== null)
                                                    {
                                                        // Add new graph distance!
                                                        let prevSplineData          = BaseLayout_Math.extractSplineData(this.baseLayout, currentRailroad);
                                                        let nextSplineData          = BaseLayout_Math.extractSplineData(this.baseLayout, newRailroad);
                                                            currentGraph[graphKey]  = (prevSplineData.distance / 2) + (nextSplineData.distance / 2);

                                                        // Follow the new track
                                                        currentGraph            = this.getRailroadGraphEdges(newRailroad, connectionType, currentGraph, alreadyChecked);
                                                        haveNewComponent        = true;
                                                    }
                                            }
                                    }

                                // No new component were found...
                                if(haveNewComponent === false)
                                {
                                    return currentGraph;
                                }
                            }
                    }
            }

        return currentGraph;
    }

    findShortestPath(graphNetwork, startRailroadTrack, endRailroadTrack)
    {
        graphNetwork[endRailroadTrack.pathName]     = {};

        // establish object for recording distances from the start node
	let distances                               = {};
            distances[endRailroadTrack.pathName]    = Infinity;
            distances                               = Object.assign(distances, graphNetwork[startRailroadTrack.pathName]);

	// track paths
	let parents = { endNode: null };
            for(let child in graphNetwork[startRailroadTrack.pathName])
            {
                parents[child] = startRailroadTrack.pathName;
            }

	// track nodes that have already been visited
	let visited = [];

	// find the nearest node
	let node = this.shortestDistanceNode(distances, visited);

	// for that node
	while(node)
        {
            // find its distance from the start node & its child nodes
            let distance = distances[node];
            let children = graphNetwork[node];
            // for each of those child nodes
            for (let child in children) {
                    // make sure each child node is not the start node
                    if (String(child) === String(startRailroadTrack.pathName)) {
                            continue;
                    } else {
                            // save the distance from the start node to the child node
                            let newdistance = distance + children[child];
                            // if there's no recorded distance from the start node to the child node in the distances object
                            // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
                            // save the distance to the object
                            // record the path
                            if (!distances[child] || distances[child] > newdistance) {
                                    distances[child] = newdistance;
                                    parents[child] = node;
                            }
                    }
            }
            // move the node to the visited set
            visited.push(node);
            // move to the nearest neighbor node
            node = this.shortestDistanceNode(distances, visited);
	}

	// using the stored paths from start node to end node
	// record the shortest path
	let shortestPath    = [endRailroadTrack.pathName];
	let parent          = parents[endRailroadTrack.pathName];
            while(parent)
            {
                shortestPath.push(parent);
                parent = parents[parent];
            }
	shortestPath.reverse();

	// return the shortest path from start node to end node & its distance
	let results = {
		distance: distances[endRailroadTrack.pathName],
		path: shortestPath,
	};

	return results;
    }

    shortestDistanceNode(distances, visited)
    {
	let shortest = null;
            for(let node in distances)
            {
                    let currentIsShortest = shortest === null || distances[node] < distances[shortest];
                        if(currentIsShortest && !visited.includes(node))
                        {
                            shortest = node;
                        }
            }

	return shortest;
    }
}
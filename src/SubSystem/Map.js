/* global Intl, Infinity */

import Building_MapMarker                       from '../Building/MapMarker.js';

export default class SubSystem_Map
{
    constructor(options)
    {
        this.baseLayout     = options.baseLayout;
        this.mapSubSystem   = this.baseLayout.saveGameParser.getTargetObject('Persistent_Level:PersistentLevel.MapManager');
        this.useFogOfWar    = this.baseLayout.useFogOfWar;

        this.baseLayout.setupSubLayer('playerFogOfWar');

        if(this.useFogOfWar === true)
        {
            this.addFogOfWar();
        }

        this.addMapMarkers();
    }

    getFogOfWar()
    {
        let mFogOfWarRawData = this.baseLayout.getObjectProperty(this.mapSubSystem, 'mFogOfWarRawData');
            if(mFogOfWarRawData !== null)
            {
                return mFogOfWarRawData.values;
            }

        return [];
    }

    getMapMarkers()
    {
        let mMapMarkers = this.baseLayout.getObjectProperty(this.mapSubSystem, 'mMapMarkers');
            if(mMapMarkers !== null)
            {
                return mMapMarkers.values;
            }

        return [];
    }

    addFogOfWar()
    {
            console.time('fogOfWar');
        let data = this.getFogOfWar();
            if(data.length > 0)
            {
                $.getJSON(this.baseLayout.staticUrl + '/img/depthMap' + this.baseLayout.useBuild + '.json', (depthMapData) => {
                    let polygonPositions    = [];
                    let dataIndex           = 0;

                    let maxRow              = 512;
                    let maxColumn           = 512;
                    let fogSize             = 750000 / 512;

                    let topLeft             = null;
                    let bottomLeft          = null;
                    let rowCenter           = 0;
                    let columnCenter        = 0;

                    for(let row = 0; row < maxRow; row++)
                    {
                        if(topLeft !== null && bottomLeft !== null)
                        {
                            polygonPositions.push([
                                topLeft,
                                this.baseLayout.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter - (fogSize / 2)]),
                                this.baseLayout.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter + (fogSize / 2)]),
                                bottomLeft
                            ]);

                            topLeft     = null;
                            bottomLeft  = null;
                        }

                        rowCenter   = (row * fogSize) + (fogSize / 2) + this.baseLayout.satisfactoryMap.mappingBoundNorth + this.baseLayout.satisfactoryMap.northOffset;

                        for(let column = 0; column < maxColumn; column++)
                        {
                            columnCenter    = (column * fogSize) + (fogSize / 2) + this.baseLayout.satisfactoryMap.mappingBoundWest + this.baseLayout.satisfactoryMap.westOffset;

                            //alpha = mSavedData[pixel].b >= mDepthMap[pixel] ? 255 : 0;
                            if(data[dataIndex] < depthMapData[dataIndex])
                            {
                                if(topLeft === null)
                                {
                                    topLeft = this.baseLayout.satisfactoryMap.unproject([columnCenter - (fogSize / 2), rowCenter - (fogSize / 2)]);
                                }
                                if(bottomLeft === null)
                                {
                                    bottomLeft = this.baseLayout.satisfactoryMap.unproject([columnCenter - (fogSize / 2), rowCenter + (fogSize / 2)]);
                                }
                            }
                            else
                            {
                                if(topLeft !== null && bottomLeft !== null)
                                {
                                    polygonPositions.push([
                                        topLeft,
                                        this.baseLayout.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter - (fogSize / 2)]),
                                        this.baseLayout.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter + (fogSize / 2)]),
                                        bottomLeft
                                    ]);

                                    topLeft         = null;
                                    bottomLeft      = null;
                                }
                            }

                            dataIndex++;
                        }
                    }

                    let fogOfWarPolygon = L.polygon(polygonPositions, {
                            smoothFactor    : 0,
                            fillColor       : '#000000',
                            fillOpacity     : 1,
                            weight          : 0,
                            interactive     : false,
                            renderer        : this.baseLayout.playerLayers.playerFogOfWar.renderer
                        });

                    this.baseLayout.playerLayers.playerFogOfWar.elements.push(fogOfWarPolygon);
                    fogOfWarPolygon.addTo(this.baseLayout.playerLayers.playerFogOfWar.subLayer);

                    console.timeEnd('fogOfWar');
                });
            }
    }

    resetFogOfWar()
    {
        if(this.useFogOfWar === true)
        {
            let data = this.getFogOfWar();
                if(data.length > 0)
                {
                    let dataLength = data.length;

                    // Update fog
                    for(let i = 0; i < dataLength; i++)
                    {
                        data[i] = 0;
                    }

                    // Delete old polygons
                    for(let i = 0; i < this.baseLayout.playerLayers.playerFogOfWar.elements.length; i++)
                    {
                        this.baseLayout.playerLayers.playerFogOfWar.subLayer.removeLayer(this.baseLayout.playerLayers.playerFogOfWar.elements[i]);
                    }
                    this.baseLayout.playerLayers.playerFogOfWar.elements = [];

                    // Refresh
                    this.addFogOfWar();
                }
        }
    }

    clearFogOfWar()
    {
        if(this.useFogOfWar === true)
        {
            let data = this.getFogOfWar();
                if(data.length > 0)
                {
                    let dataLength = data.length;

                    // Update fog
                    for(let i = 0; i < dataLength; i++)
                    {
                        data[i] = 255;
                    }

                    // Delete old polygons
                    for(let i = 0; i < this.baseLayout.playerLayers.playerFogOfWar.elements.length; i++)
                    {
                        this.baseLayout.playerLayers.playerFogOfWar.subLayer.removeLayer(this.baseLayout.playerLayers.playerFogOfWar.elements[i]);
                    }
                    this.baseLayout.playerLayers.playerFogOfWar.elements = [];
                }
        }
    }



    addMapMarkers()
    {
        let mapMarkers = this.getMapMarkers();
            for(let i = 0; i < mapMarkers.length; i++)
            {
                Building_MapMarker.add(this.baseLayout, mapMarkers[i]);
            }
    }



    getMinimap(splineData, iconsData = null)
    {
        if(splineData !== null && iconsData === null)
        {
            iconsData = splineData;
        }

        let html                = [];
        let containerSize       = 512;
        let minimapSize         = 2048;
        let minimapRatio        = 1;

        let westEastLength      = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundEast - this.baseLayout.satisfactoryMap.mappingBoundWest) - (this.baseLayout.satisfactoryMap.westOffset * 2);
        let northSouthLength    = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundSouth - this.baseLayout.satisfactoryMap.mappingBoundNorth) - (this.baseLayout.satisfactoryMap.northOffset * 2);

            // Calculate minimap boundaries
            let boundaries = {
                    xMin: this.baseLayout.satisfactoryMap.mappingBoundWest,
                    xMax: this.baseLayout.satisfactoryMap.mappingBoundEast,

                    yMin: this.baseLayout.satisfactoryMap.mappingBoundNorth,
                    yMax: this.baseLayout.satisfactoryMap.mappingBoundSouth
                };

            if(splineData !== null)
            {
                boundaries = {xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity};
                for(let i = 0; i < (splineData.length - 1); i++)
                {
                    boundaries.xMin = Math.min(boundaries.xMin, splineData[i][0]);
                    boundaries.xMax = Math.max(boundaries.xMax, splineData[i][0]);
                    boundaries.yMin = Math.min(boundaries.yMin, splineData[i][1]);
                    boundaries.yMax = Math.max(boundaries.yMax, splineData[i][1]);
                }

                // Add padding to boundaries
                let xPadding            = (boundaries.xMax - boundaries.xMin) * 0.2;
                let yPadding            = (boundaries.yMax - boundaries.yMin) * 0.2;
                    boundaries.xMin    -= xPadding;
                    boundaries.xMax    += xPadding;
                    boundaries.yMin    -= yPadding;
                    boundaries.yMax    += yPadding;

                // Ensure a square boundaries map
                let xLength     = (boundaries.xMax - boundaries.xMin);
                let yLength     = (boundaries.yMax - boundaries.yMin);
                let maxLength   = Math.max(xLength, yLength);
                    if(xLength < maxLength)
                    {
                        boundaries.xMin    -= (maxLength - xLength) / 2;
                        boundaries.xMax    += (maxLength - xLength) / 2;
                    }
                    if(yLength < maxLength)
                    {
                        boundaries.yMin    -= (maxLength - yLength) / 2;
                        boundaries.yMax    += (maxLength - yLength) / 2;
                    }

                // Calculate lowest ratio
                let xRatio          = Math.abs(maxLength) / westEastLength;
                let yRatio          = Math.abs(maxLength) / northSouthLength;
                    minimapRatio    = Math.min(minimapRatio, xRatio, yRatio) * (minimapSize / containerSize);
            }

            let backgroundSize      = (minimapSize * (1 / minimapRatio));
            let xBoundariesOffset   = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundWest + this.baseLayout.satisfactoryMap.westOffset) + boundaries.xMin;
            let yBoundariesOffset   = Math.abs(this.baseLayout.satisfactoryMap.mappingBoundNorth + this.baseLayout.satisfactoryMap.northOffset) + boundaries.yMin;

            let xMiniMapOffset      = (xBoundariesOffset / westEastLength * backgroundSize);
            let yMiniMapOffset      = (yBoundariesOffset / northSouthLength * backgroundSize);

            let backgroundProperties = [];
                backgroundProperties.push('position: relative;');
                backgroundProperties.push('width: ' + containerSize + 'px;');
                backgroundProperties.push('height: ' + containerSize + 'px;');
                backgroundProperties.push('background: url(' + this.baseLayout.staticUrl + '/js/InteractiveMap/img/backgroundGame_2048.jpg?v=' + this.baseLayout.scriptVersion + ') no-repeat #7b7b7b;');
                backgroundProperties.push('background-size: ' + backgroundSize + 'px;');
                backgroundProperties.push('background-origin: border-box;');
                backgroundProperties.push('background-position-x: -' + xMiniMapOffset + 'px;');
                backgroundProperties.push('background-position-y: -' + yMiniMapOffset + 'px;');

            html.push('<div class="img-minimap border border-secondary rounded" style="' + backgroundProperties.join('') + '">');

            // Generate lines SVG
            if(splineData !== null)
            {
                let points = [];
                    for(let i = 0; i < splineData.length; i++)
                    {
                        let x               = ((Math.abs(this.baseLayout.satisfactoryMap.mappingBoundWest + this.baseLayout.satisfactoryMap.westOffset) + splineData[i][0]) / westEastLength * backgroundSize) - xMiniMapOffset;
                        let y               = ((Math.abs(this.baseLayout.satisfactoryMap.mappingBoundNorth + this.baseLayout.satisfactoryMap.northOffset) + splineData[i][1]) / northSouthLength * backgroundSize) - yMiniMapOffset;
                            points.push(x + ',' + y);
                    }

                html.push('<svg viewBox="0 0 ' + containerSize + ' ' + containerSize + '" xmlns="http://www.w3.org/2000/svg" style="position: absolute;"><polyline points="' + points.join(' ') + '" stroke="#FFC0CB" stroke-width="2" fill="none" /></svg>');
            }

            // Generate icons
            if(iconsData !== null)
            {
                for(let i = 0; i < (iconsData.length - 1); i++)
                {
                    let x           = ((Math.abs(this.baseLayout.satisfactoryMap.mappingBoundWest + this.baseLayout.satisfactoryMap.westOffset) + iconsData[i][0]) / westEastLength * backgroundSize) - xMiniMapOffset;
                    let y           = ((Math.abs(this.baseLayout.satisfactoryMap.mappingBoundNorth + this.baseLayout.satisfactoryMap.northOffset) + iconsData[i][1]) / northSouthLength * backgroundSize) - yMiniMapOffset;

                    let iconSize    = 20;
                    let style       = 'text-align: center;border: 2px solid #777777;line-height:' + (iconSize - 4) + 'px;border-radius: 4px;font-size: 12px;z-index: 1;';

                    html.push('<span data-stop="' + i + '" style="position: absolute;margin-top: ' + (y - (iconSize / 2)) + 'px;margin-left: ' + (x - (iconSize / 2)) + 'px;width: ' + iconSize + 'px;height:' + iconSize + 'px;' + style + '" class="bg-warning">');
                    html.push(new Intl.NumberFormat(this.baseLayout.language).format(i + 1));
                    html.push('</span>');
                }
            }

            html.push('</div>');


        return html.join('');
    }
}
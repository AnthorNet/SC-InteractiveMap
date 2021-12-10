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

    addFogOfWar()
    {
            console.time('fogOfWar');
        let data = this.getFogOfWar();
            if(data.length > 0)
            {
                $.getJSON(this.baseLayout.staticUrl + '/img/depthMap' + this.baseLayout.useBuild + '.json', function(depthMapData){
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
                                this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter - (fogSize / 2)]),
                                this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter + (fogSize / 2)]),
                                bottomLeft
                            ]);

                            topLeft     = null;
                            bottomLeft  = null;
                        }

                        rowCenter   = (row * fogSize) + (fogSize / 2) + this.satisfactoryMap.mappingBoundNorth + this.satisfactoryMap.northOffset;

                        for(let column = 0; column < maxColumn; column++)
                        {
                            columnCenter    = (column * fogSize) + (fogSize / 2) + this.satisfactoryMap.mappingBoundWest + this.satisfactoryMap.westOffset;

                            //alpha = mSavedData[pixel].b >= mDepthMap[pixel] ? 255 : 0;
                            if(data[dataIndex] < depthMapData[dataIndex])
                            {
                                if(topLeft === null)
                                {
                                    topLeft = this.satisfactoryMap.unproject([columnCenter - (fogSize / 2), rowCenter - (fogSize / 2)]);
                                }
                                if(bottomLeft === null)
                                {
                                    bottomLeft = this.satisfactoryMap.unproject([columnCenter - (fogSize / 2), rowCenter + (fogSize / 2)]);
                                }
                            }
                            else
                            {
                                if(topLeft !== null && bottomLeft !== null)
                                {
                                    polygonPositions.push([
                                        topLeft,
                                        this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter - (fogSize / 2)]),
                                        this.satisfactoryMap.unproject([columnCenter + (fogSize / 2), rowCenter + (fogSize / 2)]),
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
                            smoothFactor: 0,
                            fillColor: '#000000',
                            fillOpacity: 1,
                            weight: 0,
                            interactive: false,
                            renderer: this.playerLayers.playerFogOfWar.renderer
                        });

                    this.playerLayers.playerFogOfWar.elements.push(fogOfWarPolygon);
                    fogOfWarPolygon.addTo(this.playerLayers.playerFogOfWar.subLayer);

                    console.timeEnd('fogOfWar');
                }.bind(this.baseLayout));
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
}
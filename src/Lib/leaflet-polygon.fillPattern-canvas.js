/**
 *  Extend the Polygon Object to set an image to fill the path in canvas

 *  Author: bgx1012@163.com
 *
 *  <div id="map"></div>
 *  <img id="lamp" style="display:none;" src="./fill.gif">

var map = L.map("map", {
  preferCanvas: true,
}).setView([23.7, 121], 8);

var poly1 = [
  [24, 121],
  [24.5, 121],
  [25.5, 121],
  [25.5, 124],
  [24.5, 121.9],
  [24, 121.9],
];
L.polygon(poly1, { imgId: "lamp" }).addTo(map);
 */

(function (window, document, undefined) {
    if (L.Canvas) {
        L.Canvas.include({
            _fillStroke: function (ctx, layer) {

                var options = layer.options

                if (options.fill) {
                    ctx.globalAlpha = options.fillOpacity
                    ctx.fillStyle = options.fillColor || options.color

                    ctx.fill(options.fillRule || 'evenodd')
                }

                if (options.stroke && options.weight !== 0) {
                    if (ctx.setLineDash) {
                        ctx.setLineDash(layer.options && layer.options._dashArray || [])
                    }

                    ctx.globalAlpha = options.opacity
                    ctx.lineWidth = options.weight
                    ctx.strokeStyle = options.color
                    ctx.lineCap = options.lineCap
                    ctx.lineJoin = options.lineJoin
                    ctx.stroke()
                    if (options.imgId) {

                        var img = document.getElementById(options.imgId)
                        ctx.save() // so we can remove the clipping
                        ctx.clip()
                        var bounds = layer._rawPxBounds
                        var size = bounds.getSize()
                        var pattern = ctx.createPattern(img, 'repeat')
                        ctx.fillStyle = pattern
                        ctx.fillRect(bounds.min.x, bounds.min.y, size.x, size.y)
                        ctx.restore()
                    }
                }
            }
        })
    }
}(this, document))


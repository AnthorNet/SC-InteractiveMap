#target photoshop

// Save the current unit preferences (optional)
var startRulerUnits = app.preferences.rulerUnits
var startTypeUnits = app.preferences.typeUnits



// Set units to PIXELS
app.preferences.rulerUnits = Units.PIXELS
app.preferences.typeUnits = TypeUnits.PIXELS

// Use the top-most document
var doc = app.activeDocument;

// Turn the selection into a work path and give it reference
    doc.selection.makeWorkPath(0);
var wPath = doc.pathItems['Tracé de travail'];

// This will be a string with the final output coordinates
var coords = [];

// Loop through all path points and add their anchor coordinates to the output text
for (var i=0; i<wPath.subPathItems[0].pathPoints.length; i++) {
        coords.push(wPath.subPathItems[0].pathPoints[i].anchor);
}


// Write coords to textfile on the desktop. Thanks krasatos
var f = File( '~/Desktop/coords.txt' );
f.open( 'w' );
f.write( '[' + coords.join('],[') + ']' );
f.close();
export default class BaseLayout_Math
{
    static get PI(){ return 3.1415926535897932; }
    static get halfPI(){ return 1.57079632679; }
    static get eulerPrecision(){ return 10000; }

    static getDistance(point1, point2)
    {
        let x1 = (point1.x !== undefined) ? point1.x : point1[0];
        let y1 = (point1.y !== undefined) ? point1.y : point1[1];
        let z1 = (point1.z !== undefined) ? point1.z : point1[2];

        let x2 = (point2.x !== undefined) ? point2.x : point2[0];
        let y2 = (point2.y !== undefined) ? point2.y : point2[1];
        let z2 = (point2.z !== undefined) ? point2.z : point2[2];

        return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)) + ((z1 - z2) * (z1 - z2)));
    }

    // See: https://github.com/EpicGames/UnrealEngine/blob/4.26/Engine/Source/Runtime/Core/Private/Math/UnrealMath.cpp#L598
    static getUnrealQuaternionToEuler(quaternion)
    {
            quaternion              = {x: quaternion[0], y: quaternion[1], z: quaternion[2], w: quaternion[3]};
        let rotatorFromQuat         = {};
        let radToDeg                = 180 / BaseLayout_Math.PI;

        let singularityThreshold    = 0.4999995;
        let singularityTest         = (quaternion.z * quaternion.x) - (quaternion.w * quaternion.y);

	let yawY                    = 2 * ((quaternion.w * quaternion.z) + (quaternion.x * quaternion.y));
	let yawX                    = 1 - (2 * ((quaternion.y * quaternion.y) + (quaternion.z * quaternion.z)));
            rotatorFromQuat.yaw     = Math.atan2(yawY, yawX) * radToDeg;

	if(singularityTest < -singularityThreshold)
	{
            rotatorFromQuat.pitch       = -90;
            rotatorFromQuat.roll        = BaseLayout_Math.normalizeEulerAxis(-rotatorFromQuat.yaw - (2 * Math.atan2(quaternion.x, quaternion.w) * radToDeg));
	}
	else
        {
            if(singularityTest > singularityThreshold)
            {
                rotatorFromQuat.pitch   = 90;
                rotatorFromQuat.roll    = BaseLayout_Math.normalizeEulerAxis(rotatorFromQuat.yaw - (2 * Math.atan2(quaternion.x, quaternion.w) * radToDeg));
            }
            else
            {
                rotatorFromQuat.pitch   = Math.asin(2 * singularityTest) * radToDeg;
                rotatorFromQuat.roll    = Math.atan2(-2 * ((quaternion.w * quaternion.x) + (quaternion.y * quaternion.z)), (1 - 2 * (Math.pow(quaternion.x, 2) + Math.pow(quaternion.y, 2)))) * radToDeg;
            }
        }

        rotatorFromQuat.yaw             = Math.round(rotatorFromQuat.yaw * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision;
        rotatorFromQuat.pitch           = Math.round(rotatorFromQuat.pitch * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision;
        rotatorFromQuat.roll            = Math.round(rotatorFromQuat.roll * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision;

        return rotatorFromQuat;
    }

    static getQuaternionToEuler(quaternion, debug = false)
    {
        /*
        if(debug === true)
        {
            let angles = {};
            var qw = parseFloat(quaternion[0]);
            var qx = parseFloat(quaternion[1]);
            var qy = parseFloat(quaternion[2]);
            var qz = parseFloat(quaternion[3]);
            var qw2 = qw*qw;
            var qx2 = qx*qx;
            var qy2 = qy*qy;
            var qz2 = qz*qz;
            var test= qx*qy + qz*qw;
            if (test > 0.499) {
              angles.yaw = 360/Math.PI*Math.atan2(qx,qw);
              angles.pitch = 90;
              angles.roll = 0;
              return;
            }
            else
            {
                if (test < -0.499) {
                  angles.yaw = -360/Math.PI*Math.atan2(qx,qw);
                  angles.pitch = -90;
                  angles.roll = 0;
                }
                else
                {
                    var h = Math.atan2(2*qy*qw-2*qx*qz,1-2*qy2-2*qz2);
                    var a = Math.asin(2*qx*qy+2*qz*qw);
                    var b = Math.atan2(2*qx*qw-2*qy*qz,1-2*qx2-2*qz2);
                    angles.yaw = h*180/Math.PI;
                    angles.pitch = a*180/Math.PI;
                    angles.roll = b*180/Math.PI;
                }
            }

            console.log(quaternion, angles, BaseLayout_Math.getUnrealQuaternionToEuler(quaternion))
        }
        */
        return BaseLayout_Math.getUnrealQuaternionToEuler(quaternion);
    }

    // See: https://github.com/EpicGames/UnrealEngine/blob/4.26/Engine/Source/Runtime/Core/Private/Math/UnrealMath.cpp#L460
    static getEulerToQuaternion(angle)
    {
            angle.pitch     = Math.round(angle.pitch * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision;
            angle.yaw       = Math.round(angle.yaw * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision;
            angle.roll      = Math.round(angle.roll * BaseLayout_Math.eulerPrecision) / BaseLayout_Math.eulerPrecision;

        let degToRad        = BaseLayout_Math.PI / 180;
        let radBy2          = degToRad / 2;

	let pitchNoWinding  = angle.pitch % 360;
	let yawNoWinding    = angle.yaw % 360;
	let rollNoWinding   = angle.roll % 360;

        let cosPitch        = BaseLayout_Math.scalarCos(pitchNoWinding * radBy2);
        let sinPitch        = BaseLayout_Math.scalarSin(pitchNoWinding * radBy2);
	let cosYaw          = BaseLayout_Math.scalarCos(yawNoWinding * radBy2);
        let sinYaw          = BaseLayout_Math.scalarSin(yawNoWinding * radBy2);
	let cosRoll         = BaseLayout_Math.scalarCos(rollNoWinding * radBy2);
        let sinRoll         = BaseLayout_Math.scalarSin(rollNoWinding * radBy2);

	return [
             cosRoll * sinPitch * sinYaw - sinRoll * cosPitch * cosYaw, // X
            -cosRoll * sinPitch * cosYaw - sinRoll * cosPitch * sinYaw, // Y
             cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw, // Z
             cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw  // W
        ];
    }

    static getNewQuaternionRotate(quaternion, angle)
    {
        let eulerAngle      = BaseLayout_Math.getQuaternionToEuler(quaternion);
            eulerAngle.yaw  = BaseLayout_Math.clampEulerAxis(eulerAngle.yaw + angle);

        return BaseLayout_Math.getEulerToQuaternion(eulerAngle);
    }

    static getPointRotation(position, center, rotation, useOnly2D = false)
    {
        let eulerAngle  = BaseLayout_Math.getQuaternionToEuler(rotation);
        let degToRad    = BaseLayout_Math.PI / 180;
        let cosYaw      = Math.cos(eulerAngle.yaw * degToRad);
        let sinYaw      = Math.sin(eulerAngle.yaw * degToRad);

        if(useOnly2D === true)
        {
            return [
                center[0] + (cosYaw * (position[0] - center[0])) - (sinYaw * (position[1] - center[1])),
                center[1] + (sinYaw * (position[0] - center[0])) + (cosYaw * (position[1] - center[1]))
            ];
        }

        // Constraint PITCH/ROLL to avoid too malformed polygons
        if(Math.round(BaseLayout_Math.clampEulerAxis(eulerAngle.pitch)) > 60 && Math.round(BaseLayout_Math.clampEulerAxis(eulerAngle.pitch)) < 90)
        {
            eulerAngle.pitch = 60;
        }
        if(Math.round(BaseLayout_Math.clampEulerAxis(eulerAngle.pitch)) >= 90 && Math.round(BaseLayout_Math.clampEulerAxis(eulerAngle.pitch)) < 120)
        {
            eulerAngle.pitch = 120;
        }
        if(Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) > 60 && Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) < 90)
        {
            eulerAngle.roll = 60;
        }
        if(Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) >= 90 && Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) < 120)
        {
            eulerAngle.roll = 120;
        }
        if(Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) > -60 && Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) < -90)
        {
            eulerAngle.roll = -60;
        }
        if(Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) >= -90 && Math.round(BaseLayout_Math.normalizeEulerAxis(eulerAngle.roll)) < -120)
        {
            eulerAngle.roll = -120;
        }

        // Calculation
        let cosPitch    = Math.cos(eulerAngle.pitch * degToRad);
        let sinPitch    = Math.sin(eulerAngle.pitch * degToRad);

        let cosRoll     = Math.cos(eulerAngle.roll * degToRad);
        let sinRoll     = Math.sin(eulerAngle.roll * degToRad);

        let Axx         = cosYaw * cosPitch;
        let Axy         = (cosYaw * sinPitch * sinRoll) - (sinYaw * cosRoll);

        let Ayx         = sinYaw * cosPitch;
        let Ayy         = (sinYaw * sinPitch * sinRoll) + (cosYaw * cosRoll);

        return [
            center[0] + (Axx * (position[0] - center[0])) + (Axy * (position[1] - center[1])),
            center[1] + (Ayx * (position[0] - center[0])) + (Ayy * (position[1] - center[1]))
        ];
    }


    // See: https://github.com/EpicGames/UnrealEngine/blob/4.26/Engine/Source/Runtime/Core/Public/Math/Rotator.h#L603
    static clampEulerAxis(angle)
    {
        angle = angle % 360;

	if(angle < 0)
	{
            // shift to [0,360) range
            angle += 360;
	}

	return angle;
    }

    // See: https://github.com/EpicGames/UnrealEngine/blob/4.26/Engine/Source/Runtime/Core/Public/Math/Rotator.h#L618
    static normalizeEulerAxis(angle)
    {
        angle = BaseLayout_Math.clampEulerAxis(angle);

	if(angle > 180)
	{
            // shift to (-180,180]
            angle -= 360;
	}

        return angle;
    }

    // See: https://github.com/EpicGames/UnrealEngine/blob/4.26/Engine/Source/Runtime/Core/Public/Math/UnrealMathUtility.h#L486
    static scalarCos(value)
    {
        // Map Value to y in [-pi,pi], x = 2*pi*quotient + remainder.
        let quotient = (0.31830988618 * 0.5) * value;
            if(value >= 0)
            {
                quotient = parseInt(quotient + 0.5);
            }
            else
            {
                quotient = parseInt(quotient - 0.5);
            }

        let y       = value - (2 * BaseLayout_Math.PI) * quotient;
        let sign    = 1;

        // Map y to [-pi/2,pi/2] with sin(y) = sin(Value).
        if(y > BaseLayout_Math.halfPI)
        {
            y           = BaseLayout_Math.PI - y;
            sign        = -1;
        }
        else
        {
            if(y < -BaseLayout_Math.halfPI)
            {
                y       = -BaseLayout_Math.PI - y;
                sign    = -1;
            }
        }

        let y2  = y * y;

        // 10-degree minimax approximation
        let  p  = ( ( ( ( -2.6051615e-07 * y2 + 2.4760495e-05 ) * y2 - 0.0013888378 ) * y2 + 0.041666638 ) * y2 - 0.5 ) * y2 + 1;

        return sign * p;
    }
    static scalarSin(value)
    {
        // Map Value to y in [-pi,pi], x = 2*pi*quotient + remainder.
        let quotient = (0.31830988618 * 0.5) * value;
            if(value >= 0)
            {
                //quotient = (float)((int)(quotient + 0.5f));
                quotient = parseInt(quotient + 0.5);
            }
            else
            {
                //quotient = (float)((int)(quotient - 0.5f));
                quotient = parseInt(quotient - 0.5);
            }

        let y       = value - (2 * BaseLayout_Math.PI) * quotient;

        // Map y to [-pi/2,pi/2] with sin(y) = sin(Value).
        if(y > BaseLayout_Math.halfPI)
        {
            y       = BaseLayout_Math.PI - y;
        }
        else
        {
            if(y < -BaseLayout_Math.halfPI)
            {
                y   = -BaseLayout_Math.PI - y;
            }
        }

        let y2  = y * y;

        // 11-degree minimax approximation
        return ( ( ( ( (-2.3889859e-08 * y2 + 2.7525562e-06) * y2 - 0.00019840874 ) * y2 + 0.0083333310 ) * y2 - 0.16666667 ) * y2 + 1 ) * y;
    }

    // See: https://www.nayuki.io/page/srgb-transform-library
    static RGBToLinearColor(x)
    {
        x /= 255.0;

        if(x <= 0) { return 0; }
        if(x >= 1) { return 1; }
        if(x < 0.04045) { return x / 12.92; }

        return Math.pow((x + 0.055) / 1.055, 2.4);
    }

    static linearColorToRGB(x)
    {
        if(BaseLayout_Math.colorTable === undefined)
        {
            BaseLayout_Math.colorTable = [];
            for(let i = 0; i <= 255; i++)
            {
                BaseLayout_Math.colorTable.push(BaseLayout_Math.RGBToLinearColor(i));
            }
        }

        if(x <= 0) { return 0; }
        if(x >= 1) { return 255; }

        let y = 0;
            for(let i = BaseLayout_Math.colorTable.length >>> 1; i !== 0; i >>>= 1)
            {
                if(BaseLayout_Math.colorTable[y | i] <= x)
                {
                    y |= i;
                }
            }

        if((x - BaseLayout_Math.colorTable[y]) <= (BaseLayout_Math.colorTable[y + 1] - x))
        {
            return y;
        }

        return y + 1;
    }

    static extractSplineData(baseLayout, currentObject)
    {
        let nbPoints            = 5;
        let splineDistance      = 0;
        let pointsCoordinates   = [];
        let points              = [];

        let mSplineData         = baseLayout.getObjectProperty(currentObject, 'mSplineData');
            if(mSplineData !== null)
            {
                if(currentObject.className.includes('Train/Track/Build_RailroadTrack'))
                {
                    nbPoints = 25;
                }

                let splineDataLength            = mSplineData.values.length;
                let previousSplineLocation      = null;
                let previousSplineLeaveTangent  = null;
                let oldPoint                    = null;
                let originalSplineData          = [];

                for(let i = 0; i < mSplineData.values.length; i++)
                {
                    let currentSpline               = mSplineData.values[i];
                    let currentSplineLocation       = null;
                    let currentSplineArriveTangent  = null;
                    let currentSplineLeaveTangent   = null;

                        for(let j = 0; j < currentSpline.length; j++)
                        {
                            if(currentSpline[j].name === 'Location')
                            {
                                currentSplineLocation = currentSpline[j].value.values;
                                originalSplineData.push(currentSplineLocation);
                            }
                            if(currentSpline[j].name === 'ArriveTangent')
                            {
                                currentSplineArriveTangent = currentSpline[j].value.values;
                            }
                            if(currentSpline[j].name === 'LeaveTangent')
                            {
                                currentSplineLeaveTangent = currentSpline[j].value.values;
                            }
                        }

                        if(previousSplineLocation !== null && previousSplineLeaveTangent !== null && currentSplineLocation !== null && currentSplineArriveTangent !== null)
                        {
                            for(let k = 0; k < nbPoints; k++)
                            {
                                let t           = k / (nbPoints - 1),
                                    mt          = 1 - t,
                                    mt2         = mt * mt,
                                    t2          = t * t,
                                    a           = mt2 * mt,
                                    b           = mt2 * t * 3,
                                    c           = mt * t2 * 3,
                                    d           = t * t2,
                                    newPoint    = {
                                        x: a * previousSplineLocation.x + b * (previousSplineLocation.x + previousSplineLeaveTangent.x / 3) + c * (currentSplineLocation.x - currentSplineArriveTangent.x / 3) + d * currentSplineLocation.x,
                                        y: a * previousSplineLocation.y + b * (previousSplineLocation.y + previousSplineLeaveTangent.y / 3) + c * (currentSplineLocation.y - currentSplineArriveTangent.y / 3) + d * currentSplineLocation.y,
                                        z: a * previousSplineLocation.z + b * (previousSplineLocation.z + previousSplineLeaveTangent.z / 3) + c * (currentSplineLocation.z - currentSplineArriveTangent.z / 3) + d * currentSplineLocation.z
                                    };

                                    pointsCoordinates.push([
                                        currentObject.transform.translation[0] + newPoint.x,
                                        currentObject.transform.translation[1] + newPoint.y,
                                        currentObject.transform.translation[2] + newPoint.z
                                    ]);

                                    points.push(baseLayout.satisfactoryMap.unproject([
                                        currentObject.transform.translation[0] + newPoint.x,
                                        currentObject.transform.translation[1] + newPoint.y
                                    ]));

                                    if(oldPoint !== null)
                                    {
                                        splineDistance += BaseLayout_Math.getDistance(newPoint, oldPoint) / 100;
                                    }

                                    oldPoint = newPoint;
                            }
                        }

                        if(currentSplineLocation !== null && currentSplineLeaveTangent !== null)
                        {
                            previousSplineLocation      = currentSplineLocation;
                            previousSplineLeaveTangent  = currentSplineLeaveTangent;
                        }
                }

                // Straight distance is used on pipe volume calculation
                let distanceStraight    = BaseLayout_Math.getDistance(originalSplineData[splineDataLength - 1], originalSplineData[0]) / 100;

                return {
                    distance            : splineDistance,
                    distanceStraight    : distanceStraight,
                    points              : points,
                    pointsCoordinates   : pointsCoordinates,
                    originalData        : originalSplineData
                };
            }

        return null;
    }

    static isPointInsideSelection(baseLayout, selection, x, y)
    {
        let point = baseLayout.satisfactoryMap.unproject([x, y]);

            if(selection instanceof L.Circle)
            {
                let pointDistance   = baseLayout.satisfactoryMap.leafletMap.distance([point.lat, point.lng], selection.getLatLng());
                    if(pointDistance <= selection.getRadius())
                    {
                        return true;
                    }

                return false;
            }
            else
            {
                let polyPoints  = selection.getLatLngs()[0];
                let x           = point.lat, y = point.lng;

                let inside = false;
                    for(let i = 0, j = (polyPoints.length - 1); i < polyPoints.length; j = i++)
                    {
                        let xi = polyPoints[i].lat, yi = polyPoints[i].lng;
                        let xj = polyPoints[j].lat, yj = polyPoints[j].lng;

                        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                            if(intersect) inside = !inside;
                    }

                return inside;
            }
    }
}
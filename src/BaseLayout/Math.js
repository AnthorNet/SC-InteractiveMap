export default class BaseLayout_Math
{
    // See: https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/Core/Private/Math/UnrealMath.cpp#L595
    static getQuaternionToEuler(quaternion)
    {
            quaternion              = {x: quaternion[0], y: quaternion[1], z: quaternion[2], w: quaternion[3]};
        let rotatorFromQuat         = {};

        let singularityThreshold    = 0.4999995;
        let singularityTest         = (quaternion.z * quaternion.x) - (quaternion.w * quaternion.y);

	let yawY                    = 2 * ((quaternion.w * quaternion.z) + (quaternion.x * quaternion.y));
	let yawX                    = (1 - 2 * (Math.pow(quaternion.y, 2) + Math.pow(quaternion.z, 2)));

	let radToDeg                = 180 / Math.PI;

	if(singularityTest < -singularityThreshold)
	{
		rotatorFromQuat.pitch   = -90;
		rotatorFromQuat.yaw     = Math.atan2(yawY, yawX) * radToDeg;
		rotatorFromQuat.roll    = this.normalizeEulerAxis(-rotatorFromQuat.yaw - (2 * Math.atan2(quaternion.x, quaternion.w) * radToDeg));
	}
	else
        {
            if(singularityTest > singularityThreshold)
            {
                    rotatorFromQuat.pitch   = 90;
                    rotatorFromQuat.yaw     = Math.atan2(yawY, yawX) * radToDeg;
                    rotatorFromQuat.roll    = this.normalizeEulerAxis(rotatorFromQuat.yaw - (2 * Math.atan2(quaternion.x, quaternion.w) * radToDeg));
            }
            else
            {
                    rotatorFromQuat.pitch   = Math.asin(2 * singularityTest) * radToDeg;
                    rotatorFromQuat.yaw     = Math.atan2(yawY, yawX) * radToDeg;
                    rotatorFromQuat.roll    = Math.atan2(-2 * ((quaternion.w * quaternion.x) + (quaternion.y * quaternion.z)), (1 - 2 * (Math.pow(quaternion.x, 2) + Math.pow(quaternion.y, 2)))) * radToDeg;
            }
        }

        return rotatorFromQuat;
    }

    // See: https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/Core/Private/Math/UnrealMath.cpp#L457
    static getEulerToQuaternion(angle)
    {
        let degToRad        = Math.PI / 180;
        let radBy2          = degToRad / 2;

	let pitchNoWinding  = angle.pitch % 360;
	let yawNoWinding    = angle.yaw % 360;
	let rollNoWinding   = angle.roll % 360;

        let cosPitch        = this.scalarCos(pitchNoWinding * radBy2);
        let sinPitch        = this.scalarSin(pitchNoWinding * radBy2);
	let cosYaw          = this.scalarCos(yawNoWinding * radBy2);
        let sinYaw          = this.scalarSin(yawNoWinding * radBy2);
	let cosRoll         = this.scalarCos(rollNoWinding * radBy2);
        let sinRoll         = this.scalarSin(rollNoWinding * radBy2);

	let rotationQuat    = [
                 (cosRoll * sinPitch * sinYaw) - (sinRoll * cosPitch * cosYaw), // X
                (-cosRoll * sinPitch * cosYaw) - (sinRoll * cosPitch * sinYaw), // Y
                 (cosRoll * cosPitch * sinYaw) - (sinRoll * sinPitch * cosYaw), // Z
                 (cosRoll * cosPitch * cosYaw) + (sinRoll * sinPitch * sinYaw)  // W
            ];

        return rotationQuat;
    }

    static getNewQuaternionRotate(quaternion, angle)
    {
        let eulerAngle      = this.getQuaternionToEuler(quaternion);
            eulerAngle.yaw  = this.clampEulerAxis(eulerAngle.yaw + angle);

        let newQuaternion   = this.getEulerToQuaternion(eulerAngle);

        return newQuaternion;
    }

    static getPointRotation(position, center, rotation)
    {
        let degToRad    = Math.PI / 180;
        let eulerAngle  = this.getQuaternionToEuler(rotation);
        let cos         = Math.cos(eulerAngle.yaw * degToRad);
        let sin         = Math.sin(eulerAngle.yaw * degToRad);

        let newRotation = [
            center[0] + (cos * (position[0] - center[0])) - (sin * (position[1] - center[1])),
            center[1] + (sin * (position[0] - center[0])) + (cos * (position[1] - center[1]))
        ];

        return newRotation;
    }


    // returns angle in the range (-360,360)
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

    // returns angle in the range [0,360)
    static normalizeEulerAxis(angle)
    {
        angle = this.clampEulerAxis(angle);

	if(angle > 180)
	{
            // shift to (-180,180]
            angle -= 360;
	}

        return angle;
    }

    // See: https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Source/Runtime/Core/Public/Math/UnrealMathUtility.h#L455
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

        let y       = value - (2 * Math.PI) * quotient;
        let sign    = 1;

        // Map y to [-pi/2,pi/2] with sin(y) = sin(Value).
        if(y > 1.57079632679)
        {
            y       = Math.PI - y;
            sign    = -1;
        }
        if(y < -1.57079632679)
        {
                y       = -Math.PI - y;
                sign    = -1;
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
                quotient = parseInt(quotient + 0.5);
            }
            else
            {
                quotient = parseInt(quotient - 0.5);
            }

        let y       = value - (2 * Math.PI) * quotient;
        let sign    = 1;

        // Map y to [-pi/2,pi/2] with sin(y) = sin(Value).
        if(y > 1.57079632679)
        {
            y       = Math.PI - y;
            sign    = -1;
        }
        if(y < -1.57079632679)
        {
                y       = -Math.PI - y;
                sign    = -1;
        }

        let y2  = y * y;

        // 11-degree minimax approximation
        return ( ( ( ( (-2.3889859e-08 * y2 + 2.7525562e-06) * y2 - 0.00019840874 ) * y2 + 0.0083333310 ) * y2 - 0.16666667 ) * y2 + 1 ) * y;
    }
}
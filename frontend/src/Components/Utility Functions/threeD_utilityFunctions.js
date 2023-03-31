
// export const sunSphereRadius = 10;
//
// const distanceAmplifier = 3;
//
// export const orbitRadius = distanceAmplifier * sunSphereRadius;

export const getObjectPositions = (numberOfObjects, orbitRadius, distanceAmplifier) => {
    const orbitRadiusWithAmplification = orbitRadius * distanceAmplifier;
    let positionArray = [];
    let angleDifference = 360 / numberOfObjects;
    let initialAngle = 0;
    for(let iteration=0; iteration < numberOfObjects; iteration++) {
        positionArray.push({
            x: Math.sin(initialAngle * Math.PI/180) * orbitRadiusWithAmplification,
            y: Math.cos(initialAngle * Math.PI/180) * orbitRadiusWithAmplification,
            z: 0,
            midPointArcCoordinates: {
                x: Math.sin((initialAngle + (angleDifference/2)) * Math.PI/180) * orbitRadiusWithAmplification,
                y: Math.cos((initialAngle + (angleDifference/2)) * Math.PI/180) * orbitRadiusWithAmplification,
                z: 0,
            },
            angle: initialAngle === 0 ? 360 : initialAngle,
        })
        initialAngle += angleDifference;
    }
    return {positions: positionArray, orbitRadius: orbitRadiusWithAmplification};
}

export const getValueInTheInterval = (min, max) => {
    return Math.floor((Math.random() * (max - min + 1) + 1))
}

//Related to points in a circle
import KeggLinkCoordinates from "./Kegg";

const NUMBER_OF_POINTS_IN_A_RING = 4;
const PADDING_AREA = 0.01;
const INITIAL_RING_RADIUS = 0.1;
let INITIAL_COORDINATES = {
    x: 0,
    y: 0
};
let ANGLE_BETWEEN_POINTS = 137.5; //This is the golden angle

//Related number of boxes and position of boxes
let BOX_SIZE = undefined;

//Box filling Pattern
const PATTERN = [1, 4, 3, 2]

//For Arithmetic progression to figure out number of boxes in each round
const INITIAL_BOX_COUNT = 4;
const COMMON_DIFFERENCE = 8;

//To Prevent duplications
let EC_CPD_SET = [];
let EC_CPR_COORDINATE_SET = [];
let COORDINATES = [];

/*
* To get total number of rings
* */
const getNumberOfRings = (totalPoints) => {
    // let totalRings = totalPoints % NUMBER_OF_POINTS_IN_A_RING === 0 ?  Math.ceil(totalPoints / NUMBER_OF_POINTS_IN_A_RING) : Math.ceil(totalPoints / NUMBER_OF_POINTS_IN_A_RING) + 1
    return totalPoints % NUMBER_OF_POINTS_IN_A_RING === 0 ?  Math.ceil(totalPoints / NUMBER_OF_POINTS_IN_A_RING) : Math.ceil(totalPoints / NUMBER_OF_POINTS_IN_A_RING) + 1;
};

/*
* To set the size of square box
* */
const setBoxWidth = (totalRings) => {
    BOX_SIZE = 2 * (INITIAL_RING_RADIUS + (totalRings * PADDING_AREA))
    // console.log(BOX_SIZE)
};


/*
* To get number of boxes and number of steps in each direction in a given round.
* The count is in Arithmetic progression (e.g) 4,12,20,28,......
* */
const getBoxes = (round) => {
    return [INITIAL_BOX_COUNT + ((round - 1) * COMMON_DIFFERENCE), (2*round)-1]
}

/*
* To move the initial position of the box
* */
const setBoxPosition = (round) => {
    INITIAL_COORDINATES = {
        x: -((round - 1) * BOX_SIZE) - (BOX_SIZE/2) , //: ((-BOX_SIZE/2) - BOX_SIZE),
        y: ((round - 1) * BOX_SIZE) + BOX_SIZE/2
    }
}

/*
* To add data in a pattern inside a box
* */
const addData = (EC, ECNameIndex, compoundList, center, kegg, quadrant) => {
    kegg.initialiseCPD();
    let radius = INITIAL_RING_RADIUS;
    let totalPointsInAGivenRing = 0;
    let angle = ANGLE_BETWEEN_POINTS;
    let {x, y} = {...center};
    compoundList.map((compound, index) => {
        let xCoordinate_compound = radius * Math.sin(angle * (Math.PI / 180));
        let yCoordinate_compound = radius * Math.cos(angle * (Math.PI / 180));
        angle = (angle + ANGLE_BETWEEN_POINTS) % 360;
        totalPointsInAGivenRing++;
        if (totalPointsInAGivenRing === NUMBER_OF_POINTS_IN_A_RING) {
            totalPointsInAGivenRing = 0;
            radius += PADDING_AREA;
        }
        if(kegg.findCPDIndex(compound) === -1) {
            // let xCoordinate_compound = radius * Math.sin(angle * (Math.PI / 180));
            // let yCoordinate_compound = radius * Math.cos(angle * (Math.PI / 180));
            kegg.addCPD(EC, {...center}, compound, {x: x+xCoordinate_compound, y: y+yCoordinate_compound}, ECNameIndex);
            //(compound, {x: x+xCoordinate_compound, y: y+yCoordinate_compound})
            // angle = (angle + ANGLE_BETWEEN_POINTS) % 360;
            // totalPointsInAGivenRing++;
            // if (totalPointsInAGivenRing === NUMBER_OF_POINTS_IN_A_RING) {
            //     totalPointsInAGivenRing = 0;
            //     radius += PADDING_AREA;
            // }
        }
        else {
            kegg.addCPD(EC,{...center}, compound, undefined, ECNameIndex)
        }
    })
    kegg.setCoordinates(EC, {...center}, kegg.getCPDList(), [...compoundList, EC]);
}


export const createCoordinates = (keggLinks, maxCompoundCount) => {
    //Set the box size first
    setBoxWidth(getNumberOfRings(maxCompoundCount));
    let currentRound = 1;
    setBoxPosition(currentRound);
    let [totalNumberOfBoxes, stepsAllowed] = getBoxes(currentRound);
    let quadrant = 1, currentStep = 0, totalBoxesFilled = 0;
    let coordinates = {...INITIAL_COORDINATES};
    let keggLinkCoordinates = new KeggLinkCoordinates();
    keggLinkCoordinates.setBoundary(BOX_SIZE, currentRound);
    keggLinks.map((link, index) => {
        switch (quadrant) {
            case 1:
                coordinates.x = coordinates.x + BOX_SIZE;
                addData(link.ec, index, link.cpd, {...coordinates}, keggLinkCoordinates, quadrant);
                break;
            case 4:
                coordinates.y = coordinates.y - BOX_SIZE;
                addData(link.ec, index, link.cpd, {...coordinates}, keggLinkCoordinates, quadrant);
                break;
            case 3:
                coordinates.x = coordinates.x - BOX_SIZE;
                addData(link.ec, index, link.cpd, {...coordinates}, keggLinkCoordinates, quadrant);
                break;
            case 2:
                coordinates.y = coordinates.y + BOX_SIZE;
                addData(link.ec, index, link.cpd, {...coordinates}, keggLinkCoordinates, quadrant);
                break;
        }
        totalBoxesFilled++; currentStep++;
        if(totalBoxesFilled === totalNumberOfBoxes) { //This is to move boxes frm one level to another (e.g) 4 to 12
            currentRound++;
            setBoxPosition(currentRound);
            keggLinkCoordinates.setBoundary(BOX_SIZE, currentRound);
            coordinates = {...INITIAL_COORDINATES};
            [totalNumberOfBoxes, stepsAllowed] = getBoxes(currentRound);
            totalBoxesFilled = 0; currentStep = 0; quadrant = 1;
        }
        else if( currentStep === stepsAllowed){
            quadrant = PATTERN[(PATTERN.indexOf(quadrant) + 1) % PATTERN.length];
            currentStep = 0;
        }
    })
    return keggLinkCoordinates.coordinates;
}
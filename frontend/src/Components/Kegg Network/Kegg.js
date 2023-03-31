class KeggLinkCoordinates {

    constructor() {
        this.entries = []
        this.CPDList = [];
        this.CPDSet = [];
        this.CPDDetails = [];
        this.maxMinCollection = [];
    }

    initialiseCPD() {
        this.CPDList = [];
    }

    findCPDIndex(compoundName, EC_index) {
        return this.CPDSet.indexOf(compoundName);
    }

    getFirstOccurrence(originalIndex) {
        return this.CPDDetails[originalIndex];
    }

    getCPDList() {
        return this.CPDList;
    }

    setBoundary(boxSize, round) {
        this.maxMinCollection = [round*1.3*boxSize, -round*1.3*boxSize, round*1.3*boxSize, -round*1.3*boxSize]; //xmax, xmin, ymax, ymin
    }


    addCPD(ECName, EC_Coordinates, compoundName, CPD_Coordinates, EC_Index) {
        let exist = this.findCPDIndex(compoundName, EC_Index);
        let originalDetails = {};
        if(exist === -1) {
            this.CPDSet.push(compoundName);
            this.CPDDetails.push({CPD_Coordinates: CPD_Coordinates,  EC: ECName, EC_Coordinates: EC_Coordinates});
        }
        else {
            originalDetails = this.getFirstOccurrence(exist);
        }
        this.CPDList.push(
            exist === -1 ?
                {
                    name: compoundName,
                    coordinates: CPD_Coordinates,
                    ec_coordinates: EC_Coordinates,
                    exist: false
                }
                :
                {
                    name: compoundName,
                    coordinates: originalDetails.CPD_Coordinates,
                    ec_coordinates: EC_Coordinates,
                    exist: originalDetails
                }
        )
    }

    setCoordinates(EC_name, EC_coordinates, CPDList, nameList, CPDNameList) {
        this.entries.push(
            {
                EC: {
                    name: EC_name,
                    coordinates: EC_coordinates,
                },
                CPD: CPDList,
                nameList: nameList
            }
        )
    }

    get coordinates() {
        return [this.entries, this.maxMinCollection];
    }

}

export default KeggLinkCoordinates
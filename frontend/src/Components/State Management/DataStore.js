import {observable,action,computed,decorate} from "mobx";

class Data_Store {

    files = [];

    additionalFile = [];

    dimensionalityReductionAlgorithm = "PCA" //algorithm name

    clusteringAlgorithm = "K-Means" // algorithm Name

    visualizationType = "2D" //Type of visualization

    maximumReducedDimensions = 50;

    clusterSize = 2;

    clusterSizeHelperText = "";

    callRequestPayload = false


    resetView = null

    setResetView = (fun) => {
        this.resetView = fun
    }

    changeUserFields = (userInput, field) => {
        switch (field) {
            case "dimensionalityReductionAlgorithm":
                this.dimensionalityReductionAlgorithm = userInput;
                break;
            case "visualizationType":
                this.visualizationType = userInput;
                break;
            case "clusteringAlgorithm":
                this.clusteringAlgorithm = userInput;
                break;
            default:
        }
    }

    changeClusterSize = (size) => {
        if(size<2) {
            this.clusterSize = 2;
            this.clusterSizeHelperText = "Number of clusters should be minimum of 2";
        }
        else{
            this.clusterSize = size;
            this.clusterSizeHelperText = "";
        }
    }

    toggleRequestPayloadCaller = () => {
        this.callRequestPayload = !this.callRequestPayload
    }

    addFiles = (files) => {
        this.files = files;
    }

    addAdditionalFile = (file) => {
        this.additionalFile = file;
    }

    changeClusteringType = (index, clusteringType) => {
        this.files[index].clustering = clusteringType;
    }

    get filesCount() {
        // console.log(this.files.length)
        return this.files.length;
    }

    get additionalFileCount() {
        return this.additionalFile.length;
    }
}
decorate(Data_Store,{
    files: observable,
    additionalFile: observable,
    dimensionalityReductionAlgorithm: observable,
    clusteringAlgorithm: observable,
    visualizationType: observable,
    callRequestPayload: observable,
    clusterSize: observable,
    clusterSizeHelperText: observable,
    addFiles: action,
    addAdditionalFile: action,
    changeUserFields: action,
    filesCount: computed,
    additionalFileCount: computed,
    resetView: observable,
    setResetView: action
})

const DataStore = new Data_Store();

export default DataStore;

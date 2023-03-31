import {observable,action,decorate,computed,toJS} from "mobx";
import {getObjectPositions} from "../Utility Functions/threeD_utilityFunctions";
import {createCoordinates} from "../Kegg Network/KeggNetwork";
import * as _ from "lodash"

class Response_Store {
    //uploaded files
    userFiles = [];

    //additional file containing EC
    additionalFile = [];

    //Backdrop processing screen
    visualize = false;

    showBackDrop;

    //CPD list
    compounds = [];

    //cluster size for kmeans
    clusterSize = 2;

    maximumReducedDimensions = 0;

    //Recluster for chosen components
    reCluster = false;

    //User selected target in D3
    selectedTarget = null;

    //EC-Compound
    ECCompoundSet = undefined;

    //EC-Compound with links
    keggNetwork = undefined;

    //Force directed graph dataset
    nodesAndLinks_2D = undefined;

    //error
    responseError = undefined;

    //orbitRadius
    orbitRadius = 0;

    addFile = (files, reducedDimensions, clusterSize) => {
        this.userFiles = files;
        this.maximumReducedDimensions = reducedDimensions;
        this.clusterSize = clusterSize;
        this.selectedTarget = null;
        this.ECCompoundSet = undefined;
        this.keggNetwork = undefined;
        this.nodesAndLinks_2D = undefined
    }

    addAdditionalFile = (file) => {
        this.additionalFile = file;
    }

    addReClusteredData = (fileIndex, componentPair, clusteredData) => {
        this.userFiles[fileIndex].clusteredData[componentPair] = clusteredData
    }

    toggleVisualization = (flag) => {
        this.visualize = flag;
        this.showBackDrop = !flag;
        if(!flag) {
            this.responseError = undefined;
        }
    }

    toggleError = (data) => {
        this.responseError = data;
        this.showBackDrop = false;
        this.visualize = false;
    }

    toggleReCluster = (flag) => {
        this.reCluster = flag
    }

    changeAxisComponent = (fileIndex, componentName, componentNumber) => {
        this.userFiles[fileIndex][componentName] = componentNumber;
    }

    convertToArray = (coOrdinates) => {
        let component1 = [], component2 = [];
        coOrdinates.map(coOrdinate => {
            component1.push(coOrdinate.x)
            component2.push(coOrdinate.y)
        })
        return [component1,component2]
    }

    fetchTopLoadings = (component1, component2, features, displayLoading) => {
        let rankedLoadings = component1.map((coordinate, index) => {
            return {
                index: index,
                feature: features[index],
                distanceFromOrigin: (component1[index]**2) + (component2[index]**2)
            }
        })
        rankedLoadings.sort((a,b) => b.distanceFromOrigin - a.distanceFromOrigin)
        let xCo = [], yCo = [], topFeatures = [];
        rankedLoadings.map((loadingObject, index) => {
            if(index < displayLoading){
                xCo.push(component1[loadingObject.index]);
                yCo.push(component2[loadingObject.index]);
                topFeatures.push(features[loadingObject.index])
            }
        })
        return ({
            loadingsComponent1: xCo,
            loadingsComponent2: yCo,
            features: topFeatures
        })
    }

    convertToCoordinates = (xCo,yCo,line) => {
        let coordinates = [];
        xCo.map((point,index) => {
            if(line) {
                coordinates.push([
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: point,
                        y: yCo[index]
                    }])
            }
            else {
                coordinates.push({
                    x: point,
                    y: yCo[index]
                })
            }
        })
        return coordinates;
    }

    changeSelectedTarget = (targetList) => {
        this.selectedTarget = targetList;
    }

    /*
    * To display only certain number of loadings on when a user selects them
    * */
    changeDisplayLoadings = (fileIndex, count) => {
        this.userFiles[fileIndex].displayLoadings = count;
    }

    setCompounds = (compounds) => {
        this.compounds = compounds;
    }

    get compoundList() {
        return this.compounds
    }

    /*
    * To transfer data to the visualization panel in object format
    * */
    get heuristicResult() {
        let data = [];
        toJS(this.userFiles).map(file => {
            let loadingMatrixWithFeature = {};
            loadingMatrixWithFeature = this.fetchTopLoadings(file.reducedDimensionData.loadings_matrix[file.component1 - 1],
                file.reducedDimensionData.loadings_matrix[file.component2 - 1],
                file.reducedDimensionData.features,
                file.displayLoadings === "All" ? file.reducedDimensionData.featureCount-1 : Number(file.displayLoadings));
            if(file.fileType === "Metabolite") {
                this.setCompounds(file.reducedDimensionData.features);
            }
            data.push({
                maxDisplayLoadings: 100,
                displayLoadings: file.displayLoadings,
                component1: file.component1,
                component2: file.component2,
                fileType: file.fileType,
                reducedDimensionData: {
                    featureCount: file.reducedDimensionData.featureCount,
                    narrowMatrix: this.convertToCoordinates(file.reducedDimensionData.narrow_matrix[file.component1 - 1], file.reducedDimensionData.narrow_matrix[file.component2 - 1],false),
                    target: file.reducedDimensionData.target,
                    features: loadingMatrixWithFeature.features,
                    loadingsMatrix: this.convertToCoordinates(loadingMatrixWithFeature.loadingsComponent1, loadingMatrixWithFeature.loadingsComponent2,true),
                    varianceRatio: file.reducedDimensionData.variance_ratio,
                },
                title: file.file.name.split(".csv")[0],
                clusteredData: !Array.isArray(file.clusteredData[12].centroids) && file.clusteredData[`${file.component1}${file.component2}`] === undefined
                    ?
                    undefined
                    :
                    {
                        labels: !Array.isArray(file.clusteredData[12].centroids) ? file.clusteredData[`${file.component1}${file.component2}`].labels : file.clusteredData[12].labels,
                        centroids:  !Array.isArray(file.clusteredData[12].centroids)
                            ?
                            this.getCentroids(file.clusteredData[`${file.component1}${file.component2}`].centroids)
                            :
                            this.getCentroids(file.clusteredData[12].centroids, file.clusteredData[12].labels, file.reducedDimensionData.narrow_matrix[file.component1 - 1], file.reducedDimensionData.narrow_matrix[file.component2 - 1]),
                        centroidLabels: !Array.isArray(file.clusteredData[12].centroids) ? undefined : this.getCentroidLabels(file.clusteredData[12].labels),
                    },
            })
        })
        return data;
    }

    getCentroidLabels = (labels) => {
        return [...new Set([...labels])];
    }

    getCentroids = (centroids, labels, component1, component2) => {
        let centroidCollection = []
        if(!Array.isArray(centroids)) {
            Object.entries(centroids).map(([key,value]) => {
                centroidCollection.push({x: value[0], y: value[1]})
            })
        }
        else {
            let uniqueLabels = new Set([...labels]);
            uniqueLabels.forEach(label => {
                let xAxisValue = 0;
                let yAxisValue = 0;
                let clusterCount = 0;
                labels.map((clusterLabel, index) => {
                    if(clusterLabel === label) {
                        clusterCount++;
                        xAxisValue += component1[index];
                        yAxisValue += component2[index];
                    }
                })
                centroidCollection.push({x: xAxisValue/clusterCount, y: yAxisValue/clusterCount})
            })
        }
        return centroidCollection;
    }

    get selectedTargetArray() {
        return toJS(this.selectedTarget);
    }

    get getAdditionalFile() {
        return toJS(this.additionalFile);
    }

    get keggLinksCoordinates() {
        if(this.additionalFile.length === 0) {
            return false;
        }
        else {
            if(this.keggNetwork === undefined) {
                let keggNetwork = createCoordinates(toJS(this.additionalFile.kegg.links), this.additionalFile.kegg.max_cpd_count);
                this.keggNetwork = {
                    links: keggNetwork[0],
                    maxMinCollection: keggNetwork[1],
                    maxCount: this.additionalFile.kegg.total_entries,
                }
            }
            return _.cloneDeep(this.keggNetwork);
        }
    }

    get getNodesAndLines_2D() {
        if(this.additionalFile.length === 0) {
            return false;
        }
        else {
            if(this.nodesAndLinks_2D === undefined) {
                let CPD_set = [];
                this.nodesAndLinks_2D = {nodes: [], links: []}
                toJS(this.additionalFile.kegg.links).map(link => {
                    this.nodesAndLinks_2D.nodes.push({name: link.ec, type: "EC"});
                    link.cpd.map(cpd => {
                        this.nodesAndLinks_2D.links.push({source: link.ec, target: cpd})
                        if (CPD_set.indexOf(cpd) === -1) {
                            CPD_set.push(cpd);
                            this.nodesAndLinks_2D.nodes.push({name: cpd, type: "CPD"})
                        }
                    });
                });
            }
            return _.cloneDeep(this.nodesAndLinks_2D);
        }
    }

    get getTargetFeatureConnection() {
        let targetFeatureConnection = [];
        toJS(this.userFiles).map(file => targetFeatureConnection.push(file.targetFeatureConnection))
        return targetFeatureConnection;
    }

    get getGraphTarget() {
        let options = [];
        let optionSet = [];
        //centroid details
        toJS(this.userFiles).map((file, fileIndex) => {
            if(!Array.isArray(file.clusteredData[12].centroids)) {
                [...new Array(this.clusterSize).keys()].map(cluster => {
                    options.push({
                        label: `Cluster ${cluster + 1} (${file.file.name.split(".csv")[0]})`,
                        fileIndex: fileIndex,
                        targetIndex: cluster,
                        isCentroid: true
                    });
                })
            }
            else {
                let cluster = 0;
                new Set([...file.clusteredData[12].labels]).forEach(label => {
                    options.push({
                        label: `Cluster ${label} (${file.file.name.split(".csv")[0]}) (user defined cluster)`,
                        fileIndex: fileIndex,
                        targetIndex: cluster,
                        isCentroid: true
                    });
                    cluster++;
                })
            }
        })
        //cluster details
        toJS(this.userFiles).map((file, fileIndex) => {
            file.reducedDimensionData.target.map((target, index) => {
                if(optionSet.indexOf(target) ===  -1) {
                    optionSet.push(target);
                    options.push({label: target, fileIndex: fileIndex, targetIndex: index});
                }
            })
        })
        return options;
    }

    getRangeOfTargetFeaturesConnection = (fileType, connections) => {
        let range = undefined;
        toJS(this.userFiles).map((file, index) => {
            if(file.fileType === fileType) {
                let min = Math.min(...[].concat(...connections[index]));
                let max = Math.max(...[].concat(...connections[index]));
                range = [min, max];
            }
        })
        return range;
    }

    getECCompoundList = () => {
        if(this.ECCompoundSet === undefined) {
            let ECCompoundList = toJS(this.additionalFile);
            if(ECCompoundList.length === 0) {
                this.ECCompoundSet = [];
            }
            else {
                let ECList = [];
                ECCompoundList.kegg.ec_number.map(ECNumber => {
                    ECList.push({label: ECNumber})
                });
                let CPDList = [];
                ECCompoundList.kegg.cpd_number.map(CPDNumber => {
                    CPDList.push({label: CPDNumber})
                });
                this.ECCompoundSet = [
                    {list: ECList, label: "EC Number"},
                    {list: CPDList, label: "Compound Number"}
                ]
            }
        }
        return this.ECCompoundSet;
    }

    getECCPEDDetails = (name, type) => {
        let ECCompoundList = toJS(this.additionalFile)
        if(type === "EC")
            return ECCompoundList.kegg.ec_details[ECCompoundList.kegg.ec_number.indexOf(name)];
        else
            return ECCompoundList.kegg.cpd_details[ECCompoundList.kegg.cpd_number.indexOf(name)];
    }

    get errorMessage() {
        let message = "";
        if(typeof(this.responseError.file) === "string") {
            if (this.responseError.file) {
                message = `Error occurred in the file ${this.responseError.file}. `
            }
            message += this.responseError.details;
        }
        else
            message = this.responseError;
        return message;
    }

    getObjectPositions(orbitRadius, orbitRadiusAmplifier) {
        return  getObjectPositions(this.userFiles.length, orbitRadius, orbitRadiusAmplifier);
    }
}

decorate(Response_Store,{
    userFiles: observable,
    additionalFile: observable,
    visualize: observable,
    showBackDrop: observable,
    reCluster: observable,
    responseError: observable,
    selectedTarget: observable,
    addFiles: action,
    addAdditionalFile: action,
    toggleReCluster: action,
    addReClusteredData: action,
    toggleVisualization: action,
    toggleError: action,
    changeComponent: action,
    changeDisplayLoadings: action,
    changeSelectedTarget: action,
    heuristicResult: computed,
    selectedTargetArray: computed,
    getAdditionalFile: computed,
    keggLinksCoordinates: computed,
    getTargetFeatureConnection: computed,
    compoundList: computed,
    getGraphTarget: computed,
})

const ResponseStore = new Response_Store()

export default ResponseStore
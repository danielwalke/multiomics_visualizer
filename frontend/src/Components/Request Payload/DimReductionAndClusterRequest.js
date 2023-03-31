import React,{Component} from "react";
import {inject,observer} from "mobx-react";
import {requestGenerator} from "./Request Generator/RequestGenerator";
import {endpoint_uploadFile, endpoint_KeggPathway} from "../../App Configurations/RequestURLCollections";
import * as _ from "lodash"

class DimReductionAndClusterRequest extends Component{

    //this is defined as an array because if the key are increasing in the server side, if the key names
    //are just appended here, it will extract the value from the response automatically
    responseFieldsName = ["reducedDimensionData", "clusteredData"];

    constructor(props) {
        super(props);
        this.state={
            payLoadGeneration: this.props.DataStore.callRequestPayload
        }
    }

    showVisualization = (responseCount) => {
        if(responseCount === (this.props.DataStore.files.length + this.props.DataStore.additionalFile.length)){
            this.props.ResponseStore.toggleVisualization(true);
            this.props.DataStore.toggleRequestPayloadCaller();
        }
    }

    componentDidMount() {
        if(this.props.DataStore.files.length !== 0) {
            let header = {"Content-type": "multipart/form-data"};
            this.props.ResponseStore.toggleVisualization(false);
            let uploadedFiles = this.props.DataStore.files
            let responseFromServer = 0;
            uploadedFiles.map(upload => {
                let requestBody = new FormData();
                requestBody.append('fileName', upload.file.name);
                requestBody.append('fileType', upload.fileType);
                requestBody.append('dataset', upload.file);
                requestBody.append('clustering', upload.clustering)
                requestBody.append('dimensionalityReductionAlgorithm', this.props.DataStore.dimensionalityReductionAlgorithm);
                requestBody.append('clusteringAlgorithm', this.props.DataStore.clusteringAlgorithm);
                requestBody.append('clusterSize', this.props.DataStore.clusterSize);
                requestGenerator('POST', endpoint_uploadFile, header, requestBody).then(response => {
                    if (response !== undefined && response.status === 200) {
                        responseFromServer++;
                        upload.reducedDimensionData = response.data.reducedDimensionData;
                        upload.clusteredData[`${upload.component1}${upload.component2}`] = response.data.clusteredData;
                        upload.targetFeatureConnection = response.data.targetFeatureConnection;
                        if (responseFromServer === this.props.DataStore.files.length) { //check if all the response of the the requested files are obtained
                            this.props.ResponseStore.addFile(_.cloneDeep(uploadedFiles), 50, this.props.DataStore.clusterSize);
                            this.showVisualization(responseFromServer);
                        }
                    }
                    else {
                        if(this.props.ResponseStore.responseError === undefined) {
                            this.props.ResponseStore.toggleError(response !== undefined ? response.data : "Server unavailable");
                            this.props.DataStore.toggleRequestPayloadCaller()
                        }
                    }
                })
            })
            if(this.props.DataStore.additionalFile.length !== 0) {
                let additionalFile = _.cloneDeep(this.props.DataStore.additionalFile[0]);
                let requestBody = new FormData();
                requestBody.append("data",additionalFile.file);
                requestGenerator('POST', endpoint_KeggPathway, header, requestBody).then(response => {
                    if (response !== undefined && response.status === 200) {
                        responseFromServer++;
                        additionalFile.kegg = response.data;
                        this.props.ResponseStore.addAdditionalFile(additionalFile);
                        this.showVisualization(responseFromServer);
                    }
                    else {
                        if(this.props.ResponseStore.responseError === undefined) {
                            this.props.ResponseStore.toggleError(response !== undefined ? response.data : "Server unavailable");
                            this.props.DataStore.toggleRequestPayloadCaller()
                        }
                    }
                })
            }
        }
    }

    render() {
        return null;
    }

}

export default inject('DataStore','ResponseStore')(observer(DimReductionAndClusterRequest))
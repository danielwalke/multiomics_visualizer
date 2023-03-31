import React,{Component} from "react";
import {inject, observer} from "mobx-react";
import {requestGenerator} from "./Request Generator/RequestGenerator";
import {endpoint_cluster, endpoint_uploadFile} from "../../App Configurations/RequestURLCollections";


class ReClusterRequest extends Component{

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let requestBody = {
            component1: this.props.reClusterData.components[0],
            component2: this.props.reClusterData.components[0],
            clusterSize: this.props.reClusterData.clusterSize
        };
        let header = {}
        requestGenerator('POST', endpoint_cluster, header, requestBody).then(response => {
            if(response.status === 200){
                this.props.ResponseStore.addReClusteredData(this.props.reClusterData.reClusteringFileIndex, this.props.reClusterData.clusteredDataIndex, response.data.clusteredData)
                // console.log(response.data)
                this.props.toggleRecluster(false);
            }
        })
    }

    render() {
        return null;
    }
}

export default inject("ResponseStore")(observer(ReClusterRequest));

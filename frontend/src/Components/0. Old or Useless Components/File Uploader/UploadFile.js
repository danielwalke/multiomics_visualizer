import React, {Component} from "react";
import Dialog from "@material-ui/core/Dialog";
import Container from "@material-ui/core/Container";
import ReactDropZone from "react-dropzone";
import {RootRef} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import {requestBodySize} from "../../../App Configurations/SystemSettings";
import {requestGenerator} from "../../Request Payload/Request Generator/RequestGenerator";
import {endpoint_uploadFile} from "../../../App Configurations/RequestURLCollections";

const customStyle = {
    dropZone: {
        flex: "1",display: "flex", flexDirection: "column",
        alignItems: "center", padding: "20px", borderWidth: "2px",
        borderRadius: "2px", borderColor: "#eeeeee", borderStyle: "dashed",
        backgroundColor: "#fafafa", color: "#bdbdbd", outline: "none",
        transition: "border .24s ease-in-out"
    }
}

class UploadFile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            response: ""
        }
    }

    FILE_CHUNK_SIZE = requestBodySize // file will be split into chunks of 10MB

    onDrop = (selectedFiles) => {
        console.log(selectedFiles)
        selectedFiles.map(individualFile => {
            this.FILE_CHUNK_SIZE = individualFile.size;
            let chunkStarting = 0;
            while(chunkStarting < individualFile.size){
                this.uploadCSV(individualFile.slice(chunkStarting , this.FILE_CHUNK_SIZE + chunkStarting), individualFile.name, "From " + chunkStarting/1000000 + "MB To " + (this.FILE_CHUNK_SIZE + chunkStarting)/1000000 + "MB");
                chunkStarting += this.FILE_CHUNK_SIZE;
            }
        })
    }

    uploadCSV = (file, fileName,chunkDetails ) => {
        // let CSVReader = new FileReader();
        // CSVReader.readAsText(file);
        // CSVReader.onload = (event) => {
            // let blob = new Blob([event.target.result], {type: 'text/csv'})
            // let requestBody = {
            //     fileName: fileName,
            //     fileChunkDetails: chunkDetails,
            //     dataset: new Blob([event.target.result], {type: 'text/csv'})
            // }
            let requestBody = new FormData();
            requestBody.append('fileName', fileName);
            requestBody.append('fileChunkDetails',chunkDetails);
            requestBody.append("dataset", file);
            let header = {"Content-type": "multipart/form-data"}
            requestGenerator('POST', endpoint_uploadFile, header, requestBody).then(response => {
                if(response.status===200){
                    this.props.changeResponse(response.data);
                    this.props.close();
                }
            })
        // }
        // CSVReader.onerror = (e) => {
        //     console.log(e);
        // }
        // let formData = new FormData();
        // formData.append(file,fileName);
        // requestGenerator('POST', endpoint_uploadFile, requestBody).then(response => {
        //     console.log(response);
        // })
    }

    render() {
        return(
            <Dialog fullWidth open={this.props.open} onClose={() => this.props.close()}>
                <Container maxWidth={"xl"} style={{padding: "20px"}}>
                    <ReactDropZone onDrop={files => this.onDrop(files)} accept={"application/vnd.ms-excel"} >
                        {({getRootProps,getInputProps, isDragActive, isDragReject}) => (
                            <section>
                                <div {...getRootProps({style: customStyle.dropZone})}>
                                    <input {...getInputProps()} accept={".CSV"}/>
                                    {!isDragActive && "Drag files here or click here to upload files!!"}
                                    {isDragReject && "Unsupported file format"}
                                </div>
                            </section>
                        )}
                    </ReactDropZone>
                </Container>
            </Dialog>
        );
    }
}

export default UploadFile;
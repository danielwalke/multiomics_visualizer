import React, {Component} from "react";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ReactDropZone from "react-dropzone";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import {uploadedAdditionalFileStateObject, uploadedFileStateObject} from "./uploadedFileStateObject";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import {inject,observer} from "mobx-react";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {FormControl} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import "./DatasetUploadPanel.css"


const customStyle = {
    dropZone: {
        flex: "1",display: "flex", flexDirection: "column", height: "100%",
        alignItems: "center", borderWidth: "2px",
        borderRadius: "2px", borderColor: "#eeeeee", borderStyle: "dashed",
        backgroundColor: "#fafafa", color: "#bdbdbd", outline: "none",
        transition: "border .24s ease-in-out",
        justifyContent: "center"
    }
}

class DatasetUploadPanel extends Component{

    constructor(props) {
        super(props);
        this.state = {
            openUploadSection: false,
            response: "",
            uploadedFiles: this.props.DataStore.files,
            additionalFile: this.props.DataStore.additionalFile,
            openFileType_0: false,
            openFileType_1: false,
            openFileType_2: false,
            openFileType_3: false,
            openFileType_4: false,
            openClusteringTypeFile_0: false,
            openClusteringTypeFile_1: false,
            openClusteringTypeFile_2: false,
            openClusteringTypeFile_3: false,
            openClusteringTypeFile_4: false,
            fileTypes: [
                {type: "metaProtein", selected: false, label: "Protein"},
                {type: "metabolite", selected: false, label: "Metabolite"},
                {type: "otherFiles", selected: undefined, label: "Others"},
            ],
            reduceListSize: false,
        }
        this.clusteringTypes = [{label: "Auto", type: "auto"},{label: "Manual", type: "manual"}]
    }

    componentDidMount() {
        this.resizer();
        window.onresize = () => this.resizer();
        this.fetchSelectedFileTypes();
    }

    resizer = () => {
        let width = window.innerWidth;
        if(width < 1000){
            this.setState({reduceListSize: true});
        }
        else {
            this.setState({reduceListSize: false});
        }
    }

    fetchSelectedFileTypes = () => {
        this.setState({fileTypes: [
                {type: "metaProtein", selected: false, label: "Protein"},
                {type: "metabolite", selected: false, label: "Metabolite"},
                {type: "otherFiles", selected: undefined, label: "Others"},
            ]}, () => {
            let fileTypesCopy = [...this.state.fileTypes];
            this.props.DataStore.files.map(file => {
                if(file.fileType === "Protein"){
                    fileTypesCopy[0].selected = true;
                }
                else if(file.fileType === "Metabolite"){
                    fileTypesCopy[1].selected = true;
                }
                this.setState({fileTypes: fileTypesCopy});
            })
        })
    }

    switchState = (stateName) => {
        this.setState({[stateName]: !this.state[stateName]})
    }

    removeUploadedFile = (index,deleteCount) => {
        let stateObject = this.props.inputFile ? [...this.state.uploadedFiles] : [...this.state.additionalFile];
        stateObject.splice(index, deleteCount);
        if(this.props.inputFile) {
            this.setState({uploadedFiles: stateObject}, () => {
                this.props.DataStore.addFiles(this.state.uploadedFiles);
                this.fetchSelectedFileTypes();
            })
        }
        else {
            this.setState({additionalFile: stateObject}, () => {
                this.props.DataStore.addAdditionalFile(this.state.additionalFile);
                if(this.state.additionalFile.length === 0) { //to reflect the removed file in threejs planet
                    this.props.ResponseStore.addAdditionalFile([]);
                }
            })
        }
    }

    uploadedFiles = (files) => {
        //Spread operator used
        let stateObject = [];
        if(this.props.inputFile) {
            stateObject = [...this.state.uploadedFiles];
            let userUpload = files.map(uploadedFileStateObject);
            userUpload.forEach(file => {
                if(file.file.size/1048576 <= 20) {
                    if (stateObject.length < 5) {
                        stateObject.push(file)
                    } else {
                        alert("File Exceed")
                    }
                }
                else{
                    alert(`${file.file.name} cannot be processed since it exceeded 20MB`)
                }
            })
            this.setState({uploadedFiles: stateObject}, () => {
                this.props.DataStore.addFiles(this.state.uploadedFiles);
            })
        }
        else{
            stateObject.push(uploadedAdditionalFileStateObject(files[0]));
            this.setState({additionalFile: stateObject}, () => {
                this.props.DataStore.addAdditionalFile(this.state.additionalFile);
            })
        }
    }

    //to change the file type
    changeFileType = (index, fileTypeLabel, type, fileTypeIndex) => {
        // console.log(fileTypeLabel,type)
        let stateObject = [...this.state.uploadedFiles];
        let fileTypesCopy = [...this.state.fileTypes];
        fileTypesCopy[fileTypeIndex].selected = !fileTypesCopy[fileTypeIndex].selected;
        if(stateObject[index].fileType === "Protein"){
            fileTypesCopy[0].selected = !fileTypesCopy[0].selected;
        }
        else if(stateObject[index].fileType === "Metabolite"){
            fileTypesCopy[1].selected = !fileTypesCopy[1].selected;
        }
        stateObject[index].fileType = fileTypeLabel;
        this.setState({uploadedFiles: stateObject, fileTypes: fileTypesCopy}, () => {
            this.props.DataStore.addFiles(this.state.uploadedFiles);
        })
    }

    //change clustering type
    changeClusteringType = (index, clusteringType) => {
        let stateObject = [...this.state.uploadedFiles];
        stateObject[index].clustering = clusteringType;
        this.setState({uploadedFiles: stateObject}, () => {
            this.props.DataStore.addFiles(this.state.uploadedFiles);
        })
    }

    convertFileSize = (size) => {
        if (size >= 1048576) {
            return (size / 1048576).toFixed(2) + " MB";
        }
        else {
            return (size / 1024).toFixed(2) + " KB";
        }
    }

    render() {
        let files =  [];
        this.props.inputFile ? files =  this.state.uploadedFiles : files =  this.state.additionalFile;
        return(
            <>
                <Dialog open={true} maxWidth={"lg"} fullWidth={true} onClose={() => this.props.hideDialog(this.props.inputFile ? 'uploadPanel' : 'additionalFile')}>
                    <DialogTitle style={{background: "#0068B8", color: "white"}} align={"center"}>
                        {this.props.title}
                    </DialogTitle>
                    <DialogContent style={{display: "flex", flex: "1", flexDirection: this.props.mobileMode ? "column" : "row", padding: "2%"}}>
                        {/*Drop zoe for files*/}
                        <div style={{height: "auto",width:this.props.mobileMode ? "100%" : "49%", padding: this.props.mobileMode ? "0" : "0 1% 0 0", margin: this.props.mobileMode ? "0 0 10px 0" : "0"}}>
                            <ReactDropZone onDrop={files => this.uploadedFiles(files)}>
                                {({getRootProps,getInputProps, isDragActive, isDragReject}) => (
                                    <div {...getRootProps({style: customStyle.dropZone})}>
                                        <input {...getInputProps()} accept={".CSV"}/>
                                        {!isDragActive &&
                                        <p style={{padding: "10px"}}>
                                            {this.props.inputFile ?
                                                <>
                                                Drag files here or click here to upload files.
                                                   <p>Note: Maximum size of each file should not exceed 20MB</p>
                                                </>
                                                :
                                                "Drag files here or click here to upload file"
                                            }
                                        </p>
                                        }
                                        {isDragReject && "Unsupported file format"}
                                        <Button variant={"contained"} color={"primary"}>
                                            {this.props.inputFile ? "Upload Files" : "Upload File"}
                                        </Button>
                                    </div>
                                )}
                            </ReactDropZone>
                        </div>
                        {/*File display*/}
                        {((files.length !== 0 && this.props.mobileMode) || (!this.props.mobileMode)) &&
                        <Card style={{width: this.props.mobileMode ? "100%" : "50%", overflowY: this.props.mobileMode ? "scroll" : "auto"}}>
                            <CardContent>
                                <Typography align={"center"} component={"h2"} variant={"h6"}> Selected Files </Typography>
                                <Divider variant={"middle"}/>
                                <List>
                                    {
                                        files.map((uploadedFile, index) => {
                                            return (
                                                <>
                                                    <ListItem key={uploadedFile.file.name + "_" + index}
                                                              style={{display: "flex"}}>
                                                        <ListItemIcon>
                                                            <IconButton value={index} edge={"end"}
                                                                        onClick={event => this.removeUploadedFile(event.currentTarget.value, 1)}
                                                            >
                                                                <DeleteOutlinedIcon color={"primary"}/>
                                                            </IconButton>
                                                        </ListItemIcon>
                                                        <div>
                                                            <ListItemText
                                                                primary={<Typography
                                                                    variant={"subtitle2"}>{uploadedFile.file.name}</Typography>}
                                                                secondary={this.convertFileSize(Number(uploadedFile.file.size))}
                                                            />
                                                            {this.props.inputFile && <div
                                                                className={(!this.props.mobileMode && !this.state.reduceListSize) ? "uploadedFileDetails" : ""}
                                                                style={{display: "flex"}}>
                                                                <FormControl style={{margin: "0 5px 0 0"}}>
                                                                    <InputLabel>Clustering</InputLabel>
                                                                    <Select
                                                                        open={this.state[`openClusteringTypeFile_${index}`]}
                                                                        onOpen={() => this.switchState(`openClusteringTypeFile_${index}`)}
                                                                        onClick={() => this.switchState(`openClusteringTypeFile_${index}`)}
                                                                        value={uploadedFile.clustering}
                                                                        onChange={(event) => this.changeClusteringType(index, event.currentTarget.getAttribute("name"))}
                                                                    >
                                                                        {this.clusteringTypes.map(clustering =>
                                                                            <MenuItem key={clustering.type}
                                                                                      name={clustering.type}
                                                                                      value={clustering.type}>
                                                                                <Typography>{clustering.label}</Typography>
                                                                            </MenuItem>)}
                                                                    </Select>
                                                                </FormControl>

                                                                <FormControl>
                                                                    <InputLabel>File Type </InputLabel>
                                                                    <Select open={this.state[`openFileType_${index}`]}
                                                                            onOpen={() => this.switchState(`openFileType_${index}`)}
                                                                            value={uploadedFile.fileType}
                                                                            onClose={() => this.switchState(`openFileType_${index}`)}
                                                                            onChange={(event) =>
                                                                                this.changeFileType(index, event.currentTarget.getAttribute("data-value"), event.currentTarget.getAttribute("name"),
                                                                                    Number(event.currentTarget.getAttribute("index")))
                                                                            }>
                                                                        {this.state.fileTypes.map((fileType, fileTypeIndex) =>
                                                                            <MenuItem
                                                                                key={fileType + index + fileTypeIndex}
                                                                                disabled={(fileType.type === "metaProtein" || fileType.type === "metabolite") && fileType.selected === true}
                                                                                value={fileType.label}
                                                                                name={fileType.type}
                                                                                index={fileTypeIndex}
                                                                            >
                                                                                <Typography>{fileType.label}</Typography>
                                                                            </MenuItem>
                                                                        )}
                                                                    </Select>
                                                                </FormControl>
                                                            </div>}
                                                        </div>
                                                    </ListItem>
                                                    {index !== (files.length - 1) && <Divider/>}
                                                </>
                                            );
                                        })
                                    }
                                </List>
                            </CardContent>
                        </Card>}
                    </DialogContent>
                    <div style={{display: "inline-flex", justifyContent: "center", margin: "0 0 1% 0"}}>
                        <Button variant={"contained"} color={"primary"} size={"medium"} fullWidth={false}
                                onClick={() => this.props.hideDialog(this.props.inputFile ? 'uploadPanel' : 'additionalFile')}>
                            Close
                        </Button>
                    </div>
                </Dialog>
            </>
        );
    }

}

export default inject('DataStore','ResponseStore')(observer(DatasetUploadPanel));
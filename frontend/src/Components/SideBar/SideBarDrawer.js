import React, {Component} from "react";
import BackupOutlinedIcon from '@material-ui/icons/BackupOutlined';
import TuneOutlinedIcon from '@material-ui/icons/TuneOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import TreeView from "@material-ui/lab/TreeView";
import CustomTreeItem from "./CustomTreeItem";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import HomeIcon from '@material-ui/icons/Home';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import {inject, observer} from "mobx-react";
import DatasetUploadPanel from "../Dataset Fetcher/DatasetUploadPanel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {Divider, Slider, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";

class SideBarDrawer extends Component{

    dimensionalityReductionAlgorithm = [{label: "PCA"}]
    clusteringAlgorithm = [{label: "Number of Clusters", type: "inputfield", propName: "clusterSize", helperText: "clusterSizeHelperText"}, {label: "K-Means"}]
    visualizationType = [{label:"2D", link: "/visualize"}, {label: "3D", link: "/visualize"}]

    constructor(props) {
        super(props);
        this.state={
            uploadPanel: false,
            additionalFile: false
        }
    }

    changeState = (stateName) => {
        this.setState({[stateName]: !this.state[stateName]})
    }

    //Recursive function to return render custom tree component and it's sub component
    customTreeRenderer = (drawerObject) => {
        return drawerObject.map((component, index) =>
            <CustomTreeItem key={component.label} nodeId={component.label} labelText={component.label}
                            labelInfo={component.info !== undefined ? component.info.toString() : ""}
                            labelIcon={component.icon} link={component.link}
                            onClick={() => {
                                if (component.stateName !== undefined) {
                                    this.changeState(component.stateName)
                                }
                            }}
            >
                {component.subComponent !== undefined &&
                (component.subComponentType === "treeItem"
                        ?
                        this.customTreeRenderer(component.subComponent)
                        :
                        this.radioButtonGroupRenderer(component.subComponent, component.subComponentPurpose, component.subComponentType)
                )}
            </CustomTreeItem>
        )
    }

    radioButtonGroupRenderer = (component, purpose, subComponentType) => {
        let radioButtonComponents = subComponentType === "mixedInput" ? component.slice(1, component.length) : component
        return (
            <>
                {subComponentType === "mixedInput" &&
                <>
                    <div style={{justifyContent: "center", display: "flex"}}>
                        <Typography style={{marginTop: "5px"}}>{component[0].label}:</Typography>
                        <TextField style={{maxWidth: "50px", margin: "0 0 0 10px"}} variant={"standard"} color={"primary"}  type={"number"}
                                   value={this.props.DataStore[component[0].propName]} onChange={event => this.props.DataStore.changeClusterSize(Number(event.currentTarget.value))}
                                   helperText={this.props.DataStore[`${component[0].helperText}`]} error={this.props.DataStore[`${component[0].helperText}`] !== ""}
                        />
                    </div>
                    <div style={{padding: "0 0 0 20px"}}>
                        <Slider value={this.props.DataStore[component[0].propName]} min={2} max={100} step={1} valueLabelDisplay={"auto"} onChange={(e,value) => this.props.DataStore.changeClusterSize(value)}/>
                    </div>
                    <Divider variant={"middle"}/>
                </>}
                <RadioGroup value={this.props.DataStore[purpose]}
                            style={{padding: "16px 0 16px 100px"}}
                            onChange={event => this.props.DataStore.changeUserFields(event.currentTarget.value, purpose)}
                >
                    {radioButtonComponents.map(component =>
                        component.link ?
                            <Link to={component.link} style={{color: "inherit", textDecoration: "unset"}}>
                                <FormControlLabel key={component.label} value={component.label} control={<Radio color={"primary"}/>} label={component.label}/>
                            </Link>
                            :
                            <FormControlLabel key={component.label} value={component.label} control={<Radio color={"primary"}/>} label={component.label}/>
                    )}
                </RadioGroup>
            </>
        )
    }

    render() {
        /*
        * label: Name of the icon, icon: icon svg reference, subcomponent: define the type of the child component
        * */
        let sideBarDrawerComponents = [
            {label: "Home", icon: HomeIcon, link: "/multiomics_visualizer/"},
            {label: "Data", icon: BackupOutlinedIcon, subComponentType: "treeItem",
                subComponent: [
                    {label: "Omics files", icon: AttachFileOutlinedIcon, info: this.props.DataStore.filesCount, stateName: "uploadPanel"},
                    {label: "EC collection", icon: AttachFileOutlinedIcon, info: this.props.DataStore.additionalFileCount, stateName: "additionalFile"}]
            },
            {label: "Algorithms", icon: TuneOutlinedIcon, subComponentType: "treeItem",
                subComponent: [
                    {label: "Dimensionality Reduction", icon: TrendingDownIcon,
                        info: this.props.DataStore["dimensionalityReductionAlgorithm"],
                        subComponentType: "radioButton", subComponentPurpose: "dimensionalityReductionAlgorithm", subComponent: this.dimensionalityReductionAlgorithm
                    },
                    {label: "Clustering", icon: BubbleChartIcon,
                        info: this.props.DataStore["clusteringAlgorithm"],
                        subComponentType: "mixedInput", subComponentPurpose: "clusteringAlgorithm",
                        subComponent: this.clusteringAlgorithm
                    }
                ]
            },
            {label: "Visualization", icon: AssessmentOutlinedIcon,
                info: this.props.DataStore["visualizationType"],
                subComponentType: "radioButton", subComponentPurpose: "visualizationType", subComponent: this.visualizationType
            },
        ]
        return (
            <>
                {/*This div is the left hand panel*/}
                <div id={"leftPane"} style={{width: this.props.mobileMode ? "90%" : "17%"}}>
                    <TreeView
                        defaultCollapseIcon={<ArrowDropDownIcon />}
                        defaultExpandIcon={<ArrowRightIcon />}
                        defaultEndIcon={<div style={{ width: 24 }} />}
                    >
                        {this.customTreeRenderer(sideBarDrawerComponents)}
                    </TreeView>
                    <Link to={"/multiomics_visualizer/visualize"} style={{textAlign: "center", color: "inherit", textDecoration: "unset"}}>
                        <Button size={"small"} variant={"contained"} color={"primary"} style={{margin: "5px 0 5px 0"}}
                                name={"Visualize"}
                                onClick={() => {
                                    this.props.DataStore.toggleRequestPayloadCaller();
                                    if(this.props.mobileMode) {
                                        this.props.closeSideBar();
                                    }
                                }}>
                            Visualize
                        </Button>
                    </Link>
                </div>
                {this.state.uploadPanel &&
                <DatasetUploadPanel mobileMode={this.props.mobileMode} title={"Omics file upload panel"}
                                    inputFile={true} hideDialog={(stateName) => this.changeState(stateName)}/>
                }
                {this.state.additionalFile &&
                <DatasetUploadPanel mobileMode={this.props.mobileMode} title={"EC collection file upload panel"}
                                    inputFile={false} hideDialog={(stateName) => this.changeState(stateName)}/>
                }
            </>
        );
    }
}

export default inject('DataStore')(observer(SideBarDrawer));

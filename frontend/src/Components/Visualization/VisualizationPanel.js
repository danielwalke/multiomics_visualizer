import React,{Component} from "react";
import {inject, observer} from "mobx-react";
import D3Plot from "./2D Plot/D3Plot";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import {generateColors, loadingPlotColor, scorePlotColor} from "../Utility Functions/plotColors";
import Button from "@material-ui/core/Button";
import ReCluster from "../Request Payload/ReClusterRequest";
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import "./VisualizationPanel.css"
import Icon from "@material-ui/core/Icon";
import Tooltip from "@material-ui/core/Tooltip";
import {downloadData} from "../Utility Functions/downloadData";
import ThreeDVisualizer from "./3D Plot/ThreeDVisualizer";
import D3NetworkComparison from "./3D Plot/D3NetwrokComparison";

class VisualizationPanel extends Component {

    numberToStringArray = ["zero", "one", "two", "three", "four"];

    axis_2D = [{label: "X-axis",value: "XAxis"}, {label: "Y-axis", value: "YAxis"}]

    getClusterPercentage = (clusterLabels) => {
        let clusterSet = new Set(clusterLabels)
        let clusterPercentage = [];
        [...clusterSet].map((uniqueLabel,index) => {
            clusterPercentage[uniqueLabel] = ((clusterLabels.reduce((count, label) => label === uniqueLabel ? count+1 : count, 0)/clusterLabels.length)*100).toFixed(2);
        })
        return clusterPercentage;
    }

    reClusterData = {
        components: [],
        clusterSize: 0,
        reClusteringFileIndex: null,
        clusteredDataIndex: null
    }

    constructor(props) {
        super(props);
        this.state = {
            openXAxisSelection_0: false,
            openYAxisSelection_0: false,
            openXAxisSelection_1: false,
            openYAxisSelection_1: false,
            openXAxisSelection_2: false,
            openYAxisSelection_2: false,
            openXAxisSelection_3: false,
            openYAxisSelection_3: false,
            openXAxisSelection_4: false,
            openYAxisSelection_4: false,
            openLoadingsSelection_0: false,
            openLoadingsSelection_1: false,
            openLoadingsSelection_2: false,
            openLoadingsSelection_3: false,
            openLoadingsSelection_4: false,
        }
        this.clusterColors = generateColors(this.props.ResponseStore.clusterSize);
    }

    switchState = (stateName) => {
        this.setState({[stateName]: !this.state[stateName]});
    }

    reCluster = (componentsCoOrdinates, component1Index, component2Index, reClusteringFileIndex) => {
        this.reClusterData = {
            components: this.props.ResponseStore.convertToArray(componentsCoOrdinates),
            clusterSize: this.props.ResponseStore.clusterSize,
            reClusteringFileIndex: Number(reClusteringFileIndex),
            clusteredDataIndex: `${component1Index}${component2Index}`
        }
        this.props.ResponseStore.toggleReCluster(true)
    }

    render() {
        return (
            <div id={"rightPanel"} className={"rightPanel"} style={{width: this.props.mobileMode ? "100%" : "80%", margin: this.props.mobileMode ? "0" : "0 0 0 3%"}}>
                {
                    this.props.ResponseStore.reCluster && <ReCluster reClusterData={this.reClusterData}
                                                                     toggleRecluster = {(flag) => this.props.ResponseStore.toggleReCluster(flag)}/>
                }
                {this.props.visualizationType === "2D" && this.props.ResponseStore.heuristicResult.map( (data,index) =>
                    <Card key={`d3PlotDiv-${index}`} className={"d3PlotDiv"} variant={"outlined"} color={"primary"}>
                        <div>
                            {/*For displaying loadings count*/}
                            <FormControl key={`loadingsSelection_file${index}`} style={{margin: "1%", minWidth: "120px"}}>
                                <InputLabel>Show Loadings</InputLabel>
                                <Select
                                    open={this.state[`openLoadingsSelection_${index}`]}
                                    onOpen={() => this.switchState(`openLoadingsSelection_${index}`)}
                                    value={data.displayLoadings}
                                    renderValue={(value => value === "All" ? "All" : `Top ${value}`)}
                                    onClose={() => this.switchState(`openLoadingsSelection_${index}`)}
                                    onChange={(event) => this.props.ResponseStore.changeDisplayLoadings(index, event.target.value)}
                                >
                                    {Array.from(Array(data.reducedDimensionData.featureCount < data.maxDisplayLoadings ? data.reducedDimensionData.featureCount : data.maxDisplayLoadings).keys()).map(feature =>
                                        <MenuItem value={feature === 0 ? "All" : feature} key={feature}>
                                            <Typography variant={"subtitle1"}>
                                                {feature === 0 ? "All" : `Top ${feature}`}
                                            </Typography>
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            {/*To display the X-axis and Y-axis component*/}
                            {this.axis_2D.map((axisName, axisPosition) =>
                                <FormControl key={axisName.value} style={{margin: "1%", minWidth: "120px"}}>
                                    <InputLabel>{axisName.label}</InputLabel>
                                    <Select
                                        open={this.state[`open${axisName.value}Selection_${index}`]}
                                        onOpen={() => this.switchState(`open${axisName.value}Selection_${index}`)}
                                        value={axisPosition === 0 ? data.component1 : data.component2}
                                        renderValue={(value => "Component " + value)}
                                        onClose={() => this.switchState(`open${axisName.value}Selection_${index}`)}
                                        onChange={(event) => this.props.ResponseStore.changeAxisComponent(index, "component" + Number(axisPosition + 1), event.target.value)}
                                    >
                                        {/*To show all the component number and their variance ratio*/}
                                        {data.reducedDimensionData.varianceRatio.map((value, index) =>
                                            <MenuItem
                                                disabled={axisPosition === 0 ? index + 1 === data.component2 : index + 1 === data.component1}
                                                name={axisPosition + 1} value={index + 1} key={index}>
                                                <div style={{display: "flex", flex: 1, justifyContent: "space-between"}}>
                                                    <Typography variant={"subtitle1"}>{`${index + 1}`}</Typography>
                                                    <Typography variant={"subtitle2"} style={{
                                                        alignItems: "center",
                                                        display: "flex",
                                                        color: "grey"
                                                    }}>{`variance: ${value} %`}</Typography>
                                                </div>
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            )}
                            {/*To Display form cluster button*/}
                            {data.clusteredData === undefined &&
                            <Button value={index} size={"small"} color={"primary"} variant={"contained"}
                                    style={{margin: "-20px 0 0 5px"}}
                                    onClick={event => this.reCluster(data.reducedDimensionData.narrowMatrix, data.component1,
                                        data.component2, event.currentTarget.value)}
                            >
                                Form Cluster
                            </Button>
                            }
                            <Tooltip title={"Download CSV"}>
                                <Icon fontSize={"large"} onClick={() => downloadData(data)}>
                                    <CloudDownloadOutlinedIcon style={{padding: "25px 0 0 20px", cursor: "pointer"}}/>
                                </Icon>
                            </Tooltip>
                        </div>
                        {/*To display the visualization panel*/}
                        <D3Plot key={data.title} scorePlotColor={scorePlotColor} loadingPlotColor={loadingPlotColor}
                                clusterColors={(data.clusteredData === undefined || data.clusteredData.centroidLabels === undefined )? this.clusterColors : generateColors(data.clusteredData.centroidLabels.length)}
                                data={data} fileNumber={this.numberToStringArray[index]}
                                fileIndex={index} mobileMode = {this.props.mobileMode}
                                clusterPercentage={data.clusteredData !== undefined ? this.getClusterPercentage(data.clusteredData.labels) : undefined}
                                chageSelectedTarget={(targetArray) => this.props.ResponseStore.changeSelectedTarget(targetArray)}
                                selectedTarget={this.props.ResponseStore.selectedTargetArray}
                        />
                    </Card>
                )}
                {this.props.visualizationType === "3D" &&
                <ThreeDVisualizer dataPointsColor={this.clusterColors} mobileMode={this.props.mobileMode}
                                  getClusterLabelPercentage={(labels) => this.getClusterPercentage(labels)}
                />
                }
            </div>
        );
    }

}

export default inject('ResponseStore')(observer(VisualizationPanel));
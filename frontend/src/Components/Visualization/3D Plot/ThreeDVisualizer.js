import React, {Component, forwardRef} from "react";
import ThreeJSPlanet from "./ThreeJSPlanet";
import {orbitRadius, sunSphereRadius} from "../../Utility Functions/threeD_utilityFunctions";
import {inject, observer} from "mobx-react";
import {
    AccordionSummary,
    Button,
    CardHeader,
    CardMedia,
    Divider,
    IconButton,
    Radio,
    Slider,
    Typography
} from "@material-ui/core";
import SettingsIcon from '@material-ui/icons/Settings';
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import "./ThreeDVisualizer.css"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {
    AddBox, ArrowUpward,
    Check,
    CheckBox,
    ChevronLeft,
    ChevronRight,
    Clear, FilterList,
    FirstPage,
    LastPage, Remove,
    SaveAlt, Search, ViewColumn
} from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Switch from "@material-ui/core/Switch";
import {enumeration} from "./Enums";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import MaterialTable from "material-table";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {generateColors} from "../../Utility Functions/plotColors";
import D3NetworkComparison from "./D3NetwrokComparison";
import * as _ from "lodash"
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import Tooltip from "@material-ui/core/Tooltip";

class ThreeDVisualizer extends Component {

    constructor(props) {
        super(props);
        this.threeJSPlanetRef = React.createRef();
        this.visualizerRef = React.createRef();
        this.threeDOptionRef = React.createRef();
        this.tableTitle = [{title: "Target Name", field: "label"}]
        this.state = {
            open: false,
            chosenPoints: [],
            showNetworkComparison: false,
            keggInteraction: false,
            keggNetwork: this.props.ResponseStore.getAdditionalFile.length !== 0,
            dataContainer: enumeration.dataContainer_square,
            fullscreenText: "Enter Fullscreen",
            orbitRadiusAmplifier: 3.5,
            ECConnectionRange: this.props.ResponseStore.getRangeOfTargetFeaturesConnection("Protein", this.props.ResponseStore.getTargetFeatureConnection),
            ECConnectionRange_userSelection: this.props.ResponseStore.getRangeOfTargetFeaturesConnection("Protein", this.props.ResponseStore.getTargetFeatureConnection),
            CPDConnectionRange: this.props.ResponseStore.getRangeOfTargetFeaturesConnection("Metabolite", this.props.ResponseStore.getTargetFeatureConnection),
            CPDConnectionRange_userSelection: this.props.ResponseStore.getRangeOfTargetFeaturesConnection("Metabolite", this.props.ResponseStore.getTargetFeatureConnection),
        }
        this.chosenPoints = [];
    };

    componentDidMount() {
        this.fullscreenEventListener("add");
    }

    componentWillUnmount() {
        this.fullscreenEventListener("remove");
    }

    fullscreenEventListener = (type) => {
        if(type === "add") {
            document.addEventListener('fullscreenchange', this.fullScreenStateChange, false);
            document.addEventListener('mozfullscreenchange', this.fullScreenStateChange, false);
            document.addEventListener('webkitfullscreenchange', this.fullScreenStateChange, false);
        }
        else {
            document.removeEventListener('fullscreenchange', this.fullScreenStateChange, false);
            document.removeEventListener('mozfullscreenchange', this.fullScreenStateChange, false);
            document.removeEventListener('webkitfullscreenchange', this.fullScreenStateChange, false);
        }
    }

    tableIcons = {
        Add: forwardRef ((props, ref) => <AddBox {...props} ref={ref}/>),
        Check: forwardRef ((props, ref) => <Check {...props} ref={ref}/>),
        Clear: forwardRef ((props, ref) => <Clear {...props} ref={ref}/>),
        Delete: forwardRef ((props, ref) => <DeleteIcon {...props} ref={ref}/>),
        DetailPanel: forwardRef ((props, ref) => <ChevronRight {...props}
                                                               ref={ref}/>),
        Export: forwardRef ((props, ref) => <SaveAlt {...props} ref={ref}/>),
        Filter: forwardRef ((props, ref) => <FilterList {...props} ref={ref}/>),
        FirstPage: forwardRef ((props, ref) => <FirstPage {...props} ref={ref}/>),
        LastPage: forwardRef ((props, ref) => <LastPage {...props} ref={ref}/>),
        NextPage: forwardRef ((props, ref) => <ChevronRight {...props} ref={ref}/>),
        PreviousPage: forwardRef ((props, ref) => <ChevronLeft {...props}
                                                               ref={ref}/>),
        ResetSearch: forwardRef ((props, ref) => <Clear {...props} ref={ref}/>),
        Search: forwardRef ((props, ref) => <Search {...props} ref={ref}/>),
        SortArrow: forwardRef ((props, ref) => <ArrowUpward {...props} ref={ref}/>),
        ThirdStateCheck: forwardRef ((props, ref) => <Remove {...props}
                                                             ref={ref}/>),
        ViewColumn: forwardRef ((props, ref) => <ViewColumn {...props} ref={ref}/>),
    };

    addOrRemovePoints = (data, index, shouldAdd) => {
        // let points = [...this.state.chosenPoints];
        if(shouldAdd) {
            // points = this.state.chosenPoints;
            this.chosenPoints.push(data);
        }
        else {
            // points = this.state.chosenPoints;
            this.chosenPoints.splice(index, 1);
        }
        // console.log(this.chosenPoints);
        this.setState({chosenPoints: [...this.chosenPoints]});
    };

    getDrawnLines = (index) => {
        return this.chosenPoints[index];
    }

    isLineDrawn = (label) => {
        // console.log(label);
        let index =  this.chosenPoints.findIndex(point => point.label === label);
        // console.log(index);
        return index;
    }

    changeState = (stateName, stateValue) => {
        this.setState({[stateName]: stateValue});
    };

    deleteChosenPoint = (index) => {
        this.threeJSPlanetRef.current.removeLine(index);
    };

    changeDataContainer = (value) => {
        this.setState({dataContainer: value});
        this.threeJSPlanetRef.current.changeDataContainer(value, this.chosenPoints);
    };

    displayKeggInteraction = (displayKeggInteraction) => {
        this.setState({keggInteraction: displayKeggInteraction}, () => {
            this.threeJSPlanetRef.current.displayKeggInteraction(displayKeggInteraction, this.state.ECConnectionRange_userSelection, this.state.CPDConnectionRange_userSelection)
        })
    };

    displayKeggNetwork = (displayKeggNetwork) => {
        this.setState({keggNetwork: displayKeggNetwork}, () => {
            this.displayKeggInteraction(displayKeggNetwork);
            this.threeJSPlanetRef.current.displayKeggNetwork(displayKeggNetwork);
        })
    };

    findConnection = (value) => {
        if(value !== null) {
            this.threeJSPlanetRef.current.findConnection(value);
        }
        return null;
    };

    getDisabledOptions = (option) => {
        let found = false;
        this.chosenPoints.map(point => {
            if (point.label === option.label) {
                found = true;
                return 0;
            }
        })
        return found;
    };

    findConnectionInReRenderedScene = (pointDetails) => {
        pointDetails.map(point => {
            this.threeJSPlanetRef.current.findConnection(point)
        })
    };

    findECCompoundConnection = (ECCompoundName) => {
        this.threeJSPlanetRef.current.findECCompoundConnection(ECCompoundName);
    }

    fullScreenStateChange = () => {
        if((document.webkitIsFullScreen === false || document.mozFullScreen === false)) {
            this.setState({fullscreenText: "Enter Fullscreen"});
            this.threeJSPlanetRef.current.resize();
            this.threeJSPlanetRef.current.toggleVRButton(false);
        }
    }

    changeOrbitRadius = () => {
        this.threeJSPlanetRef.current.changeOrbitRadius();
        this.threeJSPlanetRef.current.changeDataContainer(this.state.dataContainer, this.chosenPoints);
    }

    fullScreen = () => {
        // this.changeState("open", !this.state.open);
        if(document.webkitIsFullScreen === false || document.mozFullScreen === false) {
            this.visualizerRef.current.requestFullscreen().then(() => {
                this.setState({fullscreenText: "Exit Fullscreen"});
                this.threeJSPlanetRef.current.toggleVRButton(true);
            });
        }
        else {
            document.exitFullscreen().then(() => {
                this.fullScreenStateChange();
            });
        }
    }

    showSelectedRageConnections = (stateName, filetype) => {
        this.threeJSPlanetRef.current.filterKeggInteraction(stateName, filetype);
    }

    getComparisonData = () => {
        let comparisonData = [];
        this.chosenPoints.map(point => {
            comparisonData.push({label: point.label, EC: point.EC, CPD: point.CPD})
        })
        return comparisonData;
    }

    render() {
        let targetFeatureConnection = this.props.ResponseStore.getTargetFeatureConnection;
        return (
            <>
                <div id={"visualization-container"} style={{width: "100%"}} ref={this.visualizerRef}>
                    {this.state.showNetworkComparison &&
                    <>
                        <D3NetworkComparison
                            tooltipData={(name, type) => this.props.ResponseStore.getECCPEDDetails(name, type)}
                            EC_userSelectionRange = {this.state.ECConnectionRange_userSelection}
                            ECRange = {this.state.ECConnectionRange}
                            CPD_userSelectionRange = {this.state.CPDConnectionRange_userSelection}
                            CPDRange = {this.state.CPDConnectionRange}
                            parentDiv={() => this.visualizerRef.current}
                            comparisonData = {this.getComparisonData()}
                            close={() => this.changeState("showNetworkComparison", !this.state.showNetworkComparison)}
                            data={this.props.ResponseStore.getNodesAndLines_2D}/>
                    </>
                    }
                    <ThreeJSPlanet data = {this.props.ResponseStore.heuristicResult}
                                   close3DSetting={() => this.changeState("open", false)}
                                   generateColors={(colorsCount) => generateColors(colorsCount)}
                                   ref={this.threeJSPlanetRef}
                                   displayKeggNetwork = {() => this.state.keggNetwork}
                                   displayKeggInteraction = {() => this.state.keggInteraction}
                                   getchosenPoints = {() => this.chosenPoints}
                                   dataPointsColor = {this.props.dataPointsColor}
                                   lineDrawnForThisPoint = {(label) => this.isLineDrawn(label)}
                                   addOrRemovePoints = {(data, index, shouldAdd) => this.addOrRemovePoints(data, index, shouldAdd)}
                                   getDrawnLines = {(index) => this.getDrawnLines(index)}
                                   additionalFile = {this.props.ResponseStore.getAdditionalFile}
                                   objectPositions = {(orbitRadius) => this.props.ResponseStore.getObjectPositions(orbitRadius, this.state.orbitRadiusAmplifier)}
                                   // orbitRadius = {this.state.orbitRadiusAmplifier} sunSphereRadius={sunSphereRadius}
                                   getClusterLabelPercentage = {(labels) => this.props.getClusterLabelPercentage(labels)}
                                   keggLinkCoordinates = {this.props.ResponseStore.keggLinksCoordinates}
                                   targetFeatureConnection = {targetFeatureConnection}
                                   compoundList = {this.props.ResponseStore.compoundList}
                                   ECConnectionRange={() => this.state.ECConnectionRange_userSelection}
                                   CPDConnectionRange={() => this.state.CPDConnectionRange_userSelection}
                                   findConnectionInReRenderedScene = {(points) => this.findConnectionInReRenderedScene(points)}
                                   d3Enabled = {() => this.state.showNetworkComparison}
                                   fullscreenEventListener={(type) =>  this.fullscreenEventListener(type)}
                                   dataContainerType={this.state.dataContainer}
                    />
                    <Button style={{position: "absolute", top: "1%", left: this.props.mobileMode ? "" : "85%"}} variant={"contained"}
                            onClick={() => this.changeState("open", !this.state.open)} color={"primary"} endIcon={<SettingsIcon/>}>
                        Options
                    </Button>
                    {/*<Tooltip title={this.state.fullscreenText}>*/}
                    <IconButton style={{position: "absolute", bottom: "1%", right: "1%"}} onClick={() => this.fullScreen()}>
                        {this.state.fullscreenText === "Enter Fullscreen" &&
                        <FullscreenIcon fontSize={"large"} style={{color: "#FFFFFF"}}/>
                        }
                        {this.state.fullscreenText === "Exit Fullscreen" &&
                        <FullscreenExitIcon fontSize={"large"} style={{color: "#FFFFFF"}}/>
                        }
                    </IconButton>
                    {/*</Tooltip>*/}
                    {/*{this.state.open &&*/}
                    <div ref={this.threeDOptionRef}
                         style={{position: 'absolute', top: this.props.mobileMode ? "8%" : "5%", right: 0, width: this.props.mobileMode ? "100%" : (window.innerWidth >= 1000 ? "25%" : "50%"),
                        zIndex: 2000, maxHeight: this.state.open ? `${window.innerHeight - (3 * this.threeDOptionRef.current.offsetTop)}px` : 0, overflowY: "scroll", borderRadius: "20px"}}>
                        <Card>
                            <CardHeader title={"3D options"}/>
                            <CardMedia>
                                <List>
                                    <ListItem style={{display:"block"}}>
                                        <Button  variant={"contained"} color={"primary"}
                                                 onClick={()=> this.props.DataStore.resetView()}>Reset View</Button>
                                    </ListItem>
                                    <ListItem style={{display: "block"}}>
                                        <ListItemText primary={"Chosen Points"} secondary={"Points which are connected across layers"}/>
                                        <Divider variant={"middle"}/>
                                        <div style={{display: "flex", flexWrap: "wrap", maxWidth: "99%", margin: "1% 0"}}>
                                            {this.state.chosenPoints.map((point, index) => {
                                                return <Chip style={{margin: "1%"}} color={"primary"}
                                                             size={"small"} key={index} label={point.label} onDelete={() => this.deleteChosenPoint(index)}/>
                                            })}
                                            {this.state.chosenPoints.length === 0 && <>No Points Selected</>}
                                        </div>
                                        <Accordion style={{margin: "5px 0"}}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Target labels</Typography></AccordionSummary>
                                            <AccordionDetails style={{padding: 0}}>
                                                <MaterialTable title={""} icons={this.tableIcons} style={{width: "100%", boxShadow: "unset"}}
                                                               columns={this.tableTitle}
                                                               data={this.props.ResponseStore.getGraphTarget}
                                                               actions={[rowData => ({
                                                                   icon: () => this.getDisabledOptions(rowData) === true ?
                                                                       <VisibilityOffIcon color={"secondary"}/> :
                                                                       <VisibilityIcon color={"primary"}/>,
                                                                   onClick: (event, rowData) => this.findConnection(rowData)
                                                               })]}
                                                               onRowClick={(event, rowData) => this.findConnection(rowData)}
                                                               options = {{
                                                                   pageSize: 5,
                                                                   pageSizeOptions: []
                                                               }}
                                                />
                                            </AccordionDetails>
                                        </Accordion>
                                        {this.props.ResponseStore.getECCompoundList().map((ECCompoundSet, index) =>
                                            <Accordion key={ECCompoundSet.label+index} style={{margin: "5px 0"}}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>{ECCompoundSet.label}</Typography></AccordionSummary>
                                                <MaterialTable title={""} icons={this.tableIcons} style={{width: "100%", boxShadow: "unset"}}
                                                               columns={this.tableTitle}
                                                               data={ECCompoundSet.list}
                                                               onRowClick={(event, rowData) => this.findECCompoundConnection(rowData.label)}
                                                               options = {{
                                                                   pageSize: 5,
                                                                   pageSizeOptions: []
                                                               }}
                                                />
                                            </Accordion>
                                        )}
                                    </ListItem>
                                    <Divider variant={"fullWidth"} />
                                    <ListItem style={{justifyContent: "center"}} >
                                        <Button  variant={"contained"} color={"primary"}
                                                 disabled={this.props.ResponseStore.getECCompoundList().length === 0}
                                                 onClick={() => {
                                                     this.changeState("open", !this.state.open);
                                                     this.changeState("showNetworkComparison", !this.state.showNetworkComparison)
                                                 }}>
                                            Compare Kegg pathway interaction
                                        </Button>
                                    </ListItem>
                                    <Divider variant={"fullWidth"} />
                                    <ListItem style={{display: "block"}}>
                                            <ListItemText primary={`Orbit Radius Amplifier: ${this.state.orbitRadiusAmplifier}`}/>
                                            <Slider value={this.state.orbitRadiusAmplifier}
                                                    min={2}
                                                    max={5}
                                                    step={0.1}
                                                    onChange={(e, value) => this.changeState("orbitRadiusAmplifier", Number(value))}
                                                    valueLabelDisplay={"auto"}
                                            />
                                            <Button color={"primary"} variant={"outlined"}
                                                    onClick={this.changeOrbitRadius}>Apply</Button>
                                        </ListItem>
                                    <Divider variant={"fullWidth"} />
                                    {this.state.ECConnectionRange !== undefined &&
                                    <>
                                        <ListItem style={{display: "block"}}>
                                            <ListItemText primary={`Abundance ratio range (EC number): ${this.state.ECConnectionRange_userSelection[0].toFixed(3)} - ${this.state.ECConnectionRange_userSelection[1].toFixed(3)}`}/>
                                            <Slider value={this.state.ECConnectionRange_userSelection}
                                                    min={this.state.ECConnectionRange[0]}
                                                    max={this.state.ECConnectionRange[1]}
                                                    step={this.state.ECConnectionRange[1] / 100}
                                                    onChange={(e, value) => this.changeState("ECConnectionRange_userSelection", [Number(value[0].toFixed(3)), Number(value[1].toFixed(3))])}
                                                    valueLabelDisplay={"auto"}
                                                    valueLabelFormat={value => value.toFixed(3)}
                                            />
                                            <Button color={"primary"} variant={"outlined"} disabled={!this.state.keggInteraction}
                                                    onClick={() => this.showSelectedRageConnections(this.state.ECConnectionRange_userSelection, "Protein")}>Apply</Button>
                                        </ListItem>
                                        <Divider variant={"fullWidth"}/>
                                    </>
                                    }
                                    {this.state.CPDConnectionRange !== undefined &&
                                    <>
                                        <ListItem style={{display: "block"}}>
                                            <ListItemText primary={`Abundance ratio range (Compound): ${this.state.CPDConnectionRange_userSelection[0]} - ${this.state.CPDConnectionRange_userSelection[1]}`}/>
                                            <Slider value={this.state.CPDConnectionRange_userSelection}
                                                    min={this.state.CPDConnectionRange[0]}
                                                    max={this.state.CPDConnectionRange[1]}
                                                    step={this.state.CPDConnectionRange[1] / 100}
                                                    onChange={(e, value) => this.changeState("CPDConnectionRange_userSelection", [Number(value[0].toFixed(3)), Number(value[1].toFixed(3))])}
                                                    valueLabelDisplay={"auto"}
                                                    valueLabelFormat={value => value.toFixed(3)}
                                            />
                                            <Button color={"primary"} variant={"outlined"} disabled={!this.state.keggInteraction}
                                                    onClick={() => this.showSelectedRageConnections(this.state.CPDConnectionRange_userSelection, "Metabolite")}>Apply</Button>
                                        </ListItem>
                                        <Divider variant={"fullWidth"}/>
                                    </>}
                                    <ListItem>
                                        <ListItemText primary={"Display Kegg Network"}/>
                                        <ListItemSecondaryAction>
                                            <Switch disabled={this.props.ResponseStore.getAdditionalFile.length === 0}
                                                    checked={this.state.keggNetwork} color={"primary"}
                                                    onChange={() => this.displayKeggNetwork(!this.state.keggNetwork)}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider variant={"fullWidth"} />
                                    <ListItem>
                                        <ListItemText primary={"Display Kegg Network Interaction"}/>
                                        <ListItemSecondaryAction>
                                            <Switch disabled={!this.state.keggNetwork} checked={this.state.keggInteraction} color={"primary"}
                                                    onChange={() => this.displayKeggInteraction(!this.state.keggInteraction)}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider variant={"fullWidth"} />
                                    <ListItem>
                                        <ListItemText primary={"Layer type"}/>
                                        <RadioGroup value={this.state.dataContainer} onChange={(event) => this.changeDataContainer(event.target.value)}>
                                            <FormControlLabel value={enumeration.dataContainer_sphere} control={<Radio color={"primary"}/>} label={"Sphere"}/>
                                            <FormControlLabel value={enumeration.dataContainer_square} control={<Radio color={"primary"}/>} label={"Plane"}/>
                                        </RadioGroup>
                                    </ListItem>
                                </List>
                            </CardMedia>
                        </Card>
                    </div>
                    {/*// }*/}
                </div>
            </>
        );
    }
}

export default inject('ResponseStore', "DataStore") (observer(ThreeDVisualizer));

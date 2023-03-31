import React, {Component} from "react";
import NavigationBar from "../Header/NavigationBar";
import SideBarDrawer from "../SideBar/SideBarDrawer";
import RequestPayload from "../Request Payload/DimReductionAndClusterRequest";
import {inject, observer} from "mobx-react";
import VisualizationPanel from "../Visualization/VisualizationPanel";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import {isMobile} from "react-device-detect"
import Drawer from "@material-ui/core/Drawer";
import "./Home.css"
import SnackbarDisplay from "../Error display/SnackbarDisplay";
import Introduction from "../Introduction";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import OVGULogo from "../../images/OVGU_fin_logo.png"
import DBSELogo from "../../images/DBSE_logo.png"

class Home extends Component{

    constructor(props) {
        super(props);
        this.state = {
            responsePayLoad: false,
            mobileMode: isMobile || window.innerWidth <= 800,
            openDrawer: false
        }
    }

    componentDidMount() {
        window.addEventListener("resize", () => {
            this.setState({mobileMode:  isMobile || window.innerWidth <= 800})
        }, false);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", () => {
            this.setState({mobileMode:  isMobile || window.innerWidth <= 800})
        }, false);
    }

    changeState = (stateName) => {
        this.setState({[stateName]: !this.state[stateName]})
    }

    render() {
        return (
            <BrowserRouter>
                <header>
                    <NavigationBar mobileMode={this.state.mobileMode} changeState={(stateName) => this.changeState(stateName)}/>
                </header>
                <div style={{borderRadius: "0", background: "#0068b8", overflow: "auto", position: "relative"}}>
                    <div style={{display: "flex", borderRadius: "30px 30px 0 0", background: "white", overflow: "auto", position: "relative"}}>
                        {this.state.openDrawer && this.state.mobileMode &&
                        <Drawer variant={"temporary"} anchor={"left"}
                                style={{width: "80%"}} open={this.state.openDrawer} onClose={() => this.changeState("openDrawer")}>
                            <div style={{display: "flex", flexDirection: "column", background: "#0068b4"}}>
                                <a href={"https://www.inf.ovgu.de/"} target={"_blank"} rel="noopener noreferrer" style={{height: "80px"}}>
                                    <img src={OVGULogo} alt={"OVGU Logo"}/>
                                </a>
                                 <a href={"https://www.dbse.ovgu.de/"} target={"_blank"} rel="noopener noreferrer"
                               style={{textDecoration: "unset", color: "white", "fontWeight": 500, fontSize: "1rem", lineHeight: "1.2rem", margin: "10px"}}>
                                    WORKING GROUP DATABASES AND SOFTWARE ENGINEERING
                                </a>
                            </div>
                            <SideBarDrawer closeSideBar={() => this.changeState("openDrawer")} mobileMode={this.state.mobileMode}/>
                        </Drawer>
                        }
                        {!this.state.mobileMode && <SideBarDrawer mobileMode={this.state.mobileMode} style={{width: "25%"}}/>}
                        {this.props.DataStore.callRequestPayload && <RequestPayload/>}
                        <Switch>
                            <Route exact path={"/"}>
                                <Introduction mobileMode={this.state.mobileMode} closeSideBar={() => this.changeState("openDrawer")}/>
                            </Route>
                            <Route path={"/visualize"}>
                                {this.props.ResponseStore.visualize &&
                                <VisualizationPanel style={{width: this.state.mobileMode ? "100%" : "75%"}} mobileMode={this.state.mobileMode}
                                                    visualizationType={this.props.DataStore.visualizationType}/>}
                            </Route>
                        </Switch>
                        {this.props.ResponseStore.showBackDrop === true &&
                        <Backdrop style={{opacity: "0.8", zIndex: "1", backgroundColor:"#fafafa", color:"#030409"}}
                                  open={this.props.ResponseStore.showBackDrop === true}>
                            Processing....&nbsp;&nbsp;<CircularProgress/>
                        </Backdrop>}
                        {this.props.ResponseStore.responseError !== undefined &&
                        <SnackbarDisplay enabled={true} severity={"error"} message={this.props.ResponseStore.errorMessage}/>
                        }
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

export default inject('DataStore','ResponseStore')(observer(Home));
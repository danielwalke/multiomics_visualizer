import React, { Component } from 'react'
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";


export default  class  ApplicationBar extends Component{

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <AppBar style={{zIndex: "10000"}} position={"static"} color={"transparent"}>
                <Tabs onChange={(e,tabValue) => this.props.changeTab(tabValue)} value={this.props.currentTabIndex} variant={"fullWidth"} textColor={"primary"} indicatorColor={"primary"}>
                    <Tab label={"App Settings"}/>
                    <Tab label={"2D"}/>
                    <Tab label={"3D"}/>
                </Tabs>
            </AppBar>
        );
    }

}
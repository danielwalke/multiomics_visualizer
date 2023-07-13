import React from "react"
import OVGULogo from "../../Assets/ISAS_Logo_Standard.jpg"
import DBSELogo from "../../images/DBSE_logo.png"
import {AppBar, IconButton} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';

export default function NavigationBar(props) {

    let style = {
        navBar: {flexDirection: "row", display: "flex", justifyContent: props.mobileMode ? "" : "space-between", height: props.mobileMode ? "80px" : "", background: "#000", color: "white"},
        title: {display:  props.mobileMode ? "" : "flex", margin: props.mobileMode ? "0" : "0 130px 0 0", alignSelf: "center", alignItems: "center", fontSize: "1.25rem", fontWeight: "600", width: props.mobileMode ? "100%" : ""},
        DBSEText: {color: "black",fontSize: "x-larger", fontWeight: "600", wordBreak: "break-word", width: "250px", textAlign: "left", padding: "0 0 0 5px"},
        DBSELogo: {/*position: "fixed", left: "93%",*/ width: "100px", margin: "0 25px 0 0" },
        icon: {color: "white"}
    }

    return (
        <>
            <div style={style.navBar}>
                {!props.mobileMode &&
                    <img style={{height:'81px', cursor:'pointer'}} src={OVGULogo} alt={"OVGU Magdeburg"} onClick={() => window.open("https://www.isas.de/", "_blank")}/>
                }
                {props.mobileMode &&
                <IconButton style={style.icon} onClick={() => props.changeState("openDrawer")} disableRipple>
                    <MenuIcon/>
                </IconButton>
                }
                <div style={style.title}>
                    Multiomics Visualizer
                </div>
                {/*    WORKING GROUP DATABASES AND SOFTWARE ENGINEERING*/}
                <div style={style.title}></div>
            </div>
        </>
    );
}

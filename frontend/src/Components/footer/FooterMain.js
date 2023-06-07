import React from "react";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";

export const FooterMain = (props) =>{
    return(
        <div style={{backgroundColor:"#0068B4", zIndex: 10000, height: "2em", display: "flex",
        justifyContent:"center", alignItems:"center", color:"white", width:"100%"}}>
            <Link to={"/site_notice"} style={{textAlign: "center", color: "inherit", textDecoration: "unset"}}>
                <Button size={"small"} variant={"contained"} color={"primary"} style={{margin: "5px 0 5px 0"}}>
                    Site Notice
                </Button>
            </Link>
            <Link to={"/data_protection"} style={{textAlign: "center", color: "inherit", textDecoration: "unset"}}>
                <Button size={"small"} variant={"contained"} color={"primary"} style={{margin: "5px 0 5px 0"}}>
                    Data protection
                </Button>
            </Link>
        </div>
    )
}
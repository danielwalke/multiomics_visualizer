import React from "react";
import Button from "@material-ui/core/Button";
import {Link} from "react-router-dom";

export const FooterMain = (props) =>{
    return(
        <div style={{backgroundColor:"#000", zIndex: 10000, height: "2em", display: "flex",
        justifyContent:"center", alignItems:"center", color:"white", width:"100%"}}>
            <div style={{"padding": ".5rem", display: "flex",
                justifyContent:"center", alignItems:"center", width:"100%", gap:".25rem"}}>
                {/*<Link to={"/multiomics_visualizer/site_notice"} style={{textAlign: "center", color: "inherit", textDecoration: "unset"}}>*/}
                {/*    <Button size={"small"} variant={"contained"} color={"primary"} style={{margin: "5px 0 5px 0", lineHeight:"1rem"}}>*/}
                {/*        Site Notice*/}
                {/*    </Button>*/}
                {/*</Link>*/}
                {/*<Link to={"/multiomics_visualizer/data_protection"} style={{textAlign: "center", color: "inherit", textDecoration: "unset"}}>*/}
                {/*    <Button size={"small"} variant={"contained"} color={"primary"} style={{margin: "5px 0 5px 0", lineHeight:"1rem"}}>*/}
                {/*        Data protection*/}
                {/*    </Button>*/}
                {/*</Link>*/}
            </div>

        </div>
    )
}

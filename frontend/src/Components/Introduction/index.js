import React, {PureComponent} from "react";
import "./index.css"
import {Button} from "@material-ui/core";
import goal from "../../Assets/SVG/goal.svg"
import note from "../../Assets/SVG/note.svg"
import documentation from "../../Assets/SVG/documentation.svg"
import {getKEGGContent, getOmicsContents} from "../../Demo";
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";
import sample from "../../Assets/Download/Sample.zip"
import tutorial from "../../Assets/Download/User guide.pdf"


class Introduction extends PureComponent {

    load = () => {
        const demoOmicsFiles = [];
        const demoOmicsContents = getOmicsContents();
        demoOmicsContents.map(demoContent => {
            const stream = new Blob([demoContent.content], {type: 'text/csv;charset=utf-8'});
            stream.name = demoContent.name;
            const file = {
                file: stream,
                fileType: demoContent.fileType,
                clustering: "auto",
                component1: 1,
                component2: 2,
                displayLoadings: "All",
                targetFeatureConnection: [],
                reducedDimensionData: "",
                clusteredData: {},
                selectedTarget: null,
            };
            demoOmicsFiles.push(file)
        })

        const demoKEGGContent = getKEGGContent();
        const stream = new Blob([demoKEGGContent.content], {type: 'text/csv;charset=utf-8'});
        stream.name = demoKEGGContent.name;
        const demoKEGGFile = [{
            file: stream,
            fileType: "Additional File",
            kegg: {},
        }];

        this.props.DataStore.addFiles(demoOmicsFiles);
        this.props.DataStore.addAdditionalFile(demoKEGGFile);

        this.props.DataStore.toggleRequestPayloadCaller();
        if(this.props.mobileMode) {
            this.props.closeSideBar();
        }
    }

    render() {
        return (
            <div className={"introduction-body"} style={{width: this.props.mobileMode ? "100%" : "80%"}}>
                <div id={"aim"} className={`grey-text ${this.props.mobileMode ? "" :"flex max-height flex-direction"}`}>
                    <div style={{width: this.props.mobileMode? "" : "50%", display: "flex", justifyContent: "center"}}>
                        <img src={goal} alt={"aim"} style={{width: "65%"}}/>
                    </div>
                    <div id={"section-container"} style={{width: this.props.mobileMode? "" : "50%"}}>
                        <p id={"section-header"}>
                            Analysis Platform
                        </p>
                        <p id={"section-content"}>
                            Multiomics visualizer is an analysis platform based on circular multilayer networks.
                            This supports visualization of up to five omics layers with a maximum size of up to 20MB.
                            Currently, this app includes PCA, clustering along with 2D and 3D visualization and a limited VR options.
                        </p>
                        <Link to={"/multiomics/visualize"}>
                            <Button color={"primary"} variant={"outlined"} onClick={this.load}>
                                Demo
                            </Button>
                        </Link>
                    </div>
                </div>
                <div id={"requirements"} className={`grey-text ${this.props.mobileMode ? "" :"flex max-height"}`}>
                    <div style={{width: this.props.mobileMode? "" : "50%", display: "flex", justifyContent: "center"}}>
                        <img src={note} alt={"note"} style={{width: "65%"}}/>
                    </div>
                     <div id={"section-container"} style={{width: this.props.mobileMode? "" : "50%"}}>
                        <p id={"section-header"}>
                            Requirements
                        </p>
                        <p id={"section-content"}>
                            Multiplex network strategy is used to find the connection of samples between the layers.
                            The input data should follow this and also should be high dimensional in order to use this application.
                            Interconnection of layers with KEGG pathway is optional.
                        </p>
                        <a href={sample} target={"_blank"} rel="noopener noreferrer">
                            <Button color={"primary"} variant={"outlined"}>Download sample</Button>
                        </a>
                    </div>
                </div>
                <div id={"documentation"} className={`grey-text ${this.props.mobileMode ? "" : "flex max-height flex-direction"}`}>
                    <div style={{width: this.props.mobileMode? "" : "50%", display: "flex", justifyContent: "center"}}>
                        <img src={documentation} alt={"note"} style={{width: "65%"}}/>
                    </div>
                    <div id={"section-container"} style={{marginBottom: this.props.mobileMode ? "30px" : ""}}>
                        <p id={"section-header"}>
                            Documentation
                        </p>
                        <p id={"section-content"} style={{width: this.props.mobileMode? "" : "50%"}}>
                            A user guide with details on the overall options, data format and visualization is available.
                        </p>
                        <a href={tutorial} target={"_blank"} rel="noopener noreferrer">
                            <Button color={"primary"} variant={"outlined"}>Download User guide</Button>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

}
export default inject('DataStore')(observer(Introduction));

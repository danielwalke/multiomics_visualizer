import React, {PureComponent} from "react";
import "./index.css"
import {Button} from "@material-ui/core";
import goal from "../../Assets/SVG/goal.svg"
import note from "../../Assets/SVG/note.svg"
import documentation from "../../Assets/SVG/documentation.svg"
import disclaimer from "../../Assets/SVG/disclaimer.svg"
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
                        <Link to={"/visualize"}>
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

                <div id={"liability"} className={`grey-text ${this.props.mobileMode ? "flex" : "flex max-height flex-direction"}`} style={{flexDirection: this.props.mobileMode ? "column-reverse" : ""}}>
                    <div id={"section-container"} style={{marginBottom: this.props.mobileMode ? "30px" : "", width: this.props.mobileMode? "" : "50%"}}>
                        <p id={"section-header"}>
                            Disclaimer
                        </p>
                        <p id={"section-content"} style={{width: this.props.mobileMode? "" : "100%", maxHeight: this.props.mobileMode? "" : "15rem", overflowY: this.props.mobileMode? "hidden" : "auto"}}>
                            Das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. ist um Richtigkeit und Aktualität der auf dieser Internetpräsenz bereitgestellten Informationen bemüht. Trotzdem können Fehler und Unklarheiten nicht vollständig ausgeschlossen werden. Das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. übernimmt deshalb keine Gewähr für die Aktualität, Richtigkeit, Vollständigkeit oder Qualität der bereitgestellten Informationen. Für Schäden materieller oder immaterieller Art, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen unmittelbar oder mittelbar verursacht werden, haftet das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. nicht, sofern ihm nicht nachweislich vorsätzliches oder grob fahrlässiges Verschulden zur Last fällt. Gleiches gilt für kostenlos bereitgehaltene Software. Das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. behält es sich vor, Teile des Internetangebots oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen. Die Verantwortlichkeit für fremde Inhalte, die beispielsweise durch direkte oder indirekte Verknüpfungen (z. B. sogenannte „Links“) zu anderen Anbietern bereitgehalten werden, setzt unter anderem die positive Kenntnis des rechtswidrigen bzw. strafbaren Inhaltes voraus. Fremde Inhalte sind in geeigneter Weise gekennzeichnet. Das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. hat auf fremde Inhalte keinen Einfluss und macht sich diese Inhalte auch nicht zu Eigen. Das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. hat keine Kenntnis über rechtswidrige oder anstößige Inhalte auf den mit seiner Internetpräsenz verknüpften Seiten fremder Anbieter. Sollten auf den verknüpften Seiten fremder Anbieter dennoch rechtswidrige oder anstößige Inhalte enthalten sein, so distanziert sich das Leibniz-Institut für Analytische Wissenschaften - ISAS - e.V. von diesen Inhalten ausdrücklich.
                        </p>
                    </div>
                    <div style={{width: this.props.mobileMode? "" : "50%", display: "flex", justifyContent: "center"}}>
                        <img src={disclaimer} alt={"disclaimer"} style={{width: "65%"}}/>
                    </div>
                </div>
            </div>
        );
    }

}
export default inject('DataStore')(observer(Introduction));

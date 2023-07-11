import React, {useEffect, useRef, useState} from "react";
import * as d3 from 'd3';
import "./D3NetworkComparison.css"
import {AccordionSummary, Button, FormControl, FormLabel, IconButton, Radio, Slider} from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionActions from "@material-ui/core/AccordionActions";
import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import {
    COMPOUND_COLOR,
    ENZYME_COLOR,
    OCCURRENCE_IN_COMPONENT_1,
    OCCURRENCE_IN_COMPONENT_1_AND_2, OCCURRENCE_IN_COMPONENT_2
} from "../../../App Configurations/Colors";


function D3NetworkComparison(props) {

    const width = props.mobileMode ? window.innerWidth : 800;
    const height = props.mobileMode ? 350 : 700;
    const padding = 60;
    const d3DivRef = useRef();
    const svgRef = useRef();
    const backgroundRef = useRef();
    const tooltipRef = useRef();
    let ECColor = ENZYME_COLOR;
    let CPDColor = COMPOUND_COLOR;
    let showTooltip = true;

    const legends = [{name: "EC", color: ENZYME_COLOR}, {name: "CPD", color: COMPOUND_COLOR}, {name: "Occur only in component 1", color: OCCURRENCE_IN_COMPONENT_1, stroke: true}, {name: "Occurs only in component 2", color: OCCURRENCE_IN_COMPONENT_2, stroke: true}, {name: "Occurs in both components", color: OCCURRENCE_IN_COMPONENT_1_AND_2, stroke: true}];
    const [component1, changeComponent1] = useState(null);
    const [component2, changeComponent2] = useState(null);
    const [distance, changeDistance] = useState(15);
    const [ECRangeComponent1, changeECRangeComponent1] = useState(props.EC_userSelectionRange !== undefined ?[...props.EC_userSelectionRange] : undefined);
    const [ECRangeComponent2, changeECRangeComponent2] = useState(props.EC_userSelectionRange !== undefined ?[...props.EC_userSelectionRange] : undefined);
    const [CPDRangeComponent1, changeCPDRangeComponent1] = useState(props.CPD_userSelectionRange !== undefined ? [...props.CPD_userSelectionRange] : undefined);
    const [CPDRangeComponent2, changeCPDRangeComponent2] = useState(props.CPD_userSelectionRange !== undefined ? [...props.CPD_userSelectionRange] : undefined);
    const [compare ,changeCompare] = useState(0);

    const getRadioLabel = () => {
        let label = [];
        props.comparisonData.map(data => {
            label.push(data.label)
        });
        return label;
    }

    const renderD3Plot = () => {

        // let startTime = new Date().getTime();
        const nodes = [...props.data.nodes];
        const links = [...props.data.links];
        const tooltipDiv = d3.selectAll(".tooltip");

        let d3PlayGround = d3.select(svgRef.current);
        let d3Group = d3PlayGround.select(`.graphGroup`);
        d3Group.selectAll("*").remove();

        const zoom = d3.zoom()
            .on('zoom', () => {
                d3Group.attr('transform',d3.event.transform)
            })

        d3PlayGround.call(zoom);

        const ticked = (event) => {
            d3Link
                .attr('x1', (link) => link.source.x)
                .attr('y1', (link) => link.source.y)
                .attr('x2', (link) => link.target.x)
                .attr('y2', (link) => link.target.y)

            d3Node
                .attr('cx',(node) => node.x)
                .attr('cy',(node) => node.y)
        }

        const dragOptions = (options, node) => {
            switch (options) {
                case 'start':
                    showTooltip = false;
                    if(!d3.event.active) { //specifies the number of active drags
                        force.alphaTarget(0.3).restart();
                    }
                    node.fx = node.x;
                    node.fy = node.y;
                    break;
                case 'drag':
                    showTooltip = false;
                    node.fx = d3.event.x;
                    node.fy = d3.event.y;
                    break;
                case 'end':
                    showTooltip = true;
                    if(!d3.event.active) { //specifies the number of active drags
                        force.alphaTarget(0).restart();
                    }
                    node.fx = null;
                    node.fy = null;
                    break;
                default:
                    break;
            }
        }

        let d3Link = d3Group.selectAll(".link")
            .data(links)
            .enter()
            .append('line')
            .attr('class','link')
            .attr('stroke-width', 0.8)
            .attr("stroke", "#e0dfdf")
            .attr("stroke-opacity", 0.5)

        let d3Node = d3Group.selectAll(".node")
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 5)
            .attr('fill', (node) => node.type === "EC" ? ECColor : CPDColor)
            .attr('stroke', (node, index) => getComparisonResult(node, "stroke", index))
            .attr('stroke-width', node => getComparisonResult(node, "stroke-width"))
            .call(
                d3.drag()
                    .on('start', (node) => dragOptions('start', node))
                    .on('drag', (node) => dragOptions('drag', node))
                    .on('end', (node) => dragOptions('end', node))
            )
            .on("mouseover", (node, index, event) => {
                if(showTooltip){
                    tooltipDiv.html(`Name: ${node.name} (${node.type}) <br/> Details: ${props.tooltipData(node.name, node.type)}`)
                        .style("opacity", "1")
                        .style("left", Math.abs(d3.event.x + 20 - backgroundRef.current.getClientRects()[0].left) + "px")
                        .style("top", Math.abs(d3.event.y + 50 - backgroundRef.current.getClientRects()[0].top) + "px")
                        .style("background", node.type === "EC" ? ECColor : CPDColor);
                }
            })
            .on("mouseleave", () => tooltipDiv.html("").style("opacity", "0"))
            .style("cursor", "pointer")

        let force = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(accessor => accessor.name).distance(distance).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(width/2, height/2))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on('tick', ticked);
    }

    const findValueRange = (node, component) => {
        let found = false;
        let range = node.type === "EC" ?
            (component === 1 ? ECRangeComponent1 : ECRangeComponent2)
            :
            (component === 1 ? CPDRangeComponent1 : CPDRangeComponent2);
        let entityArray = node.type === "EC" ?
            (component === 1 ? component1.EC.entity : component2.EC.entity)
            :
            (component === 1 ? component1.CPD.entity : component2.CPD.entity);
        let valueArray = node.type === "EC" ?
            (component === 1 ? component1.EC.value : component2.EC.value)
            :
            (component === 1 ? component1.CPD.value : component2.CPD.value);
        entityArray.map((name, index) => {
            if(name === node.name && valueArray[index] >= range[0] && valueArray[index] <= range[1]) {
                found = true;
                return found;
            }
        })
        // (component === 1 ? component1.EC.value[component1.EC.entity.indexOf(node.name)] : component2.EC.value[component2.EC.entity.indexOf(node.name)])
        //     :
        //     (component === 1 ? component1.CPD.value[component1.CPD.entity.indexOf(node.name)] : component2.CPD.value[component2.CPD.entity.indexOf(node.name)]);
        return found;
        // value >= range[0] && value <= range[1];
    }

    const getComparisonResult = (node, type) => {
        if(component1 === null && component2 === null ) {
            return "";
        }
        else {
            let comparisonCounter = 0;
            let color = "";
            if(component1 !== null &&
                ((component1.EC !== undefined && component1.EC.entity.indexOf(node.name) !== -1) ||
                    (component1.CPD !== undefined && component1.CPD.entity.indexOf(node.name) !== -1 )) &&
                (findValueRange(node,1))
            ) {
                comparisonCounter++;
                color = OCCURRENCE_IN_COMPONENT_1;
            }
            if(component2 !== null &&
                ((component2.EC !== undefined && component2.EC.entity.indexOf(node.name) !== -1 )||
                    (component2.CPD !== undefined && component2.CPD.entity.indexOf(node.name) !== -1 )) &&
                (findValueRange(node,2))
            ){
                comparisonCounter++;
                color = OCCURRENCE_IN_COMPONENT_2;
            }
            if(type === "stroke"){
                switch (comparisonCounter) {
                    case 0:
                        return "";
                    case 2:
                        return OCCURRENCE_IN_COMPONENT_1_AND_2;
                    case 1:
                        return color;
                    default:
                        return ""
                }
            }
            else {
                if(comparisonCounter) {
                    return 3;
                }
                else {
                    return 0;
                }
            }
        }
    }

    const changeSliderValue = (componentWithType, value) => {
        switch (componentWithType) {
            case "component1_EC":
                changeECRangeComponent1(value);
                break;
            case "component2_EC":
                changeECRangeComponent2(value);
                break;
            case "component1_CPD":
                changeCPDRangeComponent1(value);
                break;
            case "component2_CPD":
                changeCPDRangeComponent2(value);
                break;
            default:
                console.log("Error in slider component")
                break;
        }
    }

    const getSlider = (component, type) => {
        return <>
            <Typography>{`Abundance Ration (${type}): ${component === "component1"
                ?
                (type === "EC" ? `${ECRangeComponent1[0]} - ${ECRangeComponent1[1]}` : `${CPDRangeComponent1[0]} - ${CPDRangeComponent1[1]}`)
                :
                (type === "EC" ? `${ECRangeComponent2[0]} - ${ECRangeComponent2[1]}` : `${CPDRangeComponent2[0]} - ${CPDRangeComponent2[1]}`)
            }`}
            </Typography>
            <Slider
                disabled={component === "component1" ? component1 === null : component2 === null
                }
                value={component === "component1"
                    ?
                    (type === "EC" ? ECRangeComponent1 : CPDRangeComponent1)
                    :
                    (type === "EC" ? ECRangeComponent2 : CPDRangeComponent2)
                }
                min={(type === "EC" ? props.ECRange[0] : props.CPDRange[0])}
                max={(type === "EC" ? props.ECRange[1] : props.CPDRange[1])}
                step={type === "EC" ? props.ECRange[1]/100 : props.CPDRange[1]/100}
                onChange={(e, value) => {
                    changeSliderValue(`${component}_${type}`, [Number(value[0].toFixed(3)), Number(value[1].toFixed(3))])
                }}
                valueLabelDisplay={"auto"}
                valueLabelFormat={value => value.toFixed(3)}
            />
        </>
    }

    const formControl = (position, count) => {
        return <div className={`${position} color${position}`} style={{width: "50%", padding: "0 10px"}}>
            <FormControl style={{display: "flex", textAlign: "left"}}>
                <FormLabel>{`Component ${count}`}</FormLabel>
                <RadioGroup value={count === 1 ? (component1 !== null ? component1.label : null)  : (component2 !== null ? component2.label : null)}
                            style={{flexDirection: "row"}}
                            onClick={e => {
                                if(e.target.value !== undefined)
                                    count === 1 ? changeComponent1(props.comparisonData[getRadioLabel().indexOf(e.target.value)]) : changeComponent2(props.comparisonData[getRadioLabel().indexOf(e.target.value)])
                            }}
                >
                    {getRadioLabel().map((value, index) =>
                        <FormControlLabel
                            key={value+index}
                            data-index={index}
                            disabled={count === 2 ? (component1 !== null ? component1.label === value  : false)  : (component2 !== null ? component2.label === value  : false)}
                            value={value} labelPlacement={"start"}
                            label={value}
                            control={<Radio color={"primary"}/>}
                        />
                    )}
                </RadioGroup>
            </FormControl>
            {props.ECRange !== undefined && getSlider(`component${count}`,"EC")}
            {props.CPDRange !== undefined && getSlider(`component${count}`,"CPD")}
        </div>
    }

    window.onresize = () => {
        if(backgroundRef.current !== null)
            backgroundRef.current.style.width = props.parentDiv().clientWidth + "px"
    }

    const reset = () => {
        changeComponent1(null);
        changeComponent2(null);
        startCompare();
    }

    const startCompare = () => {
        let value = compare+1
        changeCompare(value);
    }

    useEffect(() => {
        backgroundRef.current.style.width = props.parentDiv().clientWidth + "px"
        // backgroundRef.current.style.height = props.parentDiv().clientHeight + "px"
        renderD3Plot();
    }, [component1, component2, compare])

    return (
        <div className={"keggPathway2D"} ref={backgroundRef} >
            <div style={{width:`${width}px`, background: "white", maxHeight: `${props.parentDiv().clientHeight-100}px`, overflowY: "scroll", overflowX: "hidden", zIndex: 1000001}} ref={d3DivRef}>
                {/*<Button variant={"contained"} color={"primary"} onClick={props.close}> Close </Button>*/}
                <Typography style={{background: "#000", fontSize: "larger", color: "white", margin: "0 0 5px 0", padding: "10px 0"}}>Kegg Pathway Network</Typography>
                <IconButton onClick={props.close} style={{position: "absolute", transform: "translate(0, -100px)"}}>
                    <CloseIcon fontSize={"large"} style={{color: "#FFFFFF"}}/>
                </IconButton>
                <Typography style={{textAlign: "left"}}>
                    {props.comparisonData.length !== 0 ? `Comparison of chosen points with kegg pathway. Choose which points you would like to compare from the following.` : `No point is being currently viewed in 3D`}
                </Typography>
                {/*<div style={{display: "flex"}}>*/}
                {props.comparisonData.length !== 0 &&
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        Comparison Details
                    </AccordionSummary>
                    <AccordionDetails style={{padding: 0}}>
                        {formControl("left", 1)}
                        {formControl("right", 2)}
                    </AccordionDetails>
                    <AccordionActions>
                        <Button color={"secondary"} variant={"contained"} onClick={reset}>Reset</Button>
                        <Button color={"primary"} variant={"contained"} onClick={startCompare}>Compare</Button>
                    </AccordionActions>
                </Accordion>}
                {/*</div>*/}
                <div className={"legend-container"}>
                    {legends.map(legend =>
                        <div key={`legend${legend.name}`} className={"legend"}>
                            <div className={`${legend.stroke !== undefined ? "legend-stroke" : "legend-background"}`}
                                 style={{background: legend.stroke === undefined ? legend.color : "", borderColor: legend.stroke !== undefined ? legend.color : ""}}/>
                            {legend.name}
                        </div>)}
                </div>
                <svg role={"svg"} ref={svgRef} viewBox={`0,0,${width},${height}`}
                     style={{background: "#000000", borderRadius:"10px"}}>
                    <g role={"content"} className={`graphGroup content`} clipPath={`url(#${"graph"})`}> </g>
                </svg>
                <div className={"tooltip"} style={{opacity: 0}} ref={tooltipRef}/>
            </div>
        </div>
    )

}

export default D3NetworkComparison;

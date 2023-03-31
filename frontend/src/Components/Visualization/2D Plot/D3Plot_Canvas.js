import React, {useEffect, useRef, useState} from "react";
import * as d3 from 'd3';
import './D3Plot.css'
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Switch from "@material-ui/core/Switch";


const D3Plot = (props)  => {

    const width = props.mobileMode ? window.innerWidth : 600;
    const height = props.mobileMode ? 350 : 450;
    const padding = 60;
    const d3DivRef = useRef();
    const svgRef = useRef();
    const tooltipRef = useRef();
    let selectedTarget = null;

    const [zoomState,changeZoomState] = useState();
    const graphTypes = ["BiPlot","Loading Plot","Score Plot", "Cluster Plot"];
    const [graphType,changeGraphType] = useState("Score Plot");
    // const [zoomType, changeZoomType] = useState("x")
    const [showCentroid, flipCentroid] = useState(true);


    const changeSelectedTarget = (value, index, originatingFrom) => {
        if(graphType === "Cluster Plot") {
            // d3.select(d3DivRef.current).selectAll(".tooltip").remove();
            if ((originatingFrom !== null && selectedTarget === null) ||
                (originatingFrom === null && selectedTarget === null)
            ) {
                selectedTarget = originatingFrom;
                let targetArray = [];
                if (selectedTarget === null) {
                    targetArray = null;
                } else {
                    if (selectedTarget === "score") {
                        targetArray.push(props.data.reducedDimensionData.target[index]);
                    } else if (selectedTarget === "centroid") {
                        index = props.data.clusteredData.centroidLabels === undefined ? index : props.data.clusteredData.centroidLabels[index]; //to get centroid label for user defined clusters
                        props.data.clusteredData.labels.map((label, position) => {
                            if (label === index)
                                targetArray.push(props.data.reducedDimensionData.target[position])
                        })
                    }
                }
                props.chageSelectedTarget(targetArray);
            } else {
                selectedTarget = originatingFrom;
            }
        }
    }

    //Check which of x and y coordinates has more variance and return them as the axis components for d3
    const axisComponents = () => {
        let [X1,X2,Y1,Y2] = [props.data.reducedDimensionData.narrowMatrix.map(coOrdinates => coOrdinates.x),
            props.data.reducedDimensionData.loadingsMatrix.map(coOrdinates => coOrdinates[1].x),
            props.data.reducedDimensionData.narrowMatrix.map(coOrdinates => coOrdinates.y),
            props.data.reducedDimensionData.loadingsMatrix.map(coOrdinates => coOrdinates[1].y)]
        switch (graphType) {
            case "BiPlot":
                let minX = Math.min(...X1) < Math.min(...X2) ? Math.min(...X1) : Math.min(...X2);
                let maxX = Math.max(...X1) > Math.max(...X2) ? Math.max(...X1) : Math.max(...X2);
                let minY = Math.min(...Y1) < Math.min(...Y2) ? Math.min(...Y1) : Math.min(...Y2);
                let maxY = Math.max(...Y1) > Math.max(...Y2) ? Math.max(...Y1) : Math.max(...Y2);
                return [minX,maxX,minY,maxY]
            case "Loading Plot":
                return [Math.min(...X2)> 0 ? 0 : Math.min(...X2), Math.max(...X2), Math.min(...Y2) > 0 ? 0 : Math.min(...Y2), Math.max(...Y2)]
            case "Score Plot":
                return [Math.min(...X1), Math.max(...X1), Math.min(...Y1), Math.max(...Y1)]
            case "Cluster Plot":
                let [centroidX, centroidY] = [props.data.clusteredData.centroids.map(coordinates => coordinates.x),
                    props.data.clusteredData.centroids.map(coordinates => coordinates.y)];
                return [Math.min(...X1) < Math.min(...centroidX) ? Math.min(...X1) : Math.min(...centroidX),
                    Math.max(...X1) > Math.max(...centroidX) ? Math.max(...X1) : Math.max(...centroidX),
                    Math.min(...Y1) < Math.min(...centroidY) ? Math.min(...Y1) : Math.min(...centroidY),
                    Math.max(...Y1) > Math.max(...centroidY) ? Math.max(...Y1) : Math.max(...centroidY)]

        }
    }

    const variance = (numberArray) => {
        let mean = numberArray.reduce((a,b) => a+b)/numberArray.length;
        let variance = numberArray.reduce((a,b) => a += Math.pow(b-mean,2),0/*0 is the initial value of a*/)/numberArray.length;
        return variance;
    }

    const getTooltipContent = (value, index, originatingFrom) => {
        switch (originatingFrom) {
            case "loading":
            case "loadingEnd":
                return "Feature: " + props.data.reducedDimensionData.features[index] + "<br/>" + "Rank: " + (Number(index)+1);
            case "score":
                return "Target: " + props.data.reducedDimensionData.target[index];
            case "centroid":
                let clusterDetails = props.data.clusteredData.centroidLabels === undefined ?  `Cluster ${index+1}` :  `Cluster: ${props.data.clusteredData.centroidLabels[index]} (user defined cluster)`
                return `${clusterDetails} <br/>Info: ${props.clusterPercentage[index]} % of target <br/> belongs to this cluster
                        <br/> x: ${value.x} <br/> y: ${value.y}`
        }
    }

    const renderD3Plot = () => {
        // console.log(props.data);
        let startTime = new Date().getTime();
        let [minComponent1,maxComponent1,minComponent2,maxComponent2] = axisComponents();

        const xScale = d3.scaleLinear()
            .domain([minComponent1 - (Math.abs(minComponent1)*0.25), maxComponent1 + (Math.abs(maxComponent1)*0.25)])
            .range([padding, width-padding]);

        const yScale = d3.scaleLinear()
            .domain([minComponent2 - (Math.abs(minComponent2)*0.25), maxComponent2 + (Math.abs(maxComponent2)*0.25)]) //increase the y axis scakle 10% from minimum and maximum so that the circles at the edges will notbe clipped
            .range([height - padding, padding]);

        const xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(7);

        const yAxis = d3.axisLeft()
            .scale(yScale);

        d3.select(d3DivRef.current).selectAll('canvas').remove();
        d3.select(d3DivRef.current).selectAll('svg').remove();
        d3.select(d3DivRef.current).selectAll('g').remove();

        const context = d3.select(d3DivRef.current)
            .append('canvas')
            .attr('width', 600)
            .attr('height', 400)
            .node().getContext('2d');

        const d3PlayGround = d3.select(d3DivRef.current)
            .append('svg')
            .attr("class","visualization-2D")
            .attr('width', width)
            .attr('height', height)


        d3PlayGround.append("g")
            .attr("class", `${props.fileNumber}x-axis x-axis`)
            .attr('transform',`translate(0,${height - padding})`) //to make the xaxis 0 intersect with yaxis 0 => ${yScale(0) or ${height - padding}
            .attr("stroke-width","2")
            .call(xAxis);


        d3PlayGround.append("g")
            .attr("class",`${props.fileNumber}y-axis y-axis`)
            .attr('transform',`translate(${padding},0)`) //to make the yaxis 0 intersect with xaxis 0 => ${padding} or${xScale(0)}
            .attr("stroke-width","1.5")
            .call(yAxis);

        d3PlayGround.append("g")
            .attr("class",`${props.fileNumber}title title`);

        d3PlayGround.select(`.${props.fileNumber}x-axis`)
            .append("text")
            .attr("text-anchor", "end")
            .attr("fill","black")
            .attr("x", width-padding)
            .attr("y",padding-20 )
            .text(`Component ${props.data.component1} (Variance: ${props.data.reducedDimensionData.varianceRatio[props.data.component1-1]} %)`)

        d3PlayGround.select(`.${props.fileNumber}y-axis`)
            .append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("fill","black")
            .attr("x", -padding)
            .attr("y", -padding+15)
            .text(`Component ${props.data.component2} (Variance: ${props.data.reducedDimensionData.varianceRatio[props.data.component2-1]} %)`)

        d3PlayGround.select(`.${props.fileNumber}title`)
            .attr("transform", `translate(${width/2}, ${padding/2})`)
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill","black")
            .text(`${props.data.title}`)
            .attr("font-weight", 600)

        const d3Div = d3.select(d3DivRef.current);

        const toolTipDiv = d3Div.selectAll(".tooltip")

        context.clearRect(0,0,width,height)
        if(graphType !== "Score Plot" && graphType !== "Cluster Plot") {
            props.data.reducedDimensionData.loadingsMatrix.forEach((data, index) => {
                let startPoint_x = xScale(data[0].x);
                let startPoint_y = yScale(data[0].y);
                let endPoint_x = xScale(data[1].x);
                let endPoint_y = yScale(data[1].y);
                drawLine(context, startPoint_x, startPoint_y, endPoint_x, endPoint_y, props.loadingPlotColor)
                drawCircle(context, endPoint_x, endPoint_y, 6, props.loadingPlotColor, 0.6, false);
            })
        }
        if(graphType !== "Loading Plot") {
            props.data.reducedDimensionData.narrowMatrix.forEach((data, index) => {
                let x = xScale(data.x);
                let y = xScale(data.y);
                drawCircle(context, x, y, getCircleRadius(index, false), getCircleColor(index), 0.6, false);
            })
            if(showCentroid && graphType === "Cluster Plot") {
                props.data.clusteredData.centroids.map((data, index) => {
                    let x = xScale(data.x);
                    let y = xScale(data.y);
                    drawCircle(context, x, y, getCircleRadius(index, true), props.clusterColors[index], 0.8, true);
                })
            }
        }
        let endTime = new Date().getTime();
        console.log(endTime - startTime)
    }

    const drawLine = (context, startPoint_x, startPoint_y, endPoint_x, endPoint_y, color) => {
        context.beginPath();
        context.moveTo(startPoint_x, startPoint_y);
        context.lineTo(endPoint_x, endPoint_y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
    }

    const drawCircle = (context, x, y, radius, color, opacity, stroke) => {
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = color;
        context.globalAlpha = opacity;
        context.fill();
        if(stroke) {
            context.strokeStyle = "black";
            context.stroke();
        }
    }

    const getCircleRadius = (index, centroid) => {
        if(!centroid) {
            if (props.selectedTarget === null || graphType !== "Cluster Plot")
                return 8;
            else {
                if (props.selectedTarget.indexOf(props.data.reducedDimensionData.target[index]) === -1)
                    return 0.2;
                else
                    return 8;
            }
        }
        else{
            index = props.data.clusteredData.centroidLabels === undefined ? index : props.data.clusteredData.centroidLabels[index]; //to get the user defined cluster value
            if(props.selectedTarget === null) {
                return 12;
            }
            else {
                let showCentroid = false;
                props.selectedTarget.map(target => {
                    let targetIndex = props.data.reducedDimensionData.target.indexOf(target);
                    if(targetIndex !== -1){
                        if(props.data.clusteredData.labels[targetIndex] === index){
                            showCentroid = true;
                            return null;
                        }
                    }
                })
                if(showCentroid)
                    return 12
                else
                    return 2;
            }
        }
    }

    const getCircleColor = (index) => {
        if(graphType === "Cluster Plot"){
            let labelIndex = props.data.clusteredData.centroidLabels === undefined ? Number(props.data.clusteredData.labels[index]) :
                props.data.clusteredData.centroidLabels.indexOf(props.data.clusteredData.labels[index]);
            return props.clusterColors[labelIndex];
        }
        else {
            return props.scorePlotColor
        }
    };

    useEffect(() => {
        if(props.data.clusteredData === undefined && graphType === "Cluster Plot")
            changeGraphType("BiPlot")
        else
            renderD3Plot();
    },[zoomState,graphType, props.data.component1, props.data.component2, props.data.displayLoadings, props.selectedTarget, showCentroid])


    return (
        <div>
            <div style={{width:`${width}px`,height: `${height}px`}} ref={d3DivRef}>
                {/*<svg role={"svg"} ref={svgRef} style={{width:"100%",height: "100%", background: "#f5f5f5", borderRadius:"10px"}}>*/}
                {/*    <defs>*/}
                {/*        <clipPath id={"scatterPlot"}>*/}
                {/*            <rect style={{width:`${width-2*padding}px`,height: `${height-2*padding}px`, x:`${padding}px`, y:`${padding}px`}}/>*/}
                {/*        </clipPath>*/}
                {/*    </defs>*/}
                {/*    <g className={`${props.fileNumber}title title`}/>*/}
                {/*    <g role={"content"} className={`${props.fileNumber}content content`} clipPath={`url(#${"scatterPlot"})`}> </g>*/}
                {/*    <g className={`${props.fileNumber}x-axis x-axis`}/>*/}
                {/*    <g className={`${props.fileNumber}y-axis y-axis`}/>*/}
                {/*</svg>*/}
                {/*<canvas ref={svgRef} style={{width:"100%",height: "100%", background: "#f5f5f5", borderRadius:"10px"}}/>*/}
                <div className={"tooltip"} style={{opacity: 0}}/>
            </div>
            <div style={{display: "flex", justifyContent: "center" , marginTop: "3%"}}>
                <FormGroup>
                    <FormLabel component={"legend"}>Graph Type</FormLabel>
                    <RadioGroup row value={graphType} onChange={event => changeGraphType(event.currentTarget.value)} style={{justifyContent: "center"}}>
                        {graphTypes.map((graphName, index) => <FormControlLabel
                            key = {index}
                            value={graphName}
                            label={graphName}
                            control={<Radio disabled={props.data.clusteredData === undefined && graphName === "Cluster Plot"}
                                            color={"primary"}/>
                            }
                            labelPlacement={"bottom"}
                        />)}
                        {graphType=== "Cluster Plot" && <FormControlLabel control={<Switch checked={showCentroid} color={"primary"}/>}
                                                                          label={"Show Centroids"} labelPlacement={"bottom"} onChange={() => flipCentroid(!showCentroid)}/>}
                    </RadioGroup>
                </FormGroup>
            </div>
        </div>
    )
}

export default D3Plot;
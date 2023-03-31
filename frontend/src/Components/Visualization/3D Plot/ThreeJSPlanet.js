import * as THREE from "three"
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import FPSStats from "../../../FPS Stats/FPSStats";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";
// import {VRButton} from "three/examples/jsm/webxr/VRButton";
import {VRButton} from "./VRButton";
import * as d3Geo from "d3-geo";
import font from "./Fonts/Piazzolla_Regular.json"
import {StereoEffect} from "three/examples/jsm/effects/StereoEffect";
import {XRControllerModelFactory} from "three/examples/jsm/webxr/XRControllerModelFactory";
import {enumeration} from "./Enums";
import {inject, observer} from "mobx-react";
import {log} from "three";
import {COMPOUND_COLOR, ENZYME_COLOR} from "../../../App Configurations/Colors";


let SCENE = undefined, EFFECT = undefined, RAYCAST = undefined, VR_CONTROLLERS = [], CONTROLS, CAMERA_POSITION,
	THREEJS_FONT,
	MOUSE = undefined, CAMERA = undefined, TOOLTIP = undefined, RENDERER = undefined, KEGG_INTERACTION = [],
	DOLLY_FOR_CAMERA, START_NAVIGATE = false, KEGG_NETWORK = {},
	CLUSTER_POINTS_ARRAY = [], CLUSTER_POINTS_DETAILS_ARRAY = [], CENTROID_DETAILS_ARRAY = [],
	COMPOUND_EC_OUTLINER_SELECTION = [], COMPOUND_EC_OUTLINER, LINES_DRAWN = [], VR_HEADSET,
	TEMP_MATRIX4_VR = new THREE.Matrix4(), DATACONTAINER = enumeration.dataContainer_sphere,
	KEGGCONTAINER = enumeration.dataContainer_sphere, DATAPLANET_GROUP = [], isSceneRerendered = false,
	CONNECTION_POINTS = [], ORBIT_RADIUS, ORBIT_ORIGINAL_RADIUS, OBJECT_POSITIONS = [], CANVAS__, VR_FLIP = false,
	ORBIT;
let xSteps = 0
let ySteps = 0
let zSteps = 0


let threeDContainer, tooltipDiv, threeDContainer_Div;

function ThreeJSPlanet(props, ref) {

	threeDContainer = useRef();

	tooltipDiv = useRef();

	threeDContainer_Div = useRef();

	const blinkColor = "hsl(210,1%,63%)"//dcdcdc

	const sizeOfPointsOnSphere = 1;

	let marginPointsFactor = 10;

	const getDataContainerRadius = (totalPoints, containerType) => {
		/*
		* Derivation
		* Surface area of sphere = surface are of the point * margin for each points * total number of points
		* 4 * pi * radius of sphere(square) = size of points(square) * margin for each points * total number of points
		* radius of sphere = Square root ((size of points(square) * margin for each points * total number of points) / (4 * pi))
		* */
		if (containerType === "sphere") {
			return Math.ceil(Math.sqrt((marginPointsFactor * (4 * Math.PI * ((sizeOfPointsOnSphere / 2) ** 2)) * totalPoints) / (4 * Math.PI)));
		}
		/*
		* Same formula goes for square without 4*pi. Since surface area of the sphere is 4*pi*r(square) and surface area of a square is side(square)
		* */
		else if (containerType === "square") {
			return Math.ceil(Math.sqrt(marginPointsFactor * (4 * Math.PI * ((sizeOfPointsOnSphere / 2) ** 2)) * totalPoints));
		}

	}

	const toggleVRButton = (flag) => {
		let vrButton;
		threeDContainer_Div.current.childNodes.forEach(child => {
			if (child.id === "VRButton") vrButton = child;
		})
		if (vrButton) vrButton.hidden = flag;
	}

	const resizeCanvas = (stopFlag) => {
		if (threeDContainer_Div.current !== null) {
			console.warn("Changed viewport?")
			threeDContainer.current.width = threeDContainer_Div.current.clientWidth;
			threeDContainer.current.height = window.innerHeight - threeDContainer_Div.current.getClientRects()[0].top;
			CAMERA.aspect = threeDContainer_Div.current.clientWidth / (window.innerHeight - threeDContainer_Div.current.getClientRects()[0].top);
			CAMERA.updateProjectionMatrix();
			RENDERER.setSize(threeDContainer_Div.current.clientWidth, (window.innerHeight - threeDContainer_Div.current.getClientRects()[0].top));
		}
	}

	const exitVR = () => {
		if (document.fullscreenElement === null) {
			let vrButton;
			threeDContainer.current.parentElement.childNodes.forEach(child => {
				if (child.id === "VRButton") vrButton = child;
			})
			if (vrButton) vrButton.click();
		}
	}

	const renderScene = () => {
		VR_FLIP = false;

		let startTime = new Date().getTime();

		const canvas = threeDContainer.current;
		canvas.width = threeDContainer_Div.current.clientWidth;
		canvas.height = window.innerHeight - threeDContainer_Div.current.getClientRects()[0].top;

		RENDERER = new THREE.WebGLRenderer({canvas, antialias: true});
		RENDERER.setSize(canvas.clientWidth, canvas.clientHeight)
		RENDERER.setClearColor("#030303", 0.9)//d8e3ef
		RENDERER.xr.enabled = true;
		RENDERER.xr.setReferenceSpaceType('local');

		SCENE = new THREE.Scene();
		CAMERA = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100000);
		RAYCAST = new THREE.Raycaster();
		MOUSE = new THREE.Vector2();
		TOOLTIP = tooltipDiv.current;
		EFFECT = new StereoEffect(RENDERER);

		let vr_element = VRButton.createButton(RENDERER);
		vr_element.addEventListener("click", (e) => {

			if (vr_element.innerText === "ENTER VR") {
				window.removeEventListener("resize", resizeCanvas, false);
				props.fullscreenEventListener("remove"); //ver important
				canvas.style.width = window.screen.width;
				canvas.style.height = window.screen.height;
				CAMERA.aspect = window.screen.width / window.screen.height;
				CAMERA.updateProjectionMatrix();
				RENDERER.setSize(window.screen.width, window.screen.height);
			} else if (vr_element.innerText === "EXIT VR") {
				window.addEventListener("resize", resizeCanvas, false);
				document.removeEventListener('fullscreenchange', exitVR, false);
				document.removeEventListener('mozfullscreenchange', exitVR, false);
				document.removeEventListener('webkitfullscreenchange', exitVR, false);
				props.fullscreenEventListener("add");
				let vrButton;
				threeDContainer.current.parentElement.childNodes.forEach(child => {
					if (child.id === "VRButton") vrButton = child;
				})
				if (vrButton) threeDContainer_Div.current.append(vrButton);
			}
		}, true)
		threeDContainer_Div.current.appendChild(vr_element);
		VR_CONTROLLERS = buildControllers();

		let composer = new EffectComposer(RENDERER);

		let renderPass = new RenderPass(SCENE, CAMERA)
		composer.addPass(renderPass);

		let shaderPass = new ShaderPass(FXAAShader);

		shaderPass.material.uniforms['resolution'].value.set(1 / canvas.width, 1 / canvas.height);
		composer.addPass(shaderPass);

		DATAPLANET_GROUP = [];

		//Normal blinking
		let outlinePassNonDominantCentroids = new OutlinePass(new THREE.Vector2(canvas.width, canvas.height), SCENE, CAMERA);
		outlinePassNonDominantCentroids.visibleEdgeColor.set("#ffffff");
		composer.addPass(outlinePassNonDominantCentroids);

		//For object that blinks very fast
		let outlinePassDominantCentroids = new OutlinePass(new THREE.Vector2(canvas.width, canvas.height), SCENE, CAMERA);
		outlinePassDominantCentroids.pulsePeriod = 0.5;
		outlinePassDominantCentroids.visibleEdgeColor.set("#ffffff");
		composer.addPass(outlinePassDominantCentroids);

		//For kegg link highlighting
		COMPOUND_EC_OUTLINER = new OutlinePass(new THREE.Vector2(canvas.width, canvas.height), SCENE, CAMERA);
		COMPOUND_EC_OUTLINER.edgeStrength = 3;
		COMPOUND_EC_OUTLINER.visibleEdgeColor.set("#ffffff");
		composer.addPass(COMPOUND_EC_OUTLINER);

		ORBIT_ORIGINAL_RADIUS = 0;
		//compute radius before constructing the orbit
		if (props.additionalFile.length !== 0) {
			const {maxCount} = props.keggLinkCoordinates;
			//To add links to the center
			ORBIT_ORIGINAL_RADIUS = 2 * getDataContainerRadius(maxCount, KEGGCONTAINER);
		}
		props.data.map((processedData, processedDataIndex) => {
			let planetRadius = getDataContainerRadius(processedData.reducedDimensionData.narrowMatrix.length, DATACONTAINER);
			// console.log(planetRadius);
			if (!ORBIT_ORIGINAL_RADIUS) {
				ORBIT_ORIGINAL_RADIUS = planetRadius;
			} else {
				if (ORBIT_ORIGINAL_RADIUS < planetRadius) {
					ORBIT_ORIGINAL_RADIUS = planetRadius;
				}
			}
		});

		const objectPositions = props.objectPositions(ORBIT_ORIGINAL_RADIUS)
		OBJECT_POSITIONS = objectPositions.positions;
		ORBIT_RADIUS = objectPositions.orbitRadius;

		//Kegg network
		if (props.additionalFile.length !== 0) {
			KEGG_NETWORK = {};
			let {links, maxMinCollection, maxCount} = props.keggLinkCoordinates;
			let {ec_details, ec_number, cpd_number, cpd_details} = props.additionalFile.kegg;
			//To add links to the center
			let radiusOfKeggNetwork = getDataContainerRadius(maxCount, KEGGCONTAINER);
			radiusOfKeggNetwork = 2 * radiusOfKeggNetwork;
			// console.log(radiusOfKeggNetwork);

			// let maxMinCollection = getMinMax(xCoordinateCollection, yCoordinateCollection);
			//for plotting kegg network
			links.map((link, index) => {

				link.CPD.map((compound, compoundIndex) => {
					let lineColor = "#0b4b88";//008000
					let [cpd_x, cpd_y, cpd_z, longitude, latitude] = get3DCoordinates(0, 0, maxMinCollection, compound.coordinates.x, compound.coordinates.y, radiusOfKeggNetwork, KEGGCONTAINER)
					compound.coordinates = new THREE.Vector3(cpd_x, cpd_y, cpd_z);
					compound.radius = radiusOfKeggNetwork;
					compound.center = new THREE.Vector3(0, 0, 0);
					compound.latitude = latitude;
					compound.longitude = longitude;
					let compoundPoint = undefined;
					if (compound.exist === false) {
						// let clusterPointsGeometry = new THREE.BoxBufferGeometry(sizeOfPointsOnSphere,sizeOfPointsOnSphere,0.2);
						let compoundPointGeometry = new THREE.SphereBufferGeometry(sizeOfPointsOnSphere, 8, 6)//CircleBufferGeometry(sizeOfPointsOnSphere / 2, 30, 0, 6.3);
						let compoundPointMaterial = new THREE.MeshPhongMaterial({color: COMPOUND_COLOR});//f7ca03
						compoundPoint = new THREE.Mesh(compoundPointGeometry, compoundPointMaterial);
						compoundPoint.name = enumeration.compound;
						compoundPoint.lookAt(new THREE.Vector3(cpd_x, cpd_y, cpd_z))
						compoundPoint.position.set(cpd_x, cpd_y, cpd_z)
						compoundPoint.userData = {
							target: `${compound.name} (Compound)`,
							htmlText: `Compound: ${compound.name} \n Details: ${cpd_number.indexOf(compound.name) !== -1 ? cpd_details[cpd_number.indexOf(compound.name)] : ""}`,
							backgroundColor: COMPOUND_COLOR,
							linkIndex: index,
							name: compound.name
						}
						lineColor = "#008000";
						compound.pointGeometry = compoundPoint;
						KEGG_NETWORK[compound.name] = compoundPoint;
						if (props.displayKeggNetwork()) {
							SCENE.add(compoundPoint);
						}
					}
					let [ec_x, ec_y, ec_z, ...rest] = get3DCoordinates(0, 0, maxMinCollection, compound.ec_coordinates.x, compound.ec_coordinates.y, radiusOfKeggNetwork, KEGGCONTAINER);
					compound.ec_coordinates = new THREE.Vector3(ec_x, ec_y, ec_z);
					let geometry;
					if (!compound.exist) {
						let points = [new THREE.Vector3(cpd_x, cpd_y, cpd_z), new THREE.Vector3(ec_x, ec_y, ec_z)];
						geometry = new THREE.BufferGeometry().setFromPoints(points);
					} else {
						let greatArc = d3Geo.geoInterpolate([longitude, latitude], [rest[0], rest[1]]);
						let midPoints = greatArc(0.5).map(radians => radians * (180 / Math.PI));
						let mid3DPoints = getSphereCoordinates(1, 0, midPoints[0], midPoints[1]);
						let curve = new THREE.QuadraticBezierCurve3(compound.coordinates, mid3DPoints, compound.ec_coordinates);
						geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
					}
					let material = new THREE.LineBasicMaterial({color: lineColor, opacity: 0.2, transparent: true});
					// Create the final object to add to the scene
					let line = new THREE.Line(geometry, material);
					compound.lineGeometry = line;
					let lineObjectName = `from _${compound.name}_to_${link.EC.name}`
					KEGG_NETWORK[lineObjectName] = line;
					if (props.displayKeggNetwork()) {
						SCENE.add(line);
					}
				})
				let [ec_x, ec_y, ec_z, longitude, latitude] = get3DCoordinates(0, 0, maxMinCollection, link.EC.coordinates.x, link.EC.coordinates.y, radiusOfKeggNetwork, KEGGCONTAINER);
				link.EC.coordinates = new THREE.Vector3(ec_x, ec_y, ec_z);
				link.EC.radius = radiusOfKeggNetwork;
				link.EC.center = new THREE.Vector3(0, 0, 0);
				link.EC.longitude = longitude;
				link.EC.latitude = latitude;
				let ECPointGeometry = new THREE.SphereBufferGeometry(sizeOfPointsOnSphere, 8, 6)//CircleBufferGeometry(sizeOfPointsOnSphere / 2, 30, 0, 6.3);
				let ECPointMaterial = new THREE.MeshPhongMaterial({color: ENZYME_COLOR});//f61b07
				let ECPoint = new THREE.Mesh(ECPointGeometry, ECPointMaterial);
				ECPoint.name = enumeration.EC;
				ECPoint.userData = {
					target: `${link.EC.name} (EC)`,
					htmlText: `EC: ${link.EC.name} \n Details: ${ec_number.indexOf(link.EC.name) !== -1 ? ec_details[ec_number.indexOf(link.EC.name)] : ""}`,
					backgroundColor: ENZYME_COLOR,
					linkIndex: index,
					name: link.EC.name
				}
				link.EC.pointGeometry = ECPoint;
				ECPoint.lookAt(new THREE.Vector3(ec_x, ec_y, ec_z));
				ECPoint.position.set(ec_x, ec_y, ec_z);
				KEGG_NETWORK[link.EC.name] = ECPoint;
				if (props.displayKeggNetwork()) {
					SCENE.add(ECPoint);
				}
			})
		}

		//for constructing the planet and plotting points in it
		addDataContainer();

		CAMERA.position.set(10, 0, 1000);
		let spotLight = new THREE.AmbientLight("#ffffff", 1);
		SCENE.add(spotLight);
		let pointLight = new THREE.PointLight("#ffffff", 0.5);
		SCENE.add(pointLight);
		CONTROLS = new OrbitControls(CAMERA, RENDERER.domElement);
		CONTROLS.update();

		DOLLY_FOR_CAMERA = new THREE.Object3D();

		CAMERA_POSITION = new THREE.Vector3();

		const render = () => {
			if (!props.d3Enabled()) { //to stop rendering when comparison graph is enabled. This reduces lot of computation power consumed by GPU
				RENDERER.render(SCENE, CAMERA);
				if (isSceneRerendered) { //to make connections again when the dataplanet is rerendered
					CONNECTION_POINTS.map(intersect => {
						if (intersect.isCentroid !== true) {
							intersectedClusterOrCentroidPoints(CLUSTER_POINTS_DETAILS_ARRAY[intersect.fileIndex][intersect.targetIndex]);
						} else {
							intersectedClusterOrCentroidPoints(CENTROID_DETAILS_ARRAY[intersect.fileIndex][intersect.targetIndex]);
						}
					})
					isSceneRerendered = false;
					CONNECTION_POINTS = [];
				}
				if (CAMERA_POSITION.x !== 0 && CAMERA_POSITION.z !== 0 && !RENDERER.xr.isPresenting) {
					// CAMERA.position.set(0,0,0);
					// DOLLY_FOR_CAMERA.position.set(0,0,5);
					DOLLY_FOR_CAMERA.remove(CAMERA);
					SCENE.remove(DOLLY_FOR_CAMERA);
					CAMERA.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
					CAMERA_POSITION = new THREE.Vector3();
					VR_FLIP = !VR_FLIP;
				}

				if (RENDERER.xr.isPresenting) {
					if (!VR_FLIP) {
						if (threeDContainer.current.parentElement.id !== "3D") {
							threeDContainer.current.parentElement.requestFullscreen().then(() => {
								document.addEventListener('fullscreenchange', exitVR, false);
								document.addEventListener('mozfullscreenchange', exitVR, false);
								document.addEventListener('webkitfullscreenchange', exitVR, false);
							});
							let vrButton;
							threeDContainer_Div.current.childNodes.forEach(child => {
								if (child.id === "VRButton") vrButton = child;
							})
							if (vrButton) threeDContainer.current.parentElement.append(vrButton);
							VR_FLIP = !VR_FLIP;
						}
					}
					if (CAMERA_POSITION.x === 0 && CAMERA_POSITION.y === 0 && CAMERA_POSITION.z === 0) {
						VR_HEADSET = RENDERER.xr.getCamera(CAMERA);
						CAMERA.getWorldPosition(CAMERA_POSITION);
						let cameraQuaternion = new THREE.Quaternion();
						CAMERA.getWorldQuaternion(cameraQuaternion);
						let CameraDirection = new THREE.Vector3()
						CAMERA.getWorldDirection(CameraDirection);
						DOLLY_FOR_CAMERA.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
						DOLLY_FOR_CAMERA.lookAt(CameraDirection.x, CameraDirection.y, CameraDirection.z);
						DOLLY_FOR_CAMERA.quaternion.copy(cameraQuaternion);
						CAMERA.position.set(0, 0, 0);
						DOLLY_FOR_CAMERA.add(CAMERA);
						SCENE.add(DOLLY_FOR_CAMERA)
						if (VR_CONTROLLERS.length !== 0) {
							VR_CONTROLLERS.forEach((controller) => {
								handleController(controller);
								DOLLY_FOR_CAMERA.add(controller);
							})
						}
					}
					// VR_CONTROLLERS.forEach(controller => showToolTip_inVR(controller))
					if (START_NAVIGATE) {
						navigate();
					}
				}
			}
		}

		RENDERER.domElement.addEventListener('click', (event) => getClickedObject(event), false);
		RENDERER.domElement.addEventListener('mousemove', (event) => showToolTip(event, false, undefined), false);
		// console.log(`3D - ${(new Date().getTime() - startTime)}`)
		RENDERER.setAnimationLoop(render);
	}

	const addDataContainer = () => {

		//Orbit Geometry
		{
			let orbitGeometry = new THREE.RingBufferGeometry(ORBIT_RADIUS, ORBIT_RADIUS - (0.001 * ORBIT_RADIUS), 100, 1, 0, 6.3);
			let orbitMaterial = new THREE.MeshBasicMaterial({
				color: "#ffffff",
				side: THREE.DoubleSide,
				opacity: 0.2,
				transparent: true
			});
			ORBIT = new THREE.Mesh(orbitGeometry, orbitMaterial);
			ORBIT.position.set(0, 0, 0)
			// orbit.setRotationFromAxisAngle(new THREE.Vector3(0,0,0), 270)
			SCENE.add(ORBIT)
		}

		CENTROID_DETAILS_ARRAY = [];
		CLUSTER_POINTS_DETAILS_ARRAY = [];
		CLUSTER_POINTS_ARRAY = [];
		props.data.map((processedData, processedDataIndex) => {

			let dominantCentroidIndex = 0, dominantCentroidPercentage = 0;
			CLUSTER_POINTS_ARRAY[processedDataIndex] = [];
			CLUSTER_POINTS_DETAILS_ARRAY[processedDataIndex] = [];
			CENTROID_DETAILS_ARRAY[processedDataIndex] = [];

			let clusterLabelPercentage = props.getClusterLabelPercentage(processedData.clusteredData.labels);
			clusterLabelPercentage.map((clusterPercentage, index) => {
				if (clusterPercentage !== undefined) {
					if (dominantCentroidPercentage < Number(clusterPercentage)) {
						dominantCentroidPercentage = Number(clusterPercentage);
						dominantCentroidIndex = index;
					}
				}
			})

			let dataPlanetSize = getDataContainerRadius(processedData.reducedDimensionData.narrowMatrix.length, DATACONTAINER);

			let depthOfCentroid = 0;

			switch (dataPlanetSize / 5) {
				case dataPlanetSize / 5 < 5:
					depthOfCentroid = 5;
					break;
				case dataPlanetSize / 5 > 10:
					depthOfCentroid = 7;
					break;
				default:
					depthOfCentroid = dataPlanetSize / 5;
			}

			let object3D_origin = OBJECT_POSITIONS[processedDataIndex];
			let dataPlanet;
			if (DATACONTAINER === enumeration.dataContainer_sphere) { //for spherical data container
				let dataPlanetGeometry = new THREE.SphereBufferGeometry(dataPlanetSize, 32, 32)
				let dataPlanetMaterial = new THREE.MeshPhongMaterial({
					color: "#091c28",//091c28
					opacity: 0.5,
					transparent: true,
					shininess: 5
				})//0x06131b
				dataPlanet = new THREE.Mesh(dataPlanetGeometry, dataPlanetMaterial);
				dataPlanet.name = enumeration.dataContainer;
				dataPlanet.userData = {
					fileIndex: processedDataIndex,
					title: processedData.title,
					radius: dataPlanetSize,
				}
				dataPlanet.position.set(object3D_origin.x, object3D_origin.y, object3D_origin.z);
				// SCENE.add(dataPlanet);
			} else {//for square data container
				let dataPlanetGeometry = new THREE.PlaneGeometry(dataPlanetSize, dataPlanetSize, 32);
				let dataPlanetMaterial = new THREE.MeshPhongMaterial({
					color: "#091c28",
					opacity: 1,
					side: THREE.DoubleSide,
					transparent: true,
					shininess: 5
				})//0x06131b
				dataPlanet = new THREE.Mesh(dataPlanetGeometry, dataPlanetMaterial);
				// console.log(object3D_origin.angle, -Math.abs(object3D_origin.angle - 90));
				dataPlanet.rotateX(Math.PI / 2);
				dataPlanet.rotateY(-Math.abs(object3D_origin.angle - 90) * (Math.PI / 180))
				dataPlanet.position.set(object3D_origin.x, object3D_origin.y, object3D_origin.z);
				// dataPlanet.lookAt(new THREE.Vector3(0, 0, 0));
			}
			//for adding title
			{
				let textGeometry = new THREE.TextBufferGeometry(processedData.title, {
					font: THREEJS_FONT,
					size: 3,
					height: 1,
				});
				let textMaterial = new THREE.MeshBasicMaterial({color: "#ffffff"});
				let text = new THREE.Mesh(textGeometry, textMaterial);
				text.name = "title";
				text.userData = {
					fileIndex: processedDataIndex
				};
				text.position.set(object3D_origin.x - (0.25 * dataPlanetSize), DATACONTAINER === enumeration.dataContainer_sphere ? object3D_origin.y + dataPlanetSize + (0.2 * dataPlanetSize) : object3D_origin.y + (0.5 * dataPlanetSize), object3D_origin.z);
				SCENE.add(text);
				DATAPLANET_GROUP.push(text)
			}

			let xPoints = [], yPoints = [];
			processedData.reducedDimensionData.narrowMatrix.map(data => xPoints.push(data.x))
			processedData.reducedDimensionData.narrowMatrix.map(data => yPoints.push(data.y))
			let maxMinCollection = getMinMax(xPoints, yPoints)
			let xAxisOrigin = 0;//(x_max + x_min)/2;
			let yAxisOrigin = 0;//(y_max + y_min)/2;

			let userDefinedClusterColors = processedData.clusteredData.centroidLabels === undefined ? [] : props.generateColors(processedData.clusteredData.centroidLabels.length);

			//To add points into the sphere
			processedData.reducedDimensionData.narrowMatrix.map((data, index) => {
				CLUSTER_POINTS_ARRAY[processedDataIndex].push(processedData.reducedDimensionData.target[index]);
				let [sphere_x, sphere_y, sphere_z, longitude, latitude] = get3DCoordinates(xAxisOrigin, yAxisOrigin, maxMinCollection, data.x, data.y, dataPlanetSize, DATACONTAINER);
				// console.log(processedData.reducedDimensionData.target[index],data.x, data.y, sphere_x, sphere_y, sphere_z, dataPlanetSize);
				let clusterPointsGeometry = new THREE.SphereBufferGeometry(sizeOfPointsOnSphere / 2, 8, 6)//.CircleBufferGeometry(sizeOfPointsOnSphere/2,30,0, 6.3);
				let clusterPointsMaterial = new THREE.MeshPhongMaterial();
				clusterPointsMaterial.color.set(processedData.clusteredData.centroidLabels === undefined ? props.dataPointsColor[processedData.clusteredData.labels[index]] : userDefinedClusterColors[processedData.clusteredData.centroidLabels.indexOf(processedData.clusteredData.labels[index])])
				let clusterPoints = new THREE.Mesh(clusterPointsGeometry, clusterPointsMaterial);
				clusterPoints.name = enumeration.clusterPoints;

				clusterPoints.userData = {
					fileIndex: processedDataIndex,
					targetIndex: index,
					coordinates: new THREE.Vector3(sphere_x + object3D_origin.x, sphere_y + object3D_origin.y, sphere_z + object3D_origin.z),
					coordinates_withCenterAddition: new THREE.Vector3(sphere_x + object3D_origin.x, sphere_y + object3D_origin.y, sphere_z + object3D_origin.z),
					coordinates_withoutCenterAddition: new THREE.Vector3(sphere_x, sphere_y, sphere_z),
					x: data.x,
					y: data.y,
					longitude: longitude,
					latitude: latitude,
					target: processedData.reducedDimensionData.target[index],
					htmlText: `Target: ${processedData.reducedDimensionData.target[index]}`,
					center: new THREE.Vector3(object3D_origin.x, object3D_origin.y, object3D_origin.z),
					backgroundColor: processedData.clusteredData.centroidLabels === undefined ? props.dataPointsColor[processedData.clusteredData.labels[index]] : userDefinedClusterColors[processedData.clusteredData.centroidLabels.indexOf(processedData.clusteredData.labels[index])],
					radius: dataPlanetSize,
					paddingSphere: getSphereCoordinates(dataPlanetSize, 0.1, longitude, latitude),
					padding: 0.1,
					fileType: processedData.fileType,
					arcMidPoints: object3D_origin.midPointArcCoordinates,
					onClickName: processedData.reducedDimensionData.target[index]
				}
				// clusterPoints.lookAt(new THREE.Vector3(sphere_x, sphere_y, sphere_z))
				clusterPoints.position.set(sphere_x, sphere_y, sphere_z)
				CLUSTER_POINTS_DETAILS_ARRAY[processedDataIndex].push(clusterPoints);
				dataPlanet.add(clusterPoints)
			})

			//To add centroids into the sphere
			processedData.clusteredData.centroids.map((data, index) => {
				let [sphere_x, sphere_y, sphere_z, longitude, latitude] = get3DCoordinates(xAxisOrigin, yAxisOrigin, maxMinCollection, data.x, data.y, dataPlanetSize, DATACONTAINER)
				let centroidMaterial = new THREE.MeshPhongMaterial({
					specular: "#ffffff",
					shininess: 5,
					color: processedData.clusteredData.centroidLabels === undefined ? props.dataPointsColor[index] : userDefinedClusterColors[index]
				});
				let centroidGeometry = new THREE.BoxBufferGeometry(sizeOfPointsOnSphere / 2, sizeOfPointsOnSphere / 2, depthOfCentroid);
				let centroid = new THREE.Mesh(centroidGeometry, centroidMaterial)
				if (DATACONTAINER === enumeration.dataContainer_sphere) {
					centroid.lookAt(new THREE.Vector3(sphere_x, sphere_y, sphere_z));
				}
				centroid.position.set(sphere_x, sphere_y, sphere_z);
				centroid.name = enumeration.centroid;
				let clusterName = processedData.clusteredData.centroidLabels === undefined ? `Cluster ${index + 1}` : `Cluster ${processedData.clusteredData.centroidLabels[index]} (user defined cluster)`
				let centroidIndex = processedData.clusteredData.centroidLabels === undefined ? index : processedData.clusteredData.centroidLabels[index];
				centroid.userData = {
					htmlText: `${clusterName} \n Info: ${clusterLabelPercentage[centroidIndex]}% of target data belongs to this cluster.
                        ${dominantCentroidIndex === centroidIndex ? "Additional info: This cluster contains most of the target" : ""}`,
					backgroundColor: processedData.clusteredData.centroidLabels === undefined ? props.dataPointsColor[index] : userDefinedClusterColors[index],
					// primaryColor: props.dataPointsColor[index],
					// secondaryColor: blinkColor,
					clusterNumber: processedData.clusteredData.centroidLabels === undefined ? index : processedData.clusteredData.centroidLabels[index],
					userDefinedCentroidIndex: processedData.clusteredData.centroidLabels === undefined ? undefined : index,
					fileIndex: processedDataIndex,
					onClickName: `Cluster ${index + 1} (${processedData.title})`
				}
				dataPlanet.add(centroid);

				//Since the centroid is having a certain height, to append a end to it the coordinates need to be computed again because
				// end point lie on the circumference of the imaginary sphere
				let centroidEnd_x = (sphere_x * (dataPlanetSize + (depthOfCentroid / 2))) / dataPlanetSize;
				let centroidEnd_y = (sphere_y * (dataPlanetSize + (depthOfCentroid / 2))) / dataPlanetSize;
				let centroidEnd_z = (sphere_z * (dataPlanetSize + (depthOfCentroid / 2))) / dataPlanetSize;
				let centroidEndGeometry = new THREE.IcosahedronBufferGeometry(1, 2);
				let centroidEnd = new THREE.Mesh(centroidEndGeometry, centroidMaterial)
				if (DATACONTAINER === enumeration.dataContainer_sphere) {
					// centroidEnd.lookAt(new THREE.Vector3(sphere_x, sphere_y + depthOfCentroid, sphere_z));
					centroidEnd.position.set(centroidEnd_x, centroidEnd_y, centroidEnd_z);
				} else if (DATACONTAINER === enumeration.dataContainer_square) {
					centroidEnd.position.set(sphere_x, sphere_y, sphere_z + (depthOfCentroid / 2));
				}
				// centroidEnd.position.set(centroidEnd_x, centroidEnd_y, centroidEnd_z);
				centroidEnd.name = enumeration.centroidEnd;
				// outlinePass.selectedObjects.push(centroidEnd)
				centroidEnd.userData = {
					htmlText: `${clusterName} \n Info: ${clusterLabelPercentage[centroidIndex]}% of target data belongs to this cluster.
                        ${dominantCentroidIndex === centroidIndex ? "Additional info: This cluster contains most of the target" : ""}`,
					backgroundColor: processedData.clusteredData.centroidLabels === undefined ? props.dataPointsColor[index] : userDefinedClusterColors[index],
					primaryColor: props.dataPointsColor[index],
					secondaryColor: blinkColor,
					nextColor: "secondaryColor",
					radius: dataPlanetSize,
					clusterNumber: processedData.clusteredData.centroidLabels === undefined ? index : processedData.clusteredData.centroidLabels[index],
					userDefinedCentroidIndex: processedData.clusteredData.centroidLabels === undefined ? undefined : index,
					fileIndex: processedDataIndex,
					onClickName: processedData.clusteredData.centroidLabels === undefined ? `Cluster ${index + 1} (${processedData.title})` : `Cluster ${processedData.clusteredData.centroidLabels[index]} (${processedData.title}) (user defined cluster)`
				}
				let centroidOtherEnd;
				if (DATACONTAINER === enumeration.dataContainer_square) {
					centroidOtherEnd = centroidEnd.clone();
					centroidOtherEnd.position.set(sphere_x, sphere_y, sphere_z - (depthOfCentroid / 2));
					// centroidCollection.push(centroidOtherEnd);
					dataPlanet.add(centroidOtherEnd);
				}
				dataPlanet.add(centroidEnd);
				CENTROID_DETAILS_ARRAY[processedDataIndex].push(centroidEnd);
				if (centroidIndex === dominantCentroidIndex) {
					let highlighterMaterial = new THREE.MeshPhongMaterial({
						color: "#ffffff",
						side: THREE.BackSide
					});
					let highlighter = new THREE.Mesh(centroidEnd.geometry, highlighterMaterial); //for highlighting EC
					highlighter.scale.set(1.5, 1.5, 1.5);
					centroidEnd.add(highlighter);
					if (DATACONTAINER === enumeration.dataContainer_square) {
						let highlighterOtherEnd = highlighter.clone();
						centroidOtherEnd.add(highlighterOtherEnd)
					}
				}
			})
			SCENE.add(dataPlanet);
			DATAPLANET_GROUP.push(dataPlanet)
		});
	}

	const navigate = () => {
		let speed = 0.5;
		let dollyQuaternion = new THREE.Quaternion();
		DOLLY_FOR_CAMERA.getWorldQuaternion(dollyQuaternion);
		let cameraQuaternion = new THREE.Quaternion();
		VR_HEADSET.getWorldQuaternion(cameraQuaternion);
		let CameraDirection = new THREE.Vector3()
		VR_HEADSET.getWorldDirection(CameraDirection);
		DOLLY_FOR_CAMERA.translateX(CameraDirection.x * speed);
		DOLLY_FOR_CAMERA.translateY(CameraDirection.y * speed);
		DOLLY_FOR_CAMERA.translateZ(CameraDirection.z * speed);
		xSteps++
		ySteps++
		zSteps++
		DOLLY_FOR_CAMERA.quaternion.copy(dollyQuaternion)
	};


	const buildControllers = () => {
		const controllerModelFactory = new XRControllerModelFactory();
		const geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1)
		])
		// const line = new THREE.Line(geometry);
		const line = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), 5, "#ffffff")
		line.name = "controller";
		// line.scale.z = 5;

		let controllers = [];
		for (let iteration = 0; iteration < 1; iteration++) {
			const controller = RENDERER.xr.getController(iteration);
			controller.add(line.clone());
			controller.userData.pressed = false;
			SCENE.add(controller);
			controllers.push(controller);

			const grip = RENDERER.xr.getControllerGrip(iteration);
			grip.add(controllerModelFactory.createControllerModel(grip));
			SCENE.add(grip);
		}

		return controllers;
	};

	const handleController = (controller) => {
		controller.addEventListener(`selectstart`, () => START_NAVIGATE = true, false);
		controller.addEventListener(`selectend`, () => START_NAVIGATE = false, false);
	}

	const currentMouseLocation = (event) => {
		let {left, top} = RENDERER.domElement.getBoundingClientRect();
		MOUSE.set(((event.clientX - left) / RENDERER.domElement.width) * 2 - 1,
			((event.clientY - top) / RENDERER.domElement.height) * -2 + 1)
	}

	const getClickedObject = (event) => {
		currentMouseLocation(event, MOUSE, RENDERER);
		RAYCAST.setFromCamera(MOUSE, CAMERA);
		let intersections = RAYCAST.intersectObjects(SCENE.children, true);
		if (intersections.length !== 0 &&
			[enumeration.EC, enumeration.compound, enumeration.clusterPoints, enumeration.centroidEnd, enumeration.centroid].indexOf(intersections[0].object.name) !== -1) {
			if ([enumeration.EC, enumeration.compound].indexOf(intersections[0].object.name) !== -1) { //For highlighting EC and compound
				getECCompoundOutliner(intersections[0].object.userData.linkIndex, true);
			} else { // for drawing lines between points
				intersectedClusterOrCentroidPoints(intersections[0].object)
			}
		} else if (intersections.length === 0) {
			getECCompoundOutliner(undefined, false);
		}
	}

	const intersectedClusterOrCentroidPoints = (intersect) => {
		LINES_DRAWN = [];
		KEGG_INTERACTION = [];
		// console.log(intersect.userData.onClickName);
		let lineDrawn = props.lineDrawnForThisPoint(intersect.userData.onClickName);
		// console.log(lineDrawn);
		if (Number(lineDrawn) === Number(-1)) {
			// console.log("adding");
			let pointDetails = {label: intersect.userData.onClickName};
			let selectedFileIndex = Number(intersect.userData.fileIndex), selectedData = [];
			if (enumeration.clusterPoints === intersect.name) { //If a cluster poingt is clicked
				selectedData.push(intersect);
			} else { //If a centroid is clicked
				props.data[selectedFileIndex].clusteredData.labels.map((value, index) => {
					if (value === intersect.userData.clusterNumber) {
						selectedData.push(CLUSTER_POINTS_DETAILS_ARRAY[selectedFileIndex][index])
					}
				})
			}
			selectedData.map(data => {
				let target = data.userData.target;
				let nextFileIndex = selectedFileIndex;
				let currentFile = data;
				let allLinesDrawn = false;
				while (!allLinesDrawn) {
					if (currentFile.userData.fileType !== "Others" && props.additionalFile.length !== 0) { //for connecting points with kegg network
						let [connections, connectionsValue] = getConnections(currentFile.userData.fileIndex, currentFile.userData.targetIndex, currentFile.userData.fileType);
						let connectionNames_2D = [], connectionValues_2D = [];
						connections.map((connection, index) => {
							if (connection.lineGeometry === undefined || connection.exist === false) {
								// console.log(connection.name);
								connectionNames_2D.push(connection.name);
								connectionValues_2D.push(connectionsValue[index])
								drawLines(getModifiedIntersectionObject(currentFile, true), getModifiedIntersectionObject(connection, false), false, connectionsValue[index], connection.name, currentFile.userData.fileType);
							}
						});
						pointDetails[currentFile.userData.fileType === "Protein" ? "EC" : "CPD"] = {
							entity: pointDetails[currentFile.userData.fileType === "Protein" ? "EC" : "CPD"] !== undefined
								?
								pointDetails[currentFile.userData.fileType === "Protein" ? "EC" : "CPD"].entity.concat([...connectionNames_2D])
								:
								[...connectionNames_2D],
							value: pointDetails[currentFile.userData.fileType === "Protein" ? "EC" : "CPD"] !== undefined
								?
								pointDetails[currentFile.userData.fileType === "Protein" ? "EC" : "CPD"].value.concat([...connectionValues_2D])
								:
								[...connectionValues_2D],
						}
					}
					nextFileIndex = (nextFileIndex += 1) % CLUSTER_POINTS_ARRAY.length;
					let targetIndex = CLUSTER_POINTS_ARRAY[nextFileIndex].indexOf(target);
					if (targetIndex !== -1) {
						if (currentFile.userData.fileIndex !== CLUSTER_POINTS_DETAILS_ARRAY[nextFileIndex][targetIndex].userData.fileIndex) {
							drawLines(getModifiedIntersectionObject(currentFile, true), getModifiedIntersectionObject(CLUSTER_POINTS_DETAILS_ARRAY[nextFileIndex][targetIndex], true), true);
							currentFile = CLUSTER_POINTS_DETAILS_ARRAY[nextFileIndex][targetIndex];
						}
					}
					if (nextFileIndex === selectedFileIndex) {
						allLinesDrawn = true;
					}
				}
			});
			pointDetails.linesDrawn = [...LINES_DRAWN];
			pointDetails.keggInteraction = [...KEGG_INTERACTION];
			pointDetails.fileIndex = intersect.userData.fileIndex;
			//use target index in case of cluster points. In case of centroids based on manual/auto clustering chose the centroid index
			pointDetails.targetIndex = enumeration.clusterPoints === intersect.name
				?
				intersect.userData.targetIndex
				:
				intersect.userData.userDefinedCentroidIndex !== undefined ? intersect.userData.userDefinedCentroidIndex : intersect.userData.clusterNumber;
			pointDetails.isCentroid = enumeration.clusterPoints !== intersect.name;
			props.addOrRemovePoints(pointDetails, undefined, true)
		} else {
			// console.log("removing");
			removeDrawnLines(lineDrawn);
		}
	}

	const removeDrawnLines = (drawnLineIndex) => {
		let line = props.getDrawnLines(drawnLineIndex)
		line.linesDrawn.map(drawnLine => {
			SCENE.remove(drawnLine);
		})
		line.keggInteraction.map(keggInteractionLines => {
			SCENE.remove(keggInteractionLines);
		})
		props.addOrRemovePoints(undefined, drawnLineIndex, false);
	}

	const getModifiedIntersectionObject = (threeD_Object, isClusterPoint) => {
		let modifiedObject = {};
		if (isClusterPoint) {
			modifiedObject = threeD_Object.userData;
			if (DATACONTAINER === enumeration.dataContainer_square) {
				let worldPosition = new THREE.Vector3();
				threeD_Object.getWorldPosition(worldPosition);
				modifiedObject.coordinates = worldPosition;
			}
		} else {
			modifiedObject = threeD_Object;
			modifiedObject.backgroundColor = threeD_Object.pointGeometry.userData.backgroundColor;
			modifiedObject.padding = 0;
		}
		return modifiedObject;
	}

	const drawLines = (point1, point2, isCluster, lineValue, lineName, fileType) => {
		let point1Radius = point1.radius + point1.padding;
		let lineColor = isCluster ? point2.backgroundColor : point2.backgroundColor;
		let [distanceBetweenPoints, point1CenterToPoint2, point2CenterToPoint1] = getDistanceArray(point1.coordinates, point1.center, point2.coordinates, point2.center);
		let point2Radius = point2.radius + point2.padding;
		let geometry;
		let lineDetails = {
			htmlText: `From: ${point1.target} in the Cluster ${props.data[point1.fileIndex].clusteredData.labels[point1.targetIndex] + 1} of ${props.data[point1.fileIndex].title}\nTo: ${isCluster ? `${point2.target} in the Cluster ${props.data[point2.fileIndex].clusteredData.labels[point2.targetIndex] + 1} of ${props.data[point2.fileIndex].title}` : `${point2.pointGeometry.userData.target} in the Kegg network`}`,
			backgroundColor: lineColor,
		};
		if ((distanceBetweenPoints < point1CenterToPoint2) && (distanceBetweenPoints < point2CenterToPoint1) && (DATACONTAINER !== enumeration.dataContainer_square)) {
			let points = [];
			points.push(point1.coordinates)
			points.push(point2.coordinates)
			geometry = new THREE.BufferGeometry().setFromPoints(points);
		} else {
			let radiusOfPoint1WrappingSphere = Math.abs(distanceBetweenPoints - point1CenterToPoint2) / point1Radius;
			let radiusOfPoint2WrappingSphere = Math.abs(distanceBetweenPoints - point2CenterToPoint1) / point2Radius;
			let point1Center = point1.center;
			let startPoints = (DATACONTAINER === enumeration.dataContainer_sphere) ? getSphereCoordinates(point1Radius, radiusOfPoint1WrappingSphere, point1.longitude, point1.latitude) : point1.coordinates;
			if (DATACONTAINER !== enumeration.dataContainer_square) {
				startPoints = {
					x: point1Center.x + startPoints.x,
					y: point1Center.y + startPoints.y,
					z: point1Center.z + startPoints.z
				}
			}
			let point2Center = point2.center;
			let endPoints = (DATACONTAINER === enumeration.dataContainer_sphere) ? getSphereCoordinates(point2Radius, radiusOfPoint2WrappingSphere, point2.longitude, point2.latitude) : point2.coordinates;
			if (DATACONTAINER === enumeration.dataContainer_sphere) {
				endPoints = {
					x: point2Center.x + endPoints.x,
					y: point2Center.y + endPoints.y,
					z: point2Center.z + endPoints.z
				}
			}
			//line details
			// Create the final object to add to the scene
			if (DATACONTAINER !== enumeration.dataContainer_square) {
				let line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([point1.coordinates, startPoints]),
					new THREE.LineBasicMaterial({color: lineColor}));
				line.userData = lineDetails;
				line.name = enumeration.connections;
				if (!isCluster) {
					line.userData.fileType = fileType;
					line.userData.connectionValue = lineValue
				}
				if ((props.displayKeggInteraction() && !isCluster &&
						(
							(fileType === "Protein" && lineValue >= props.ECConnectionRange()[0] && lineValue <= props.ECConnectionRange()[1])
							||
							(fileType === "Metabolite" && lineValue >= props.CPDConnectionRange()[0] && lineValue <= props.CPDConnectionRange()[1])
						))
					|| isCluster) {
					SCENE.add(line);
				}
				isCluster ? LINES_DRAWN.push(line) : KEGG_INTERACTION.push(line); //for enbling and disableing kegg interaction line
				line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([point2.coordinates, endPoints]),
					new THREE.LineBasicMaterial({color: lineColor}));
				line.userData = lineDetails;
				line.name = enumeration.connections;
				if (!isCluster) {
					line.userData.fileType = fileType;
					line.userData.connectionValue = lineValue
				}
				if ((props.displayKeggInteraction() && !isCluster &&
						(
							(fileType === "Protein" && lineValue >= props.ECConnectionRange()[0] && lineValue <= props.ECConnectionRange()[1])
							||
							(fileType === "Metabolite" && lineValue >= props.CPDConnectionRange()[0] && lineValue <= props.CPDConnectionRange()[1])
						))
					|| isCluster) {
					SCENE.add(line);
				}
				isCluster ? LINES_DRAWN.push(line) : KEGG_INTERACTION.push(line);
			}

			{//old code for getting the curve
				// let greatArc = d3Geo.geoInterpolate(translateCoordinates(distanceBetweenPoints/2, startPoints,
				//     point1.radius + (radiusOfPoint1WrappingSphere * point1.radius)),
				//     translateCoordinates(distanceBetweenPoints/2, endPoints, point2.radius + (radiusOfPoint2WrappingSphere * point2.radius)));
				// let midPoints = greatArc(0.5).map(radians => radians * (180/Math.PI));
				// let mid3DPoints = getSphereCoordinates(distanceBetweenPoints/2, 0, midPoints[0], -midPoints[1]);
			}
			let mid3DPoints = {
				x: point1.coordinates.x + point1.arcMidPoints.x,
				y: point1.coordinates.y + point1.arcMidPoints.y,
				z: point1.coordinates.z + point1.arcMidPoints.z
			};
			let curve = new THREE.QuadraticBezierCurve3(startPoints, mid3DPoints, endPoints);
			geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
		}
		let material = new THREE.LineBasicMaterial({color: lineColor, opacity: 0.5, transparent: true});
		// Create the final object to add to the scene
		let connectingLine = new THREE.Line(geometry, material);
		connectingLine.userData = lineDetails;
		connectingLine.name = enumeration.connections;
		if (!isCluster) {
			connectingLine.userData.fileType = fileType;
			connectingLine.userData.connectionValue = lineValue
		}
		if ((props.displayKeggInteraction() && !isCluster &&
				(
					(fileType === "Protein" && lineValue >= props.ECConnectionRange()[0] && lineValue <= props.ECConnectionRange()[1])
					||
					(fileType === "Metabolite" && lineValue >= props.CPDConnectionRange()[0] && lineValue <= props.CPDConnectionRange()[1])
				))
			|| isCluster) {
			SCENE.add(connectingLine);
			// if(fileType === "Protein" || fileType === "Metabolite")
			//     console.log(lineName);
		}
		isCluster ? LINES_DRAWN.push(connectingLine) : KEGG_INTERACTION.push(connectingLine);
	}

	const getConnections = (fileIndex, targetIndex, connectionType) => {
		let connections = [], connectionsValue = [];
		const ECorCompoundList = connectionType === "Protein" ?
			props.additionalFile.kegg.ec_number_collection
			:
			props.compoundList;
		const EC_CPDCoordinates = props.keggLinkCoordinates.links;
		props.targetFeatureConnection[fileIndex][targetIndex].map((value, index) => {
			if (value !== 0) {
				if (connectionType === "Protein" && Array.isArray(ECorCompoundList[index])) {
					ECorCompoundList[index].map(EC => {
						EC_CPDCoordinates.map(object => {
							if (EC === object.EC.name) {
								connections.push(object.EC);
								connectionsValue.push(value);
							}
							// return 0;
						})
					})
				} else {
					EC_CPDCoordinates.map(object => {
						object.CPD.map(cpd => {
							if (cpd.name === ECorCompoundList[index]) {
								connections.push(cpd);
								connectionsValue.push(value);
							}
						})
					})
				}
			}
		})
		return [connections, connectionsValue];
	}

	const getRaycastObject = (vrMode, controller) => {
		if (vrMode) {
			TEMP_MATRIX4_VR.identity().extractRotation(controller.matrixWorld);
			RAYCAST.ray.origin.setFromMatrixPosition(controller.matrixWorld);
			RAYCAST.ray.direction.set(0, 0, -1).applyMatrix4(TEMP_MATRIX4_VR);
		} else {
			RAYCAST.setFromCamera(MOUSE, CAMERA);
		}
		return RAYCAST.intersectObjects(SCENE.children, true);
	};

	const showToolTip_inVR = (controller) => {
		let intersectObjects = getRaycastObject(true, controller);
		let intersectObject = undefined;
		if (intersectObjects.length > 0) {
			intersectObjects.map(intersect => {
				if (intersectObject === undefined &&
					[enumeration.clusterPoints, enumeration.centroid, enumeration.centroidEnd, enumeration.EC,
						enumeration.compound, enumeration.connections].indexOf(intersect.object.name) !== -1) {
					intersectObject = intersect;
					console.log(intersectObject);
				}
			})
			if (CAMERA.children.length !== 0 && intersectObject === undefined) {
				CAMERA.remove(CAMERA.children[0]);
				controller.userData.tooltip = undefined;
				controller.userData.toolTipText = "";
				console.log(CAMERA.children);
			}
			if (intersectObject !== undefined && controller.userData.toolTipText !== intersectObject.object.userData.htmlText) {
				VRToolTipContainer(controller, intersectObject.object.userData.htmlText, intersectObject.object.userData.backgroundColor);
			}
		}
		if (CAMERA.children.length !== 0 && intersectObject === undefined) {
			CAMERA.remove(CAMERA.children[0]);
			controller.userData.tooltip = undefined
			controller.userData.toolTipText = ""
		}
	};

	const VRToolTipContainer = (controller, text, materialColor) => {
		let textGeometry = new THREE.TextBufferGeometry(text, {
			font: THREEJS_FONT,
			size: 0.05,
			height: 0.001,
		});
		let textMaterial = new THREE.MeshBasicMaterial({color: "#ffffff"});
		let Three_text = new THREE.Mesh(textGeometry, textMaterial);
		let DollyWorldPosition = new THREE.Vector3();
		CAMERA.getWorldPosition(DollyWorldPosition);
		Three_text.lookAt(0, 0, 0)
		Three_text.position.set(-0.5, 0, -1);
		controller.userData.tooltip = Three_text;
		controller.userData.toolTipText = text;
		CAMERA.add(Three_text);
	};

	const showToolTip = (event) => {
		currentMouseLocation(event, MOUSE, RENDERER);
		let intersectObjects = getRaycastObject(false, undefined);
		let noPointFound = true;
		if (intersectObjects.length > 0) {
			let intersectObject = intersectObjects[0];
			if ([enumeration.clusterPoints, enumeration.centroid, enumeration.centroidEnd, enumeration.EC, enumeration.compound, enumeration.connections].indexOf(intersectObject.object.name) !== -1) {
				threeDContainer_Div.current.style.cursor = "pointer";
				TOOLTIP.innerText = intersectObject.object.userData.htmlText;
				TOOLTIP.style.left = `${event.clientX + 30}px`;
				TOOLTIP.style.top = `${event.clientY + 30}px`;
				TOOLTIP.style.opacity = 1;
				TOOLTIP.style.borderRadius = "10px";
				TOOLTIP.style.padding = "10px";
				TOOLTIP.style.background = intersectObject.object.userData.backgroundColor;
				TOOLTIP.style.color = "white";
				noPointFound = false;
			}
		}
		if (noPointFound) {
			threeDContainer_Div.current.style.cursor = "default"
			TOOLTIP.innerText = "";
			TOOLTIP.style.opacity = 0;
			TOOLTIP.style.padding = "0px"
		}
	}

	const get3DCoordinates = (xOrigin, yOrigin, maxMinCollection, x, y, dataContainerSize, type) => {
		let latitude, longitude;
		if (type === enumeration.dataContainer_sphere) {
			x > xOrigin ? longitude = Math.abs(x / maxMinCollection[0]) * Math.PI : longitude = -(Math.abs(x / maxMinCollection[1])) * Math.PI;
			y > yOrigin ? latitude = Math.abs(y / maxMinCollection[2]) * (Math.PI / 2) : latitude = -(Math.abs(y / maxMinCollection[3])) * (Math.PI / 2);
			let coordinates = getSphereCoordinates(dataContainerSize, 0, longitude, latitude);
			return [coordinates.x, coordinates.y, coordinates.z, longitude, latitude];
		} else if (type === enumeration.dataContainer_square) {
			let coordinates = {
				x: 0, y: 0, z: 0
			};
			if (x > xOrigin) {
				longitude = Math.abs(x / maxMinCollection[0]) * Math.PI;
				coordinates.x = (x / maxMinCollection[0]) * (dataContainerSize / 2);
			} else {
				longitude = -(Math.abs(x / maxMinCollection[1])) * Math.PI;
				coordinates.x = -(Math.abs(x / maxMinCollection[1])) * (dataContainerSize / 2);
			}
			if (y > yOrigin) {
				latitude = Math.abs(y / maxMinCollection[2]) * (Math.PI / 2);
				coordinates.y = Math.abs(y / maxMinCollection[2]) * (dataContainerSize / 2);
			} else {
				latitude = -(Math.abs(y / maxMinCollection[3])) * (Math.PI / 2);
				coordinates.y = -(Math.abs(y / maxMinCollection[3])) * (dataContainerSize / 2);
			}
			return [coordinates.x, coordinates.y, coordinates.z, longitude, latitude];
		}
	}

	const getMinMax = (xCoordinateCollection, yCoordinateCollection) => {
		return [
			Math.max(...xCoordinateCollection) + (0.05 * Math.max(...xCoordinateCollection)), //xMax
			Math.min(...xCoordinateCollection) + (0.05 * Math.min(...xCoordinateCollection)), //xMin
			Math.max(...yCoordinateCollection) + (0.05 * Math.max(...yCoordinateCollection)), //yMax
			Math.min(...yCoordinateCollection) + (0.05 * Math.min(...yCoordinateCollection)) //yMin
		]
	}

	const getSphereCoordinates = (radius, padding, longitude, latitude) => {
		let sphere_x = (radius + (radius * padding)) * Math.cos(latitude) * Math.cos(longitude);
		let sphere_y = (radius + (radius * padding)) * Math.cos(latitude) * Math.sin(longitude);
		let sphere_z = (radius + (radius * padding)) * Math.sin(latitude);
		return {
			x: sphere_x,
			y: sphere_y,
			z: sphere_z
		}
	}

	const getDistanceArray = (point1, point1Center, point2, point2Center) => {
		return [point1.distanceTo(point2),
			point1Center.distanceTo(point2),
			point2Center.distanceTo(point1)]
	}

	const translateCoordinates = (radius, threeDPoints, originalRadius) => {
		let {x, y, z} = threeDPoints;
		// return [Math.asin(z/originalRadius)* (180/Math.PI) , Math.atan2(y,x)* (180/Math.PI)];
		let latitude = Math.asin(z / originalRadius), longitude = Math.atan2(y, x);
		let sphere_x = radius * Math.cos(latitude) * Math.cos(longitude);
		let sphere_y = radius * Math.cos(latitude) * Math.sin(longitude);
		let sphere_z = radius * Math.sin(latitude);
		return [Math.asin(sphere_z / radius) * (180 / Math.PI), Math.atan2(sphere_y, sphere_x) * (180 / Math.PI)];
	}

	const getECCompoundOutliner = (index, getConnection) => {
		// COMPOUND_EC_OUTLINER_SELECTION = []
		if (COMPOUND_EC_OUTLINER_SELECTION.length !== 0) {
			COMPOUND_EC_OUTLINER_SELECTION.map(highlighter => {
				if (highlighter.line) {
					highlighter.parent.material.opacity = 0.2;
				}
				highlighter.parent.remove(highlighter.meshToRemove);
			});
			COMPOUND_EC_OUTLINER_SELECTION = [];
		}
		if (getConnection) {
			let links = props.keggLinkCoordinates.links;
			let targetList = links[index].nameList
			let highlighterMaterial = new THREE.MeshPhongMaterial({
				color: "#ffffff",
				side: THREE.BackSide
			});
			links.map((link, index) => {
				if (link.nameList.some(name => targetList.includes(name))) { //if any of the entries is contained in the name list collection
					let ECHighlighter = new THREE.Mesh(link.EC.pointGeometry.geometry, highlighterMaterial); //for highlighting EC
					ECHighlighter.scale.set(1.5, 1.5, 1.5);
					link.EC.pointGeometry.add(ECHighlighter);
					COMPOUND_EC_OUTLINER_SELECTION.push({parent: link.EC.pointGeometry, meshToRemove: ECHighlighter});
					link.CPD.map(compound => {
						if (compound.pointGeometry !== undefined) { //for compound highlighting
							let compoundHighlighter = new THREE.Mesh(compound.pointGeometry.geometry, highlighterMaterial)
							compoundHighlighter.scale.set(1.5, 1.5, 1.5);
							compound.pointGeometry.add(compoundHighlighter);
							COMPOUND_EC_OUTLINER_SELECTION.push({
								parent: compound.pointGeometry,
								meshToRemove: compoundHighlighter
							});
						}
						// COMPOUND_EC_OUTLINER_SELECTION.push(compound.lineGeometry); //for lines highlighting
						// highlighterMaterial.opacity = 1;
						compound.lineGeometry.material.opacity = 0.8;
						let lineHighlighter = new THREE.Mesh(compound.lineGeometry.geometry, highlighterMaterial); //for highlighting EC
						compound.lineGeometry.add(lineHighlighter);
						COMPOUND_EC_OUTLINER_SELECTION.push({
							parent: compound.lineGeometry,
							meshToRemove: lineHighlighter,
							line: true
						});
					})
				}
			})
		}
	}

	const loadFont = () => {
		THREEJS_FONT = new THREE.FontLoader().parse(font);
		renderScene(true)
	}

	useImperativeHandle(ref, () => ({
		removeLine: (drawnLineIndex) => removeDrawnLines(drawnLineIndex),

		displayKeggInteraction: (display, ECRange, CPDRange) => {
			let lines = props.getchosenPoints();
			lines.map(line => {
				line.keggInteraction.map(interaction => {
					if (display) {
						if ((interaction.userData.fileType === "Protein" && interaction.userData.connectionValue >= ECRange[0] &&
								interaction.userData.connectionValue <= ECRange[1])
							||
							(interaction.userData.fileType === "Metabolite" && interaction.userData.connectionValue >= CPDRange[0] &&
								interaction.userData.connectionValue <= CPDRange[1])) {
							SCENE.add(interaction);
						}
					} else {
						SCENE.remove(interaction)
					}
				})
			})
		},

		filterKeggInteraction: (range, fileType) => {
			let lines = props.getchosenPoints();
			lines.map(line => {
				line.keggInteraction.map(interaction => {
					if (interaction.userData.fileType === fileType) {
						SCENE.remove(interaction);
						if (interaction.userData.connectionValue >= range[0] && interaction.userData.connectionValue <= range[1]) {
							SCENE.add(interaction);
						}
					}
				})
			})
		},

		displayKeggNetwork: (display) => {
			Object.entries(KEGG_NETWORK).map(([key, data]) => {
				if (display) {
					SCENE.add(data);
				} else {
					SCENE.remove(data);
				}
			})
		},

		findECCompoundConnection: (ECCompoundName) => {
			getECCompoundOutliner(KEGG_NETWORK[ECCompoundName].userData.linkIndex, true);
		},

		changeDataContainer: (containerType, chosenPoints) => {
			let points = [];
			chosenPoints.map(point => {
				points.push({fileIndex: point.fileIndex, targetIndex: point.targetIndex, isCentroid: point.isCentroid});
			});
			DATACONTAINER = containerType;
			DATAPLANET_GROUP.map(mesh => SCENE.remove(mesh));
			DATAPLANET_GROUP = [];
			points.map((intersect, index) => {
				removeDrawnLines(0)
			});
			SCENE.remove(ORBIT);
			addDataContainer();
			// CONNECTION_POINTS = points;
			// isSceneRerendered = true;
		},

		findConnection: (intersect) => {
			if (intersect.isCentroid !== true) {
				intersectedClusterOrCentroidPoints(CLUSTER_POINTS_DETAILS_ARRAY[intersect.fileIndex][intersect.targetIndex]);
			} else {
				intersectedClusterOrCentroidPoints(CENTROID_DETAILS_ARRAY[intersect.fileIndex][intersect.targetIndex]);
			}
		},

		changeOrbitRadius: () => {
			const objectPositions = props.objectPositions(ORBIT_ORIGINAL_RADIUS)
			OBJECT_POSITIONS = objectPositions.positions;
			ORBIT_RADIUS = objectPositions.orbitRadius;
		},

		resize: () => resizeCanvas(),

		toggleVRButton: (flag) => toggleVRButton(flag)
	}))

	useEffect(() => {
		window.addEventListener("resize", resizeCanvas, false)
		DATACONTAINER = props.dataContainerType;//enumeration.dataContainer_square;
		loadFont();
		return () => {
			window.removeEventListener("resize", resizeCanvas, false)
		}
	}, [])


	useEffect(() => {
		props.DataStore.setResetView(function () {
			CAMERA.position.set(10, 0, 1000);
			CONTROLS.update();
		})
	}, [])

	return (
		<div id={"3D"} ref={threeDContainer_Div} style={{width: "100%", height: "100%"}}>
			<div style={{height: "46px", width: "76px", position: "absolute", margin: "5px"}}>
				<FPSStats/>
			</div>
			<canvas ref={threeDContainer} onClick={props.close3DSetting}/>
			<div id={"tooltip"} ref={tooltipDiv} style={{opacity: 0, position: "absolute"}}/>
		</div>
	)

}

export default inject('DataStore')(observer(forwardRef(ThreeJSPlanet)));

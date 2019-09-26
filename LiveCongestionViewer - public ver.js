/*
LiveCongestionViewer Web App created by Alan J. Tan - GitHub/DoYouEvenBacon, 2019
*/

const apiUsername = ''; //Your InfoConnect Username
const apiPassword = ''; //Your InfoConnect Password
const proxy = 'https://cors-anywhere.herokuapp.com/' //required because no headers for CORS are currently set on the server side

let aucklandMap;
let vectorSource = new ol.source.Vector({
	features: []
}); 
let positionVectorSource = new ol.source.Vector({
	features: []
});
let greenCongestionVectorSource = new ol.source.Vector({
	features: []
});
let yellowCongestionVectorSource = new ol.source.Vector({
	features: []
});
let redCongestionVectorSource = new ol.source.Vector({ //prioritise colour of congestion with heaviest on the upper layer
	features: []
});
let busPopupOverlay;

let userTracking = false; //used in toggleUserLocation()
let trackingId;

let autoUpdate = false;
let updateInterval;

const createMap = () =>{
	aucklandMap = new ol.Map({
		target: 'mapContainer',
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			}),
			new ol.layer.Vector({
				name: 'greenCongestionLineVector',
				source: greenCongestionVectorSource
			}),			
			new ol.layer.Vector({
				name: 'yellowCongestionLineVector',
				source: yellowCongestionVectorSource
			}),			
			new ol.layer.Vector({
				name: 'redCongestionLineVector',
				source: redCongestionVectorSource
			}),
			new ol.layer.Vector({
				name: 'positionMarkerVector',
				source: positionVectorSource
			}),
			new ol.layer.Vector({
				name: 'cameraMarkerVector',
				source: vectorSource
			})
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([174.75, -36.8617074]),
			zoom: 11
		})
	});

	//openlayers overlay for the popup boxes
	cameraPopupOverlay = new ol.Overlay({
		element: cameraPopup,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	});	
	aucklandMap.addOverlay(cameraPopupOverlay);
	
	//'x' button functionality in the popup
	document.getElementById('cameraPopup-closer').onclick = function(){
		cameraPopupOverlay.setPosition(undefined);
		document.getElementById('cameraPopup-closer').blur();
	};	


	aucklandMap.on('singleclick', function(event){
		let coordinate = event.coordinate;
		if(aucklandMap.hasFeatureAtPixel(event.pixel)){
			console.log(aucklandMap.getFeaturesAtPixel(event.pixel));
			let feature = aucklandMap.getFeaturesAtPixel(event.pixel)[0].values_
			
			if(feature.markerType === 'Camera'){ //set the camera popup info
				let popupName = feature.name;
				let popupDesc = feature.description;
				let popupThumb = feature.camThumb;
				let popupImage = feature.camImage;
				let popupCamLat = feature.latitude;
				let popupCamLon = feature.longitude;
				
				console.log(`${popupName}`);
				document.getElementById('cameraPopupContent').innerHTML = `<h3><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Antu_folder-camera.svg/512px-Antu_folder-camera.svg.png" style="width:8%">${popupName}</h3><h4>${popupDesc}</h4><img src="${popupImage}?${Date.now()}">`;
				if(typeof feature.congestion1Name !== 'undefined'){
					document.getElementById('cameraPopupContent').innerHTML += `<div id="congest1StatusDiv"><br>${feature.congestion1Direction} - ${feature.congestion1Name}: <b>${feature.congestion1Status}</b></div>`;
					if(feature.congestion1Status === 'Free Flow'){
						document.getElementById('congest1StatusDiv').style.cssText = 'background-color:#33a532;text-align:center;padding-bottom:15px';
					}					
					if(feature.congestion1Status === 'Moderate'){
						document.getElementById('congest1StatusDiv').style.cssText = 'background-color:#fad201;text-align:center;padding-bottom:15px';
					}					
					if(feature.congestion1Status === 'Heavy' || feature.congestion1Status === 'Congested'){
						document.getElementById('congest1StatusDiv').style.cssText = 'background-color:#cc0605;text-align:center;padding-bottom:15px';
					}
				}				
				if(typeof feature.congestion2Name !== 'undefined'){
					document.getElementById('cameraPopupContent').innerHTML += `<div id="congest2StatusDiv"><br>${feature.congestion2Direction} - ${feature.congestion2Name}: <b>${feature.congestion2Status}</b></div>`;
					if(feature.congestion2Status === 'Free Flow'){
						document.getElementById('congest2StatusDiv').style.cssText = 'background-color:#33a532;text-align:center;padding-bottom:15px';
					}					
					if(feature.congestion2Status === 'Moderate'){
						document.getElementById('congest2StatusDiv').style.cssText = 'background-color:#fad201;text-align:center;padding-bottom:15px';
					}					
					if(feature.congestion2Status === 'Heavy' || feature.congestion2Status === 'Congested'){
						document.getElementById('congest2StatusDiv').style.cssText = 'background-color:#cc0605;text-align:center;padding-bottom:15px';
					}
				}
				cameraPopupOverlay.setPosition(coordinate); 
			}
		}
		else{ //close popups when clicking on the map
			cameraPopupOverlay.setPosition(undefined);
			document.getElementById('cameraPopup-closer').blur();
		}
	});	
	
	//change the cursor style depending on action - do not modify
	aucklandMap.on('pointermove', function(event){
		if(aucklandMap.hasFeatureAtPixel(event.pixel)){
			aucklandMap.getTargetElement().style.cursor = 'pointer';
		}
		else{
			aucklandMap.getTargetElement().style.cursor = 'default';
		}
	});
	aucklandMap.on('pointerdrag', function(event){
		aucklandMap.getTargetElement().style.cursor = 'all-scroll';
	});	
	aucklandMap.on('moveend', function(event){
		aucklandMap.getTargetElement().style.cursor = 'default';
	});	
};

const plotPositionMarker = (posLatitude, posLongitude) =>{ //show user's position on the map
	let positionSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24">'
	+ '<circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;"/>'
	+ '</svg>';
	let positionMarker = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat([posLongitude, posLatitude])),
	});
	positionMarker.setProperties({'markerType':'userPosition', 'latitude':posLatitude, 'longitude':posLongitude});
	positionMarker.setStyle(new ol.style.Style({
		image: new ol.style.Icon(({
			src: 'data:image/svg+xml;utf8,' + encodeURIComponent(positionSVG),
			scale: 1,
			opacity: 1
		}))
	}));	
	positionVectorSource.addFeature(positionMarker);
};

const plotCongestionLines = (congest1Status, congest1StartLat, congest1StartLon, congest1EndLat, congest1EndLon) =>{
		
	let polyline1 = new ol.Feature({
		geometry: new ol.geom.LineString([ol.proj.fromLonLat([congest1StartLon, congest1StartLat].map(Number)), ol.proj.fromLonLat([congest1EndLon, congest1EndLat].map(Number))]),
	});
	
	let strokeStyle = {
		color: [],
		width: 5};
	
	if(congest1Status === 'Free Flow'){
		strokeStyle.color = [51, 165, 50];
		polyline1.setStyle(new ol.style.Style({
			stroke: new ol.style.Stroke(strokeStyle)
		}));
		greenCongestionVectorSource.addFeature(polyline1);
	}
	else if(congest1Status === 'Moderate'){
		strokeStyle.color = [250, 210, 1];
		polyline1.setStyle(new ol.style.Style({
			stroke: new ol.style.Stroke(strokeStyle)
		}));
		yellowCongestionVectorSource.addFeature(polyline1);
	}	
	else if(congest1Status === 'Heavy'){
		strokeStyle.color = [204, 6, 5];
		polyline1.setStyle(new ol.style.Style({
			stroke: new ol.style.Stroke(strokeStyle)
		}));
		redCongestionVectorSource.addFeature(polyline1);
	}	
	else if(congest1Status === 'Congested'){
		strokeStyle.color = [204, 6, 5];
		polyline1.setStyle(new ol.style.Style({
			stroke: new ol.style.Stroke(strokeStyle)
		}));
		redCongestionVectorSource.addFeature(polyline1);
	}
};


/* ...congestParams: congest1Name, congest1Status, congest1Dir, congest1StartLat, congest1StartLon, congest1EndLat, congest1EndLon, 
	congest2Name, congest2Status, congest2Dir, congest2StartLat, congest2StartLon, congest2EndLat, congest2EndLon */
const addCamMarker = (camName, camDesc, camLat, camLon, camImg, camThumb, ...congestParams) =>{
	let camMarker = new ol.Feature({
		geometry: new ol.geom.Point(ol.proj.fromLonLat([camLon, camLat].map(Number)))
	});
	let camProperties = {'markerType':'Camera', 'name':camName, 'description':camDesc, 'camImage':camImg, 'camThumb':camThumb, 'latitude':camLat, 'longitude':camLon};
	if(congestParams.length === 7 || congestParams.length === 14){
		let congestion1Properties = {'congestion1Name':congestParams[0], 'congestion1Status':congestParams[1], 'congestion1Direction':congestParams[2], 'congestion1StartLat':congestParams[3], 'congestion1StartLon':congestParams[4], 'congestion1EndLat':congestParams[5], 'congestion1EndLon':congestParams[6]};
		Object.assign(camProperties, congestion1Properties);
	}
	if(congestParams.length === 14){
		let congestion2Properties = {'congestion2Name':congestParams[7], 'congestion2Status':congestParams[8], 'congestion2Direction':congestParams[9], 'congestion2StartLat':congestParams[10], 'congestion2StartLon':congestParams[11], 'congestion2EndLat':congestParams[12], 'congestion2EndLon':congestParams[13]};
		Object.assign(camProperties, congestion2Properties);
	}

	camMarker.setStyle(new ol.style.Style({
		image: new ol.style.Icon(({
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Antu_folder-camera.svg/512px-Antu_folder-camera.svg.png',
			scale: 0.05
		}))
	}));
	console.log(camProperties);
	camMarker.setProperties(camProperties);
	vectorSource.addFeature(camMarker);
};

const formatTrafficCameras = (trafficCams) =>{
	const allCameras = trafficCams.getElementsByTagNameNS('https://infoconnect.highwayinfo.govt.nz/schemas/camera2', 'camera'); //nationwide cameras
	
	for(let i = 0; i < allCameras.length; i++){ //cameraRegion to filter Auckland cameras only
		let cameraRegion = allCameras[i].getElementsByTagName('tns:region')[0].innerHTML; 
		
		if(cameraRegion === 'Auckland'){ 
			let cameraId = allCameras[i].getElementsByTagName('tns:id')[0].innerHTML;
			let cameraName = allCameras[i].getElementsByTagName('tns:name')[allCameras[i].getElementsByTagName('tns:name').length - 1].innerHTML;
			let cameraDesc = allCameras[i].getElementsByTagName('tns:description')[0].innerHTML;
			let cameraLat = allCameras[i].getElementsByTagName('tns:lat')[0].innerHTML;
			let cameraLon = allCameras[i].getElementsByTagName('tns:lon')[0].innerHTML;
			let cameraImgUrl = allCameras[i].getElementsByTagName('tns:imageUrl')[0].innerHTML;
			let cameraThumbUrl = allCameras[i].getElementsByTagName('tns:thumbUrl')[0].innerHTML; //use thumb as an <a href> to larger image?
			
			//fetch congestion info if applicable
			let cameraCongestions = allCameras[i].getElementsByTagName('tns:congestionLocations');
			if(cameraCongestions.length > 0){
				let congestionLocs = [];
				for(let c = 0; c < cameraCongestions.length; c++){ //create object to store info; some cameras have congestion info for both ways
					congestionInfo = {
						name: cameraCongestions[c].getElementsByTagName('tns:name')[0].innerHTML,
						congestion: cameraCongestions[c].getElementsByTagName('tns:congestion')[0].innerHTML,
						direction: cameraCongestions[c].getElementsByTagName('tns:direction')[0].innerHTML,
						startLat: cameraCongestions[c].getElementsByTagName('tns:startLat')[0].innerHTML,
						startLon: cameraCongestions[c].getElementsByTagName('tns:startLon')[0].innerHTML,
						endLat: cameraCongestions[c].getElementsByTagName('tns:endLat')[0].innerHTML,
						endLon: cameraCongestions[c].getElementsByTagName('tns:endLon')[0].innerHTML //use lat lon values to draw colour-coded lines on map
					}; 
					congestionLocs.push(congestionInfo);
				}
				if(congestionLocs.length === 1){
					addCamMarker(cameraName, cameraDesc, cameraLat, cameraLon, cameraImgUrl, cameraThumbUrl, congestionLocs[0].name, congestionLocs[0].congestion, congestionLocs[0].direction, congestionLocs[0].startLat, congestionLocs[0].startLon, congestionLocs[0].endLat, congestionLocs[0].endLon);
					console.log(`Camera[ID:${cameraId}]: ${cameraName}, ${cameraRegion}, Lat:${cameraLat} Lon:${cameraLon}, imgUrl:${cameraImgUrl}`);
					console.log(`Camera[ID:${cameraId}]: ${congestionLocs[0].name}, Status:${congestionLocs[0].direction} - ${congestionLocs[0].congestion}, Start Lat/Lon:${congestionLocs[0].startLat},${congestionLocs[0].startLon} End Lat/Lon:${congestionLocs[0].endLat},${congestionLocs[0].endLon}`);
				}
				else if(congestionLocs.length === 2){
					addCamMarker(cameraName, cameraDesc, cameraLat, cameraLon, cameraImgUrl, cameraThumbUrl, congestionLocs[0].name, congestionLocs[0].congestion, congestionLocs[0].direction, congestionLocs[0].startLat, congestionLocs[0].startLon, congestionLocs[0].endLat, congestionLocs[0].endLon,
						congestionLocs[1].name, congestionLocs[1].congestion, congestionLocs[1].direction, congestionLocs[1].startLat, congestionLocs[1].startLon, congestionLocs[1].endLat, congestionLocs[1].endLon);
					console.log(`Camera[ID:${cameraId}]: ${cameraName}, ${cameraRegion}, Lat:${cameraLat} Lon:${cameraLon}, imgUrl:${cameraImgUrl}`);
					console.log(`Camera[ID:${cameraId}]: ${congestionLocs[0].name}, Status:${congestionLocs[0].direction} - ${congestionLocs[0].congestion}, Start Lat/Lon:${congestionLocs[0].startLat},${congestionLocs[0].startLon} End Lat/Lon:${congestionLocs[0].endLat},${congestionLocs[0].endLon}`);
					console.log(`Camera[ID:${cameraId}]: ${congestionLocs[1].name}, Status:${congestionLocs[1].direction} - ${congestionLocs[1].congestion}, Start Lat/Lon:${congestionLocs[1].startLat},${congestionLocs[1].startLon} End Lat/Lon:${congestionLocs[1].endLat},${congestionLocs[1].endLon}`);
				}
			}
			else{
				addCamMarker(cameraName, cameraDesc, cameraLat, cameraLon, cameraImgUrl, cameraThumbUrl);
				console.log(`Camera[ID:${cameraId}]: ${cameraName}, ${cameraRegion}, Lat:${cameraLat} Long:${cameraLon}, imgUrl:${cameraImgUrl}`);
			}
		};
	};
	document.getElementById('mapContainer').style.opacity = 1;
	document.getElementById('mapLoader').style.display = 'none';
};

const formatTrafficConditions = (trafficConds) =>{
	const allConditions = trafficConds.getElementsByTagNameNS('https://infoconnect.highwayinfo.govt.nz/schemas/traffic2', 'locations');
	const lastUpdated = trafficConds.getElementsByTagNameNS('https://infoconnect.highwayinfo.govt.nz/schemas/traffic2', 'lastUpdated');
	console.log(lastUpdated[0].innerHTML);

	
	for(let i = 0; i < allConditions.length; i++){
		let conditionId = allConditions[i].childNodes[0].innerHTML;
		let conditionName = allConditions[i].getElementsByTagName('tns:name')[0].innerHTML;
		let conditionStatus = allConditions[i].getElementsByTagName('tns:congestion')[0].innerHTML;
		let startLat = allConditions[i].getElementsByTagName('tns:startLat')[0].innerHTML;
		let startLon = allConditions[i].getElementsByTagName('tns:startLon')[0].innerHTML;
		let endLat = allConditions[i].getElementsByTagName('tns:endLat')[0].innerHTML;
		let endLon = allConditions[i].getElementsByTagName('tns:endLon')[0].innerHTML;
		
		console.log(`${conditionStatus}, ${startLat} ${startLon}, ${endLat}, ${endLon}`);
		plotCongestionLines(conditionStatus, startLat, startLon, endLat, endLon);
	};
};

//HTTP GET Methods
const getTrafficCameras = () =>{
	const xhr = new XMLHttpRequest();
	const url = 'https://infoconnect1.highwayinfo.govt.nz/ic/jbi/TrafficCameras2/REST/FeedService/';
	xhr.open("GET", proxy + url, true);
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			formatTrafficCameras(xhr.responseXML);
		}
	};
	xhr.setRequestHeader('Username', apiUsername);
	xhr.setRequestHeader('Password', apiPassword);
	xhr.send();	
};

const getTrafficConditions = () =>{
	const xhr = new XMLHttpRequest();
	const url = 'https://infoconnect1.highwayinfo.govt.nz/ic/jbi/TrafficConditions2/REST/FeedService/';
	xhr.open("GET", proxy + url, true);
	xhr.onreadystatechange = () =>{
		if(xhr.readyState === XMLHttpRequest.DONE){
			formatTrafficConditions(xhr.responseXML);
		}
	};
	xhr.setRequestHeader('Username', apiUsername);
	xhr.setRequestHeader('Password', apiPassword);
	xhr.send();	
};

const getFunctions = () =>{ //clear the map and call the http xhr requests
	document.getElementById('mapContainer').style.opacity = 0.5;//change opacity of the map and show the loading animation
	document.getElementById('mapLoader').style.display = 'block';
	cameraPopupOverlay.setPosition(undefined);
	document.getElementById('cameraPopup-closer').blur();
	vectorSource.clear();
	greenCongestionVectorSource.clear();
	yellowCongestionVectorSource.clear();
	redCongestionVectorSource.clear();
	
	getTrafficCameras();
	getTrafficConditions();
};

const showUserPosition = (position) =>{
	console.log('User latitude ' + position.coords.latitude);
	console.log('User longitude ' + position.coords.longitude);
	plotPositionMarker(position.coords.latitude, position.coords.longitude);
	document.getElementById('userLocationButton').disabled = false;
};

const toggleUserLocation = () =>{
	positionVectorSource.clear();
	if(userTracking){ //turn off gps tracking
		navigator.geolocation.clearWatch(trackingId);
		userTracking = !userTracking;
		document.getElementById('userLocationButton').innerHTML = 'Start Tracking My Location';
	}
	else if(!userTracking){
		let geoOptions = {
			enableHighAccuracy: true, 
			timeout: 2500,
			maximumAge: 0
		};
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(showUserPosition, userLocationError, geoOptions);
			userTracking = !userTracking;
			document.getElementById('userLocationButton').innerHTML = 'Stop Tracking My Location';
		}
		else{
			console.log('Geolocation not supported.');
			document.getElementById('userLocationButton').disabled = false;
		}			
	}
};
const userLocationError = (error) =>{
	console.warn(`${error.code} ${error.message}`);
};

const toggleAutoUpdate = () =>{
	let updateTime = 90; //time reset to 90 seconds each time button is pressed

	if(autoUpdate){ //turn off auto update if auto update is on
		autoUpdate = false;
		clearInterval(updateInterval);
		document.getElementById('autoUpdateButton').innerHTML = `Turn Auto Update On (${updateTime}s)`;
	}
	else if(!autoUpdate){
		autoUpdate = true;
		updateInterval = setInterval(updateTimer, 1000);
		function updateTimer(){
			if(updateTime === 0){
				updateTime = 90;
				document.getElementById('autoUpdateButton').innerHTML = `Turn Auto Update Off (${updateTime}s)`;				
				getFunctions();
			}
			else{
				updateTime -= 1;
				document.getElementById('autoUpdateButton').innerHTML = `Turn Auto Update Off (${updateTime}s)`;
			}
		};
	}
};

const toggleSideBox = () =>{
	let sideBoxCSS = window.getComputedStyle(document.getElementById('sideBox'));
	if(sideBoxCSS.getPropertyValue('display') === 'block'){
		document.getElementById('sideBox').style.display = 'none';
		document.getElementById('sideBox_toggle').style.marginLeft = '1px';
		document.getElementById('sideBox_toggle').innerHTML = '&#9654;';
	}
	else if(sideBoxCSS.getPropertyValue('display') === 'none'){
		document.getElementById('sideBox').style.display = 'block';
		document.getElementById('sideBox_toggle').style.marginLeft = '351px';
		document.getElementById('sideBox_toggle').innerHTML = '&#9664;';
	}
};

const openAbout = () =>{
	document.getElementById('aboutBox').style.display = 'block';
	document.getElementById('mapContainer').style.opacity = 0.5;
};
const closeAbout = () =>{
	document.getElementById('aboutBox').style.display = 'none';
	document.getElementById('mapContainer').style.opacity = 1;
};

'use strict';

// global data
var lotCoordinate = [],
	lotData = [],
	mapCenter = [0,0];

var treeCoordinate = [],
	treeData = [],
	mapCenter = [0,0],
	treePerPage = 20;

// polygon render data
var lastLot = [],
	lastTree = [],
	activeLot = [],
	activeTree = [],
	lotPerPage = 20;

// map variables
var polygonBreakPoint = 17,
	initialZoom = 7,
	markerBreakPoint = 22;

var heatmapSetting = {
	radius: 10,
	blur: 10,
	maxZoom:11,
	gradient:{
		0.4: 'lime',
		0.65: 'green',
		1: 'darkgreen'
	}
}

var baseURL = 'http://api.trees.id/tree/';
var archiveParameter = ['program_id', 'project_id', 'block_id', 'relawan_id', 'verifikator_id', 'petani_id', 'status', 'nohp'];

// polygon vars
var lotPolygonColor = 'lime',
	lotPolygonWeight = 2,
	lotPolygonFillColor = 'darkgreen',
	lotPolygonFillOpacity = 0.5;

// leaflet variables
var treeIcon = L.icon({
	iconUrl: 'http://api.trees.id/tree.png',
	iconSize:     [16, 16], // size of the icon
	iconAnchor:   [0, 8], // point of the icon which will correspond to marker's location
	popupAnchor:  [8, -8] // point from which the popup should open relative to the iconAnchor
});

// leaflet base map
var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
	maxZoom: 27,
	maxNativeZoom:17
});

// http://stackoverflow.com/questions/6132796/how-to-make-a-jsonp-request-from-javascript-without-jquery
var _jsonp = (function(){
	var that = {};

	that.send = function(src, options) {
		var callback_name = options.callbackName || 'callback',
			on_success = options.onSuccess || function(){},
			on_timeout = options.onTimeout || function(){},
			timeout = options.timeout || 20; // sec

		var timeout_trigger = window.setTimeout(function(){
			window[callback_name] = function(){};
			on_timeout();
		}, timeout * 1000);

		window[callback_name] = function(data){
			window.clearTimeout(timeout_trigger);
			on_success(data);
		}

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = src;

		document.getElementsByTagName('head')[0].appendChild(script);
	}

	return that;
})();

//Returns true if it is a DOM element    
function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
);
}

function archiveMap(elementID,heatmapData,polygonData,page){

	// TODO : set to receive element ID or object
	if (typeof elementID === 'string') {
		
	} else {

	}

	var mapObject = document.getElementById(elementID);
	var APIurl = 'http://api.trees.id/?object=lot&per_page='+lotPerPage+'&callback=callback';
	var lotPage = mapObject.getAttribute('data-lot-page');
	
	if (!heatmapData) {
		var heatmapData = [];
		var polygonData = [];
	}

	if (!page) {
		var page = 1;
	}

	APIurl = APIurl + '&page=' + page;
	archiveParameter.forEach(function(item, i){
		var parameterValue = mapObject.getAttribute('data-'+item);
		if (parameterValue) {
			APIurl = APIurl + '&' + item + '=' + parameterValue;
		}
	});

	if (page == 1) {
		mapObject.insertAdjacentHTML('beforebegin', '<div id="trees-id-map-progress"><div id="trees-id-map-progress-bar" style="width:0%;"></div>');
	}

	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){
			APIresult.data.forEach(function(value,index,array){
				if (value.kordinat_center) {
					var lat = parseFloat(value.kordinat_center.lat);
					var lng = parseFloat(value.kordinat_center.lng);
					heatmapData.push([lat, lng, value.id_lot]);
					mapCenter[0] += lat;
					mapCenter[1] += lng;
				}
				polygonData[value.id_lot] = value;
			})
			var totalPage = Math.ceil(APIresult.totalCount / lotPerPage);
			var progressBar = document.getElementById('trees-id-map-progress-bar');
			var percentage = heatmapData.length / APIresult.totalCount * 100;
			progressBar.style.width = percentage+'%';

			console.log(percentage.toFixed(2) + ' % ');

			if (page == 1) {
				var mapCentered = _.map(mapCenter, function(num){ return num / heatmapData.length ; });
				window.map = new L.Map('trees-id-map', {center: mapCentered, zoom: initialZoom, layers: [Esri_WorldImagery]});
				window.map.scrollWheelZoom.disable();
				window.heat = L.heatLayer(heatmapData, heatmapSetting).addTo(window.map);
			} else {
				window.heat.setLatLngs(heatmapData);
			}

			if (totalPage > 1 && page < totalPage) {
				page ++;
				archiveMap(elementID, heatmapData, polygonData, page);
			} else {
				progressBar.style.height = 0;
				window.map.fitBounds(heatmapData);
			}
			
			window.map.on('zoomend dragend', function(e) {
				var zoom_level = window.map.getZoom();
				if (zoom_level >= polygonBreakPoint){
					var
						bounds = window.map.getBounds(),
						west = bounds.getWest(),
						south = bounds.getSouth(),
						east = bounds.getEast(),
						north = bounds.getNorth()
					;

					var currentLot = _.filter(heatmapData, function(num){ return num[1] > (west - 0.005 ) && num[1] < (east + 0.005  ) && num[0] < (north + 0.005 ) && num[0] > (south - 0.005 ); });

					if (currentLot.length > 0) {

						currentLot.forEach(function(value){
							if (lastLot.indexOf(value) === -1) {
								lastLot.push(value);
								
								var currentLotPage = lotPage.replace('[lot]', polygonData[value[2]].id_lot);
								var lotDetail = '<a class="popup-link text-center" href="'+ currentLotPage +'"><img id="popup-image" class="popup-image" src="'+ polygonData[value[2]].img_lot +'" width="200" ></div><br> <span>'+ polygonData[value[2]].nama_lot+'</span></a>';
								activeLot[value[2]] = L.polygon(
									polygonData[value[2]].kordinat,{
										color: lotPolygonColor,
										weight: lotPolygonWeight,
										fillColor: lotPolygonFillColor,
										fillOpacity: lotPolygonFillOpacity,
									}).bindPopup(lotDetail);
								activeLot[value[2]].addTo(window.map);
							};
						})
					}

					var removeLot = _.difference(lastLot, currentLot);
					
					removeLot.forEach(function(value){
						var index = lastLot.indexOf(value);
						lastLot.splice(index, 1);
						window.map.removeLayer(activeLot[value[2]]);
					})

					window.map.removeLayer(window.heat);

				} else{
					window.heat.addTo(window.map);
					activeLot.forEach(function(value){
						window.map.removeLayer(value);
					});
					lastLot = [];
				}
			});
		},
		 onTimeout: function(){
			console.log('timeout!');
		}
	});
}

function archiveMapTree(APIurl,heatmapData,polygonData,page,treePage){

	//console.log(page);
	var mapObject = document.getElementById('trees-id-map');
	if (page == 1) {
		mapObject.insertAdjacentHTML('beforebegin', '<div id="trees-id-map-progress"><div id="trees-id-map-progress-bar" style="width:0%;"></div>');
	}

	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){

			APIresult.data.forEach(function(value,index,array){
				if (value.tree_kordinat) {
					var lat = parseFloat(value.tree_kordinat[0]);
					var lng = parseFloat(value.tree_kordinat[1]);
					heatmapData.push([lat, lng, value.id_tree]);
					mapCenter[0] += lat;
					mapCenter[1] += lng;
				}
				polygonData[value.id_tree] = value;
				//console.log('tree : '+ value.tree_kordinat[0]);
			})
			//console.log(APIresult.totalCount);

			var percentage = heatmapData.length / APIresult.totalCount * 100;
			var totalPage = Math.ceil(APIresult.totalCount / treePerPage);

			var progressBar = document.getElementById('trees-id-map-progress-bar');
			progressBar.style.width = percentage+'%';

			console.log(percentage.toFixed(2) + ' percent ');

			if (page < 2) {
				var mapCentered = _.map(mapCenter, function(num){ return num / heatmapData.length ; });
				window.map = new L.Map('trees-id-map', {center: mapCentered, zoom: polygonBreakPoint, layers: [Esri_WorldImagery]});
				window.heat = L.heatLayer(heatmapData, heatmapSetting).addTo(window.map);
			} else {
				// var mapCentered = _.map(mapCenter, function(num){ return num / heatmapData.length ; });
				// window.map.panTo(mapCentered);
				// var heat = L.heatLayer(heatmapData, heatmapSetting).addTo(window.map);
				window.heat.setLatLngs(heatmapData);
			}


			

			if (totalPage > 1 && page < totalPage) {
				page ++;

				if (APIurl.indexOf("&page=") === -1) {
					APIurl = APIurl + '&page=' + page;
				} else {
					APIurl = APIurl.replace(/&page=?\d+$/g, '&page='+page);
				}

				archiveMapTree(APIurl, heatmapData, polygonData, page, treePage);

			} else {
				
				window.map.on('zoomend dragend', function(e) {
					var zoom_level = window.map.getZoom();
					if (zoom_level >= 20){
						var
							bounds = window.map.getBounds(),
							west = bounds.getWest(),
							south = bounds.getSouth(),
							east = bounds.getEast(),
							north = bounds.getNorth()
						;


						var currentTree = _.filter(heatmapData, function(num){ return num[1] > (west - 0.00005 ) && num[1] < (east + 0.00005) && num[0] < (north + 0.00005) && num[0] > (south - 0.00005); });

						if (currentTree.length > 0) {
							currentTree.forEach(function(value, index){
								if (lastTree.indexOf(value) === -1) {
									lastTree.push(value);

									var currentTreePage = treePage.replace('[lot]',treeData[value[2]].tree_lot_id).replace('[offset]',treeData[value[2]].tree_offset);
									var treeDetail = '<a href="'+ currentTreePage +'"><img src="' + treeData[value[2]].img_tree +'" width="200"></a>';
									activeTree[value[2]] = L.marker([value[0], value[1]], {icon: treeIcon}).addTo(window.map).bindPopup(treeDetail);
									
									//console.log(treeData[value[2]].id_tree+'|'+value[0]+'|'+value[1]);
								};
							})
						}
						//console.log(activeTree);

						var removeTree = _.difference(lastTree, currentTree);
						removeTree.forEach(function(value){
							var index = lastTree.indexOf(value);
							lastTree.splice(index, 1);
							window.map.removeLayer(activeTree[value[2]]);
						})

						window.map.removeLayer(window.heat);

					} else{

						window.heat.addTo(window.map);
						lastTree.forEach(function(value){
							window.map.removeLayer(activeTree[value[2]]);
						});

						lastTree = [];
					}
				});
				
			}
		}
	});
}

function singleMap(elementID){

	var mapObject = document.getElementById(elementID);
	var treePage = mapObject.getAttribute('data-tree-page');
	var lotID = mapObject.getAttribute('data-id');
	var APIurl = 'http://api.trees.id/?object=lot&callback=callback&content=map&id=' + lotID;

	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){
			if (APIresult.data !== undefined) {

				window.map = new L.Map('trees-id-map', {center: APIresult.mapCenter , zoom: polygonBreakPoint, layers: [Esri_WorldImagery]});
				window.map.scrollWheelZoom.disable();

				var treeOffset = mapObject.getAttribute('data-offset');
				if (treeOffset) {
					var treeArray = treeOffset.split(',');
					var coordinateArray = []
					treeArray.forEach(function(value, index){

						var newPoint = [ APIresult.data[value][0], APIresult.data[value][1]];
						coordinateArray.push(newPoint);

						var currentTreePage = treePage.replace('[lot]',lotID).replace('[offset]',value);
						var treeDetail = '<a href="'+ currentTreePage +'"><img src="' +  baseURL + APIresult.id_relawan  +'/'+ lotID +'/'+ APIresult.data[value][2] +'" width="200"></a>';
						activeTree[parseInt(value)] = L.marker([ APIresult.data[value][0], APIresult.data[value][1]], {icon: treeIcon}).addTo(window.map).bindPopup(treeDetail);
					});
					window.map.fitBounds(coordinateArray);
					// activeTree.slice(-1)[0].openPopup();

				} else {
					
					window.heat = L.heatLayer(APIresult.data, heatmapSetting).addTo(window.map);
					window.map.fitBounds(APIresult.data);
					window.map.on('zoomend dragend', function(e) {
						var zoom_level = window.map.getZoom();

						if (zoom_level >= markerBreakPoint){
							var
								bounds = window.map.getBounds(),
								west = bounds.getWest(),
								south = bounds.getSouth(),
								east = bounds.getEast(),
								north = bounds.getNorth()
							;

							var currentTree = _.filter(APIresult.data, function(num){ return num[1] > (west - 0.00005 ) && num[1] < (east + 0.00005) && num[0] < (north + 0.00005) && num[0] > (south - 0.00005); });

							if (currentTree.length > 0) {
								currentTree.forEach(function(value, index){
									if (lastTree.indexOf(value) === -1) {
										lastTree.push(value);

										var currentTreePage = treePage.replace('[lot]',lotID).replace('[offset]',parseInt(value[2]));
										var treeDetail = '<a href="'+ currentTreePage +'"><img src="' +  baseURL + APIresult.id_relawan  +'/'+ lotID +'/'+ value[2] +'" width="200"></a>';
										activeTree[value[2]] = L.marker([value[0], value[1]], {icon: treeIcon}).addTo(window.map).bindPopup(treeDetail);
									};
								})
							}

							var removeTree = _.difference(lastTree, currentTree);
							removeTree.forEach(function(value){
								var index = lastTree.indexOf(value);
								lastTree.splice(index, 1);
								window.map.removeLayer(activeTree[value[2]]);
							})

							window.map.removeLayer(window.heat);

						} else{

							window.heat.addTo(window.map);
							lastTree.forEach(function(value){
								window.map.removeLayer(activeTree[value[2]]);
							});

							lastTree = [];
						}
					});

				}


			} else {
				var polygonData = [];
				APIresult.polygon.forEach(function(item, i){
					var newPoint = L.latLng(item[0], item[1]);
					polygonData.push(newPoint);
				});

				window.map = new L.Map('trees-id-map', {center: APIresult.center , zoom: polygonBreakPoint, layers: [Esri_WorldImagery]});
				window.map.scrollWheelZoom.disable();
				window.lotPolygon = L.polygon(
					polygonData,{
						color: lotPolygonColor,
						weight: lotPolygonWeight,
						fillColor: lotPolygonFillColor,
						fillOpacity: lotPolygonFillOpacity,
					});
				window.lotPolygon.addTo(window.map);
			}
		},
		 onTimeout: function(){
			console.log('timeout!');
		}
	});
}

function treeMap(elementID){

	var mapObject = document.getElementById(elementID);
	var treeID = mapObject.getAttribute('data-id');

	if (treeID != undefined) {
		var arrayLength = treeID.split(',').length;
		var APIurl = 'http://api.trees.id/?object=tree&callback=callback&single_id=' + treeID +'&per_page='+arrayLength;
	} else {
		var lotID = mapObject.getAttribute('data-lot_id');
		var offset = mapObject.getAttribute('data-offset');
		var arrayLength = offset.split(',').length;
		var APIurl = 'http://api.trees.id/?object=tree&callback=callback&lot_id=' + lotID +'&tree_offset='+offset +'&per_page='+arrayLength;
	}

	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){

			window.map = new L.Map('trees-id-map', {center: APIresult.data[0].tree_kordinat , zoom: markerBreakPoint, layers: [Esri_WorldImagery]});
			window.map.scrollWheelZoom.disable();
			APIresult.data.forEach(function(value,index){
				console.log(value, index);
				var treeDetail = '<img src="' +  value.img_tree +'" width="200">';
				var treeMarker = L.marker(value.tree_kordinat, {icon: treeIcon}).addTo(window.map).bindPopup(treeDetail);
			});

		},
		 onTimeout: function(){
			console.log('timeout!');
		},
	});
}
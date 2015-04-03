'use strict';

// global data
var lotCoordinate = [],
	lotData = [],
	mapCenter = [0,0];	

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
var archiveParameter = ['program_id', 'project_id', 'block_id', 'relawan_id', 'verifikator_id', 'petani_id', 'status'];

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


// function imgToDataURL(url, callback, outputFormat, quality) {
// 	var canvas = document.createElement('CANVAS'),
// 		ctx = canvas.getContext('2d'),
// 		img = new Image();
// 	img.crossOrigin = 'Anonymous';
// 	img.onload = function() {
// 		var dataURL;
// 		canvas.height = img.height;
// 		canvas.width = img.width;
// 		try {
// 			ctx.drawImage(img, 0, 0);
// 			dataURL = canvas.toDataURL(outputFormat, quality);
// 			callback(null, dataURL);
// 		} catch (e) {
// 			callback(e, null);
// 		}
// 		canvas = img = null;
// 	};
// 	img.onerror = function() {
// 		callback(new Error('Could not load image'), null);
// 	};
// 	img.src = url;
// }

function archiveMap(elementID,heatmapData,polygonData,page){

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
			// TODO : set up visual progress bar

			var percentage = heatmapData.length / APIresult.totalCount * 100;
			console.log(percentage.toFixed(2) + ' percent ');

			if (page == 1) {
				console.log('initial load');
				var mapCentered = _.map(mapCenter, function(num){ return num / heatmapData.length ; });
				window.map = new L.Map('trees-id-map', {center: mapCentered, zoom: initialZoom, layers: [Esri_WorldImagery]});
				window.heat = L.heatLayer(heatmapData, heatmapSetting).addTo(window.map);
			} else {
				window.heat.setLatLngs(heatmapData);
			}

			if (page == totalPage) {
				// TODO : pan map to center and set to max zoom to cover all lot
				console.log('zoom and pan');
			}

			if (totalPage > 1 && page < totalPage) {
				page ++;
				archiveMap(elementID, heatmapData, polygonData, page);
			} else {

				window.map.fitBounds(heatmapData);
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
									
									var currentLotPage = lotPage.replace('[lot]', lotData[value[2]].id_lot);
									var lotDetail = '<a class="popup-link text-center" href="'+ currentLotPage +'"><img id="popup-image" class="popup-image" src="'+ lotData[value[2]].img_lot +'" width="200" ></div><br> <span>'+ lotData[value[2]].nama_lot+'</span></a>';
									activeLot[value[2]] = L.polygon(
										lotData[value[2]].kordinat,{
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
			}
		}
	});
}

function singleMap(lotID,treePage){

	var APIurl = 'http://api.trees.id/?object=lot&callback=callback&content=map&id=' + lotID;

	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){
			if (APIresult.data !== undefined) {
				window.map = new L.Map('trees-id-map', {center: APIresult.mapCenter , zoom: polygonBreakPoint, layers: [Esri_WorldImagery]});
				window.heat = L.heatLayer(APIresult.data, heatmapSetting).addTo(window.map);

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

			} else {
				var polygonData = [];

				APIresult.polygon.forEach(function(item, i){
					var newPoint = L.latLng(item[0], item[1]);
					polygonData.push(newPoint);
				});

				window.map = new L.Map('trees-id-map', {center: APIresult.center , zoom: polygonBreakPoint, layers: [Esri_WorldImagery]});
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

function treeMap(treeID){
	console.log('Rendering Single Tree ', treeID);

	var APIurl = 'http://api.trees.id/?object=tree&callback=callback&single_id=' + treeID;

	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){
			console.log(APIresult);
			window.map = new L.Map('trees-id-map', {center: APIresult.data[0].tree_kordinat , zoom: markerBreakPoint, layers: [Esri_WorldImagery]});
			var treeDetail = '<img src="' +  APIresult.data[0].img_tree +'" width="200">';
			var treeMarker = L.marker(APIresult.data[0].tree_kordinat, {icon: treeIcon}).addTo(window.map).bindPopup(treeDetail).openPopup();
		},
		 onTimeout: function(){
			console.log('timeout!');
		},
	});

	// imgToDataURL(treeImage, function(err, base64Img){
	// 	console.log('IMAGE:',base64Img);
	// })
}

function treeMapOffset(lotID, offset){

	var APIurl = 'http://api.trees.id/?object=tree&callback=callback&lot_id=' + lotID +'&tree_offset='+offset;
	_jsonp.send(APIurl, {
		onSuccess: function(APIresult){
			window.map = new L.Map('trees-id-map', {center: APIresult.data[0].tree_kordinat , zoom: markerBreakPoint, layers: [Esri_WorldImagery], scrollWheelZoom: false});
			var treeDetail = '<img src="' +  APIresult.data[0].img_tree +'" width="200">';
			var treeMarker = L.marker(APIresult.data[0].tree_kordinat, {icon: treeIcon}).addTo(window.map).bindPopup(treeDetail);
		},
		 onTimeout: function(){
			console.log('timeout!');
		},
	});
}
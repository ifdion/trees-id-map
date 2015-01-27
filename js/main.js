'use strict';

jQuery(document).ready(function($) {

	// setup API parameter
	var APIparam = {
		url : 'http://v3.twitgreen.com/public-api/',
		type: 'GET',
		dataType: 'jsonp',
		data:{
			object:'lot',
			per_page : 20
		}
	}

	// global data
	var lotCoordinate = [],
		lotData = [],
		mapCenter = [0,0];

	// polygon render data
	var lastLot = [],
		activePolygon = [];
	
	// map variables
	var polygonBreakPoint = 17,
		initialZoom = 7;
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
	var lotPolygonColor = 'lime',
		lotPolygonWeight = 2,
		lotPolygonFillColor = 'darkgreen',
		lotPolygonFillOpacity = 0.5;

	var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
		maxZoom: 27,
		maxNativeZoom:17
	});

	var treeIcon = L.icon({
		iconUrl: 'http://twitgreen.com/tree.png',
		iconSize:     [16, 16], // size of the icon
		iconAnchor:   [0, 8], // point of the icon which will correspond to marker's location
		popupAnchor:  [8, -8] // point from which the popup should open relative to the iconAnchor
	});


	// set API parameter based on markup
	var target = $('#twitgreen-map');
	if (target.data('project')) {
		APIparam.data.project_id = target.data('project');
	};
	if (target.data('program')) {
		APIparam.data.program_id = target.data('program');
	};
	if (target.data('block')) {
		APIparam.data.block_id = target.data('block');
	};
	if (target.data('relawan')) {
		APIparam.data.relawan_id = target.data('relawan');
	};
	if (target.data('verifikator')) {
		APIparam.data.verifikator_id = target.data('verifikator');
	};
	if (target.data('petani')) {
		APIparam.data.petani_id = target.data('petani');
	};
	if (target.data('status')) {
		APIparam.data.status = target.data('status');
	};

	function dynamicMap(APIparam,heatmapData,polygonData,page){

		APIparam.data.page = page;

		$.ajax(APIparam)
		.done(function(ev) {
			ev.data.forEach(function(value,index,array){
				if (value.kordinat_center) {
					var lat = parseFloat(value.kordinat_center.lat);
					var lng = parseFloat(value.kordinat_center.lng);
					heatmapData.push([lat, lng, value.id_lot]);
					mapCenter[0] += lat;
					mapCenter[1] += lng;
				}
				polygonData[value.id_lot] = value;
			})

			var percentage = heatmapData.length / ev.totalCount * 100;
			target.find('.percentage').text(percentage.toFixed(2) + ' %');

			if (ev.totalPage > 1 && page < ev.totalPage) {
				page ++;
				dynamicMap(APIparam, heatmapData, polygonData, page);
			} else {
				var mapCentered = _.map(mapCenter, function(num){ return num / heatmapData.length ; });
				var map = new L.Map("twitgreen-map", {center: mapCentered, zoom: initialZoom, layers: [Esri_WorldImagery]});
				var heat = L.heatLayer(heatmapData, heatmapSetting).addTo(map);

				map.on('zoomend dragend', function(e) {
					var zoom_level = map.getZoom();
					if (zoom_level >= polygonBreakPoint){
						var
							bounds = map.getBounds(),
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
									var lotDetail = 'test content';
									var lotDetail = '<a class="popup-link text-center" href="#"><img id="popup-image" class="popup-image" src="'+ lotData[value[2]].img_lot +'"></div><br> <span>'+ lotData[value[2]].nama_lot+'</span></a>';
									console.log(lotData[value[2]]);
									activePolygon[value[2]] = L.polygon(
										lotData[value[2]].kordinat,{
											color: lotPolygonColor,
											weight: lotPolygonWeight,
											fillColor: lotPolygonFillColor,
											fillOpacity: lotPolygonFillOpacity,
										}).bindPopup(lotDetail);
									activePolygon[value[2]].addTo(map);
								};
							})
						}

						var removeLot = _.difference(lastLot, currentLot);
						
						removeLot.forEach(function(value){
							var index = lastLot.indexOf(value);
							lastLot.splice(index, 1);
							map.removeLayer(activePolygon[value[2]]);
						})

						map.removeLayer(heat);

					} else{
						heat.addTo(map);
						activePolygon.forEach(function(value){
							map.removeLayer(value);
						});
						lastLot = [];
					}
				});
			}	
		})
	}

	dynamicMap(APIparam, lotCoordinate, lotData, 1);

});












































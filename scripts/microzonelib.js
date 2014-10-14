/*
Configuración
=============

La configuración de *microzonelib* se hace a través de un objeto con los
siguiente campos:

parameter_source
    Determina el origen de la tabla de parámetros utilizada por esta
    aplicación. Los valores pueden ser:

    * javascript: la tabla está definida en el archivo `spectrum_parameters.js`
    * json: la tabla es un json. Se baja una sola vez al cargar la
    * aplicación. [TODO] aprovechar el almacenamiento de HTML5 en un futuro.
    * wapi: la tabla está en una base de datos accesible mediante una *API
      WEB*. Si se elige este valor, entonces hay que definir el campo
      *parameters_service*.

geoserver_url 
    Una cadena de texto que representa la *URL* del servidor *WFS/WMS*
    compatible que tiene las capas que requiere la aplicación. Como ejemplo:
    'http://localhost:8080/geoserver/Microzonas/wms'. [TODO] cambiar el nombre
    de este campo por el de wms_url

parameters_service
    Si el campo *parameter_source* es *wapi*, entonces este representa la *URL*
    del servicio que permite el acceso a la tabla de parámetros a través de una
    *API WEB*. Como ejemplo:
    'http://localhost:3000/microzones/get-by-label.json'

microzone_layers
    Tal vez la variable más complicada ([TODO] cambiar los subarreglos que
    utiliza por objetos con campos). Se trata de un arreglo de tripletas que
    identifican las capas que buscamos en el origen de las capas (definido por
    ahora por *geoserver_url*). Las tripletas tienen la siguiente estructura:
    [<Nombre en la Interfaz de Usuario>, <Identificación en el origen>, <Campo
    de interés>]. Como ejemplo::
    
    microzone_layers : [
        ['Laderas', 'Microzonas:Microzonas_Laderas', 'Amenaza'],
        ['Sedimentos', 'Microzonas:Microzonas_Sedimentos', 'microzona'],
        ['Amenaza General', 'Microzonas:Microzonas_Amenaza_General', 'Microzonas']
    ]

microzone_group (Opcional)

    Usted puede definir un "grupo de capas" en el servidor SIG. Es
    algo opcional pero permite un mejor rendimiento a la aplicación ya
    que reduce el número de poticiones WEB al servidor.

    Si definió un "grupo de capas", indique su nombre en este
    parámetro de configuración para que la aplicación solicite los
    recursos sólo a ese "grupo de capas" y no a todas las capas.  Si
    no definió un "grupo de capas", entonces no coloque este parámetro
    en la documentación, ni si quiera con una cadena vacía como valor.

    Tiene la misma estructura que las tuplas de 'microzone_layers',
    pero sin el último componente.

    Cabe mencionar que una mejor optimización es trabajar con una sola
    capa. Y si se tienen varias capas, crear una capa que fusione
    todas las capas y que de alguna forma tenga en un campo o atributo
    el "Campo de interés". Al garantizar una sola capa, *microzn*
    utiliza esto para mejorar el tiempo de respuesta cuando se
    consulta el servidor WMS al hacer click sobre una
    microzona.

    Claro, esto solo no es una justificación para realizar dicho
    trabajo, ya que la mejora en tiempo en mínima en comparación con
    los tiempos de descarga de las imágenes (el verdadero asunto
    importante a atacar para mejorar el rendimiento de la aplicación).

div

    Representa el nombre del atributo "id" del elemento *"div"* en la página
    *HTML* que incluirá la aplicación.

Configuración de ejemplo
------------------------

var config = {
    geoserver_url : 'http://localhost:8080/geoserver/Microzonas/wms',
    microzone_layers : [
        ['Laderas', 'Microzonas:Microzonas_Laderas', 'Amenaza'],
        ['Sedimentos', 'Microzonas:Microzonas_Sedimentos', 'microzona'],
        ['Amenaza General', 'Microzonas:Microzonas_Amenaza_General', 'Microzonas']
    ],
    div: 'microzonelib',
    parameter_source : 'javascript'
};
*/

g_fetched_spectrum = null;

define(
    [
	'microzn/scripts/spectrum',
	'microzn/scripts/spectrum_parameters',
	'OpenLayers',
	'jquery',
	'jquery-ui',
	'jqplot/jquery.jqplot',
	'Blob',
	'FileSaver',
	'text!microzn/markup/div_content.html' // Actúa cómo código cliente de si mismo
    ],
    function (
	Spectrum,
	spectrum_parameters,
	OpenLayers,
	$,
	jqui,
	jqplot,
	Blob,
	FileSaver,
	div_content
    ) {
	// Simplemente incluye todos estos plugins. Extienden a
	// jqplot.
	require([
	    'jqplot/plugins/jqplot.logAxisRenderer',
	    'jqplot/plugins/jqplot.canvasAxisTickRenderer',
	    'jqplot/plugins/jqplot.canvasTextRenderer',
	    'jqplot/plugins/jqplot.cursor',
	    'jqplot/plugins/jqplot.canvasAxisLabelRenderer'
	], function(_,_,_,_){});
	// JQuery = $;

	var determine_macrozone = function (microzone) {

	    var macrozones = {
		1: "Sur",
		2: "Centro-Sur",
		3: "Centro-Norte",
		7: "Norte"
	    };

	    var mzid = "7";
	    if (microzone[0] == "R") {
		mzid = microzone.match(/\d/); // First Digit
	    }

	    return macrozones[mzid];
	};

	return {
	    microzonespectrum: function(config) {
		"use strict";

		/**
		 * Private atributes and methods of the microzonelib object
		 */
		var 
		current_microzone = "",
		config = config,

		set_conf = function (newconf) {
		    config = newconf || config;
		},

		plot_spectrum = function (espectro, scale) {
		    $("#mzid").html(espectro.label);
		    $("#val_phi").html(espectro.phi);
		    $("#val_beta").html(espectro.beta);
		    $("#val_a0").html(espectro.A_0);
		    $("#val_m").html(espectro.m);
		    $("#val_p").html(espectro.p);
		    $("#val_t0").html(espectro.T_0);
		    $("#val_ta").html(espectro.T_A);
		    $("#val_td").html(espectro.T_D);
		    $("#val_tstar").html(espectro.T_star);

		    

		    var points = espectro.getPoints(scale);

		    var axes_options = {
			yaxis: {
			    label: "Aceleración (s)",
			    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
			    tickOptions: {
			    	formatString: '%.2f'
			    },
			    ticks : [0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
			    min : 0.0,
			    max : 1.3
			},
			xaxis: {
			    label: "Período (s)",
			    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
			    tickOptions: {
			    	formatString: '%.2f'
			    }
			}
		    };

		    if(scale == 'log') {
		    	axes_options.xaxis.renderer = $.jqplot.LogAxisRenderer;
		    }

		    $('#' + config.chartdiv).html('');

		    $.jqplot(config.chartdiv,  [points],
			     {
				 axesDefaults: {
				     tickRenderer: $.jqplot.CanvasAxisTickRenderer,
				     tickOptions: {
				 	 fontSize: '8pt'
				     }
				     //,showTickMarks: false  //???
				 },
				 seriesDefaults: {
				     showMarker: false
				 },
				 axes: axes_options,

				 cursor: {
				     show: true
				 }
			     });
		},

		display_map = function (mapdiv) {
		    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
		    var mercator = new OpenLayers.Projection("EPSG:900913");
		    var geographic = new OpenLayers.Projection("EPSG:4326");
		    var regven_utm_19_n = new OpenLayers.Projection("EPSG:2202");
		    var tail_format = 'image/gif';
		    var
                    div_id = mapdiv || config.map_div,

                    options = {
			controls: [
                            new OpenLayers.Control.Navigation(),
                            //new OpenLayers.Control.PanZoomBar(),
                            //new OpenLayers.Control.LayerSwitcher({'ascending':false}),
                            new OpenLayers.Control.LayerSwitcher(),
                            // new OpenLayers.Control.Permalink(),
                            new OpenLayers.Control.ScaleLine(),
                            // new OpenLayers.Control.Permalink('permalink'),
                            //new OpenLayers.Control.MousePosition(),
                            // new OpenLayers.Control.OverviewMap(),
                            new OpenLayers.Control.KeyboardDefaults()
			],
			// maxExtent: bounds,
			// maxResolution: 201.93779531080872,
			// projection: "EPSG:2202",
			// units: 'm',
			projection: mercator,
			numZoomLevels:16
                    },
		    map = new OpenLayers.Map(div_id, options),
		    layers = config.microzone_layers.map(
			function(e){
			    return new OpenLayers.Layer.WMS(
				e[0],
				config.geoserver_url,
				{
				    layers: e[1],
				    transparent: true,
				    format: tail_format
				},
				{
				    noMagic: true,
				    isBaseLayer: false,
				    opacity: 0.3
				}
			    )
			}
		    ),
		    osm = new OpenLayers.Layer.OSM( "Simple OSM Map"),
		    wms_gl;

		    if(config.hasOwnProperty('microzone_group')) {
			
			wms_gl = new OpenLayers.Layer.WMS(config.microzone_group[0],
							  config.geoserver_url,
							  {
							      layers: config.microzone_group[1],
							      transparent: true,
							      format: tail_format
							  },
							  {
							      noMagic: true,
							      isBaseLayer: false,
							      opacity: 0.3
							  });
			map.addLayer(osm);
			map.addLayer(wms_gl);
		    }
		    else {
			map.addLayer(osm);
		     	map.addLayers(layers);
		    }
		    map.setCenter([-7448897.08925, 1176127.48317], 12);
		    return map;
		},

		get_full_microzone_id = function (slope_value) {
		    var full_microzone_id;
		    slope_value = slope_value || 'T0';

		    if (current_microzone[0] === 'R') {
			full_microzone_id = current_microzone + '-' + slope_value;
		    } else {
			full_microzone_id = current_microzone;
		    }

		    return full_microzone_id;
		},

		request_zone_attributes = function (microzone_id) {

		    var selected_building_group = $('#building_group_select option:selected').val();
		    var reduction_factor = parseFloat($('#reduction_factor_input').val());
		    var scale = $('#scale_group_select option:selected').val();

		    var web_get_parameters = function (microzone_id) {
			var fetched_spectrum = null;
			$.ajax({
			    dataType: "json",
			    url: config.parameters_service,
			    data: {label: microzone_id},
			    async: false,
			    success: function (response) {
				var
				label = response.label,
				phi = response.phi,
				beta = response.beta,
				arg_a0 = response.arg_a0,
				arg_ta = response.arg_ta,
				arg_t0 = response.arg_t0,
				arg_tstar = response.arg_tstar,
				arg_td = response.arg_td,
				arg_m = response.arg_m,
				arg_p = response.arg_p;
				
				var fetched_spectrum = new Spectrum(
				    label,
				    phi,
				    beta,
				    arg_a0,
				    arg_ta,
				    arg_t0,
				    arg_tstar,
				    arg_td,
				    arg_m, arg_p,
				    determine_macrozone(microzone_id),
				    selected_building_group,
				    reduction_factor
				);
			    }});
			return fetched_spectrum;
		    };

		    var javascript_get_parameters = function (microzone_id) {

			var _parameters = spectrum_parameters.parameters.filter(function (x) { return x.label == microzone_id;})[0];
			var
			label = _parameters.label,
			phi = _parameters.phi,
			beta = _parameters.beta,
			arg_a0 = _parameters.arg_a0,
			arg_ta = _parameters.arg_ta,
			arg_t0 = _parameters.arg_t0,
			arg_tstar = _parameters.arg_tstar,
			arg_td = _parameters.arg_td,
			arg_m = _parameters.arg_m,
			arg_p = _parameters.arg_p;
			
			var fetched_spectrum = new Spectrum(
			    label,
			    phi,
			    beta,
			    arg_a0,
			    arg_ta,
			    arg_t0,
			    arg_tstar,
			    arg_td,
			    arg_m,
			    arg_p,
			    determine_macrozone(microzone_id),
			    selected_building_group,
			    reduction_factor
			);
			return fetched_spectrum;
		    };

		    g_fetched_spectrum = null;

		    if (config.parameter_source == 'web') {
			g_fetched_spectrum = web_get_parameters(microzone_id);
		    }
		    else if (config.parameter_source == 'javascript') {
			g_fetched_spectrum = javascript_get_parameters(microzone_id);
		    }

                    if (current_microzone[0] === 'R') {
			$('#slope_select').prop('disabled', false);
                    } else {
			$('#slope_select').prop('disabled', true);
                    }
                    $("#" + config.dialog_div).dialog("open");
                    plot_spectrum(g_fetched_spectrum, scale);
		},

		map_click_handler = function (response) {

		    //microzone_ = response.features[0]; // Expo for debugging
		    var
                    microzone_name = response.features[0].id.split('.')[0],
                    microzone_id,
                    field_name,
                    i;

		    for (i = 0; i < config.microzone_layers.length; i = i + 1) {
			if (config.microzone_layers[i][1].indexOf(microzone_name) !== -1) {
			    field_name = config.microzone_layers[i][2];
			    break;
			}
		    }

		    current_microzone = response.features[0].properties[field_name];    //updates global zone id
		    microzone_id = get_full_microzone_id();  // uses default slope (T0)
		    request_zone_attributes(microzone_id);  // requests the microzone attributes
		};

		/**
		 * Public methods of the microzonelib object
		 */
		return {
		    init : function (new_config) {
			set_conf(new_config);

			document.getElementById(config._div).innerHTML = div_content;
			var map = display_map();

		    	var text_options_form = document.getElementById("text-options");
		    	text_options_form.addEventListener("submit", function(event) {
			    event.preventDefault();
			    var mzid_f  = document.getElementById("mzid").textContent;
			    var spectrum_points = g_fetched_spectrum.getPoints();
			    var csv_text = spectrum_points[0].toString();
			    for (var i = 1; i < spectrum_points.length; i++) {
				csv_text = csv_text.concat("\n").concat(spectrum_points[i].toString());
			    }

		    	    saveAs(
		    		new Blob(
		    		    [csv_text],
		    		    {type: "text/csv;charset=" + document.characterSet}
		    		)
		    		, mzid_f + ".csv"
		    	    );
		    	}, false);
			


			$("#" + config.dialog_div).dialog({
			    autoOpen: false,
			    show: 'scale',
			    hide: 'scale',
			    width: 650,
			    height: 700
			});

			map.events.register('click', map, function (e) {

			    var
			    query_layers = map.layers.map(
			    	function (element) {
			    	    return element.params.LAYERS;
			    	}
			    ).slice(1).join(),

			    params = {
				REQUEST: "GetFeatureInfo",
				EXCEPTIONS: "application/vnd.ogc.gml",
				SERVICE: "WMS",
				INFO_FORMAT: 'application/json',
				QUERY_LAYERS: query_layers,
				FEATURE_COUNT: 50,
				Layers: query_layers,
				X: Math.round(e.xy.x),
				Y: Math.round(e.xy.y),
				srs: map.layers[1].params.SRS,

				// Los siguientes parámetros sí son necesarios.
				// Sin ellos, la respuesta será un error concerniente
				// a que el punto es inválido ya que no está dentro de
				// un cuadrante adecuado (WIDTH y HEIGHT) o simplemente
				// un error "oscuro" (BBOX)
				BBOX: map.getExtent().toBBOX(), 
				WIDTH: map.size.w,
				HEIGHT: map.size.h,
				version: "1.1.1" // Sin esto, genera
						 // el error "valores
						 // I y J inválidos".
			    };

			    // Optimización en caso de haber una sola capa
			    if(
				config.microzone_layers.length == 1
				&&
				!config.hasOwnProperty('microzone_group')
			      )
			    {
				params.propertyName = config.microzone_layers[0][2];
			    }

			    $("#slope_select option[value=T0]").attr("selected", true);
			    $("#building_group_select option[value=B2]").attr("selected", true);
			    $("#scale_gruop_select option[value=log]").attr("selected", true);
			    $.getJSON(config.geoserver_url, params, map_click_handler);
			    e.stopPropagation();
			});

			var update_plot = function () {
			    var selected_slope = $('#slope_select option:selected').val();
			    request_zone_attributes(get_full_microzone_id(selected_slope));
			};
			
			$('#scale_group_select').change(update_plot);

			//slope selection onChange event
			$('#slope_select').change(update_plot);

			// group selection onChange event
			$('#building_group_select').change(update_plot);

			// reduction_factor_input onChange event
			$('#reduction_factor_input').change(update_plot);


		    },

		    set_config: set_conf,                   //set_config({option1: '', option2: 3})
		    plot: plot_spectrum,                    //plot(new Spectrum('R', 1.32, 132,...)) 
		    request_zone: request_zone_attributes,  //request_zone('R2-T1')
		    show_map: display_map                   //show_map('map_div')
		};
	    }
	};
    });

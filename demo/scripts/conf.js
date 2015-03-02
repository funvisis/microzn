// SHIM
require.config({
    shim: {
	'OpenLayers': {
	    exports: 'OpenLayers'
	},
	Blob: {
	    exports: 'Blob'
	},

	'jqplot/jquery.jqplot': {
	    deps: ['jquery']
	},

	'jqplot/jqplot.logAxisRenderer': {
	     deps: ['jqplot/jquery.jqplot']
	},

	'jqplot/jqplot.canvasAxisTickRenderer': {
	    deps: ['jqplot/jquery.jqplot']
	},

	'jqplot/jqplot.canvasTextRenderer': {
	    deps: ['jqplot/jquery.jqplot']
	},

	'jqplot/jqplot.cursor': {
	    deps: ['jqplot/jquery.jqplot']
	},

	'jqplot/jqplot.canvasAxisLabelRenderer': {
	    deps: ['jqplot/jquery.jqplot']
	}
    },
// END SHIM


// ***************
//  CONFIGURACIÓN
// ***************
//
// A partir de esta línea pueden realizarse los cambios.

    paths: {
	"microzn": '../components/microzn',
	"jquery": '../components/jquery/dist/jquery',
	"OpenLayers": '../components/openlayers/OpenLayers',
	"jquery-ui": '../components/jquery-ui/jquery-ui',
	"jqplot": '../components/jquery.jqplot.1.0.8r1250.tar',
	"FileSaver": '../components/FileSaver.js/FileSaver',
	"Blob": '../components/Blob.js/Blob',
        "text": '../components/text/text'
	
    }
});

require(['microzn/scripts/microzonelib'], function(microzonelib) {
    
    // require(["jqplot.logAxisRenderer"], function(jqpl){});
	

    var config = {


	// *geoserver_url*:
	// URL del servicio WMS que ofrece los mapas de la
	// microzonificación.

	geoserver_url: 'http://geoserver:8080/geoserver/funvisis/wms',

	// TODO: Cambiar el nombre del parámetro geoserver_url a wms_url

	// *microzone_layers*:
	// Lista de 3-tuplas donde cada una representa una
	// combinación de tres datos:
	// Posición 1: Display. Texto que será mostrado en la
	// aplicación que identifica la capa asociada en esta
	// 3-tupla.
	// Posición 2: Layer. Texto que identifica la capa en el
	// servidor WMS.
	// Posición 3: Field. Texto que identifica cuál campo de los
	// "Features" de la capa asociada a esta 3-tupla, contiene la
	// información requerida por {{microzonespectrumjs}} para
	// hacer los cálculos.

	microzone_layers : [
	    ['Microzonas', 'funvisis:microzonas_ids', 'microzona_id']
            // ['Laderas', 'funvisis:laderas', 'amenaza'],
            // ['Sedimentos', 'funvisis:sedimentos', 'microzona'],
            // ['Amenaza General', 'funvisis:general', 'microzonas']
	],

	// *microzone_group*:

	// Usted puede definir un "grupo de capas" en el servidor
	// SIG. Es algo opcional pero permite un mejor rendimiento a
	// la aplicación ya que reduce el número de poticiones WEB al
	// servidor.
	//
	// Si definió un "grupo de capas", indique su nombre en este
	// parámetro de configuración para que la aplicación solicite
	// los recursos sólo a ese "grupo de capas" y no a todas las
	// capas.  Si no definió un "grupo de capas", entonces no
	// coloque este parámetro en la documentación, ni si quiera
	// con una cadena vacía como valor.
	//
	// Tiene la misma estructura que las tuplas de
	// 'microzone_layers', pero sin el último componente.

	// microzone_group : ['Microzonas de Caracas', 'funvisis:microzonas_caracas'],

	// TODO: cambiar el esquema de "lista" por uno que utilice
	// "objetos". Ejemplo:
	// microzone_layers : {
	//     {
	// 	layer: 'funvisis:laderas',
	// 	field: 'amenaza',
	// 	display: 'laderas'
	//     },
	//     {
	// 	layer: 'funvisis:sedimentos',
	// 	field: 'microzona',
	// 	display: 'Sedimentos'
	//     },
	//     {
	// 	layer: 'funvisis:amenaza',
	// 	field: 'microzonas',
	// 	display: 'Amenaza General'
	//     }
	// },

	// *parameters_service* (Opcional):
	// URL del servicio de parámetros.
	// Alternativamente a establecer *microzone_layers* en la
	// configuración, puede consultarse el servicio
	// *paremeters_service* para obtener la misma información.
	// Este servicio puede ser consultado para determinar cuáles
	// campos de los "features" ofrecidos por el servicio WMS
	// configurado tienen la información requerida por
	// {{microzonespectrumjs}} para hacer los cálculos.
        // parameters_service : 'http://ws.funvisis.gob.ve/microzones/get-by-label.json',

	// *_div*:
	// Determina el atributo *id* del "<div>" que contendrá la
	// aplicación en la página web.

	// *parameter_source*:

	// Determina qué fuente consultar para obtener los valores de los
	// parámetros. Puede ser 'wapi', que supone el uso del servicio de
	// parámetros, o 'javascript'
	parameter_source : 'javascript', // or 'json' or 'wapi'

        _div: 'microzonas',


// Hasta aquí se puede configurar. No tocar el resto de las líneas
// que quedan
// *************************
//  FIN DE LA CONFIGURACIÓN
// *************************

        map_div : 'map',
        dialog_div : 'dialog',
        chartdiv : 'chartdiv',
    };
    var Microzonespectrum = new microzonelib.microzonespectrum(config);
    Microzonespectrum.init(config);
});

// TODO:
//
// Quitar de main.js:
// * shim
// * map_div
// * dialog_div
// * chartdiv

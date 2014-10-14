({
    mainConfigFile: 'scripts/conf.js',
    removeCombined: true,
    skipDirOptimize: true,


    dir: 'dist',
    modules: [
    	{
    	    name: 'conf',
    	    exclude: [
    	    	'jquery',
    	    	'OpenLayers',
    	    	'jquery-ui',
    	    	'jqplot/jquery.jqplot',
		'jqplot/plugins/jqplot.logAxisRenderer',
		'jqplot/plugins/jqplot.canvasAxisTickRenderer',
		'jqplot/plugins/jqplot.canvasTextRenderer',
		'jqplot/plugins/jqplot.cursor',
		'jqplot/plugins/jqplot.canvasAxisLabelRenderer',
    	    ]
    	}
    ],

    paths: {
	OpenLayers: 'empty:',
    	jquery: 'empty:',
    	'jquery-ui': 'empty:',
    	'jqplot/jquery.jqplot': 'empty:',
	'jqplot/plugins/jqplot.logAxisRenderer': 'empty:',
	'jqplot/plugins/jqplot.canvasAxisTickRenderer': 'empty:',
	'jqplot/plugins/jqplot.canvasTextRenderer': 'empty:',
	'jqplot/plugins/jqplot.cursor': 'empty:',
	'jqplot/plugins/jqplot.canvasAxisLabelRenderer': 'empty:'
    }
})

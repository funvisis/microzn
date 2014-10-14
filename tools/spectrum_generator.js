require('amd-loader');
var fs = require('fs');

var parameters_file = '../scripts/spectrum_parameters';
var spectrum_module = '../scripts/spectrum';

var spectrum = require(spectrum_module);
var microzones = require(parameters_file);

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

microzones.parameters.forEach(function(parameters){
    var
    label = parameters.label,
    phi = parameters.phi,
    beta = parameters.beta,
    arg_a0 = parameters.arg_a0,
    arg_ta = parameters.arg_ta,
    arg_t0 = parameters.arg_t0,
    arg_tstar = parameters.arg_tstar,
    arg_td = parameters.arg_td,
    arg_m = parameters.arg_m,
    arg_p = parameters.arg_p;

    var microzone_id = label;
    var selected_building_group = 'B2';
    var reduction_factor = 1;

    var s = new spectrum(
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
    console.log(label);
    var ini = 0.0;
    var end = 4.0;
    var step = 0.001;
    var i, a;
    var out = fs.createWriteStream(label + ".csv", { encoding: "utf8" });
    for(i = ini; i <= end; i += step) {
	a = s.calculate(i);
	out.write(i + ',' + a + '\n');
    }
    out.end();
}
);

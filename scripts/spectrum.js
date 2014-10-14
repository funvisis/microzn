define(function(){
    var Spectrum = function (label, phi, beta, A_0, T_A, T_0, T_star, T_D, m, p, macrozone, group, R) {
        "use strict";
	
        this.label = label;
        this.A_0 = A_0;
        this.phi = phi;
        this.beta = beta; 
        this.T_A = T_A;
        this.T_0 = T_0;
        this.T_star = T_star;
        this.T_D = T_D;
        this.m = m;
        this.p = p;
	this.importance_factor = this.get_importance_function(macrozone, group);
	this.R = R;
	var T_plus = Math.min((R-1)/10, 0.4);
	T_plus = Math.min(T_plus, T_star);
	T_plus = Math.max(T_plus, T_0);
	this.T_plus = T_plus;
	var beta_plus = beta*Math.pow(T_0/T_plus, m);
	this.beta_plus = beta_plus;
	this.c = Math.sqrt(Math.sqrt(R/beta_plus));
	
        return this;
    };


    // generate a function of T as the importance factor based on Macrozone and
    // Group
    Spectrum.prototype.get_importance_function = function(macrozone, group) {
	"use strict";
	// F * e ^ 0.06 * T <= ceil if A
	// (1 + A)/2 if B1
	// 1 if B2

	var macrozone_parameters = {
	    "Sur": {F: 1.28, ceil: 1.5},
	    "Centro-Sur": {F: 1.30, ceil: 1.6},
	    "Centro-Norte": {F: 1.30, ceil: 1.6},
	    "Norte": {F: 1.35, ceil: 1.7}
	};

	var A_function = function (T) {
	    var ps = macrozone_parameters[macrozone];
	    var r = ps.F*Math.exp(0.06*T);
	    return Math.min(r, ps.ceil);
	}

	var group_functions = {
	    "A": A_function,
	    "B1": function (T) {
		return (1.0 + A_function(T))/2;
	    },
	    "B2": function (T) {
		return 1.0;
	    }
	};

	return group_functions[group];
    }
    
    Spectrum.prototype.calculate = function (T) {
        "use strict";

	var acc = 0;
	
        if (T < this.T_A) {
            acc = this.phi * this.A_0;
        }

	else if(this.T_A <= T && T < this.T_plus) {
	    acc = this.phi * this.A_0 *((1 + ((T - this.T_A)/(this.T_plus - this.T_A))*(this.beta_plus - 1))/(1 + Math.pow((T - this.T_A)/(this.T_plus - this.T_A), this.c)*(this.R - 1)));
	}
	
        // else if (this.T_A <= T && T < this.T_0) {
        //     acc = this.phi * this.A_0 * (1 + ((T - this.T_A) * (this.beta - 1) / (this.T_0 - this.T_A)));
        // }
	else if (T >= this.T_plus){
            if (this.T_0 <= T && T < this.T_star) {
		acc = this.phi * this.beta * this.A_0 * Math.pow(this.T_0 / T, this.m);
            }
	    
            else if (this.T_star <= T && T < this.T_D) {
		acc = this.phi * this.beta * this.A_0 * Math.pow(this.T_0 / this.T_star, this.m) * Math.pow(this.T_star / T, this.p);
            }
	    
            else if (this.T_D <= T) {
		acc = this.phi * this.beta * this.A_0 * Math.pow(this.T_0 / this.T_star, this.m) * Math.pow(this.T_star / this.T_D, this.p) * Math.pow(this.T_D / T, 2);
            }
	    acc = acc / this.R;
	}
	
        else {
	    return false; // error
	}

	return this.importance_factor(T) * acc;
    };

    Spectrum.prototype.getPoints = function (scale) {
        "use strict";
	
	var scales = {
	    log : {
		func :  this.logspace,
		params : [-2, Math.log(5)/Math.LN10, 500]
	    },
	    linear : {
		func : this.linspace,
		params : [0.0, 5.0, 250]
	    }
	};

	if(scale != "linear" && scale != "log") {
	    scale = "linear";
	}

        var space = scales[scale].func.apply(this, scales[scale].params);

	var points = [];

	var i;
	for (i = 0; i < space.length; i++) {
	    points.push([space[i], this.calculate(space[i])]);
	}
	
        return points;
    };

    Spectrum.prototype.integers = function () {
	// https://github.com/jesusabdullah/node-integers
	
	var
	from = 0,
	to = 0,
	every = 1,
	output = [];
	switch(arguments.length) {
	case 1:
	    to = arguments[0];
	    break;
	case 3:
	    every = arguments[2];
	case 2:
	    from = arguments[0];
	    to = arguments[1];
	    break;
	}
	for (i=from; i < to; i+=every) {
	    output.push(i);
	}
	return output;
    }

    Spectrum.prototype.linspace = function (a,b,n) {
	// https://github.com/jesusabdullah/node-linspace
	
	var every = (b-a)/(n-1),
	ranged = this.integers(a,b,every);
	return ranged.length == n ? ranged : ranged.concat(b);
    }
    
    Spectrum.prototype.logspace = function (a,b,n) {
	// https://github.com/jesusabdullah/node-logspace
	
	return this.linspace(a,b,n).map(function(x) { return Math.pow(10,x); });
    }

    return Spectrum;
});

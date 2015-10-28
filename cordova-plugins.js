/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global exports, module, require, define, tern */

(function (mod) {
    if (typeof exports === "object" && typeof module === "object") { // CommonJS
        return mod(require("../tern/lib/infer"), require("../tern/lib/tern"), require);
    }
    if (typeof define === "function" && define.amd) { // AMD
        return define(["../tern/lib/infer", "../tern/lib/tern"]);
    }
    mod(tern, tern);
})(function (infer, tern, require) {
    "use strict";
    
    var fs = require("fs");
    
    function preCondenseReach(state) {
    }
    
    function postCondense(state) {
    }
    
    tern.registerPlugin("cordova-plugins", function (server, options) {        
        server.on("preCondenseReach", preCondenseReach);
        server.on("postCondense", postCondense);
    });
});
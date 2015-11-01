/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global exports, module, require, define, tern */

(function (mod) {
    if (typeof exports === "object" && typeof module === "object") { // CommonJS
        return mod(require("../tern/lib/tern"), require("./cordova-plugin-def"), require("./cordova-plugin-modules"), require("../tern/plugin/commonjs"), require);
    }
    if (typeof define === "function" && define.amd) { // AMD
        return define(["../tern/lib/tern", "./cordova-plugin-def", "./cordova-plugin-modules", "../tern/plugin/commonjs"]);
    }
    mod(tern, tern);
})(function (tern) {
    "use strict";

    tern.registerPlugin("cordova-plugins-condense", function (server, options) {
        server.loadPlugin("cordova-plugin-def");
        server.loadPlugin("cordova-plugin-modules");
        server.loadPlugin("commonjs");
    });
});
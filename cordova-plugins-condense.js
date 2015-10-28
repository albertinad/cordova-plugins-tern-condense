/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global exports, module, require, define, tern */

(function (mod) { console.log("dirname:",__dirname)
    if (typeof exports === "object" && typeof module === "object") { // CommonJS
        return mod(require("../tern/lib/tern"), require("./cordova-plugins"), require("../tern/plugin/node"), require);
    }
    if (typeof define === "function" && define.amd) { // AMD
        return define(["../tern/lib/tern", "./cordova-plugins", "../tern/plugin/node"]);
    }
    mod(tern, tern);
})(function (tern) {
    "use strict";

    tern.registerPlugin("cordova-plugins-condense", function (server, options) {
        server.loadPlugin("cordova-plugins");
        server.loadPlugin("node");
    });
});
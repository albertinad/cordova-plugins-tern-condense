/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50 */
/*global exports, module, require, define, tern */

(function (mod) {
    if (typeof exports === "object" && typeof module === "object") { // CommonJS
        return mod(require("../tern/lib/infer"), require("../tern/lib/tern"), require("../tern/plugin/modules"), require);
    }
    if (typeof define === "function" && define.amd) { // AMD
        return define(["../tern/lib/infer", "../tern/lib/tern", "../tern/plugin/modules"]);
    }
    mod(tern, tern);
})(function (infer, tern) {
    "use strict";

    function preCondenseReach(state) {
        if (!state.roots["!modules"]) {
            return;
        }

        // patchModules
        var server = infer.cx().parent,
            modModules = server.mod.modules.modules,
            mods = server.mod.cordovaPluginDef.modulesDef,
            node = state.roots["!modules"], // infer.Obj
            props = node.props,
            currProp,
            modDef,
            mod,
            prop,
            path;

        for (path in props) {
            currProp = props[path];
            modDef = mods[currProp.origin];
            mod = modModules[currProp.origin];

            if (modDef) {
                prop = node.defProp(modDef.name);
                mod.origin = modDef.name;
                mod.propagate(prop);
                prop.origin = mod.origin;
            }

            delete props[path];
        }
    }

    function postCondense(state) {
        if (!state.output["!define"] || !state.output["!define"]["!modules"]) {
            return;
        }

        var output = state.output,
            modulesOutput = state.output["!define"]["!modules"],
            cordovaPluginDef = infer.cx().parent.mod.cordovaPluginDef,
            name,
            moduleDef,
            outputPoint,
            namespace;

        for (name in modulesOutput) {
            moduleDef = cordovaPluginDef.getModuleDefByName(name);

            if (moduleDef) {
                outputPoint = "+!modules." + name;
                namespace = moduleDef.getNamespace();

                var count = namespace.length,
                    lastIndex = count - 1,
                    lastNamespace = output,
                    part,
                    i;

                for (i = 0; i < count; i++) {
                    part = namespace[i];

                    if (!lastNamespace[part]) {
                        lastNamespace[part] = (i === lastIndex) ? outputPoint : {};
                    }

                    lastNamespace = lastNamespace[part];
                }
            }
        }
    }

    tern.registerPlugin("cordova-plugin-modules", function (server, options) {
        server.loadPlugin("modules");

        server.on("preCondenseReach", preCondenseReach);
        server.on("postCondense", postCondense);
    });
});

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50 */
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

    var fs = require("fs"),
        et = require("elementtree");

    /**
     * @constructor
     */
    function ModuleDef(name, src, target) {
        this._name = name;
        this._src = src;
        this._target = target; // maps with clobber target, from js-module
    }

    Object.defineProperties(ModuleDef.prototype, {
        "name": {
            get: function () {
                return this._name;
            }
        },
        "src": {
            get: function () {
                return this._src;
            }
        },
        "target": {
            get: function () {
                return this._target;
            }
        }
    });

    /**
     * @return {array}
     */
    ModuleDef.prototype.getNamespace = function () {
        return this._target.split(".");
    };

    /**
     * @constructor
     */
    function PluginDef(id, file, parser) {
        this._id = id;
        this._parser = parser;
        this._modulesDef = {};
        this._file = file;

        this._dir = this._file.substring(0, this._file.indexOf(PluginDef.METADATA_FILE));
    }

    PluginDef.METADATA_FILE = "plugin.xml";

    Object.defineProperties(PluginDef.prototype, {
        "id": {
            get: function () {
                return this._id;
            }
        },
        "modulesDef": {
            get: function () {
                return this._modulesDef;
            }
        }
    });

    /**
     * @param {string} name
     * @param {string} src
     * @param {string} target
     */
    PluginDef.prototype.addModule = function (name, src, target) {
        src = this._dir + src;

        var mod = this._modulesDef[src];

        if (!mod) {
            this._modulesDef[src] = new ModuleDef(name, src, target);
        } else if (mod.name !== name || mod.target !== target) {
            console.log("[cordova-plugin-def] - A module for the same source file, with differents attributes was found!");
        }
    };

    /**
     * @param {string} name
     */
    PluginDef.prototype.getModuleDefByName = function (name) {
        var currentModule,
            src,
            mod;

        for (src in this._modulesDef) {
            currentModule = this._modulesDef[src];
            if (currentModule.name === name) {
                mod = currentModule;
                break;
            }
        }

        return mod;
    };

    /**
     * @param {string} file
     * @constructor
     */
    function PluginParser(file) {
        this._descriptor = file;
        this._pluginTree = null;
    }

    Object.defineProperty(PluginParser.prototype, "descriptor", {
        get: function () {
            return Object.clone(this._descriptor);
        }
    });

    PluginParser.prototype.parse = function () {
        var data = fs.readFileSync(this._descriptor, "utf-8"),
            id,
            jsModules,
            pluginDef,
            i;

        this._pluginTree = et.parse(data);
        id = this._pluginTree.getroot().get("id", this._descriptor);
        jsModules = this._parseJsModules();

        pluginDef = new PluginDef(id, this._descriptor, this);

        for (i = 0; i < jsModules.length; i++) {
            var jsMod = jsModules[i];
            pluginDef.addModule(jsMod.name, jsMod.src, jsMod.target);
        }

        return pluginDef;
    };

    /**
     * @private
     */
    PluginParser.prototype._parseJsModules = function () {
        var elements = this._pluginTree.findall("js-module");
        elements = elements.concat(this._pluginTree.findall("platform/js-module"));

        var size = elements.length,
            jsModules = [],
            element,
            clobbers,
            i;

        for (i = 0; i < size; i++) {
            element = elements[i];
            clobbers = element.find("clobbers");

            if (clobbers) {
                var jsModule = this._parseJsModule(element, clobbers);
                if (jsModule) {
                    jsModules.push(jsModule);
                }
            }
        }

        return jsModules;
    };

    /**
     * @private
     */
    PluginParser.prototype._parseJsModule = function (jsModule, clobbers) {
        var name = jsModule.get("name"),
            src = jsModule.get("src"),
            target = clobbers.get("target"),
            mod;

        if (name && src && target) {
            mod = {
                name: name,
                src: src,
                target: target
            };
        }

        return mod;
    };

    function preCondenseReach(state) {
        // look for plugin.xml in state.origins
        var descriptor = state.origins[0];

        if (!descriptor || !descriptor.match(PluginDef.METADATA_FILE)) {
            throw "Not valid plugin.xml: " + descriptor;
        }

        // read and parse the content of plugin.xml in order to get the sources and clobber mounting
        var parser = new PluginParser(descriptor);
        state.server.mod.cordovaPluginDef = parser.parse();

        state.output["!name"] = state.server.mod.cordovaPluginDef.id;

        var cx = infer.cx(),
            server = state.server,
            index = cx.origins.indexOf(descriptor),
            origins = [],
            mods = server.mod.cordovaPluginDef.modulesDef,
            modDef,
            file,
            i;

        // replace cx.origins and update files from server
        if (index > -1) {
            cx.origins.splice(index, 1);
        }
        server.delFile(descriptor);

        for (file in mods) {
            modDef = mods[file];
            origins.push(modDef.name);
            origins.push(file);
            cx.origins.push(file);
            server.addFile(file, fs.readFileSync(file, "utf8"));
        }

        server.flush(function (err) {
            if (err) {
                console.log("[cordova-plugin-def] - Error applying changes", err);
            }
        });

        state.origins = origins;
        // update maxOrigin value
        for (i = 0; i < origins.length; ++i) {
            state.maxOrigin = Math.max(state.maxOrigin, infer.cx().origins.indexOf(origins[i]));
        }
    }

    tern.registerPlugin("cordova-plugin-def", function (server, options) {
        server.on("preCondenseReach", preCondenseReach);
    });
});

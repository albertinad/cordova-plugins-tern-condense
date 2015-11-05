var expect = require("chai").expect,
    execFile = require("child_process").execFile;

describe("Tern condense cordova plugins", function() {

    var args;

    beforeEach(function () {
        args = ["../tern/bin/condense", "--plugin", "cordova-plugins-condense.js"];
    });

    it("should generate definitions for a single namespace definition, at default (window)", function (done) {
        args.push("tests/data/simple1/plugin.xml");

        execFile(process.execPath, args, function (err, stdout, stderr) {

            if (stderr) {
                throw stderr;
            }

            var ternDef = JSON.parse(stdout);

            expect(ternDef).to.exist;
            expect(ternDef["!name"]).to.equal("test-plugin-1");
            expect(ternDef["!define"]).to.be.an("object");
            expect(ternDef.Simple).to.equal("+!modules.Simple");
            expect(Object.keys(ternDef).length).to.equal(3);

            done();
        });
    });

    it("should generate definitions for a single namespace definition in navigator", function (done) {
        args.push("tests/data/simple2/plugin.xml");

        execFile(process.execPath, args, function (err, stdout, stderr) {
            if (stderr) {
                throw stderr;
            }

            var ternDef = JSON.parse(stdout);

            expect(ternDef).to.exist;
            expect(ternDef["!name"]).to.equal("test-plugin-2");
            expect(ternDef["!define"]).to.be.an("object");
            expect(ternDef.navigator).to.be.an("object");
            expect(ternDef.navigator.simplemodule).to.equal("+!modules.Simple");
            expect(Object.keys(ternDef).length).to.equal(3);

            done();
        });
    });

    it("should generate definitions for more than one modules", function (done) {
        args.push("tests/data/plugin3/plugin.xml");

        execFile(process.execPath, args, function (err, stdout, stderr) {
            if (stderr) {
                throw stderr;
            }

            var ternDef = JSON.parse(stdout);

            expect(ternDef).to.exist;
            expect(ternDef["!name"]).to.equal("test-plugin-3");
            expect(ternDef["!define"]).to.be.an("object");
            expect(ternDef.cordovaplugincondense).to.be.an("object");
            expect(ternDef.cordovaplugincondense.simplemodule).to.equal("+!modules.Simple");
            expect(ternDef.navigator).to.be.an("object");
            expect(ternDef.navigator.dummy).to.be.equal("+!modules.SimpleError");
            expect(ternDef.OtherModule).to.be.equal("+!modules.OtherModule");
            expect(Object.keys(ternDef).length).to.equal(5);

            done();
        });
    });

    it("should generate definitions for more than one modules and complex namespaces", function (done) {
        args.push("tests/data/plugin4/plugin.xml");

        execFile(process.execPath, args, function (err, stdout, stderr) {
            if (stderr) {
                throw stderr;
            }

            var ternDef = JSON.parse(stdout);

            expect(ternDef).to.exist;
            expect(ternDef["!name"]).to.equal("test-plugin-4");
            expect(ternDef["!define"]).to.be.an("object");
            expect(ternDef.cordovaplugincondense).to.be.an("object");
            expect(ternDef.cordovaplugincondense.simplemodule).to.equal("+!modules.Simple");
            expect(ternDef.navigator.pluginerror).to.be.an("object");
            expect(ternDef.navigator.pluginerror.SimpleError).to.be.equal("+!modules.SimpleError");
            expect(ternDef.navigator.dummy).to.be.an("object");
            expect(ternDef.navigator.dummy.jam).to.be.equal("+!modules.JustAnotherModule");
            expect(ternDef.navigator.dummy.magic).to.be.equal("+!modules.Magic");
            expect(ternDef.OtherModule).to.be.equal("+!modules.OtherModule");
            expect(Object.keys(ternDef).length).to.equal(5);

            done();
        });
    });
});

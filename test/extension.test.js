/* global suite, test */

//
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');

// Defines a Mocha test suite to group tests of similar kind together
suite("Helper Functions Tests", function () {
    const {
        maxWidth,
        padRight,
        padToCenter
    } = require('../src/comment-box');

    // Defines a Mocha unit test
    test("maxWidth", function () {
        assert.equal(maxWidth([]), 0, "With no lines, the maximum length is 0.");
        assert.equal(maxWidth([""]), 0, "With an empty line the max length is 0.");
        assert.equal(maxWidth(["single non empty"]), 16);
        assert.equal(maxWidth([
            "multiple",
            "lines"
        ]), 8);
        assert.equal(maxWidth([
            "lines",
            "multiple"
        ]), 8);
    });

    test("padRight", function () {
        assert.equal(padRight("", 3, "*"), "***", "Creates a string with the appropriate symbols and length.")
        assert.equal(padRight("-", 3, "*"), "-**", "Extends a string with the appropriate symbols and length.")
        assert.equal(padRight("---", 3, "*"), "---", "Doesn't extend strings with the right size.")
        assert.equal(padRight("", 3, "*+"), "*+*", "Works with multi-character tokens.")
    });

    test("padToCenter", function () {
        assert.equal(padToCenter("", 3, "*"), "***", "Creates a string with the appropriate symbols and length.")
        assert.equal(padToCenter("-", 3, "*"), "*-*", "Extends a string with the appropriate symbols and length.")
        assert.equal(padToCenter("---", 3, "*"), "---", "Doesn't extend strings with the right size.")
        assert.equal(padToCenter("--", 5, "*"), "*--**", "Works when the string can't be exactly centered.")
        assert.equal(padToCenter("", 3, "*+"), "**+", "Works with multi-character tokens 1.")
        assert.equal(padToCenter("-", 5, "*+"), "*+-*+", "Works with multi-character tokens 2.")
        assert.equal(padToCenter("-", 4, "*+"), "*-*+", "Works with multi-character tokens 3.")
    });
});

/** END **/
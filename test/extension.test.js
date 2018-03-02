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
        padToCenter,
        convertToCommentBox
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

    test("convertToCommentBox", function () {
        const styleA = {
            startToken: "/*",
            endToken: "*/",
            topEdgeToken: "*",
            bottomEdgeToken: "*",
            leftEdgeToken: " *",
            rightEdgeToken: "*",
            fillingToken: " ",
            width: 0,
            clearAroundText: 1,
            align: "left",
        }
        //convertToCommentBox(" \t with multiple lines \t \n \t test \t ", styleA)
        assert.equal(convertToCommentBox("test", styleA), "\
/********\n\
 * test *\n\
 ********/\
", "StyleA works.")

        assert.equal(convertToCommentBox("test\nwith multiple lines", styleA), "\
/***********************\n\
 * test                *\n\
 * with multiple lines *\n\
 ***********************/\
", "StyleA works with multiple lines.")

        assert.equal(convertToCommentBox("with multiple lines\ntest", styleA), "\
/***********************\n\
 * with multiple lines *\n\
 * test                *\n\
 ***********************/\
", "StyleA works with multiple lines in reverse order.")

        assert.equal(
            convertToCommentBox("with multiple lines\ntest", styleA), 
            convertToCommentBox(" \t with multiple lines \t \n \t test \t ", styleA),
            "StyleA correctly strips empty space.")

        
        const styleB = {
            startToken: "/*",
            endToken: "*/",
            topEdgeToken: "=",
            bottomEdgeToken: "=",
            leftEdgeToken: " |",
            rightEdgeToken: "|",
            fillingToken: "~",
            width: 50,
            clearAroundText: 1,
            align: "center",
        }

        assert.equal(convertToCommentBox("test", styleB), "\
/*===============================================|\n\
 |~~~~~~~~~~~~~~~~~~~~ test ~~~~~~~~~~~~~~~~~~~~~|\n\
 |===============================================*/\
", "StyleB works.")

        assert.equal(convertToCommentBox("test\nwith multiple lines", styleB), "\
/*===============================================|\n\
 |~~~~~~~~~~~~~        test         ~~~~~~~~~~~~~|\n\
 |~~~~~~~~~~~~~ with multiple lines ~~~~~~~~~~~~~|\n\
 |===============================================*/\
", "StyleB works.")
    })
});

/** END **/
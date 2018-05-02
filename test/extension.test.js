/* global suite, test */

//
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert')

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode')

// Defines a Mocha test suite to group tests of similar kind together
suite("Helper Functions Tests", function () {
    const {
        widthOfLastLine,
        maxWidth,
        findIndentationLevel,
        padRight,
        padToCenter,
        convertToCommentBox
    } = require('../src/comment-box')

    test("widthOfLastLine", function () {
        assert.equal(widthOfLastLine(""), 0, "Width of an empty line is 0.")
        assert.equal(widthOfLastLine("***\n"), 0, "Last line empty, width of an empty line is 0.")
        assert.equal(widthOfLastLine("\n*"), 1, "Last line has one character.")
        assert.equal(widthOfLastLine("\n***"), 3, "Last line has multiple characters.")
        assert.equal(widthOfLastLine("*\n**\n***"), 3, "Multiple lines, with multiple characters.")
    })

    test("maxWidth", function () {
        assert.equal(maxWidth([]), 0, "With no lines, the maximum length is 0.")
        assert.equal(maxWidth([""]), 0, "With an empty line the max length is 0.")
        assert.equal(maxWidth(["single non empty"]), 16)
        assert.equal(maxWidth([
            "multiple",
            "lines"
        ]), 8)
        assert.equal(maxWidth([
            "lines",
            "multiple"
        ]), 8)
    })

    test("findIndentationLevel", function () {
        assert.equal(findIndentationLevel([]), 0,
            "Indentation level with no strings is 0.")
        assert.equal(findIndentationLevel(["", ""]), 0,
            "Indentation level with just empty strings is 0.")
        assert.equal(findIndentationLevel(["  ", ""]), 2,
            "Indentation level of strings with just spaces is the width of the largest string.")
        assert.equal(findIndentationLevel(["", "  "]), 2,
            "Indentation level of strings with just spaces is the width of the largest string reversed.")
        assert.equal(findIndentationLevel(["  text"]), 2,
            "Indentation level works with a single string.")
        assert.equal(findIndentationLevel(["  text", "  text2"]), 2,
            "Indentation level with multiple strings works.")
        assert.equal(findIndentationLevel(["  text", "    text2"]), 2,
            "Indentation level with multiple strings and different alignments works 1.")
        assert.equal(findIndentationLevel(["    text", "  text2"]), 2,
            "Indentation level with multiple strings and different alignments works 2.")
        assert.equal(findIndentationLevel(["    text", "  text2", "    text3"]), 2,
            "Indentation level with multiple strings and different alignments works 2.")
        assert.equal(findIndentationLevel(["", "  text", ""]), 2, "Empty lines do not change the result.")
    })

    test("padRight", function () {
        assert.equal(padRight("", 3, "*"), "***",
            "Creates a string with the appropriate symbols and length.")
        assert.equal(padRight("-", 3, "*"), "-**",
            "Extends a string with the appropriate symbols and length.")
        assert.equal(padRight("---", 3, "*"), "---",
            "Doesn't extend strings with the right size.")
        assert.equal(padRight("", 3, "*+"), "*+*",
            "Works with multi-character tokens.")
        assert.equal(padRight("---\n--", 3, "*"), "---\n--*",
            "On strings with multiple lines, extends the last one to the appropriate length.")
    })

    test("padToCenter", function () {
        assert.equal(padToCenter("", 2, "*"), "**",
            "Creates a string with the appropriate symbols and length.")
        assert.equal(padToCenter("", 3, "*"), "***",
            "Creates a string with the appropriate symbols and length.")
        assert.equal(padToCenter("-", 3, "*"), "*-*",
            "Extends a string with the appropriate symbols and length.")
        assert.equal(padToCenter("---", 3, "*"), "---",
            "Doesn't extend strings with the right size.")
        assert.equal(padToCenter("--", 5, "*"), "*--**",
            "Works when the string can't be exactly centered.")
        assert.equal(padToCenter("", 3, "*+"), "*+*",
            "Works with multi-character tokens 1.")
        assert.equal(padToCenter("O", 4, "*+"), "*O+*",
            "Works with multi-character tokens 2.")
    })

    test("convertToCommentBox", function () {
        const styleA = {
            startToken: "/*",
            endToken: "**/",
            topRightToken: "**",
            bottomLeftToken: " **",
            topEdgeToken: "*",
            bottomEdgeToken: "*",
            leftEdgeToken: " * ",
            rightEdgeToken: " *",
            fillingToken: " ",
            width: 0,
            align: "left",
        }

        assert.equal(convertToCommentBox("", styleA), "\
/****\n\
 *  *\n\
 ****/\
", "StyleA works with an empty comment.")

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
            topRightToken: "+",
            bottomLeftToken: " +",
            topEdgeToken: "=",
            bottomEdgeToken: "=",
            leftEdgeToken: " |",
            rightEdgeToken: "|",
            fillingToken: "~",
            width: 50,
            align: "center",
        }

        assert.equal(convertToCommentBox("", styleB), "\
/*===============================================+\n\
 |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|\n\
 +===============================================*/\
", "StyleB works with an empty comment.")

        assert.equal(convertToCommentBox("test", styleB), "\
/*===============================================+\n\
 |~~~~~~~~~~~~~~~~~~~~~test~~~~~~~~~~~~~~~~~~~~~~|\n\
 +===============================================*/\
", "StyleB works.")

        assert.equal(convertToCommentBox("test\nwith multiple lines", styleB), "\
/*===============================================+\n\
 |~~~~~~~~~~~~~~~~~~~~~test~~~~~~~~~~~~~~~~~~~~~~|\n\
 |~~~~~~~~~~~~~~with multiple lines~~~~~~~~~~~~~~|\n\
 +===============================================*/\
", "StyleB works.")

        // No box, just a bar to the left
        const styleC = {
            startToken: "/* ",
            endToken: " */",
            topRightToken: "**",
            bottomLeftToken: " **",
            topEdgeToken: "",
            bottomEdgeToken: "",
            leftEdgeToken: " * ",
            rightEdgeToken: "",
            fillingToken: " ",
            width: 0,
            align: "left",
        }
        assert.equal(convertToCommentBox("test", styleC), "\
/* test */\
", "When 'topEdgeToken' or 'bottomEdgeToken' is set to an empty string, the first or last line is skipped.")

        assert.equal(convertToCommentBox("test\nwith multiple lines", styleC), "\
/* test               \n\
 * with multiple lines */\
", "StyleC works with multiple lines.")

        assert.equal(convertToCommentBox("with multiple lines\ntest", styleC), "\
/* with multiple lines\n\
 * test                */\
", "StyleC works with multiple lines in reverse order.")

        // Fixed width with left alignment and different tokens
        const styleD = {
            startToken: "/*",
            endToken: "^*/",
            topRightToken: "vv",
            bottomLeftToken: " ^^",
            topEdgeToken: "v",
            bottomEdgeToken: "^",
            leftEdgeToken: " > ",
            rightEdgeToken: " <",
            fillingToken: "-",
            width: 30,
            align: "left",
        }

        assert.equal(convertToCommentBox("", styleD), "\
/*vvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\
 > ------------------------- <\n\
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/\
", "StyleD works with an empty comment.")

        assert.equal(convertToCommentBox("test", styleD), "\
/*vvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\
 > test--------------------- <\n\
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/\
", "StyleD works.")

        assert.equal(convertToCommentBox("test\nwith multiple lines", styleD), "\
/*vvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\
 > test--------------------- <\n\
 > with multiple lines------ <\n\
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/\
", "StyleD works with multiple lines.")

        assert.equal(convertToCommentBox("with multiple lines\ntest", styleD), "\
/*vvvvvvvvvvvvvvvvvvvvvvvvvvvv\n\
 > with multiple lines------ <\n\
 > test--------------------- <\n\
 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/\
", "StyleD works with multiple lines in reverse order.")

        // Using newlines in the start and end tokens
        const styleE = {
            startToken: "// Hello there!\n/*",
            endToken: "**/\n// Yap, this is cool :)",
            topRightToken: "**",
            bottomLeftToken: " **",
            topEdgeToken: "*",
            bottomEdgeToken: "*",
            leftEdgeToken: " * ",
            rightEdgeToken: " *",
            fillingToken: " ",
            width: 0,
            align: "left",
        }
        //convertToCommentBox(" \t with multiple lines \t \n \t test \t ", styleA)
        assert.equal(convertToCommentBox("test\nwith multiple lines", styleE), "\
// Hello there!\n\
/***********************\n\
 * test                *\n\
 * with multiple lines *\n\
 ***********************/\n\
// Yap, this is cool :)\
", "StyleE works in a complex case.")
    })
})

/** END **/
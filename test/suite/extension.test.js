//
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert')

/**
 * Creates a new object that contains the combined properties and values of two given objects. When
 * both objects have a value for the same key, it keeps the values from the second object.
 * 
 * @param {object} objectA 
 * @param {object} objectB 
 * @returns {object}
 */
function extend(objectA, objectB) {
    let result = {}

    for (let key in objectA) {
        result[key] = objectA[key]
    }

    for (let key in objectB) {
        result[key] = objectB[key]
    }

    return result
}

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode')

// Defines a Mocha test suite to group tests of similar kind together
suite("Helper Functions Tests", function () {
    const {
        widthOfLastLine,
        findIndentationLevel,
        convertTabsToSpaces,
        reverseString,
        padRight,
        padToCenter,
        convertToCommentBox
    } = require('../../src/comment-box')

    test("widthOfLastLine", function () {
        assert.equal(widthOfLastLine(""), 0, "Width of an empty line is 0.")
        assert.equal(widthOfLastLine("***\n"), 0, "Last line empty, width of an empty line is 0.")
        assert.equal(widthOfLastLine("\n*"), 1, "Last line has one character.")
        assert.equal(widthOfLastLine("\n***"), 3, "Last line has multiple characters.")
        assert.equal(widthOfLastLine("*\n**\n***"), 3, "Multiple lines, with multiple characters.")
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
            "Indentation level with multiple strings and different alignments works 3.")
        assert.equal(findIndentationLevel(["", "  text", ""]), 2,
            "Empty lines do not change the result.")
    })

    test("reverseString", function () {
        assert.equal(reverseString(""), "",
            "Reversing an empty string works.")
        assert.equal(reverseString("a"), "a",
            "Reversing a simple string works 1.")
        assert.equal(reverseString("ab"), "ba",
            "Reversing a simple string works 2.")
        assert.equal(reverseString("abc"), "cba",
            "Reversing a simple string works 3.")
        assert.equal(reverseString("🐶"), "🐶",
            "Reversing an unicode string works 1.")
        assert.equal(reverseString("あ"), "あ",
            "Reversing an unicode string works 2.")
        assert.equal(reverseString("🐶🐱"), "🐱🐶",
            "Reversing an unicode string works 3.")
        assert.equal(reverseString("あい"), "いあ",
            "Reversing an unicode string works 4.")
        assert.equal(reverseString("🐶 🐱"), "🐱 🐶",
            "Reversing an unicode string works 5.")
        assert.equal(reverseString("あ い"), "い あ",
            "Reversing an unicode string works 6.")
        assert.equal(reverseString("🐶❌🐭"), "🐭❌🐶",
            "Reversing an unicode string works 7.")
    })

    test("convertTabsToSpaces", function () {
        assert.equal(convertTabsToSpaces("", 1), "", "Using an empty string.")
        assert.equal(convertTabsToSpaces("", 0), "", "Using an empty string with 0 width.")
        assert.equal(convertTabsToSpaces("\t", 1), " ", "Replacing with width 1.")
        assert.equal(convertTabsToSpaces("abc\tabc", 1), "abc abc", "Replacing with width 1 in the middle of the text.")
        assert.equal(convertTabsToSpaces("\t", 4), "    ", "Replacing with width 4.")
        assert.equal(convertTabsToSpaces("abc\tabc", 4), "abc abc", "Replacing with width 4 in the middle of the text 1.")
        assert.equal(convertTabsToSpaces("ab\tab", 4), "ab  ab", "Replacing with width 4 in the middle of the text 1.")
        assert.equal(convertTabsToSpaces(" \t".repeat(5), 8).length, 8 * 5, "Many tabs in a row with spaces in between.")
        assert.equal(convertTabsToSpaces("🐶\t", 4), "🐶  ", "With unicode characters 1.")
        assert.equal(convertTabsToSpaces("🐶🐶\t", 4), "🐶🐶    ", "With unicode characters 2.")
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
        assert.equal(padRight("🐶", 4, "*"), "🐶**",
            "Works with unicode characters 1.")
        assert.equal(padRight("🐶", 4, "🐶"), "🐶🐶",
            "Works with unicode characters 2.")
        assert.equal(padRight("*", 4, "🐶"), "*🐶 ",
            "Works with unicode characters 3.")

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
        assert.equal(padToCenter("", 4, "🐶"), "🐶🐶",
            "Works with unicode characters 1.")
        assert.equal(padToCenter("", 4, "🐶"), "🐶🐶",
            "Works with unicode characters 2.")
        assert.equal(padToCenter("--", 9, "🐶"), "🐶 --🐶🐶",
            "Works with unicode characters 3.")
    })

    test("convertToCommentBox", function () {
        const defaultStyle = {
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
            textAlignment: "center",
            removeEmptyLines: true,
            ignoreOuterIndentation: true,
            ignoreInnerIndentation: true,
            tabSize: 4
        }

        assert.equal(convertToCommentBox("", defaultStyle), "\
/****\n\
 ****/\
", "Default works with an empty line.")

        assert.equal(convertToCommentBox("\n\n", defaultStyle), "\
/****\n\
 ****/\
", "Default works with multiple empty lines")

        assert.equal(convertToCommentBox("test", defaultStyle), "\
/********\n\
 * test *\n\
 ********/\
", "Default works with a normal comment.")

        assert.equal(convertToCommentBox("test\nmultiple lines", defaultStyle), "\
/******************\n\
 *      test      *\n\
 * multiple lines *\n\
 ******************/\
", "Default works with a multi-line comment 1.")

        assert.equal(convertToCommentBox("multiple lines\n test", defaultStyle), "\
/******************\n\
 * multiple lines *\n\
 *      test      *\n\
 ******************/\
", "Default works with a multi-line comment 2")

        assert.equal(convertToCommentBox("really\ntest\nmultiple lines", defaultStyle), "\
/******************\n\
 *     really     *\n\
 *      test      *\n\
 * multiple lines *\n\
 ******************/\
", "Default works with a multi-line comment 3.")



        const leftStyle = extend(defaultStyle, {
            textAlignment: "left"
        })

        assert.equal(convertToCommentBox("", leftStyle), "\
/****\n\
 ****/\
", "Left alignment works with an empty line.")

        assert.equal(convertToCommentBox("\n\n", leftStyle), "\
/****\n\
 ****/\
", "Left alignment works with multiple empty lines")

        assert.equal(convertToCommentBox("test", leftStyle), "\
/********\n\
 * test *\n\
 ********/\
", "Left alignment works with a normal comment.")

        assert.equal(convertToCommentBox("test\nmultiple lines", leftStyle), "\
/******************\n\
 * test           *\n\
 * multiple lines *\n\
 ******************/\
", "Left alignment works with a multi-line comment 1.")

        assert.equal(convertToCommentBox("multiple lines\n test", leftStyle), "\
/******************\n\
 * multiple lines *\n\
 * test           *\n\
 ******************/\
", "Left alignment works with a multi-line comment 2")

        assert.equal(convertToCommentBox("really\ntest\nmultiple lines", leftStyle), "\
/******************\n\
 * really         *\n\
 * test           *\n\
 * multiple lines *\n\
 ******************/\
", "Left alignment works with a multi-line comment 3.")



        const fillingTokenStyle = extend(defaultStyle, {
            fillingToken: "~"
        })

        assert.equal(convertToCommentBox("really\ntest\nmultiple lines", fillingTokenStyle), "\
/******************\n\
 * ~~~~really~~~~ *\n\
 * ~~~~~test~~~~~ *\n\
 * multiple lines *\n\
 ******************/\
", "Filling token works.")



        const multiCharfillingStyle = extend(defaultStyle, {
            fillingToken: "~-"
        })

        assert.equal(convertToCommentBox("test\nusing a really really long line", multiCharfillingStyle), "\
/***********************************\n\
 * ~-~-~-~-~-~-~test-~-~-~-~-~-~-~ *\n\
 * using a really really long line *\n\
 ***********************************/\
", "Filling token works with multiple characters.")


        const fixedWidthStyle = extend(defaultStyle, {
            width: 50,
        })

        assert.equal(convertToCommentBox("", fixedWidthStyle), "\
/*************************************************\n\
 *************************************************/\
", "Fixed width works with an empty comment.")

        assert.equal(convertToCommentBox("test", fixedWidthStyle), "\
/*************************************************\n\
 *                     test                      *\n\
 *************************************************/\
", "Fixed width works with a normal comment.")

        assert.equal(convertToCommentBox("test\nwith multiple lines", fixedWidthStyle), "\
/*************************************************\n\
 *                     test                      *\n\
 *              with multiple lines              *\n\
 *************************************************/\
", "Fixed width works with multi-line comment 1.")

        assert.equal(convertToCommentBox("really\ntest\nmultiple lines", fixedWidthStyle), "\
/*************************************************\n\
 *                    really                     *\n\
 *                     test                      *\n\
 *                multiple lines                 *\n\
 *************************************************/\
", "Fixed width works with multi-line comment 3.")



        const leftFixedWidthStyle = extend(defaultStyle, {
            width: 30,
            textAlignment: "left"
        })

        assert.equal(convertToCommentBox("really\ntest\nmultiple lines", leftFixedWidthStyle), "\
/*****************************\n\
 * really                    *\n\
 * test                      *\n\
 * multiple lines            *\n\
 *****************************/\
", "Left aligned fixed width works with multi-line comment.")



        const outerIndentationStyle = extend(defaultStyle, {
            ignoreOuterIndentation: false,
            textAlignment: "left"
        })

        assert.equal(convertToCommentBox("\treally\n\ttest\n\tmultiple lines", outerIndentationStyle), "\
    /******************\n\
     * really         *\n\
     * test           *\n\
     * multiple lines *\n\
     ******************/\
", "Keeping outer indentation intact.")



        const innerIndentationStyle = extend(defaultStyle, {
            ignoreInnerIndentation: false,
            textAlignment: "left"
        })

        assert.equal(convertToCommentBox("really\n\ttest\n\tmultiple lines", innerIndentationStyle), "\
/**********************\n\
 * really             *\n\
 *     test           *\n\
 *     multiple lines *\n\
 **********************/\
", "Keeping inner indentation intact.")



        const keepIndentationStyle = extend(defaultStyle, {
            ignoreInnerIndentation: false,
            ignoreOuterIndentation: false,
            textAlignment: "left"
        })

        assert.equal(convertToCommentBox("\treally\n\t\ttest\n\t\tmultiple lines", keepIndentationStyle), "\
    /**********************\n\
     * really             *\n\
     *     test           *\n\
     *     multiple lines *\n\
     **********************/\
", "Keeping indentation intact 1.")

        assert.equal(convertToCommentBox("\t\tmultiple lines\n\treally\n\t\ttest", keepIndentationStyle), "\
    /**********************\n\
     *     multiple lines *\n\
     * really             *\n\
     *     test           *\n\
     **********************/\
", "Keeping indentation intact 2.")



        const widthEightTabs = extend(defaultStyle, {
            tabSize: 8
        })

        assert.equal(convertToCommentBox("tabs\tin\tthe\tmiddle", widthEightTabs), "\
/**********************************\n\
 * tabs    in      the     middle *\n\
 **********************************/\
", "Correctly handles text with tabs.")

        assert.equal(convertToCommentBox("spaces  and     \ttabs\nwith\tmultiple\tlines", widthEightTabs), "\
/*********************************\n\
 * spaces  and             tabs  *\n\
 * with    multiple        lines *\n\
 *********************************/\
", "Correctly handles text with tabs and spaces, even with multiple lines.")



        const noTopEdgeStyle = extend(defaultStyle, {
            topEdgeToken: "",
            startToken: "/* "
        })

        assert.equal(convertToCommentBox("test", noTopEdgeStyle), "\
/* test *\n\
 ********/\
", "Correctly skips the top edge when top edge token is empty.")



        const noBottomEdgeStyle = extend(defaultStyle, {
            bottomEdgeToken: "",
            endToken: " */"
        })

        assert.equal(convertToCommentBox("test", noBottomEdgeStyle), "\
/********\n\
 * test */\
", "Correctly skips the bottom edge when bottom edge token is empty.")



        const pythonStyle = extend(defaultStyle, {
            startToken: "#",
            topEdgeToken: "#",
            topRightToken: "##",
            leftEdgeToken: "# ",
            rightEdgeToken: " #",
            bottomLeftToken: "",
            bottomEdgeToken: "#",
            endToken: "##"
        })

        assert.equal(convertToCommentBox("this is a\nmulti-line comment example", pythonStyle), "\
##############################\n\
#         this is a          #\n\
# multi-line comment example #\n\
##############################\
", "Correctly draws a Python style comment.")



        const crazyStyle = extend(defaultStyle, {
            startToken: "// I like to pre-comment my comments\n/*",
            endToken: "*/\n// I like to post-comment my comments",
            leftEdgeToken: " |",
            rightEdgeToken: "|",
            topEdgeToken: "=",
            bottomEdgeToken: "=",
            topRightToken: "+",
            bottomLeftToken: " +",
            fillingToken: "~-",
            textAlignment: "center",
        })

        assert.equal(convertToCommentBox("I LIVE ON THE EDGE\nSEE?", crazyStyle), "\
// I like to pre-comment my comments\n\
/*==================+\n\
 |I LIVE ON THE EDGE|\n\
 |~-~-~-~SEE?~-~-~-~|\n\
 +==================*/\n\
// I like to post-comment my comments\
", "Correctly draws a Python style comment.")


    })
})

/** END **/
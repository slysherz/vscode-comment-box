// @ts-check
//
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert')
const {
    widthOfLastLine,
    findIndentationLevel,
    convertTabsToSpaces,
    reverseString,
    padRight,
    padToCenter,
    convertToCommentBox,
    removeStyledCommentBox,
    findStyledCommentBox,
    dedentBy
} = require('../../src/comment-box')
const {
    mergeConfigurations
} = require('../../src/extension')

function* allCombinations(variations, start) {
    if (variations.length === 0) {
        yield start
        return;
    }

    const [
        [property, options], ...otherVariations
    ] = variations
    for (const option of options) {
        start[property] = option
        for (let style of allCombinations(otherVariations, start)) {
            yield style
        }
    }
}

function* objectCombinations(variations, start = null) {
    const vars = Object.entries(variations)
    for (const value of allCombinations(vars, start || {})) {
        yield value
    }
}

function* allSlices(start, end) {
    for (let i = start; i < end; i++) {
        for (let j = i; j < end; j++) {
            yield [i, j]
        }
    }
}

function removeCommonIndentation(string) {
    const lines = string.split(/\n/g)
    let indentation = findIndentationLevel(lines)
    return dedentBy(lines, indentation).join("\n")
}

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

function trimLine(string) {
    return string.split("\n").map(l => l.trim()).join("\n")
}

function fakeDocument(text) {
    const lines = text.split(/\n/g)

    return (n) => n >= 0 && n < lines.length ? lines[n] : null;
}

function lineCount(text) {
    return (text.match(/\n/g) || '').length + 1
}

function matchesProperties(properties, inObj) {
    for (const property in properties) {
        const prop = properties[property]
        const objValue = inObj[property]

        if (typeof (prop) === 'object') {
            if (!matchesProperties(prop, objValue)) {
                return false
            }
        } else if (prop instanceof Array) {
            if (prop.length != objValue.lenght) {
                return false
            }

            for (let i = 0; i < prop.length; i++) {
                if (prop[i] === undefined) {
                    continue
                }

                if (!matchesProperties(prop[i], objValue[i])) {
                    return false
                }
            }
        } else if (prop !== objValue) {
            return false
        }
    }

    return true
}

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode')

// Defines a Mocha test suite to group tests of similar kind together
suite("Helper Functions Tests", function () {
    const eq = assert.strictEqual

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
        // assert.equal(reverseString("👨‍👩‍👧‍👦"), "👨‍👩‍👧‍👦",
        //     "Reversing an unicode string works 8.")
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

        // Just for the unicode version
        assert.equal(convertTabsToSpaces("あ\t", 4), "あ  ", "With sneaky unicode characters 1.")
        assert.equal(convertTabsToSpaces("ああ\t", 4), "ああ    ", "With sneaky unicode characters 2.")
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

        // Just for the unicode version
        assert.equal(padRight("あ", 4, "*"), "あ**",
            "Works with sneaky unicode characters 1.")
        assert.equal(padRight("あ", 4, "あ"), "ああ",
            "Works with sneaky unicode characters 2.")
        assert.equal(padRight("*", 4, "あ"), "*あ ",
            "Works with sneaky unicode characters 3.")

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

        // Just for the unicode version
        assert.equal(padToCenter("", 4, "あ"), "ああ",
            "Works with sneaky unicode characters 1.")
        assert.equal(padToCenter("", 4, "あ"), "ああ",
            "Works with sneaky unicode characters 2.")
        assert.equal(padToCenter("--", 9, "あ"), "あ --ああ",
            "Works with sneaky unicode characters 3.")
    })
})


suite("Comment Functions Tests", function () {
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
        maxEndColumn: 120,
        textAlignment: "center",
        removeEmptyLines: true,
        ignoreOuterIndentation: true,
        ignoreInnerIndentation: true,
        tabSize: 4,
        capitalize: false
    }

    const leftStyle = extend(defaultStyle, {
        textAlignment: "left"
    })

    const fillingTokenStyle = extend(defaultStyle, {
        fillingToken: "~"
    })

    const multiCharfillingStyle = extend(defaultStyle, {
        fillingToken: "~-"
    })

    const fixedWidthStyle = extend(defaultStyle, {
        width: 50,
    })

    const leftFixedWidthStyle = extend(defaultStyle, {
        width: 30,
        textAlignment: "left"
    })

    const outerIndentationStyle = extend(defaultStyle, {
        ignoreOuterIndentation: false,
        textAlignment: "left"
    })

    const keepIndentationStyle = extend(defaultStyle, {
        ignoreInnerIndentation: false,
        ignoreOuterIndentation: false,
        textAlignment: "left"
    })

    const innerIndentationStyle = extend(defaultStyle, {
        ignoreInnerIndentation: false,
        textAlignment: "left"
    })

    const widthEightTabs = extend(defaultStyle, {
        tabSize: 8
    })

    const noTopEdgeStyle = extend(defaultStyle, {
        topEdgeToken: "",
        startToken: "/* "
    })

    const noBottomEdgeStyle = extend(defaultStyle, {
        bottomEdgeToken: "",
        endToken: " */"
    })

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

    const rightLimitStyle = extend(keepIndentationStyle, {
        maxEndColumn: 20,
        width: 20
    })

    const rightStyle = extend(defaultStyle, {
        textAlignment: "right",
        width: 50
    })

    const testCases = [{
            name: "Default works with an empty line.",
            style: defaultStyle,
            input: "",
            result: "\
/****\n\
 ****/\
"
        },
        {
            name: "Default works with multiple empty lines",
            style: defaultStyle,
            input: "\n\n",
            result: "\
/****\n\
 ****/\
"
        },
        {
            name: "Default works with a normal comment.",
            style: defaultStyle,
            input: "test",
            result: "\
/********\n\
 * test *\n\
 ********/\
"
        },
        {
            name: "Default works with a multi-line comment 1.",
            style: defaultStyle,
            input: "test\nmultiple lines",
            result: "\
/******************\n\
 *      test      *\n\
 * multiple lines *\n\
 ******************/\
"
        },
        {
            name: "Default works with a multi-line comment 2",
            style: defaultStyle,
            input: "multiple lines\n test",
            result: "\
/******************\n\
 * multiple lines *\n\
 *      test      *\n\
 ******************/\
"
        },
        {
            name: "Default works with a multi-line comment 3.",
            style: defaultStyle,
            input: "really\ntest\nmultiple lines",
            result: "\
/******************\n\
 *     really     *\n\
 *      test      *\n\
 * multiple lines *\n\
 ******************/\
"
        },
        {
            name: "Left alignment works with an empty line.",
            style: leftStyle,
            input: "",
            result: "\
/****\n\
 ****/\
"
        },
        {
            name: "Left alignment works with multiple empty lines",
            style: leftStyle,
            input: "\n\n",
            result: "\
/****\n\
 ****/\
"
        },
        {
            name: "Left alignment works with a normal comment.",
            style: leftStyle,
            input: "test",
            result: "\
/********\n\
 * test *\n\
 ********/\
"
        },
        {
            name: "Left alignment works with a multi-line comment 1.",
            style: leftStyle,
            input: "test\nmultiple lines",
            result: "\
/******************\n\
 * test           *\n\
 * multiple lines *\n\
 ******************/\
"
        },
        {
            name: "Left alignment works with a multi-line comment 2",
            style: leftStyle,
            input: "multiple lines\n test",
            result: "\
/******************\n\
 * multiple lines *\n\
 * test           *\n\
 ******************/\
"
        },
        {
            name: "Left alignment works with a multi-line comment 3.",
            style: leftStyle,
            input: "really\ntest\nmultiple lines",
            result: "\
/******************\n\
 * really         *\n\
 * test           *\n\
 * multiple lines *\n\
 ******************/\
"
        },
        {
            name: "Filling token works.",
            style: fillingTokenStyle,
            input: "really\ntest\nmultiple lines",
            result: "\
/******************\n\
 * ~~~~really~~~~ *\n\
 * ~~~~~test~~~~~ *\n\
 * multiple lines *\n\
 ******************/\
"
        },
        {
            name: "Filling token works with multiple characters.",
            style: multiCharfillingStyle,
            input: "test\nusing a really really long line",
            result: "\
/***********************************\n\
 * ~-~-~-~-~-~-~test-~-~-~-~-~-~-~ *\n\
 * using a really really long line *\n\
 ***********************************/\
"
        },
        {
            name: "Fixed width works with an empty comment.",
            style: fixedWidthStyle,
            input: "",
            result: "\
/*************************************************\n\
 *************************************************/\
"
        },
        {
            name: "Fixed width works with a normal comment.",
            style: fixedWidthStyle,
            input: "test",
            result: "\
/*************************************************\n\
 *                     test                      *\n\
 *************************************************/\
"
        },
        {
            name: "Fixed width works with multi-line comment 1.",
            style: fixedWidthStyle,
            input: "test\nwith multiple lines",
            result: "\
/*************************************************\n\
 *                     test                      *\n\
 *              with multiple lines              *\n\
 *************************************************/\
"
        },
        {
            name: "Fixed width works with multi-line comment 3.",
            style: fixedWidthStyle,
            input: "really\ntest\nmultiple lines",
            result: "\
/*************************************************\n\
 *                    really                     *\n\
 *                     test                      *\n\
 *                multiple lines                 *\n\
 *************************************************/\
"
        },
        {
            name: "Left aligned fixed width works with multi-line comment.",
            style: leftFixedWidthStyle,
            input: "really\ntest\nmultiple lines",
            result: "\
/*****************************\n\
 * really                    *\n\
 * test                      *\n\
 * multiple lines            *\n\
 *****************************/\
"
        },
        {
            name: "Keeping outer indentation intact.",
            style: outerIndentationStyle,
            input: "\treally\n\ttest\n\tmultiple lines",
            result: "\
    /******************\n\
     * really         *\n\
     * test           *\n\
     * multiple lines *\n\
     ******************/\
"
        },
        {
            name: "Keeping inner indentation intact.",
            style: innerIndentationStyle,
            input: "really\n\ttest\n\tmultiple lines",
            result: "\
/**********************\n\
 * really             *\n\
 *     test           *\n\
 *     multiple lines *\n\
 **********************/\
"
        },
        {
            name: "Keeping indentation intact 1.",
            style: keepIndentationStyle,
            input: "\treally\n\t\ttest\n\t\tmultiple lines",
            result: "\
    /**********************\n\
     * really             *\n\
     *     test           *\n\
     *     multiple lines *\n\
     **********************/\
"
        },
        {
            name: "Keeping indentation intact 2.",
            style: keepIndentationStyle,
            input: "\t\tmultiple lines\n\treally\n\t\ttest",
            result: "\
    /**********************\n\
     *     multiple lines *\n\
     * really             *\n\
     *     test           *\n\
     **********************/\
"
        },
        {
            name: "Correctly handles text with tabs.",
            style: widthEightTabs,
            input: "tabs\tin\tthe\tmiddle",
            result: "\
/**********************************\n\
 * tabs    in      the     middle *\n\
 **********************************/\
"
        },
        {
            name: "Correctly handles text with tabs and spaces, even with multiple lines.",
            style: widthEightTabs,
            input: "spaces  and     \ttabs\nwith\tmultiple\tlines",
            result: "\
/*********************************\n\
 * spaces  and             tabs  *\n\
 * with    multiple        lines *\n\
 *********************************/\
"
        },
        {
            name: "Correctly skips the top edge when top edge token is empty.",
            style: noTopEdgeStyle,
            input: "test",
            result: "\
/* test *\n\
 ********/\
"
        },
        {
            name: "Correctly skips the bottom edge when bottom edge token is empty.",
            style: noBottomEdgeStyle,
            input: "test",
            result: "\
/********\n\
 * test */\
"
        },
        {
            name: "Correctly draws a Python style comment.",
            style: pythonStyle,
            input: "this is a\nmulti-line comment example",
            result: "\
##############################\n\
#         this is a          #\n\
# multi-line comment example #\n\
##############################\
"
        },
        {
            name: "Correctly draws a Python style comment.",
            style: crazyStyle,
            input: "I LIVE ON THE EDGE\nSEE?",
            result: "\
// I like to pre-comment my comments\n\
/*==================+\n\
 |I LIVE ON THE EDGE|\n\
 |~-~-~-~SEE?~-~-~-~|\n\
 +==================*/\n\
// I like to post-comment my comments\
"
        },
        {
            name: "Works with unicode characters whose width differs from their length.",
            style: defaultStyle,
            input: "\
あ          \n\
ああ        \n\
あああ      \n\
ああああ    \n\
あああああ  \n\
ああああああ\
",
            result: "\
/****************\n\
 *      あ      *\n\
 *     ああ     *\n\
 *    あああ    *\n\
 *   ああああ   *\n\
 *  あああああ  *\n\
 * ああああああ *\n\
 ****************/\
"
        },
        {
            name: "Works with maxEndColumn 1",
            style: rightLimitStyle,
            input: "hello",
            result: "\
/*******************\n\
 * hello           *\n\
 *******************/"
        },
        {
            name: "Works with maxEndColumn 2",
            style: rightLimitStyle,
            input: "    hello",
            result: "\
    /***************\n\
     * hello       *\n\
     ***************/"
        },
        {
            name: "Works with right style",
            style: rightStyle,
            input: "    hello",
            result: "\
/*************************************************\n\
 *                                         hello *\n\
 *************************************************/"
        }
    ]

    test("addCommentBox", function () {
        testCases.forEach(({
            name,
            style,
            input,
            result
        }) => {
            assert.strictEqual(convertToCommentBox(input, style), result, name)
        })
    })


    test("findCommentBox", function () {
        function testFindComment(name, style, selections, document = "", properties) {
            document = document.split('\n').slice(1, -1).join('\n')

            if (!(selections[0] instanceof Array)) {
                selections = [selections]
            }

            for (const [selectionStart, selectionEnd] of selections) {
                const {
                    selection,
                    annotatedLines
                } = findStyledCommentBox(
                    selectionStart,
                    selectionEnd,
                    style,
                    fakeDocument(document)
                )

                assert.ok(
                    matchesProperties(properties, annotatedLines),
                    `${name} + ${[selectionStart, selectionEnd]}}`
                )
            }
        }

        testFindComment(
            "Not a comment",
            defaultStyle,
            [0, 0],
            `
hello
                `,
            [{
                text: 'hello'
            }]
        )

        testFindComment(
            "Not a comment (correct line)",
            defaultStyle,
            [1, 1],
            `
hello
hi
there
                `,
            [{
                text: 'hi'
            }]
        )

        testFindComment(
            "Find entire comment box",
            defaultStyle,
            [
                [0, 0],
                [1, 1],
                [2, 2],
                [0, 2],
                [0, 1],
                [1, 2]
            ],
            `
/********
 * test *
 ********/
                `,
            [{
                startToken: '/*'
            }, {
                text: 'test'
            }, {
                endToken: '**/'
            }]
        )

        testFindComment(
            "Always find the box",
            keepIndentationStyle,
            [
                [0, 0],
                [1, 1],
                [2, 2],
                [3, 3],
                [1, 2],
                [0, 3]
            ],
            `
    /*********************
     * this              *
     *     is a big test *
     *********************/
                `,
            [, {
                text: 'this'
            }, {
                leftFill: '    ',
                text: 'is a big test'
            }, ]
        )

        testFindComment(
            "Don't find the boxes",
            keepIndentationStyle,
            [
                [4, 4]
            ],
            `
    /*********************
     * this              *
     *     is a big test *
     *********************/
    hello
     /*********************
      * this              *
      *     is a big test *
      *********************/
        `,
            [{
                text: '    hello'
            }]
        )

        testFindComment(
            "Broken box",
            keepIndentationStyle,
            [
                [0, 6],
                [0, 3],
                [4, 6],
                [0, 0],
                [1, 1],
                [2, 2],
                [3, 3],
                [4, 4],
                [5, 5],
                [6, 6]
            ],
            `
    /*********************
     * this              *
     *     is a big test *
    hello
      * this              *
      *     is a big test *
        ***********/
        `,
            [{
                    startToken: '/*'
                },
                {
                    text: 'this'
                },
                {
                    text: 'is a big test'
                },
                {
                    text: '    hello'
                },
                {
                    text: 'this'
                },
                {
                    text: 'is a big test'
                },
                {
                    endToken: '**/'
                }
            ]
        )



    })

    test("removeCommentBox", function () {
        const baseStyle = {
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
            ignoreOuterIndentation: false,
            ignoreInnerIndentation: false,
            tabSize: 4
        }

        const pythonStyle = {
            startToken: "/*",
            endToken: "**/",
            fillingToken: " ",
            width: 0,
            removeEmptyLines: true,
            ignoreOuterIndentation: false,
            ignoreInnerIndentation: false,
            tabSize: 4,
            commentStartToken: "",
            commentEndToken: "##",
            leftEdgeToken: "# ",
            rightEdgeToken: " #",
            topEdgeToken: "#",
            bottomEdgeToken: "#",
            topRightToken: "##",
            bottomLeftToken: "##",
        }

        const styles = [
            ...objectCombinations({
                textAlignment: ["center", "left", "right"],
                ignoreOuterIndentation: [true, false],
                ignoreInnerIndentation: [true, false]
            }, baseStyle),
            ...objectCombinations({
                textAlignment: ["center", "left", "right"],
                ignoreOuterIndentation: [true, false],
                ignoreInnerIndentation: [true, false]
            }, pythonStyle),
        ]

        const strings = [
            `
hello
`, `
hi
there
`, `
hello
hi
`, `
hi there
    hello
`, `
    hi there
hello
`, `
hi
    hello
there
`, `
    hi
    hello
`, `
        hi
    hello
`, `
    hi
        hello
`, `
    hi
        there
            hello
`
        ]

        for (const comb of objectCombinations({
                style: styles,
                string: strings
            })) {
            let {
                style,
                string
            } = comb

            string = string.trim()
            const comment = convertToCommentBox(string, style)

            for (const [selStart, selEnd] of allSlices(0, lineCount(comment) - 1)) {
                const box = findStyledCommentBox(
                    selStart,
                    selEnd,
                    style,
                    fakeDocument(comment)
                )
                const newString = removeStyledCommentBox(box.annotatedLines, style)

                let expected = string
                let result = newString

                if (style.textAlignment === "center" ||
                    style.ignoreInnerIndentation && style.ignoreOuterIndentation) {
                    expected = trimLine(expected)
                    result = result
                } else if (style.ignoreOuterIndentation) {
                    expected = removeCommonIndentation(expected)
                }

                assert.strictEqual(trimLine(string), trimLine(newString), "\n" + comment)

            }
        }
    })


    test("findCommentBoxSelection", function () {
        testCases.forEach(({
            name,
            style,
            result
        }) => {
            if (style.startToken.indexOf('\n') !== -1 || style.endToken.indexOf('\n') !== -1) {
                return
            }

            const nbLines = (result.match(/\n/g) || '').length + 1
            const {
                selection,
                annotatedLines
            } = findStyledCommentBox(0, nbLines - 1, style, fakeDocument(result))

            assert.strictEqual(0, selection[0], name)
            assert.strictEqual(nbLines - 1, selection[1], name)
        })
    })
})



/** END **/
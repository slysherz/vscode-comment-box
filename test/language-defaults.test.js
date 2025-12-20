// @ts-check
// Tests for language-specific default configurations

const assert = require('assert')
const { convertToCommentBox } = require('../src/comment-box')
const packageJson = require('../package.json')
const stringWidth = require('string-width')

const baseStyle = {
    fillingToken: " ",
    width: 0,
    maxEndColumn: 0,
    textAlignment: "center",
    removeEmptyLines: true,
    ignoreOuterIndentation: true,
    ignoreInnerIndentation: true,
    tabSize: 4,
    capitalize: false,
    wordWrap: "off"
}

/**
 * Convert package.json configuration to test style object
 */
function configToStyle(config) {
    return {
        ...baseStyle,
        startToken: config["commentBox.commentStartToken"],
        endToken: config["commentBox.commentEndToken"],
        topRightToken: config["commentBox.topRightToken"],
        bottomLeftToken: config["commentBox.bottomLeftToken"],
        topEdgeToken: config["commentBox.topEdgeToken"],
        bottomEdgeToken: config["commentBox.bottomEdgeToken"],
        leftEdgeToken: config["commentBox.leftEdgeToken"],
        rightEdgeToken: config["commentBox.rightEdgeToken"],
    }
}

const configDefaults = packageJson.contributes.configurationDefaults

suite("Language Default Configuration Tests", function () {

    // JavaScript/C-style (default) - uses package.json defaults
    const jsStyle = {
        ...baseStyle,
        startToken: "/*",
        endToken: "**/",
        topRightToken: "**",
        bottomLeftToken: " **",
        topEdgeToken: "*",
        bottomEdgeToken: "*",
        leftEdgeToken: " * ",
        rightEdgeToken: " *",
    }

    const batStyle = configToStyle(configDefaults["[bat]"])
    const pythonStyle = configToStyle(configDefaults["[python][cmake][coffeescript][dockerfile][julia][jupyter][makefile][perl][powershell][r][raku][ruby][shellscript][toml][yaml]"])
    const texStyle = configToStyle(configDefaults["[tex][bibtex][latex]"])
    const lispStyle = configToStyle(configDefaults["[clojure][lisp][ini]"])
    const fsharpStyle = configToStyle(configDefaults["[fsharp]"])
    const htmlStyle = configToStyle(configDefaults["[html][markdown]"])
    const luaStyle = configToStyle(configDefaults["[lua][sql]"])
    const vbStyle = configToStyle(configDefaults["[vb]"])
    const ocamlStyle = configToStyle(configDefaults["[ocaml][reason]"])
    const fortranStyle = configToStyle(configDefaults["[fortran][fortran-modern]"])
    const haskellStyle = configToStyle(configDefaults["[haskell]"])
    const asmStyle = configToStyle(configDefaults["[asm][nasm][gas][arm]"])

    const testCases = [
        // JavaScript/C-style (default)
        {
            name: "JavaScript - Empty box",
            style: jsStyle,
            input: "",
            expected: `\
/****
 ****/`,
        },
        {
            name: "JavaScript - With text",
            style: jsStyle,
            input: "TEST",
            expected: `\
/********
 * TEST *
 ********/`,
        },

        // Python/Hash-style
        {
            name: "Python - Empty box",
            style: pythonStyle,
            input: "",
            expected: `\
####
####`,
        },
        {
            name: "Python - With text",
            style: pythonStyle,
            input: "TEST",
            expected: `\
########
# TEST #
########`,
        },

        // Batch file
        {
            name: "Batch - Empty box",
            style: batStyle,
            input: "",
            expected: `\
::::::
::::::`,
        },
        {
            name: "Batch - With text",
            style: batStyle,
            input: "TEST",
            expected: `\
::::::::::
:: TEST ::
::::::::::`,
        },

        // TeX/LaTeX
        {
            name: "TeX - Empty box",
            style: texStyle,
            input: "",
            expected: `\
%%%%
%%%%`,
        },
        {
            name: "TeX - With text",
            style: texStyle,
            input: "TEST",
            expected: `\
%%%%%%%%
% TEST %
%%%%%%%%`,
        },

        // Clojure/Lisp
        {
            name: "Lisp - Empty box",
            style: lispStyle,
            input: "",
            expected: `\
;;;;
;;;;`,
        },
        {
            name: "Lisp - With text",
            style: lispStyle,
            input: "TEST",
            expected: `\
;;;;;;;;
; TEST ;
;;;;;;;;`,
        },

        // F#
        {
            name: "F# - Empty box",
            style: fsharpStyle,
            input: "",
            expected: `\
//--+
//--+`,
        },
        {
            name: "F# - With text",
            style: fsharpStyle,
            input: "TEST",
            expected: `\
//------+
// TEST |
//------+`,
        },

        // HTML/Markdown
        {
            name: "HTML - Empty box",
            style: htmlStyle,
            input: "",
            expected: `\
<!------>
<!------>`,
        },
        {
            name: "HTML - With text",
            style: htmlStyle,
            input: "TEST",
            expected: `\
<!---------->
<!-- TEST -->
<!---------->`,
        },

        // Lua/SQL
        {
            name: "Lua - Empty box",
            style: luaStyle,
            input: "",
            expected: `\
------
------`,
        },
        {
            name: "Lua - With text",
            style: luaStyle,
            input: "TEST",
            expected: `\
----------
-- TEST --
----------`,
        },

        // Visual Basic
        {
            name: "VB - Empty box",
            style: vbStyle,
            input: "",
            expected: `\
''''
''''`,
        },
        {
            name: "VB - With text",
            style: vbStyle,
            input: "TEST",
            expected: `\
''''''''
' TEST '
''''''''`,
        },

        // OCaml/Reason
        {
            name: "OCaml - Empty box",
            style: ocamlStyle,
            input: "",
            expected: `\
(****)
(****)`,
        },
        {
            name: "OCaml - With text",
            style: ocamlStyle,
            input: "TEST",
            expected: `\
(********)
(* TEST *)
(********)`,
        },

        // Fortran
        {
            name: "Fortran - Empty box",
            style: fortranStyle,
            input: "",
            expected: `\
!!!!
!!!!`,
        },
        {
            name: "Fortran - With text",
            style: fortranStyle,
            input: "TEST",
            expected: `\
!!!!!!!!
! TEST !
!!!!!!!!`,
        },

        // Haskell
        {
            name: "Haskell - Empty box",
            style: haskellStyle,
            input: "",
            expected: `\
{----}
{----}`,
        },
        {
            name: "Haskell - With text",
            style: haskellStyle,
            input: "TEST",
            expected: `\
{--------}
{- TEST -}
{--------}`,
        },

        // Assembly
        {
            name: "Assembly - Empty box",
            style: asmStyle,
            input: "",
            expected: `\
;;;;
;;;;`,
        },
        {
            name: "Assembly - With text",
            style: asmStyle,
            input: "TEST",
            expected: `\
;;;;;;;;
; TEST ;
;;;;;;;;`,
        },
    ]

    for (const testCase of testCases) {
        test(testCase.name, function () {
            const result = convertToCommentBox(testCase.input, testCase.style)
            assert.strictEqual(result, testCase.expected,
                `Expected:\n${testCase.expected}\n\nGot:\n${result}`)
        })
    }

    // Test that right-side tokens have consistent width for proper alignment
    test("Right-side tokens should have equal width for alignment", function () {
        for (const [languageSelector, config] of Object.entries(configDefaults)) {
            const topRightWidth = stringWidth(config["commentBox.topRightToken"])
            const rightEdgeWidth = stringWidth(config["commentBox.rightEdgeToken"])
            const endTokenWidth = stringWidth(config["commentBox.commentEndToken"])

            assert.strictEqual(topRightWidth, rightEdgeWidth,
                `${languageSelector}: topRightToken width (${topRightWidth}) should equal rightEdgeToken width (${rightEdgeWidth})`)

            assert.strictEqual(topRightWidth, endTokenWidth,
                `${languageSelector}: topRightToken width (${topRightWidth}) should equal commentEndToken width (${endTokenWidth})`)
        }
    })
})
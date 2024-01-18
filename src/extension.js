// @ts-check
"use strict"

// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode')
const {
    convertToCommentBox,
    removeStyledCommentBox,
    updateStyledCommentBox,
    findStyledCommentBox
} = require('./comment-box')

/**
 * Define JSDoc types
 * @typedef {import('./comment-box').BoxStyle} BoxStyle
 * 
 * @typedef BoxConfiguration
 * @property {boolean} capitalize
 * @property {boolean} extendSelection
 * @property {string} commentStartToken
 * @property {string} commentEndToken
 * @property {string} topRightToken
 * @property {string} bottomLeftToken
 * @property {string} topEdgeToken
 * @property {string} bottomEdgeToken
 * @property {string} leftEdgeToken
 * @property {string} rightEdgeToken
 * @property {string} fillingToken
 * @property {number} boxWidth
 * @property {number} maxEndColumn
 * @property {string} wordWrap
 * @property {string} textAlignment
 * @property {boolean} removeEmptyLines
 * @property {boolean} ignoreOuterIndentation
 * @property {boolean} ignoreInnerIndentation
 * @property {boolean} hidden
 */

function ignore() {
    /* Do nothing */
}

/**
 * Find the tab size for the current document
 * @returns {number}
 */
function getTabSize() {
    return vscode.workspace
        .getConfiguration("editor", vscode.window.activeTextEditor.document.uri)
        .get("tabSize")
}

function toStringArray(value) {
    if (typeof value === "string") {
        return [value]
    }

    if (!value) {
        return []
    }

    return value
}

/**
 * @returns {BoxConfiguration} 
 */
function loadOldConfiguration() {
    const configuration = vscode.workspace.getConfiguration("commentBox")

    return mergeConfigurations([{
        capitalize: configuration.get("capitalize"),
        textAlignment: configuration.get("textAlignment"),
        boxWidth: configuration.get("boxWidth"),
        extendSelection: configuration.get("extendSelection"),
        commentStartToken: configuration.get("commentStartToken"),
        commentEndToken: configuration.get("commentEndToken"),
        topRightToken: configuration.get("topRightToken"),
        bottomLeftToken: configuration.get("bottomLeftToken"),
        topEdgeToken: configuration.get("topEdgeToken"),
        bottomEdgeToken: configuration.get("bottomEdgeToken"),
        leftEdgeToken: configuration.get("leftEdgeToken"),
        rightEdgeToken: configuration.get("rightEdgeToken"),
        fillingToken: configuration.get("fillingToken"),
        removeEmptyLines: configuration.get("removeEmptyLines"),
        ignoreOuterIndentation: configuration.get("ignoreOuterIndentation"),
        ignoreInnerIndentation: configuration.get("ignoreInnerIndentation"),
        // clearAroundText: configuration.get("textToEdgeSpace")
    }])
}

/**
 * Creates a new configuration by merging a list of configurations. Each configuration might be
 * incomplete, so when no value is provided for some setting, the default value is used
 * @param {object} configurations
 * @returns {BoxConfiguration}
 * @todo Investigate if VSCode can provide these defaults for us
 */
function mergeConfigurations(configurations) {
    // Start with the default configuration
    let result = {
        capitalize: true,
        textAlignment: "center",
        boxWidth: 0,
        maxEndColumn: 0,
        wordWrap: "false",
        extendSelection: true,
        commentStartToken: "/*",
        commentEndToken: "**/",
        topRightToken: "**",
        bottomLeftToken: " **",
        topEdgeToken: "*",
        bottomEdgeToken: "*",
        leftEdgeToken: " * ",
        rightEdgeToken: " *",
        fillingToken: " ",
        removeEmptyLines: true,
        ignoreOuterIndentation: true,
        ignoreInnerIndentation: true,
        hidden: false,
    }

    for (const config of configurations) {
        result = {
            ...result,
            ...config
        }
    }

    return result
}

/**
 * @param {BoxConfiguration} configuration 
 * @param {number} tabSize 
 * @returns {BoxStyle}
 */
function configurationToStyle(configuration, tabSize) {
    return {
        capitalize: configuration.capitalize,
        startToken: configuration.commentStartToken,
        endToken: configuration.commentEndToken,
        topRightToken: configuration.topRightToken,
        bottomLeftToken: configuration.bottomLeftToken,
        topEdgeToken: configuration.topEdgeToken,
        bottomEdgeToken: configuration.bottomEdgeToken,
        leftEdgeToken: configuration.leftEdgeToken,
        rightEdgeToken: configuration.rightEdgeToken,
        width: configuration.boxWidth,
        maxEndColumn: configuration.maxEndColumn,
        wordWrap: configuration.wordWrap,
        textAlignment: configuration.textAlignment,
        removeEmptyLines: configuration.removeEmptyLines,
        ignoreOuterIndentation: configuration.ignoreOuterIndentation,
        ignoreInnerIndentation: configuration.ignoreInnerIndentation,
        fillingToken: configuration.fillingToken || " ", // Cannot be empty
        tabSize
    }
}

function getExtendedSelection(editor, lineStart, lineEnd) {
    let last = editor.document.lineAt(lineEnd).range.end.character
    let selection = new(vscode.Selection)(
        lineStart,
        0,
        lineEnd,
        last)

    return selection;
}

function userSelection(editor, selection, options, extendSelection) {
    const startLine = selection.start.line
    const endLine = selection.end.line

    if (extendSelection) {
        // Let's extend the selection from the first character of the first line to the
        // last character of the last line
        selection = getExtendedSelection(editor, startLine, endLine)
    }

    return {
        selection,
        selectionText: editor.document.getText(selection)
    }
}

function getLineAccess(editor) {
    return function getLine(n) {
        if (n < 0 || n >= editor.document.lineCount) {
            return null
        }

        return editor.document.lineAt(n).text
    }
}

function findCommentSelection(editor, selection, options, extendSelection) {
    const startLine = selection.start.line
    const endLine = selection.end.line
    const {
        selection: slice,
        annotatedLines
    } = findStyledCommentBox(startLine, endLine, options, getLineAccess(editor))

    selection = getExtendedSelection(editor, slice[0], slice[1])

    return {
        selection: getExtendedSelection(editor, slice[0], slice[1]),
        selectionText: editor.document.getText(selection),
        annotatedLines
    }
}

function findAndRemoveStyledComment(editor, configuration) {
    const editOperations = editor.selections.map((current) => {
        let style = configurationToStyle(configuration, getTabSize())

        let {
            selection,
            selectionText: text,
            annotatedLines
        } = findCommentSelection(editor, current, style, configuration.extendSelection)

        text = removeStyledCommentBox(annotatedLines, style)

        return {
            text,
            selection,
        }
    })

    editor.edit(builder => {
        editOperations.forEach(({
            text,
            selection
        }) => {
            // We use insert + delete instead of replace so that the selection automatically
            // jumps to the end of the comment box
            builder.delete(selection)
            builder.insert(selection.anchor, text)
        })
    })
}

function findAndUpdateStyledComment(editor, configuration) {
    const editOperations = editor.selections.map((current) => {
        let style = configurationToStyle(configuration, getTabSize())

        let {
            selection,
            selectionText: text,
            annotatedLines
        } = findCommentSelection(editor, current, style, configuration.extendSelection)

        text = updateStyledCommentBox(annotatedLines, style)

        return {
            text,
            selection,
        }
    })

    editor.edit(builder => {
        editOperations.forEach(({
            text,
            selection
        }) => {
            // We use insert + delete instead of replace so that the selection automatically
            // jumps to the end of the comment box
            builder.delete(selection)
            builder.insert(selection.anchor, text)
        })
    })
}

function addStyledComment(editor, configuration) {
    const editOperations = editor.selections.map((current) => {
        let style = configurationToStyle(configuration, getTabSize())

        let {
            selection,
            selectionText: text
        } = userSelection(editor, current, style, configuration.extendSelection)

        text = convertToCommentBox(text, style)

        return {
            text,
            selection,
        }
    })

    editor.edit(builder => {
        editOperations.forEach(({
            text,
            selection
        }) => {
            // We use insert + delete instead of replace so that the selection automatically
            // jumps to the end of the comment box
            builder.delete(selection)
            builder.insert(selection.anchor, text)
        })
    })
}


function defaultStyleCommand(transformation) {
    return () => {
        let editor = vscode.window.activeTextEditor

        if (!editor) {
            // No open text editor
            return;
        }

        // Load user settings
        const oldDefaultStyle = loadOldConfiguration()

        let newDefaultStyle = tryGetConfiguration("defaultStyle")

        if (!newDefaultStyle) {
            return;
        }

        const configuration = mergeConfigurations([oldDefaultStyle, newDefaultStyle])

        // Apply transformation
        transformation(editor, configuration)
    }
}

function pickedStyleCommand(transformation) {
    return (...args) => {
        let editor = vscode.window.activeTextEditor

        if (!editor) {
            // No open text editor
            return;
        }

        // Load user settings
        const languageId = editor.document.languageId
        const styles = vscode.workspace.getConfiguration("commentBox", { languageId })
            .get("styles")

        // Check whether the style to be used was passed as an argument
        if (args.length) {
            // We already have the style, use it
            const styleName = "" + args[0]

            const style = tryGetConfiguration(styleName)
            if (!style) {
                return;
            }

            const configuration = mergeConfigurations([style])

            transformation(editor, configuration)
        } else {
            // No style was passed, ask the user
            const styleNames = Object.keys(styles).filter(style => !styles[style].hidden)
            if (styleNames.length === 0) {
                vscode.window.showErrorMessage(
                    "All styles are hidden, there are no styles to pick from."
                )
                return;
            }

            vscode.window.showQuickPick(styleNames).then((styleName) => {
                if (!styleName) {
                    // The user didn't pick any style
                    return;
                }

                const style = tryGetConfiguration(styleName)

                if (!style) {
                    // The user got a message something is wrong, don't do anything else
                    return;
                }

                const configuration = mergeConfigurations([style])

                transformation(editor, configuration)
            }, ignore)
        }
    }
}

/**
 * Tries to find a configuration with a given name in the user settings. If it doesn't exist, an
 * error notification is shown to the user and null is returned.
 * @param {string} styleName
 */
function tryGetConfiguration(styleName, checked = []) {
    if (checked.includes(styleName)) {
        vscode.window.showErrorMessage(
            "The following styles refer to each other in a cycle: " +
            checked.join(", ")
        )

        return null
    }

    const editor = vscode.window.activeTextEditor
    const languageId = editor.document.languageId
    const styles = vscode.workspace.getConfiguration("commentBox", { languageId }).get('styles')
    const style = styles[styleName]

    if (!style) {
        if (checked.length) {
            // Found a broken link
            const parentStyle = checked[checked.length - 1]
            vscode.window.showErrorMessage(
                `Style ${styleName} is based on ${parentStyle}, but the later doesn't exist.`)

        } else {
            vscode.window.showErrorMessage(`Style ${styleName} doesn't exist.`)
        }

        return null
    }

    const basedOn = toStringArray(style.basedOn)

    let parentStyles = []
    checked.push(styleName)
    for (const parentStyleName of basedOn) {
        const parentStyle = tryGetConfiguration(parentStyleName, checked)

        if (!parentStyle) {
            // Failed to get parent style for some reason, child also fails
            return null
        }

        parentStyles.push(parentStyle)
    }

    console.assert(styleName === checked.pop())

    return mergeConfigurations([...parentStyles, style])
}

// When the extension is activated
function activate(context) {
    const commands = [
        ['commentBox.add', defaultStyleCommand, addStyledComment],
        ['commentBox.remove', defaultStyleCommand, findAndRemoveStyledComment],
        ['commentBox.update', defaultStyleCommand, findAndUpdateStyledComment],
        ['commentBox.addUsingStyle', pickedStyleCommand, addStyledComment],
        ['commentBox.removeUsingStyle', pickedStyleCommand, findAndRemoveStyledComment],
        ['commentBox.updateUsingStyle', pickedStyleCommand, findAndUpdateStyledComment],
        // Deprecated
        ['extension.commentBox', defaultStyleCommand, addStyledComment],
        ['commentBox.transformUsingStyle', pickedStyleCommand, addStyledComment]
    ]

    for (const [name, command, transformation] of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(
            name,
            command(transformation)
        ))
    }
}

// Export additional functions for testing purposes
module.exports = {
    activate,
    deactivate: ignore,
    mergeConfigurations,
    configurationToStyle,
    getTabSize
}

/** END **/
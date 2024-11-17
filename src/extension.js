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
const {
    getDefaultStyleAndConfig,
    tryGetStyleAndConfig,
    getStyleList,
} = require('./configuration')

/**
 * @typedef {import('./configuration').StyleAndConfig} StyleAndConfig
 */

function ignore() {
    /* Do nothing */
}

function getExtendedSelection(editor, lineStart, lineEnd) {
    let last = editor.document.lineAt(lineEnd).range.end.character
    let selection = new (vscode.Selection)(
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

/**
 * @param {vscode.TextEditor} editor 
 * @param {import('./configuration').StyleAndConfig} param1 
 */
function findAndRemoveStyledComment(editor, { style, config }) {
    const editOperations = editor.selections.map((current) => {
        let {
            selection,
            selectionText: text,
            annotatedLines
        } = findCommentSelection(editor, current, style, config.extendSelection)

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

/**
 * @param {vscode.TextEditor} editor 
 * @param {import('./configuration').StyleAndConfig} param1 
 */
function findAndUpdateStyledComment(editor, { style, config }) {
    const editOperations = editor.selections.map((current) => {
        let {
            selection,
            selectionText: text,
            annotatedLines
        } = findCommentSelection(editor, current, style, config.extendSelection)

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

/**
 * @param {vscode.TextEditor} editor 
 * @param {import('./configuration').StyleAndConfig} param1 
 */
function addStyledComment(editor, { style, config }) {
    const editOperations = editor.selections.map((current) => {
        let {
            selection,
            selectionText: text
        } = userSelection(editor, current, style, config.extendSelection)

        // text = convertToCommentBox(text, style)
        text = JSON.stringify(getStyleList(), null, 4)
        text += '\n' + JSON.stringify(style, null, 4)

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
        const style = getDefaultStyleAndConfig()
        if (!style) {
            // The user got a message something is wrong, don't do anything else
            return;
        }

        // Apply transformation
        transformation(editor, style)
    }
}

function pickedStyleCommand(transformation) {
    return (...args) => {
        let editor = vscode.window.activeTextEditor

        if (!editor) {
            // No open text editor
            return;
        }

        // Check whether the style to be used was passed as an argument
        if (args.length) {
            // We already have the style, use it
            const styleName = "" + args[0]

            const style = tryGetStyleAndConfig(styleName)
            if (!style) {
                return;
            }

            transformation(editor, style)
        } else {
            // No style was passed, ask the user
            const styleNames = getStyleList()
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

                const style = tryGetStyleAndConfig(styleName)

                if (!style) {
                    // The user got a message something is wrong, don't do anything else
                    return;
                }

                transformation(editor, style)
            }, ignore)
        }
    }
}

// When the extension is activated
function activate(context) {
    /**
     * @type {Array<[string, Function, Function]>}
     */
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
}

/** END **/

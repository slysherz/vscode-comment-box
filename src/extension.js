"use strict"

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const {
    convertTabsToSpaces,
    convertToCommentBox
} = require('./comment-box')


// When the extension is activated
function activate(context) {
    // Register comment box command
    const commentBox = vscode.commands.registerCommand('extension.commentBox', function () {
        let editor = vscode.window.activeTextEditor
        let document = editor.document

        if (!editor) {
            // No open text editor
            return;
        }

        // Load user settings
        const configuration             = vscode.workspace.getConfiguration("commentBox")
        const capitalize                = configuration.get("capitalize")
        const textAlignment             = configuration.get("textAlignment")
        const width                     = configuration.get("boxWidth")
        const extendSelection           = configuration.get("extendSelection")
        const startToken                = configuration.get("commentStartToken")
        const endToken                  = configuration.get("commentEndToken")
        const topRightToken             = configuration.get("topRightToken")
        const bottomLeftToken           = configuration.get("bottomLeftToken")
        const topEdgeToken              = configuration.get("topEdgeToken")
        const bottomEdgeToken           = configuration.get("bottomEdgeToken")
        const leftEdgeToken             = configuration.get("leftEdgeToken")
        const rightEdgeToken            = configuration.get("rightEdgeToken")
        const fillingToken              = configuration.get("fillingToken")
        //const clearAroundText         = configuration.get("textToEdgeSpace")
        const removeEmptyLines          = configuration.get("removeEmptyLines")
        const ignoreOuterIndentation    = configuration.get("ignoreOuterIndentation")
        const ignoreInnerIndentation    = configuration.get("ignoreInnerIndentation")

        const editOperations = editor.selections.map((selection) => {
            if (extendSelection) {
                // Let's extend the selection from the first character of the first line
                // to the last character of the last line
                let last = editor.document.lineAt(selection.end.line).range.end.character
                selection = new(vscode.Selection)(selection.start.line, 0, selection.end.line, last)
            }

            const tabSize = vscode.workspace.getConfiguration("editor").get("tabSize")
            let text = convertTabsToSpaces(document.getText(selection), tabSize)

            if (capitalize) text = text.toUpperCase()

            text = convertToCommentBox(text, {
                startToken,
                endToken,
                topRightToken,
                bottomLeftToken,
                topEdgeToken,
                bottomEdgeToken,
                leftEdgeToken,
                rightEdgeToken,
                fillingToken: fillingToken.length ? 
                    fillingToken :
                    " ", 
                width,
                //clearAroundText,
                textAlignment,
                removeEmptyLines,
                ignoreOuterIndentation,
                ignoreInnerIndentation
            })

            return {
                text: text,
                selection: selection,
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
    })

    context.subscriptions.push(commentBox)
}
exports.activate = activate;


function deactivate() { /* Do nothing */ }
exports.deactivate = deactivate;

/** END **/
// @ts-check
"use strict"

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const {
    maxWidth,
    padRight,
    padToCenter
} = require('./comment-box')


// When the extension is activated
function activate(context) {
    // Register comment box command
    let commentBox = vscode.commands.registerCommand('extension.commentBox', function () {
        let editor = vscode.window.activeTextEditor;
        let document = editor.document;

        if (!editor) {
            // No open text editor
            return;
        }
        
        // Load user settings
        let configuration   = vscode.workspace.getConfiguration("commentBox")
        let capitalize      = configuration.get("capitalize")
        let extendSelection = configuration.get("extendSelection")
        let startToken      = configuration.get("commentStartToken")
        let endToken        = configuration.get("commentEndToken")
        let lineStartToken  = configuration.get("leftEdgeToken")
        let lineEndToken    = configuration.get("rightEdgeToken")
        let fillingToken    = configuration.get("fillingToken")
        let firstFillToken  = configuration.get("topEdgeToken")
        let lastFillToken   = configuration.get("bottomEdgeToken")
        let align           = configuration.get("textAlignment")
        let clearAroundText = configuration.get("textToEdgeSpace")
        
        let selection = editor.selection;
        
        if (extendSelection) {
            // Let's extend the selection from the first character of the first line
            // to the last character of the last line
            let last = editor.document.lineAt(selection.end.line).range.end.character
            selection = new (vscode.Selection)(selection.start.line, 0, selection.end.line, last)
        }

        let text = document.getText(selection)

        if (capitalize) text = text.toUpperCase()

        let lines = text.split(/\s*\n\s*/)
        let maxLineWidth = maxWidth(lines)
        
        let edgesWidth = lineStartToken.length + lineEndToken.length
        
        // Calculate width of the box
        let width = configuration.get("boxWidth") || maxLineWidth + edgesWidth + 2 * clearAroundText
        let alignmentStyle = {
            center: padToCenter,
            left: padRight
        }[align]
        
        lines = lines
            // Make sure all lines have the same width
            .map(line => alignmentStyle(line, maxLineWidth, " "))

            // Add space to separate from edges
            .map(line => padToCenter(line, maxLineWidth + 2 * clearAroundText, " "))

            // Extend lines to match desired with, using the choosen filling token
            .map(line => padToCenter(line, width - edgesWidth, fillingToken))
        
        let lineFlip = lineEndToken + "\n" + lineStartToken

        text = padRight(startToken, width, firstFillToken) + "\n" + 
            lineStartToken + lines.join(lineFlip) + lineEndToken + "\n" + 
            padRight(lineStartToken, width, lastFillToken) + endToken

        let resultLines = text.split(/\n/g)
        let newLineSpan = resultLines.length - 1
        let endLine = selection.start.line + newLineSpan
        let finalAnchor = new (vscode.Position)(endLine, resultLines[newLineSpan].length)

        editor.edit(builder => {
            builder.replace(selection, text);
        })

        editor.selection = new vscode.Selection(finalAnchor, finalAnchor)
    });

    context.subscriptions.push(commentBox);
}
exports.activate = activate;


function deactivate() { /* Do nothing */ }
exports.deactivate = deactivate;

/** END **/
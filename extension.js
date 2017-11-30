// @ts-check
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

function maxWidth (lines) {
    let result = 0;

    for (let line of lines) {
        let width = line.length

        result = Math.max(result, width)
    }

    return result;
}

function padRight (string, width, token = " ") {
    let position = 0
    let str = string

    while (str.length < width) {
        str += token[position++ % token.length]
    }

    return str
}

function padToCenter (string, width, token = " ") {
    let difference = width - string.length
    let str = padRight("", Math.floor(difference / 2), token) + string

    return padRight(str, width, token)
}

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
        let text = ""
        
        if (extendSelection) {
            // Let's extend the selection from the first character of the first line
            // to the first character of the line after the last
            let last = editor.document.lineAt(selection.end.line).range.end.character
            let extendSel = new (vscode.Range)(selection.start.line, 0, selection.end.line, last)
            text = document.getText(extendSel)
        } else {
            // Use the current selection, but add a new line at the start
            text = document.getText(selection)
        }

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
            padRight(lineStartToken, width, lastFillToken) + endToken + "\n"

        if (!extendSelection) {
            text = "\n" + text
        }

        editor.edit(builder => {
            builder.replace(selection, text);
        })
    });

    context.subscriptions.push(commentBox);
}
exports.activate = activate;


function deactivate() { /* Do nothing */ }
exports.deactivate = deactivate;

/** END **/
//@ts-check
"use strict"

// Calculates the maximum width in a list of strings
function maxWidth(lines) {
    let result = 0;

    for (let line of lines) {
        let width = line.length

        result = Math.max(result, width)
    }

    return result;
}

// Extends a string up to 'width' by filling with the token characters from the right
function padRight(string, width, token = " ") {
    let position = 0
    let str = string

    while (str.length < width) {
        str += token[position++ % token.length]
    }

    return str
}

// Extends a string up to 'width' by filling with the token characters from both sides
function padToCenter(string, width, token = " ") {
    // TODO: Find a better way to handle the cut in the middle
    let difference = width - string.length

    if (difference <= 0) {
        return string
    }

    let str = padRight("", Math.floor(difference / 2), token) + string

    return padRight(str, width, token)
}

function convertToCommentBox(text = "", {
    startToken,
    endToken,
    topEdgeToken,
    bottomEdgeToken,
    leftEdgeToken,
    rightEdgeToken,
    fillingToken,
    width,
    clearAroundText,
    align
} = {
    startToken: "/",
    endToken: "/",
    topEdgeToken: "*",
    bottomEdgeToken: "*",
    leftEdgeToken: " *",
    rightEdgeToken: "*",
    fillingToken: " ",
    width: 0,
    clearAroundText: 1,
    align: "left",
}) {
    let lines = text
        .replace(/^\s*/, "")    // Remove empty space at the beginning
        .replace(/\s*$/, "")    // Remove empty space at the end
        .split(/\s*\n\s*/)      // Cut by newline, and remove empty space
    let maxLineWidth = maxWidth(lines)

    let edgesWidth = leftEdgeToken.length + rightEdgeToken.length

    // Calculate width of the box
    if (!width) 
        width = maxLineWidth + edgesWidth + 2 * clearAroundText

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

    const lineFlip = rightEdgeToken + "\n" + leftEdgeToken
    const widthWithoutRightEdge = width - rightEdgeToken.length

    let result = ""
    result += padRight(startToken, widthWithoutRightEdge, topEdgeToken) + lineFlip
    result += lines.join(lineFlip) + rightEdgeToken + "\n"
    result += padRight(leftEdgeToken, widthWithoutRightEdge, bottomEdgeToken) + endToken

    return result
}

module.exports = {
    maxWidth,
    padRight,
    padToCenter,
    convertToCommentBox
}

/** END **/
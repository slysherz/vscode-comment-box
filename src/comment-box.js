"use strict"

function reverseString(string) {
    let result = "";

    for (let i = string.length - 1; i >= 0; i--) {
        result += string[i]
    }

    return result
}

/**
 * Calculates the width of the last line on a string.
 * @todo Change this so it also works with '\r'
 * @param {string} string
 * @returns {number}
 */
function widthOfLastLine(string) {
    const lastNewlinePos = string.lastIndexOf("\n")

    return lastNewlinePos === - 1 ?
        string.length :
        string.length - lastNewlinePos - 1
}

/**
 * Calculates the maximum width in a list of strings
 * @param {string[]} lines  List with the strings
 * @returns {number}
 */
function maxWidth(lines) {
    let result = 0;

    for (let line of lines) {
        let width = line.length

        result = Math.max(result, width)
    }

    return result;
}

/**
 * Extends a string up to 'width' characters, by filling it with the token characters from the right
 * @param {string} string   The string which will be extended
 * @param {number} width    The width we want the new string to have
 * @param {string} token    The characters that will be used to extend the string
 */
function padRight(string, width, token) {
    let position = 0
    let str = string
    let tokensLeft = width - widthOfLastLine(str)
    
    for (let i = 0; i < tokensLeft; i++) {
        str += token[i % token.length]
    }

    return str
}

/**
 * Extends a string up to 'width' characters, by filling it with the token characters from both sides
 * The token characters are inserted from the edges to the middle, so that the edges always look the same
 * @param {string} string   The string which will be extended
 * @param {number} width    The width we want the new string to have
 * @param {string} token    The characters that will be used to extend the string
 */
function padToCenter(string, width, token) {
    const difference = width - string.length

    if (difference <= 0) {
        return string
    }

    const leftPadSize = Math.floor(difference / 2)
    const rightPadSize = width - leftPadSize - string.length

    return padRight("", leftPadSize, token) +
        string +
        reverseString(padRight("", rightPadSize, token))
}

/**
 * @typedef BoxStyle
 * @property {string} startToken
 * @property {string} endToken
 * @property {string} topRightToken,
 * @property {string} bottomLeftToken,
 * @property {string} topEdgeToken
 * @property {string} bottomEdgeToken
 * @property {string} leftEdgeToken
 * @property {string} rightEdgeToken
 * @property {string} fillingToken
 * @property {number} width
 * @property {string} align
 * 
 * @param {string} text
 * @param {BoxStyle} options
 */
function convertToCommentBox(text, options) {
    const {
        startToken,
        endToken,
        topRightToken,
        bottomLeftToken,
        topEdgeToken,
        bottomEdgeToken,
        leftEdgeToken,
        rightEdgeToken,
        fillingToken,
        width: desiredWidth,
        //clearAroundText,
        align
    } = options

    let lines = text
        .replace(/^\s*/, "") // Remove empty space at the beginning
        .replace(/\s*$/, "") // Remove empty space at the end
        .split(/\s*\n\s*/) // Cut by newline, and remove empty space

    const maxLineWidth = maxWidth(lines)

    const edgesWidth = leftEdgeToken.length + rightEdgeToken.length

    // Calculate width of the box
    const width = desiredWidth || maxLineWidth + edgesWidth

    const alignmentStyle = {
        center: padToCenter,
        left: padRight
    }[align]

    lines = lines/*
        // Make sure all lines have the same width
        .map(line => alignmentStyle(line, maxLineWidth, " "))

        // Add space to separate from edges
        .map(line => padToCenter(line, maxLineWidth + 2 * clearAroundText, " "))
*/
        // Extend lines to match desired width, using the choosen filling token
        .map(line => alignmentStyle(line, width - edgesWidth, fillingToken))

    /**
     * Box layout
     * 
     * The symbol '~' means that we repeat the token until it aligns with the other lines.
     * 
     *          [startToken][~~~~~~~~~~~~~~~~topEdgeToken~~~~~~~~~~~~~][topRightToken]
     * Repeat:  [leftEdgeToken][~fillingToken~~][line][~~fillingToken~][rightEdgeToken]
     *          [bottomLeftToken][~~~~~~~~~~bottomEdgeToken~~~~~~~~~~~][endToken]
     * 
     * If 'topEdgeToken' or 'bottomEdgeToken' is set to an empty string, we'll skip drawing the
     * first or last line respectively.
     */

    const widthWithoutRightEdge = width - rightEdgeToken.length

    const midLines = lines.join(rightEdgeToken + "\n" + leftEdgeToken)

    const firstLine = topEdgeToken === "" ?
        startToken :
        padRight(startToken, widthWithoutRightEdge, topEdgeToken) + topRightToken + "\n" +
        leftEdgeToken

    const lastLine = bottomEdgeToken === "" ?
        endToken :
        rightEdgeToken + "\n" +
        padRight(bottomLeftToken, widthWithoutRightEdge, bottomEdgeToken) + endToken

    return firstLine + midLines + lastLine
}

module.exports = {
    maxWidth,
    padRight,
    padToCenter,
    widthOfLastLine,
    convertToCommentBox
}

/** END **/
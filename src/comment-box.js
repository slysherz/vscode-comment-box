"use strict"

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
 * Assume indentation uses spaces only
 * @param {string[]} strings List of strings
 * @returns {number} The number of spaces by which all lines are indented
 */
function findIndentationLevel(strings) {
    const width = maxWidth(strings)

    // First we try to find the indentation level of the leftmost character which is not a space
    for (let level = 0; level < width; level++) {
        for (let string of strings) {
            if (string.length > level && string[level] !== " ") {
                return level;
            }
        }
    }

    // If we don't find one, we use the length of the largest string
    return width;
}

/**
 * @param {string[]} strings List of strings
 * @param {number} levels
 * @returns {string[]}
 */
function dedentBy(strings, levels) {
    return strings.map(s => s.slice(levels))
}

/**
 * @param {string[]} strings List of strings
 * @param {number} levels
 * @returns {string[]}
 */
function indentBy(strings, levels) {
    const indentation = " ".repeat(levels)

    return strings.map(s => indentation + s)
}

/**
 * Converts tab characters to spaces, without changing the text.
 * Assumes that there are no newline characters in the string.
 * @param {string} string
 * @param {number} tabWidth
 */
function convertTabsToSpaces(string, tabWidth) {
    if (tabWidth <= 0) {
        return string.replace("\t", "")
    }

    let result = ""

    for (let i = 0; i < string.length; i++) {
        if (string[i] === "\t") {
            const widthLeft = tabWidth - (i % tabWidth)
            result += " ".repeat(widthLeft)
        } else {
            result += string[i]
        }
    }

    return result;
}

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
 * @property {string} textAlignment
 * @property {boolean} removeEmptyLines
 * @property {boolean} ignoreOuterIndentation
 * @property {boolean} ignoreInnerIndentation
 * @property {number} tabSize
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
        textAlignment,
        removeEmptyLines,
        ignoreOuterIndentation,
        ignoreInnerIndentation,
        tabSize
    } = options

    let lines = text
        // Split text by newlines
        .split(/\n/)
        // Remove empty lines
        .filter(s => !removeEmptyLines || s.match(/\S/))
        // Remove space to the right
        .map(s => s.replace(/\s*$/, ""))
        // Remove tabs
        .map(line => convertTabsToSpaces(line, tabSize))

    const indentationLevel = findIndentationLevel(lines)
    lines = dedentBy(lines, indentationLevel)

    // Deal with inner indentation
    const innerIndentationRegxp = /^\s*/
    lines = lines.map(line => {
        // Inner indentation doesn't make sense with centered text
        if (ignoreInnerIndentation || textAlignment === "center") {
            // Remove space to the left
            return line.replace(innerIndentationRegxp, "")
        }

        // Replace space with fillingToken
        const indentation = line.match(innerIndentationRegxp)[0]
        const indentationWidth = indentation.length

        return line.replace(
            indentation, 
            reverseString(padRight("", indentationWidth, fillingToken)))
    })

    const maxLineWidth = maxWidth(lines)

    const edgesWidth = leftEdgeToken.length + rightEdgeToken.length

    // Calculate width of the box
    const width = desiredWidth || maxLineWidth + edgesWidth

    const alignmentStyle = {
        center: padToCenter,
        left: padRight
    }[textAlignment]

    lines = lines
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
    const skipFirstLine = topEdgeToken === ""
    const skipLastLine = bottomEdgeToken === ""

    const firstLine = skipFirstLine ?
        "" :
        padRight(startToken, widthWithoutRightEdge, topEdgeToken) + topRightToken + "\n"

    const midLines = lines
        .map((str, line) => {
            const left = line === 0 && skipFirstLine ?
                startToken :
                leftEdgeToken

            const right = line === lines.length - 1 && skipLastLine ?
                endToken :
                rightEdgeToken

            const newline = line === lines.length - 1 && skipLastLine ?
                "" :
                "\n"

            return left + str + right + newline;
        })
        .join("")

    const lastLine = skipLastLine ?
        "" :
        padRight(bottomLeftToken, widthWithoutRightEdge, bottomEdgeToken) + endToken

    const result = firstLine + midLines + lastLine

    if (!ignoreOuterIndentation) {
        return indentBy(result.split("\n"), indentationLevel).join("\n");
    }

    return result;
}

module.exports = {
    maxWidth,
    findIndentationLevel,
    convertTabsToSpaces,
    padRight,
    padToCenter,
    widthOfLastLine,
    convertToCommentBox
}

/** END **/
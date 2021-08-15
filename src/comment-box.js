// @ts-check
"use strict"

// When working with strings, we use two similar but different concepts:
// length: the number of characters the string contains.
// width: the amount of space that the string takes, measured in spaces.
// For some special characters (newlines, unicode) these do not match and we need to think carefully
// about which one we're using.

const stringWidth = require("string-width")

/**
 * Generates a list with the string character by character
 * @todo Add support for grapheme clusters
 * @param {string} str 
 * @returns {string[]}
 */
function splitByCharPoints(str) {
    return [...str]
}

/**
 * Assume indentation uses spaces only
 * @param {string[]} strings List of strings
 * @returns {number} The number of spaces by which all lines are indented
 */
function findIndentationLevel(strings) {
    const maxLength = strings.reduce((max, str) => Math.max(max, str.length), 0)

    // First we try to find the indentation level of the leftmost character which is not a space
    for (let level = 0; level < maxLength; level++) {
        for (let string of strings) {
            if (string.length > level && string[level] !== " ") {
                return level;
            }
        }
    }

    // If we don't find one, we use the length of the largest string
    return maxLength
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
 * Converts tab characters to spaces, without changing the text
 * Assumes that there are no newline characters in the string
 * @param {string} string
 * @param {number} tabWidth
 */
function convertTabsToSpaces(string, tabWidth) {
    if (tabWidth <= 0) {
        return string.replace("\t", "")
    }

    let slices = string.split("\t")

    // There is no tab after the last slice, so we skip it
    const lastSlice = slices.pop()

    let result = ""
    for (const slice of slices) {
        const thisTabWidth = tabWidth - stringWidth(slice) % tabWidth
        result += slice + " ".repeat(thisTabWidth)
    }

    return result + lastSlice
}

/**
 * Reverses the order of the characters
 * @param {string} string
 */
function reverseString(string) {
    return splitByCharPoints(string).reverse().join("")
}

function findLastIndex(array, predicate) {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}

/**
 * Calculates the width of the last line on a string.
 * @todo Change this so it also works with '\r'
 * @param {string} string
 * @returns {number}
 */
function widthOfLastLine(string) {
    const lastNewlinePos = string.lastIndexOf("\n")
    const lastLine = lastNewlinePos === - 1 ?
        string :
        string.slice(lastNewlinePos + 1)

    return stringWidth(lastLine)
}

/**
 * Extends a string up to 'width' characters, by filling it with the token characters from the right
 * @todo Find a better way to avoid infinite loops
 * @param {string} string   The string which will be extended
 * @param {number} width    The width we want the new string to have
 * @param {string} token    The characters that will be used to extend the string
 */
function padRight(string, width, token) {
    const tokens = splitByCharPoints(token)
    let tokensLeft = width - widthOfLastLine(string)

    let i = 0
    while (tokensLeft >= stringWidth(tokens[i])) {
        string += tokens[i]
        tokensLeft -= Math.max(1, stringWidth(tokens[i]))
        i = (i + 1) % tokens.length
    }

    // In case we couldn't pad to the end, add spaces
    return string + " ".repeat(tokensLeft)
}

/**
 * Extends a string up to 'width' characters, by filling it with the token characters from both sides
 * The token characters are inserted from the edges to the middle, so that the edges always look the same
 * @param {string} string   The string which will be extended
 * @param {number} width    The width we want the new string to have
 * @param {string} token    The characters that will be used to extend the string
 */
function padToCenter(string, width, token) {
    const difference = width - stringWidth(string)

    if (difference <= 0) {
        return string
    }

    const leftPadSize = Math.floor(difference / 2)
    const rightPadSize = width - leftPadSize - stringWidth(string)

    return padRight("", leftPadSize, token) +
        string +
        reverseString(padRight("", rightPadSize, token))
}

/**
 * @param {string} string
 * @param {string} start
 * @param {string} fill
 * @param {string} end
 * @returns {boolean}
 */
function isTopOrBottonLine(string, start, fill, end) {
    if (!string.startsWith(start) || !string.endsWith(end)) {
        return false
    }

    const mid = string.slice(start.length, -end.length)
    const fillCP = splitByCharPoints(fill)
    
    return splitByCharPoints(mid).every(cp => fillCP.includes(cp))
}

/**
 * @param {string} string
 * @param {string} start
 * @param {string} end
 * @returns {[number, number]|null} [start, end] if it is a comment line, null otherwise
 */
function matchLineComment(string, start, end) {
    const iStart = string.search(start)

    if (iStart === -1) {
        return null;
    }

    const iEnd = string.lastIndexOf(end)

    if (iEnd === -1) {
        return null;
    }

    if (iStart + start.length > iEnd) {
        return null;
    }

    return [iStart + start.length, iEnd];
}

/**
 * @param {string} string
 * @param {string} start
 * @param {string} fill
 * @param {string} end
 */
function removeLineComment(string, start, fill, end, keepSpace = false) {
    const commentPos = matchLineComment(string, start, end)

    // If these don't match, we leave the line as it is
    if (!commentPos) {
        return string
    }

    const [comStart, comEnd] = commentPos

    // Remove the start and end of the comment
    const innerStr = string.slice(comStart, comEnd)

    if (stringWidth(fill) === 0) {
        return innerStr;
    } 

    const fillCP = splitByCharPoints(fill)

    let skipped = ""
    let result = innerStr
    for (let i = 0; result.length; i++) {
        const token = fillCP[i % fillCP.length]
        
        if (!result.startsWith(token)) {
            break
        }
        
        result = result.slice(token.length)
        skipped += token
    }

    for (let i = 0; result.length; i++) {
        const token = fillCP[i % fillCP.length]
        
        if (!result.endsWith(token)) {
            break
        }
        
        result = result.slice(0, result.length - token.length)
    }

    const spaces = keepSpace
        ? stringWidth(skipped)
        : 0

    return " ".repeat(spaces) + result
}

/**
 * @typedef BoxStyle
 * @property {boolean} capitalize
 * @property {string} startToken
 * @property {string} endToken
 * @property {string} topRightToken
 * @property {string} bottomLeftToken
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
        capitalize,
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

    if (capitalize) {
        text = text.toUpperCase()
    }

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
        const indentationWidth = stringWidth(indentation)

        return line.replace(
            indentation,
            reverseString(padRight("", indentationWidth, fillingToken)))
    })

    const maxLineWidth = lines.reduce((max, str) => Math.max(max, stringWidth(str)), 0)

    const edgesWidth = stringWidth(leftEdgeToken) + stringWidth(rightEdgeToken)

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

    const widthWithoutRightEdge = width - stringWidth(rightEdgeToken)
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
                rightEdgeToken + "\n"

            return left + str + right;
        })
        .join("")

    const lastLine = skipLastLine ?
        "" :
        padRight(bottomLeftToken, widthWithoutRightEdge, bottomEdgeToken) + endToken

    const result = firstLine + midLines + lastLine

    if (!ignoreOuterIndentation) {
        // The whole box might be indented, do it at the end
        return indentBy(result.split("\n"), indentationLevel).join("\n");
    }

    return result;
}

/**
 * Add lines to styled comment box
 * 
 * @param {string} text
 * @param {BoxStyle} options
 */
function addLinesToStyledCommentBox(text, options) {

}

/**
 * Remove comment box from a piece of text that we know was built by a given style. It might have
 * been modified in the meantime, it won't match exactly
 * 
 * @param {string} text
 * @param {BoxStyle} options
 */
function removeStyledCommentBox(text, options) {
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
        // width: desiredWidth,
        //clearAroundText,
        textAlignment,
        removeEmptyLines,
        ignoreOuterIndentation,
        ignoreInnerIndentation,
        tabSize
    } = options

    const keepSpace = textAlignment !== "center"

    let lines = text
        // Split text by newlines
        .split(/\n/)
        // Remove space to the right
        .map(s => s.replace(/\s*$/, ""))
        // Remove tabs
        .map(line => convertTabsToSpaces(line, tabSize))

    const indentationLevel = findIndentationLevel(lines)
    lines = dedentBy(lines, indentationLevel)

    let result = []

    // Out of the box, look for top row first, inside box look for top line first
    // Outside look for bottom line first
    let inBox = false
    lines.forEach(line => {
        const matched = inBox
            ? isTopOrBottonLine(line, startToken, topEdgeToken, topRightToken)
            : isTopOrBottonLine(line, bottomLeftToken, bottomEdgeToken, endToken)

        if (matched) {
            inBox = !inBox
            return;
        }

        const cleanLine = removeLineComment(line, leftEdgeToken, fillingToken, rightEdgeToken, keepSpace)
        if (cleanLine != line) {
            result.push(cleanLine)
            return;
        }
        
        const matchedEnd = inBox
            ? isTopOrBottonLine(line, bottomLeftToken, bottomEdgeToken, endToken)
            : isTopOrBottonLine(line, startToken, topEdgeToken, topRightToken)

        if (matchedEnd) {
            return;
        }

        // Not part of the box?
        result.push(line)
    })

    return result.join("\n")
}

module.exports = {
    // Helpers
    dedentBy,
    findIndentationLevel,
    convertTabsToSpaces,
    reverseString,
    padRight,
    padToCenter,
    widthOfLastLine,
    removeLineComment,
    
    // User functions
    convertToCommentBox,
    removeStyledCommentBox
}

/** END **/
// @ts-check
"use strict"

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
 * 
 * 
 * When working with strings, we use two similar but different concepts:
 *  - length: the number of characters the string contains.
 *  - width: the amount of space that the string takes, measured in spaces.
 * 
 * For some special characters (newlines, unicode) these do not match and we need to think carefully
 * about which one we're using.
 */

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
 * @typedef AnnotatedLine
 * @property {string?} indentation
 * @property {string?} startToken
 * @property {string?} leftFill
 * @property {string} text
 * @property {string?} rightFill
 * @property {string?} endToken
 * 
 * @typedef AnnotatedSelection
 * @property {number[]} selection
 * @property {AnnotatedLine[]} annotatedLines
 */

const stringWidth = require("string-width")

function splitAt(array, pred) {
    let first = []
    let second = []

    let cut = false
    for (let i = 0; i < array.length; i++) {
        cut = cut || pred(array[i])

        let arr = cut ? second : first
        arr.push(array[i])
    }

    return [first, second]
}

function splitAtLast(array, pred) {
    let first = []
    let second = []

    let cut = array.length
    for (let i = array.length - 1; i >= 0; i--) {
        if (pred(array[i])) {
            cut = i;
            break;
        }
    }

    for (let i = 0; i < array.length; i++) {
        let arr = i <= cut ? first : second
        arr.push(array[i])
    }

    return [first, second]
}

function findLastIndex(array, pred) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (pred(array[i])) {
            return i
        }
    }

    return -1
}

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

/**
 * Calculates the width of the last line on a string.
 * @todo Change this so it also works with '\r'
 * @param {string} string
 * @returns {number}
 */
function widthOfLastLine(string) {
    const lastNewlinePos = string.lastIndexOf("\n")
    const lastLine = lastNewlinePos === -1 ?
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
 * Annotate a line as not being a comment
 * @param {string} text
 * @returns {AnnotatedLine}
 */
function noCommentLine(text) {
    return {
        indentation: null,
        startToken: null,
        leftFill: null,
        text: text,
        rightFill: null,
        endToken: null
    }
}

/**
 * Checks if a given line matches the tokens for a the first or last line of a comment box
 * @param {string} string
 * @param {string} start
 * @param {string} fill
 * @param {string} end
 * @returns {AnnotatedLine?}
 */
function matchCommentEdge(string, start, fill, end) {
    let index = string.indexOf(start)
    if (index === -1 || !string.endsWith(end)) {
        return null
    }

    for (let i = 0; i < index; i++) {
        if (string[i] !== ' ' && string[i] !== '\t') {
            return null
        }
    }

    const mid = string.slice(index + start.length, -end.length)
    const fillCP = splitByCharPoints(fill)

    if (!splitByCharPoints(mid).every(cp => fillCP.includes(cp))) {
        return null
    }

    return {
        indentation: string.slice(0, index),
        startToken: start,
        leftFill: mid,
        text: null,
        rightFill: null,
        endToken: end
    }
}

/**
 * Checks if a given line matches the tokens for a middle line of a comment box
 * @param {string} string
 * @param {string} start
 * @param {string} fill
 * @param {string} end
 * @returns {AnnotatedLine?}
 */
function matchCommentLine(string, start, fill, end) {
    const index = string.indexOf(start)
    if (index === -1 || !string.endsWith(end)) {
        return null
    }

    // Before the start, it's indentation only
    for (let i = 0; i < index; i++) {
        if (string[i] !== ' ' && string[i] !== '\t') {
            return null
        }
    }

    const mid = string.slice(index + start.length, -end.length)
    const fillCP = splitByCharPoints(fill)
    const [leftFill, rest] = splitAt(splitByCharPoints(mid), c => !fillCP.includes(c))
    const [midText, rightFill] = splitAtLast(rest, (c) => !fillCP.includes(c))

    return {
        indentation: string.slice(0, index),
        startToken: start,
        leftFill: leftFill.join(''),
        text: midText.join(''),
        rightFill: rightFill.join(''),
        endToken: end
    }
}

/**
 * Checks if a given line matches the top edge of a comment box with a given style
 * @param {string} line
 * @param {BoxStyle} options
 * @returns {AnnotatedLine?}
 */
function matchTopEdge(line, options) {
    const hasHardTopEdge = options.topEdgeToken !== ''
    const hasHardBottomEdge = options.bottomEdgeToken !== ''

    if (hasHardTopEdge) {
        return matchCommentEdge(
            line,
            options.startToken,
            options.topEdgeToken,
            options.topRightToken
        )
    }

    return matchCommentLine(
        line,
        options.startToken,
        options.fillingToken,
        options.rightEdgeToken
    ) || (hasHardBottomEdge && matchCommentLine(
        line,
        options.startToken,
        options.fillingToken,
        options.endToken
    ))
}


/**
 * Checks if a given line matches the bottom edge of a comment box with a given style
 * @param {string} line
 * @param {BoxStyle} options
 * @returns {AnnotatedLine?}
 */
function matchBottomEdge(line, options) {
    const hasHardTopEdge = options.topEdgeToken !== ''
    const hasHardBottomEdge = options.bottomEdgeToken !== ''

    if (hasHardBottomEdge) {
        return matchCommentEdge(
            line,
            options.bottomLeftToken,
            options.bottomEdgeToken,
            options.endToken
        )
    } else {
        return matchCommentLine(
            line,
            options.leftEdgeToken,
            options.fillingToken,
            options.endToken
        ) || (hasHardTopEdge && matchCommentLine(
            line,
            options.startToken,
            options.fillingToken,
            options.endToken
        ))
    }
}

/**
 * Checks if a given line matches a middle line from a comment box with a given style
 * @param {string} line
 * @param {BoxStyle} options
 * @returns {AnnotatedLine?}
 */
function matchMidLine(line, options) {
    return matchCommentLine(
        line,
        options.leftEdgeToken,
        options.fillingToken,
        options.rightEdgeToken
    )
}

/**
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
    } [textAlignment]

    lines = lines
        // Extend lines to match desired width, using the choosen filling token
        .map(line => alignmentStyle(line, width - edgesWidth, fillingToken))

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
 * @param {number} selectionStart
 * @param {number} selectionEnd
 * @param {BoxStyle} options
 * @param {function(number):string?} getLine
 * @returns {AnnotatedSelection}
 */
function findStyledCommentBox(selectionStart, selectionEnd, options, getLine) {
    let lines = []
    for (let i = selectionStart; i <= selectionEnd; i++) {
        const line = getLine(i)
        lines.push(convertTabsToSpaces(line, options.tabSize))
    }

    const lineMatches = lines.map(line => [
        matchTopEdge(line, options),
        matchMidLine(line, options),
        matchBottomEdge(line, options)
    ])

    const firstTop = lineMatches.findIndex(([start, mid, end]) => start)
    const firstEnd = lineMatches.findIndex(([start, mid, end]) => end)
    const lastTop = findLastIndex(lineMatches, ([start, mid, end]) => start)
    const lastEnd = findLastIndex(lineMatches, ([start, mid, end]) => end)
    const anyMid = lineMatches.findIndex(([start, mid, end]) => mid)

    const searchUp = firstTop === -1 || firstEnd !== -1 && firstTop > firstEnd
    const searchDown = firstEnd === -1 || firstEnd < firstTop

    const lineStart = searchUp ? 0 : firstTop
    const lineEnd = searchDown ? lineMatches.length : lastEnd + 1

    let searchUpResult = []
    if (searchUp) {
        for (let l = selectionStart - 1;; l--) {
            let line = getLine(l)

            if (line === null) {
                // Failed to find comment start
                searchUpResult = []
                break
            }

            line = convertTabsToSpaces(line, options.tabSize)

            let match = matchTopEdge(line, options)

            if (match) {
                searchUpResult.push(match)
                break
            } else if (matchBottomEdge(line, options)) {
                // Failed to find comment start
                searchUpResult = []
                break
            }

            searchUpResult.push(matchMidLine(line, options) || noCommentLine(line))
        }
    }

    let midResult = []
    let insideComment = searchUp
    for (let i = lineStart; i < lineEnd; i++) {
        const [matchTop, matchMid, matchBot] = lineMatches[i]

        let lineInterpretation = null

        if (matchTop) {
            lineInterpretation = matchTop
            insideComment = true
        }

        if (matchBot) {
            lineInterpretation = lineInterpretation || matchBot
            insideComment = false
        }

        const line = lines[i]
        lineInterpretation = lineInterpretation ||
            (insideComment && matchMid) ||
            noCommentLine(line)

        midResult.push(lineInterpretation)
    }

    let searchDownResult = []
    if (searchDown) {
        for (let l = selectionEnd + 1;; l++) {
            let line = getLine(l)

            if (line === null) {
                // Failed to find comment start
                searchDownResult = []
                break
            }

            line = convertTabsToSpaces(line, options.tabSize)

            let match = matchBottomEdge(line, options)

            if (match) {
                searchDownResult.push(match)
                break
            } else if (matchTopEdge(line, options)) {
                // Failed to find comment start
                searchUpResult = []
                break
            }

            searchDownResult.push(matchMidLine(line, options) || noCommentLine(line))
        }
    }

    const result = searchUpResult.reverse().concat(midResult, searchDownResult)
    selectionStart -= searchUpResult.length
    selectionEnd += searchDownResult.length
    return {
        selection: [selectionStart, selectionEnd],
        annotatedLines: result
    }
}

/**
 * Remove comment box from a piece of text that we know was built by a given style. It might have
 * been modified in the meantime, it won't match exactly
 * 
 * @param {AnnotatedLine[]} annotatedLines
 * @param {BoxStyle} options
 * @returns {string}
 */
function removeStyledCommentBox(annotatedLines, options) {
    let result = []
    for (const line of annotatedLines) {
        const {
            indentation,
            startToken,
            leftFill,
            text,
            rightFill,
            endToken
        } = line

        if (text === null) {
            continue
        }

        let resultLine = ''
        resultLine += indentation || ''
        resultLine += leftFill ? ' '.repeat(stringWidth(leftFill)) : ''
        resultLine += text
        resultLine += rightFill ? ' '.repeat(stringWidth(rightFill)) : ''

        result.push(resultLine)
    }

    return result.join('\n')
}


function updateStyledCommentBox(annotatedLines, options) {
    return convertToCommentBox(
        removeStyledCommentBox(annotatedLines, options),
        options
    )
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

    // User functions
    convertToCommentBox,
    removeStyledCommentBox,
    updateStyledCommentBox,
    findStyledCommentBox
}

/** END **/
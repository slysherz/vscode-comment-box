"use strict"

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
    // TODO: Find a better way to handle the cut in the middle
    let difference = width - string.length

    if (difference <= 0) {
        return string
    }

    let str = padRight("", Math.floor(difference / 2), token) + string

    return padRight(str, width, token)
}

module.exports = {
    maxWidth,
    padRight,
    padToCenter
}

/** END **/
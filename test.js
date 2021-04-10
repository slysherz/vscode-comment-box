"use strict"

const {
    widthOfLastLine,
    findIndentationLevel,
    convertTabsToSpaces,
    reverseString,
    padRight,
    padToCenter,
    removeLineComment,
    convertToCommentBox
} = require('./src/comment-box.js')


removeLineComment("🐶🐱🐶🐱hello🐱🐶🐱🐶", "", "🐶🐱", "")

/** END **/
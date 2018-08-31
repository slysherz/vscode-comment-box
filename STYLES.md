# Styles

This file contains notes and a bunch of examples about how to configure the extention settings, so that it draws the box exactly the way you want it to. If you're having troubles with setting up the style you want, please fill an issue in our [GitHub Repository](https://github.com/SlySherZ/vscode-comment-box/issues).

# Comment box layout

The layout used to draw the comment box looks like this:
```
[A][~B~][C]
[D][~E~][F]
...
[G][~H~][I]
```

- **A**: Token that starts a multiline comment in the language you're currently using. Uses `commentBox.commentStartToken`.
- **B**: top edge of the box, filled with characters from `commentBox.topEdgeToken`.
- **C**: top right corner of the box, which uses `commentBox.topRightToken`.
- **D**: the left edge of the box, which uses `commentBox.leftEdgeToken`. We draw this for every line of selected text.
- **E**: your selected text, with minor modifications depending on the settings. We use `commentBox.fillingToken` to fill the box up to the desired width.
- **F**: the right edge of the box, which uses `commentBox.rightEdgeToken`. We draw this for every line of selected text.
- **G**: the leftmost token for the last line of the box, which uses `commentBox.bottomLeftToken`.
- **H**: bottom edge of the box, filled with characters from `commentBox.bottomEdgeToken`.
- **I**: Token that ends a multiline comment in the language you're currently using. Uses `commentBox.commentStartToken`.

## Tips and tricks
- If you don't want a top/bottom edge, leave `commentBox.topEdgeToken`/`commentBox.bottomEdgeToken` empty and we will skip those.


# Style examples

## Don't mess with my text
```
    /**********************************************
     * we'll try to:                              *
     *    - preserve inner and outer indentation; *
     *    - preserve text CaSiNg;                 *
     *                                            *
     *    - and skipping lines is fine too;       *
     **********************************************/
```
`settings.json`:
```
"commentBox.capitalize": false,
"commentBox.ignoreInnerIndentation": false,
"commentBox.ignoreOuterIndentation": false,
"commentBox.removeEmptyLines": false,
```

## Pythonic style
```
#############################
# THIS IS A                 #
# MULTILINE COMMENT EXAMPLE #
#############################
```


`settings.json`: 
```
"commentBox.commentStartToken": "",
"commentBox.commentEndToken": "##",
"commentBox.leftEdgeToken": "# ",
"commentBox.rightEdgeToken": " #",
"commentBox.topEdgeToken": "#",
"commentBox.bottomEdgeToken": "#",
"commentBox.topRightToken": "##",
"commentBox.bottomLeftToken": "##",
```

## Just a left bar
```
/* Just a left bar
 * is enough.     
 */
 ```

`settings.json`: 
 ```
"commentBox.commentStartToken": "/* ",
"commentBox.commentEndToken": "\n */",
"commentBox.leftEdgeToken": " * ",
"commentBox.rightEdgeToken": "",
"commentBox.topEdgeToken": "",
"commentBox.bottomEdgeToken": "",
"commentBox.topRightToken": "",
"commentBox.bottomLeftToken": "",
"commentBox.capitalize": false,
 ```


## I Live on the Edge
```
// I like to precomment my comments
/*==================+
 |I LIVE ON THE EDGE|
 |~-~-~-~SEE?~-~-~-~|
 +==================*/
 ```
 `settings.json`: 
```
"commentBox.commentStartToken": "// I like to precomment my comments\n/*",
"commentBox.commentEndToken": "*/",
"commentBox.leftEdgeToken": " |",
"commentBox.rightEdgeToken": "|",
"commentBox.topEdgeToken": "=",
"commentBox.bottomEdgeToken": "=",
"commentBox.topRightToken": "+",
"commentBox.bottomLeftToken": " +",
"commentBox.fillingToken": "~-",
"commentBox.textAlignment": "center",
```

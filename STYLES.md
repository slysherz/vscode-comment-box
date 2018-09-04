# Styles

This file contains notes and examples about how to configure this extention's settings, to make sure it draws the box exactly the way you want it to. If you're having troubles with setting up the style you want, please fill an issue in our [GitHub Repository](https://github.com/SlySherZ/vscode-comment-box/issues).

# Comment box layout

The layout used to draw the comment box looks like this:
```
[commentStartToken][    topEdgeToken      ][topRightToken]
[leftEdgeToken][         your code        ][rightEdgeToken]
                           ...
[bottomLeftToken][    bottomEdgeToken     ][commentEndToken]
```

- If you want, you can configure what appears on any of the blocks above. For example, if you want to change the left edge, go to your settings and search for `commentBox.leftEdgeToken`;
- To configure the characters used to fill empty space around your code, search for `commentBox.fillingToken` in your settings;
- If want a box without top / bottom edge, change `commentBox.topEdgeToken` / `commentBox.bottomEdgeToken` to an empty string;


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
"commentBox.textAlignment": "left"
```

## Pythonic style
```
##############################
#         THIS IS A          #
# MULTI-LINE COMMENT EXAMPLE #
##############################
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
"commentBox.textAlignment": "left"
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
```

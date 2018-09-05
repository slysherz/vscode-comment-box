# Comment Box for Visual Studio Code

This extension creates a highly configurable `Transform to Comment Box` command that transforms any piece of text into a pretty comment box.


## Examples:
#### Transforming a simple comment (with default settings)

```
my comment
```

turns into:

```
/**************
 * MY COMMENT *
 **************/
```


#### Transforming a multiple line comment (with default settings)
```
could you
comment box this?
pretty please (*.*)
```
turns into:

```
/***********************
 *      COULD YOU      *
 *  COMMENT BOX THIS?  *
 * PRETTY PLEASE (*.*) *
 ***********************/
```

If you'd like to see examples with different configurations, please check the [Styles section](#styles).

## Usage
Select the text that you want to transform, then call the command bar with:

`Ctrl+Shift+P`

And run the command:

`> Transform to Comment Box`

That's it. Alternatively, you can bind the command to a shortcut by adding something like this to your `keybindings.json`:
```
{ "key": "shift+alt+c", "command": "extension.commentBox", "when": "editorTextFocus"}
```

## Configuration

This section contains notes and examples about how to configure this extension's settings, to make sure it draws the box exactly the way you want it to. If you're having troubles with setting up the style you want, please fill an issue in our [GitHub Repository](https://github.com/SlySherZ/vscode-comment-box/issues).

### Extension settings

Setting | Description
--- | ---
`commentBox.capitalize` | Capitalizes the text inside the box.
`commentBox.textAlignment` | Controls how the text should be aligned. Can be 'center' or 'left'.
`commentBox.extendSelection` | When 'true' the whole line is replaced, not just the selected part.
`commentBox.commentStartToken` | Characters that start a multi-line comment for your current language. This also defines the top left corner of the box.
`commentBox.commentEndToken` | Characters that end a multi-line comment for your current language. This also defines the bottom right corner of the box.
`commentBox.topRightToken` | Characters that are used to draw the top right corner of the box.
`commentBox.bottomLeftToken` | Characters that are used to draw the bottom left corner of the box.
`commentBox.topEdgeToken` | Characters that are used to draw top edge of the box. The entire top edge is skipped when this is set to an empty string.
`commentBox.bottomEdgeToken` | Characters that are used to draw bottom edge of the box. The entire bottom edge is skipped when this is set to an empty string.
`commentBox.leftEdgeToken` | Characters that are used to draw left edge of the box.
`commentBox.rightEdgeToken` | Characters that are used to draw right edge of the box.
`commentBox.boxWidth` | The width of the comment box. When set to 0, it will automatically pick the smallest possible value.
`commentBox.fillingToken` | Characters that are used to fill the space between the text and the edges.
`commentBox.removeEmptyLines` | When set to 'true', skips drawing lines that are empty.
`commentBox.ignoreOuterIndentation` | When set to 'false', the box is placed in a way that matches the indentation of the text being commented. Works best when 'extendSelection' is enabled.
`commentBox.ignoreInnerIndentation` | When set to 'false', the text inside the box will keep the same relative indentation between the lines. Requires `commentBox.textAlignment` to be set to 'left'.

### Box layout

The layout used to draw the comment box looks like this:
```
[commentStartToken][    topEdgeToken      ][topRightToken]
[leftEdgeToken][         your code        ][rightEdgeToken]
                           ...
[bottomLeftToken][    bottomEdgeToken     ][commentEndToken]
```

- If you want, you can configure what appears on any of the blocks above. For example, if you want to change the left edge, go to your settings and search for `commentBox.leftEdgeToken`;
- To configure the characters used to fill empty space around your code, search for `commentBox.fillingToken` in your settings;
- If you want a box without top / bottom edge, change `commentBox.topEdgeToken` / `commentBox.bottomEdgeToken` to an empty string;


### Styles

#### Don't mess with my text
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

#### Pythonic style
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

#### Just a left bar
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


#### I Live on the Edge
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

## Todo
* Consider allowing multiple box styles (possibly by passing an argument to the extension).
* Consider adding a command that generates a box style from an example.
* Consider converting spaces back to tabs when it makes sense.


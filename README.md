# CommentBox README

## Description

This extension creates a configurable `Transform to Comment Box` command that transforms any piece of text into a pretty comment box.


### Examples:
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

### Usage
Select the text that you want to transform, call the command bar with:

`Ctrl+Shift+P`

And run the command:

\> Transform to Comment Box

Alternatively, you can bind the command to a shortcut by adding something like this to your `keybindings.json`:
```
{ "key": "shift+alt+c", "command": "extension.commentBox", "when": "editorTextFocus"}
```

For more information about how to configure the extension, or to see examples with different styles, please check the [Styles page](STYLES.md).

## Extension Settings

* `commentBox.capitalize`: capitalizes the text inside the box.
* `commentBox.textAlignment`: when using a fixed width, controls how the text should be aligned. Can be 'center' or 'left'.
* `commentBox.extendSelection`: when 'true' the whole line is replaced, not just the selected part.
* `commentBox.commentStartToken`: characters that start a multi-line comment for your current language. This also defines the top left corner of the box.
* `commentBox.commentEndToken`: characters that end a multi-line comment for your current language. This also defines the bottom right corner of the box.
* `commentBox.topRightToken`: characters that are used to draw the top right corner of the box.
* `commentBox.bottomLeftToken`: characters that are used to draw the bottom left corner of the box.
* `commentBox.topEdgeToken`: characters that are used to draw top edge of the box.
* `commentBox.bottomEdgeToken`: characters that are used to draw bottom edge of the box.
* `commentBox.leftEdgeToken`: characters that are used to draw left edge of the box.
* `commentBox.rightEdgeToken`: characters that are used to draw right edge of the box.
* `commentBox.boxWidth`: the width of the comment box. When set to 0, it will automatically pick the smallest possible value.
* `commentBox.fillingToken`: characters that are used to fill the space between the text and the edges.

## Todo
* Consider allowing multiple box styles (possibly by passing an argument to the extension).
* Consider adding a command that generates a box style from an example.
* Consider converting spaces back to tabs when it makes sense.

## Known Issues

* None at the moment :)

# comment-box README

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

## Extension Settings

* `commentBox.capitalize`: capitalizes the text.
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
* Find a better way to handle malformed configuration styles.
* Add more regression tests.
* Consider allowing multiple box styles (possibly by passing an argument to the extension).
* Consider automatically detecting and adjusting against the text indentation.

## Known Issues

* None at the moment :)

## Release Notes

### 0.0.1
* Initial release `\(*.*)/`

### 0.0.2
* Improved cursor handling: the cursor is now moved to the end of the comment box.

### 0.0.3
* Added support for multi-selection comment boxes.

### 0.0.4
* The behaviour related to column vs row priority is now more consistent, so that columns always go from top to bottom.

### 0.1.0
* Warning: if you use a custom style, it's likely that this update changes/breaks the style's behaviour. We'll try hard to avoid doing this in the future, it's really annoying to have your thing broken by an update (╯°□°）╯︵ ┻━┻
* Changed how the inner part of the box is filled:
    * The behaviour much simpler, we just fill everything with 'fillingToken';
    * Text to edge space configuration is going away for while, while we try to make it play well with other features;
    * Spaces should be added to the edges, if needed;
    * We might improve this in the future if someone needs to use a style that cannot be implemented like this.
* Added configurations to customize the top right and bottom left edges of the box.
* Improved the way 'commentStartToken' is handled when it contains newline characters.
* Improved the way 'topEdgeToken' and 'bottomEdgeToken' are handled: when they are empty, we now skip drawing the top/bottom  edge.
* Fixed a bug where fixed width was forcing the text to be centered.
* Fixed a bug where empty tokens would fill with 'undefined'.
* If you'd like to have a different type of box and you are having trouble getting it to work, please fill an issue and let us know.

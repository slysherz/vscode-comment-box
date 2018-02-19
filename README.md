# comment-box README

## Description

This extension creates a configurable `Transform to Comment Box` command that transforms any piece of text into a pretty comment box.


### Example:

```
my comment
```

\> Transform to Comment Box

```
/**************
 * MY COMMENT *
 **************/
```

## Extension Settings

* `commentBox.capitalize`: capitalizes the text.
* `commentBox.textAlignment`: when using a fixed width, controls how the text should be aligned. Can be 'center' or 'left'.
* `commentBox.extendSelection`: when 'true' the whole line is replaced, not just the selected part.
* `commentBox.commentStartToken`: characters that start a multi-line comment for your current language.
* `commentBox.commentEndToken`: characters that end a multi-line comment for your current language.
* `commentBox.topEdgeToken`: characters that are used to draw top edge of the box.
* `commentBox.bottomEdgeToken`: characters that are used to draw bottom edge of the box.
* `commentBox.leftEdgeToken`: characters that are used to draw left edge of the box.
* `commentBox.rightEdgeToken`: characters that are used to draw right edge of the box.
* `commentBox.boxWidth`: the width of the comment box. When set to 0, it will automatically pick the smallest possible value.
* `commentBox.fillingToken`: when using a fixed width, controls the characters that are used to fill the extra space available.
* `commentBox.textToEdgeSpace`: the amount of spaces (empty characters) that are used to separate the text from the side edges.

## Todo
* Cleanup situations where newlines are added.
* Add regression tests.
* Consider implenting different box styles.

## Known Issues

* `textAlignment` setting is not declared properly. 

## Release Notes

### 0.0.1

* Initial release `\(*.*)/`

### 0.0.2

* Improved cursor handling: the cursor is now moved to the end of the comment box.

### 0.0.3

* Added support for multi-selection comment boxes.


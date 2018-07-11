# Change Log
All notable changes to the "comment-box" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.1] - 2017-11-30
- Initial release `\(*.*)/`

## [0.0.2] - 2018-02-02
- Improved cursor handling: the cursor is now moved to the end of the comment box.

## [0.0.3] - 2018-02-19
- Added support for multi-selection comment boxes.

## [0.0.4] - 2018-03-02
- The behaviour related to column vs row priority is now more consistent, so that columns always go from top to bottom.

## [0.1.0] - 2018-04-18
- Warning: if you use a custom style, it's likely that this update changes/breaks the style's behaviour. We'll try hard to avoid doing this in the future, it's really annoying to have your thing broken by an update (╯°□°）╯︵ ┻━┻
- Changed how the inner part of the box is filled:
    - The behaviour is now much simpler, we just fill everything with 'fillingToken';
    - Text to edge space configuration is going away for while, while we try to make it play well with other features;
    - Spaces should be added to the edges, if needed;
    - We might improve this in the future if someone needs to use a style that cannot be implemented like this.
- Added configurations to customize the top right and bottom left edges of the box.
- Improved the way 'commentStartToken' is handled when it contains newline characters.
- Improved the way 'topEdgeToken' and 'bottomEdgeToken' are handled: when they are empty, we now skip drawing the top/bottom  edge.
- Fixed a bug where fixed width was forcing the text to be centered.
- Fixed a bug where empty tokens would fill with 'undefined'.
- If you'd like to have a different type of box and you are having trouble getting it to work, please fill an issue and let us know.

## [0.1.1] - 2018-06-21
- Added support to adapt the comment box to the text indentation:
    - Added a configuration option to indent the comment box when the text being commented was indented;
    - Added a configuration option to keep the relative indentation between lines;
    - Added a configuration option to skip drawing empty lines.
- Improved the way tab characters are handled:
    - We now replace tab characters with spaces before processing the text, using the same width that the editor is using;
    - The spacing inside the text should now be kept intact;
    - Fixed a bug where having tab characters in the middle of the text could cause the box to end up misaligned.

## [0.1.2] - 2018-06-26
- Fixed a bug introduced with the latest update where the inner indentation was wrong with indented text. I am really sorry about that : (
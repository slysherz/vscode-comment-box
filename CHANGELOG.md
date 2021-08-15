# Changelog

## [2.1.0]

Support for updating and removing comments, and better unicode support!

### Added

- You can now update and remove comment boxes
    - Use the new `Remove Comment Box` and `Update Comment Box` commands
    - Caveats: it doesn't repair text when the comment is destructive: `tEsT` -> `/* TEST */`
    - For now, you'll have to manually select the entire box to update / delete it. We'll try to support automatic comment box / style detection in a later update
- Better Unicode support

### Changed

- The `Transform to Comment Box` command has been renamed to `Add Comment Box` to be consistent with the default `Add Line Comment` VSCode command

## [2.0.0] - 2019-05-20

Multi-styles!

### Added
- You can now define multiple styles at the same time;
- New command `Transform To Comment Box Using Style`
    - Asks which style to use;
    - Supports keybindings to specific styles;
- New logo;

### Changed
- The way Comment Box is configured is changing to support multi-styles
    - Supports the same configuration options, but written in a different way;
    - There is a single setting - `commentBox.styles` - which is an object that contains defined styles;
    - The `Transform To Comment Box` command now uses settings from `commentBox.styles.defaultStyle`;
    - Check the `README` to see how it works;

### Fixed
- Fixed a bug where we would add giberish characters to the box if unicode characters were used as tokens;

## [1.0.0] - 2018-09-06
There is nothing new this time, just a few bug fixes and a big documentation improvement. We've reached the point where things are pretty stable and unlikely to change much : )

### Changed
- Updated `npm` development dependencies;
- Cleaned up the Readme file;
- Cleaned up unit tests to make them clearer and more orthogonal;
- Cleaned up the documentation:
    - The changelog now has it's own file;
    - Added a new Styles section that contains information and examples about how to configure the extension;

### Fixed
- Inner indentation is now replaced with `fillingToken` characters;
- Fixed a bug where we were the `tabSize` for the open document was being loaded incorrectly;
- Fixed a bug where tabs weren't being converted to spaces correctly in some situations;

## [0.1.2] - 2018-06-26
- Fixed a bug introduced with the latest update where the inner indentation was wrong with indented text. I am really sorry about that : (

## [0.1.1] - 2018-06-21
- Added support to adapt the comment box to the text indentation:
    - Added a configuration option to indent the comment box when the text being commented was indented;
    - Added a configuration option to keep the relative indentation between lines;
    - Added a configuration option to skip drawing empty lines.
- Improved the way tab characters are handled:
    - We now replace tab characters with spaces before processing the text, using the same width that the editor is using;
    - The spacing inside the text should now be kept intact;
    - Fixed a bug where having tab characters in the middle of the text could cause the box to end up misaligned.

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

## [0.0.4] - 2018-03-02
- The behaviour related to column vs row priority is now more consistent, so that columns always go from top to bottom.

## [0.0.3] - 2018-02-19
- Added support for multi-selection comment boxes.

## [0.0.2] - 2018-02-02
- Improved cursor handling: the cursor is now moved to the end of the comment box.

## [0.0.1] - 2017-11-30
- Initial release `\(*.*)/`

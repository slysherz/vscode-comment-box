
## Feature table

| | With a given style | Known style detection | Any style detection
| - | - | - | - |
| Add comment | yes | - | - 
| Remove comment | yes | 4 | 6
| Update comment | yes | 4 | 6
| Toggle comment | 2 | 4 | 6
| Change style | no | 4 | 6

## Roadmap

1. (Done) Support to remove / update a comment box
2. Detect boxes with the current selected style
3. Variable style per language
4. Support to detect comment boxes from all known styles, then use that to support all change operations
5. Learn style from box example
6. Support to detect *any* comment box (whatever that is), then use that to support all change operations

Changing style from one known style to another doesn't seem hard to implement, but it isn't that useful - skipping that for now.
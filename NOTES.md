
## Feature table

| | With a given style | Known style detection | Any style detection
| - | - | - | - |
| Add comment | yes | - | - 
| Remove comment | yes | 3 | 4
| Update comment | yes | 3 | 4
| Toggle comment | 2 | 3 | 4
| Update lines | 2 | 3 | 4
| Change style | no | 3 | 4

## Roadmap

1. (Done) Support to remove / update a comment box
2. Detect boxes with the current selected style
3. Support to detect comment boxes from all known styles, then use that to support all change operations
4. Learn style from box example
5. Support to detect *any* comment box (whatever that is), then use that to support all change operations
6. Variable style per language

Changing style from one known style to another doesn't seem hard to implement, but it isn't that useful - skipping that for now.
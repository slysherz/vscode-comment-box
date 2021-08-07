
## Feature table

| | With a given style | Known style detection | Any style detection
| - | - | - | - |
| Add comment | yes | - | - 
| Remove comment | 1 | 2 | 3
| Update comment | 1 | 2 | 3
| Toggle comment | 2 | 2 | 3
| Update lines | 2 | 2 | 3
| Change style | no | 2 | 3

## Roadmap

1. Support to remove / toggle / update a comment box
2. Support to detect comment boxes from all known styles, then use that to support all change operations
3. Learn style from box example
4. Support to detect *any* comment box (whatever that is), then use that to support all change operations
5. Variable style per language

Changing style from one known style to another doesn't seem hard to implement, but it isn't that useful - skipping that for now.
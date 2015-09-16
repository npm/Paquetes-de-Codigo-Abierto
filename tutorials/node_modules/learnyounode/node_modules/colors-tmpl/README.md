# colors-tmpl - Super-simple templating for [colors.js](https://github.com/Marak/colors.js)

```js
var colorsTmpl = require('colors-tmpl')

// simple:
colorsTmpl('{red}this should be red{/red}')
// same as → 'this should be red'.red

// fancy:
colorsTmpl('lotsa colours: {red}red{/red}, {green}green{/green}, {blue}blue{/blue}, yeehaw!')
// same as → 'lotsa colours: ' + 'red'.red + ', ' + 'green'.green + ', ' + 'blue'.blue + ', ' + 'yeehaw!'

// fancier:
colorsTmpl(
      '{bold}colours {red}within {green}colours{/green} within {yellow}colours, {underline}oh my!{/underline}{/yellow}{/red} EEEK!{/bold}'
    )
// same as → 'colours ' + ('within ' + 'colours'.green + ' within ' + ('colours, ' + 'oh my!'.underline).yellow).red + ' EEEK!').bold
```

## License

**colors-tmpl** is Copyright (c) 2014 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.
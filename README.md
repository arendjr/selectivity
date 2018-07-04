# Selectivity.js

Modular and light-weight selection library.

[![Selectivity on NPM](https://img.shields.io/npm/v/selectivity.svg)](https://www.npmjs.com/package/selectivity)
[![Build Status](https://travis-ci.org/arendjr/selectivity.svg?branch=master)](https://travis-ci.org/arendjr/selectivity)
[![Greenkeeper badge](https://badges.greenkeeper.io/arendjr/selectivity.svg)](https://greenkeeper.io/)

## Setup

### Dependencies

Selectivity doesn't require any external libraries to be loaded on your page, but it does have some
optional dependencies:

-   There's a React build that provides the official Selectivity React API. If you wish to use this,
    [React](https://facebook.github.io/react/) should be loaded on your page.
-   There's a jQuery build that provides the official Selectivity jQuery API. If you wish to use
    this, either [jQuery](http://jquery.com/) or [Zepto.js](http://zeptojs.com/) should be loaded on
    your page.
-   The default templates assume that you have included
    [FontAwesome](http://fortawesome.github.io/Font-Awesome/) in your page to display the icons. If
    you do not want this, please specify custom templates.

### Manual

**Warning:** Do you use Browserify or Webpack? Please use Yarn or NPM as described below.

Download and unpack the latest release from the project website:
https://arendjr.github.io/selectivity/

Copy the JavaScript and CSS file for your desired build from the archive into your project. See the
following table to see which files you need:

| Build                     | JavaScript file           | CSS file                   |
| ------------------------- | ------------------------- | -------------------------- |
| jQuery (development)      | selectivity-jquery.js     | selectivity-jquery.css     |
| jQuery (production)       | selectivity-jquery.min.js | selectivity-jquery.min.css |
| React (development)       | selectivity-react.js      | selectivity-react.css      |
| React (production)        | selectivity-react.min.js  | selectivity-react.min.css  |
| _VanillaJS_ (development) | selectivity.js            | selectivity.css            |
| _VanillaJS_ (production)  | selectivity.min.js        | selectivity.min.css        |

Reference the files from your HTML page like this:

    <head>
        ...
        <link href="font-awesome.css" rel="stylesheet">
        <link href="selectivity.css" rel="stylesheet">
        ...
        <script src="jquery-or-react-or-zepto.js"></script>
        <script src="selectivity.js"></script>
        ...
    </head>

Note the first line includes FontAwesome which is required for the default icons. This line is
optional if you use custom templates.

The second line should reference the CSS file from the bundle you chose to use.

The third line should reference jQuery, React or Zepto.js as appropriate. This line is optional if
you use the VanillaJS bundle. _Note: If you want to use the React templates plugin, don't forget to
also include `react-dom.js`._

Finally, the last line should reference the JavaScript file from the bundle you chose to use.

You are now ready to start using Selectivity as described on the Selectivity homepage:
https://arendjr.github.io/selectivity/

### Using Yarn

If you have Yarn installed, run:

    $ yarn add selectivity

Note you will need to include the CSS yourself. You can find it in
`node_modules/selectivity/selectivity.css`.

### Using NPM

Make sure you have Node.js installed and run:

    $ npm install --save selectivity

Note you will need to include the CSS yourself. You can find it in
`node_modules/selectivity/selectivity.css`.

#### Which module do I require?

You can `require()` Selectivity as follows:

    var Selectivity = require('selectivity');

But, this will only expose the main Selectivity object and will load none of the plugins, nor enable
any of the specialized APIs. You could say what you're getting is the core of the VanillaJS API.

If however, you just want to use the jQuery API with all the relevant plugins loaded, you can do
this:

    require('selectivity/jquery');

After this you can call the jQuery API as you would expect:

    $('...').selectivity(/*...*/);

Similarly, if you want to use the React API with all its relevant plugins, you can do this:

    var Selectivity = require('selectivity/react');

The Selectivity object you receive is the same one as if you'd required `'selectivity'`, but you get
the React Component class as `Selectivity.React` so you can use it as follows:

    <Selectivity.React {...props} />

Finally, if you're an expert (\*) you can choose to use the VanillaJS API and enable just the
plugins you want one by one. For example:

    var Selectivity = require('selectivity');
    require('selectivity/dropdown');
    require('selectivity/inputs/single');
    require('selectivity/plugins/ajax');
    require('selectivity/plugins/async');
    require('selectivity/plugins/submenu');

    var singleInput = new Selectivity.Inputs.Single({
        element: document.querySelector('...'),
        /*...*/
    });

All the modules listed in the table below under _Creating custom builds_ can be required this way.

\*) Using the VanillaJS API isn't really that hard, but all the examples and documentation assume
you're using either the React or the jQuery API, so be prepared that you'll have to figure out a bit
more on your own.

### Ruby on Rails

Detailed information for `selectivity-rails`, including
[Installation and usage](https://github.com/msx2/selectivity-rails#installation-and-usage) are
provided in the [gem's repository](https://github.com/msx2/selectivity-rails).

### Customization

Once installed, you may want to customize Selectivity. For example, by specifying custom templates
or localized strings. While creating a custom build is always an option (see details below), easier
options exist.

To do any basic customization, you'll need a reference to the `Selectivity` object. If you have
installed through Yarn/NPM, you can get this object through
`var Selectivity = require('selectivity');`. If you're using a jQuery build, the object is exposed
as `$.Selectivity`. For non-jQuery builds that you included as a script, the object is exposed as
global variable.

#### Example: Customizing localization in a jQuery build

    $.Selectivity.Locale.noResultsForTerm = function(term) {
        return 'No results were found for <b>' + escape(term) + '</b>';
    };

See [locale.js](https://github.com/arendjr/selectivity/blob/master/src/locale.js) for an overview of
all localizable messages.

#### Example: Specifying a custom template when installed through NPM

    var Selectivity = require('selectivity');
    Selectivity.Templates.loading = function() {
        return '<div class="selectivity-loading"><div class="my-spinner"></div></div>';
    };

See [templates.js](https://github.com/arendjr/selectivity/blob/master/src/templates.js) for an
overview of all templates that can be customized.

## API

For usage instructions, please see the Selectivity homepage: https://arendjr.github.io/selectivity/

## Browser Support

-   Chrome
-   Firefox
-   Internet Explorer 10+
-   Safari 6+

Note that while Internet Explorer versions older than 10 are not supported, you might be able to get
them to work, possibly with the use of some polyfills. Reports of success or patches to create a
"legacy" build would be welcomed.

## Build System

Selectivity is built modularly and uses Yarn and Gulp as a build system to build its distributable
files. Make sure you have the `yarn` command globally available and make sure you have the `sass`
Gem installed. Then, inside the project directory, run:

    $ yarn

Now you can generate new distributable files from the sources, using:

    $ yarn build

### Creating custom builds

If you want to create your own Selectivity library that contains just the modules you need, you can
use the following command:

    $ yarn gulp [--api=<react-or-jquery>] --modules=<comma-separated-module-list>

The following modules are available:

| Module                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **inputs/email**               | Implements the 'Email' input type. This is a special case of the 'Multiple' input type with no dropdown and a specialized tokenizer for recognizing email addresses (including pasted content from address books).                                                                                                                                                                                                                                                                                                                                                                                          |
| **inputs/multiple**            | Implements the 'Multiple' input type. If you only want to use Selectivity with single values, you can leave this out.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **inputs/single**              | Implements the 'Single' input type. If you only want to use Selectivity with multiple values, you can leave this out.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **plugins/ajax**               | Convenience module for performing AJAX requests. Needed if you want to use any `ajax` options. If you use this module, you should also include the 'async' module to correctly handle out-of-order replies. This module relies on the presence of the `[fetch()](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch)` method which is only available in modern browsers, so you should either provide a polyfill if you want to support older browsers, or -- if you're creating a jQuery build -- you can use the 'jquery/ajax' module to provide a fallback that uses `$.ajax()` instead. |
| **plugins/async**              | Blocks the query function from calling its callback functions if another query has been issued since. This prevents out-of-order replies from remote sources to display incorrect results. This module is only needed if you use the query function and call its callbacks asynchronously.                                                                                                                                                                                                                                                                                                                  |
| **plugins/diacritics**         | Diacritics support. This will make sure that `"Łódź"` will match when the user searches for `"Lodz"`, for example. However, if you always query a server when searching for results, you may want to solve matching of diacritics server-side, in which case this module can be omitted.                                                                                                                                                                                                                                                                                                                    |
| **plugins/keyboard**           | Provides keyboard support for navigating through the dropdown. If you don't use a dropdown, or are only targeting mobile, you may want to leave this module out.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **plugins/submenu**            | Extends the default dropdown so that multiple levels of submenus can be created.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **plugins/tokenizer**          | Default tokenizer implementation. This module adds support for the `tokenSeparators` option which is used by the default tokenizer. Support for tokenizers themselves is already included in the "multiple" module, so you can omit this module if you don't want to use any tokenizers or want to specify your own tokenizer.                                                                                                                                                                                                                                                                              |
| **plugins/jquery/ajax**        | Provides a fallback to use `$.ajax()` instead of the `fetch()` method for performing AJAX requests. _(Requires jQuery 3.0 or higher)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **plugins/jquery/traditional** | This module allows you to convert an HTML5 `<select>` form element into a Selectivity instance. The items will be initialized from the `<option>` and `<optgroup>` elements. _(jQuery only)_                                                                                                                                                                                                                                                                                                                                                                                                                |
| **plugins/react/templates**    | Adds support for React (JSX) templates. Requires `react-dom` to be available.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **dropdown**                   | Module that implements the dropdown. You will most likely want to include this, unless you only want to use Selectivity without any dropdown or you provide a completely custom implementation instead.                                                                                                                                                                                                                                                                                                                                                                                                     |
| **locale**                     | Localizable content pulled in by the default templates. You may or may not decide to use these with your own templates. Also used for localizable messages by the ajax module.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **templates**                  | Default templates to use with Selectivity. If you provide your own templates, you may want to skip this.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

Note that the build system automatically resolves dependencies between modules. So for example, if
you specify you want the submenu plugin, the dropdown module will be automatically included.

Example:

    $ yarn gulp --api=react --modules=inputs/multiple,dropdown

This will create a custom build that uses the React API and which has support for selecting multiple
values with a dropdown. The build will be saved in `build/selectivity-custom.js`. There will be no
plugins available, you will have to provide your own templates with their localizable content, and
you cannot use this build for creating a single-select input.

To display any other options available for custom builds, run `gulp usage`.

### Development server

While developing, you can start a development server like this:

    $ yarn start [--api=<jquery-or-react>]

You may want to pass the `--source-map` parameter to generate a source map for debugging. Check out
the various files in the `demos/` directory that are set up to with custom builds as they can be
used for development.

## Unit Tests

Unit tests are available and can be ran using the following command:

    $ yarn unit-tests

If you want to run an individual test, just add `--test=<test-name>`. Simply provide an invalid test
name to get a list of all available test names.

## License

Selectivity is made available under the [MIT license](LICENSE).

## Contributing

To read more about guidelines for submitting pull requests, please read the
[Contributing document](CONTRIBUTING.md).

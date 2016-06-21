Selectivity.js
==============

Modular and light-weight selection library.

[![Build Status](https://travis-ci.org/arendjr/selectivity.svg?branch=master)](https://travis-ci.org/arendjr/selectivity)

Setup
-----

Selectivity relies on [React](https://facebook.github.io/react/), [jQuery](http://jquery.com/) or
[Zepto.js](http://zeptojs.com/) being loaded on the page to work.

In addition, the default templates assume that you have included
[FontAwesome](http://fortawesome.github.io/Font-Awesome/) in your page to display the icons.

### Manual

Copy `selectivity-full.js` and `selectivity-full.css` from the `dist/` directory into your project.
Then put the following in your HTML head:

    <head>
        ...
        <link href="font-awesome.css" rel="stylesheet">
        <link href="selectivity-full.css" rel="stylesheet">
        ...
        <script src="jquery.js"></script>
        <script src="selectivity-full.js"></script>
        ...
    </head>

Verify the paths are correct for your particular project. The important thing is that jQuery (or
Zepto.js) should be loaded before including Selectivity.

### Using NPM

Make sure you have Node.js installed and run:

    $ npm install selectivity

### Ruby on Rails

Detailed information for `selectivity-rails`, including
[Installation and usage](https://github.com/msx2/selectivity-rails#installation-and-usage) are
provided in the [gem's repository](https://github.com/msx2/selectivity-rails).

Browser Support
---------------

- Chrome
- Firefox
- Internet Explorer 10+
- Safari 6+

Note that while Internet Explorer versions older than 10 are not supported, you might be able
to get them to work, possibly with the use of some polyfills. Reports of success or patches
to create a &quot;legacy&quot; build would be welcomed.

API
---

See the Selectivity homepage: https://arendjr.github.io/selectivity/

Build System
------------

Selectivity is built modularly and uses Gulp as a build system to build its distributable files. To
install the necessary dependencies, please run:

    $ npm install -g gulp
    $ npm install

Then you can generate new distributable files from the sources, using:

    $ npm run build

### Creating custom builds

If you want to create your own Selectivity library that contains just the modules you need, you can
use the following command:

    $ gulp --api=<react-or-jquery> --modules=<comma-separated-module-list>

The following modules are available:

Module                   | Description
-------------------------|------------
**input-types/email**    | Implements the 'Email' input type. This is a special case of the 'Multiple' input type with no dropdown and a specialized tokenizer for recognizing email addresses (including pasted content from address books).
**input-types/multiple** | Implements the 'Multiple' input type. If you only want to use Selectivity with single values, you can leave this out.
**input-types/single**   | Implements the 'Single' input type. If you only want to use Selectivity with multiple values, you can leave this out.
**plugins/ajax**         | Convenience module for performing AJAX requests. All options passed into the `ajax` object are provided by this module.
**plugins/async**        | Blocks the query function from calling its callback functions if another query has been issued since. This prevents out-of-order replies from remote sources to display incorrect results. This module is only needed if you use the query function and call its callbacks asynchronously.
**plugins/diacritics**   | Diacritics support. This will make sure that `"Łódź"` will match when the user searches for `"Lodz"`, for example. However, if you always query a server when searching for results, you may want to solve matching of diacritics server-side, in which case this module can be omitted.
**plugins/keyboard**     | Provides keyboard support for navigating through the dropdown. If you don't use a dropdown, or are only targeting mobile, you may want to leave this module out.
**plugins/submenu**      | Extends the default dropdown so that multiple levels of submenus can be created.
**plugins/tokenizer**    | Default tokenizer implementation. This module adds support for the `tokenSeparators` option which is used by the default tokenizer. Support for tokenizers themselves is already included in the "multiple" module, so you can omit this module if you don't want to use any tokenizers or want to specify your own tokenizer.
**plugins/traditional**  | This module allows you to convert an HTML5 &lt;select&gt; form element into a Selectivity instance. The items will be initialized from the &lt;option&gt; and &lt;optgroup&gt; elements. **This plugin is only compatible with the jQuery API.**
**dropdown**             | Module that implements the dropdown. You will most likely want to include this, unless you only want to use Selectivity without any dropdown or you provide a completely custom implementation instead.
**locale**               | Localizable content pulled in by the default templates. You may or may not decide to use these with your own templates. Also used for localizable messages by the ajax module.
**templates**            | Default templates to use with Selectivity. If you provide your own templates, you may want to skip this.

Note that the build system automatically resolves dependencies between modules. So for example, if
you specify you want the submenu plugin, the dropdown module will be automatically included.

Example:

    $ gulp --api=react --modules=input-types/multiple,dropdown

This will create a custom build that uses the React API and which has support for selecting multiple
values with a dropdown. The build will be saved in `dist/selectivity-custom.js`. There will be no
plugins available, you will have to provide your own templates with their localizable content, and
you cannot use this build for creating a single-select input.

Note that because Selectivity uses Browserify internally, the build will contain various `require()`
calls, which may sometimes interfere with build systems that scan for those calls. If this gives
problems for you, you can pass the `--derequire` parameter to rename those calls. Of course, if
you're using Browserify in your own project you may even decide to skip the whole build process and
just copy the relevant modules from the `src/` directory straight into your project.

To display any other options available for custom builds, run `gulp usage`.

### Development server

While developing, you can start a development server like this:

    $ gulp dev --api=<jquery-or-react> [--modules=<comma-separated-module-list>] [--source-map]

You may want to pass the `--source-map` parameter to generate a source map for debugging. The files
`demos/custom-jquery.html` and `demos/custom-zepto.html` are set up to work with custom builds, which
you can also use for development.

Unit Tests
----------

Unit tests are available and can be ran using the following command:

    $ gulp unit-tests

License
-------

Selectivity is made available under the [MIT license](LICENSE).

Contributing
------------

To read more about guidelines for submitting pull requests, please read the
[Contributing document](CONTRIBUTING.md).

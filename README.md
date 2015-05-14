Selectivity.js
==============

Modular and light-weight selection library for jQuery and Zepto.js.

Motivation
----------

I've used [Select2](https://select2.github.io/) for a long time because I reckon it is the
best and most feature-rich selection library out there.

However, time and again I've ran into its limitations. It is difficult to customize the styling, and
introducing subtle tweaks to its behavior typically meant maintaining a private fork. More
specifically, I wanted to make the following changes:

- Use custom templates, instead of the ones that are hard-coded in Select2. This would also open up
  the possibility of not loading the image sprite included with Select2, but instead use
  [FontAwesome icons](http://fortawesome.github.io/Font-Awesome/) that I already use in my projects.
- Use custom loading indicators, instead of the spinner GIF included by Select2.
- I wanted to make it easier to support a use case where Select2 is used without any selection
  dropdown, but with the proper tokenization.
- Make Select2 work with jQuery builds without Sizzle for better performance. Patches for this have
  been accepted in Select2, but unfortunately it's a moving target causing repeated breakage. Also,
  once Sizzle is no longer required, it becomes much easier to support Zepto.js.
- Personally, I preferred a more modern codebase to work with, rather than the huge monolithic
  library that is Select2. This also includes proper documentation of the code as well as good test
  coverage. At this point also support for any IE version older than 10 can be dropped.

Having said that, if you're a user of Select2 and don't recognize yourself in any of these issues,
I advise you to keep using Select2. It's feature-rich and actively supported, so don't fix what
ain't broken ;)

Setup
-----

Selectivity only relies on [jQuery](http://jquery.com/) or [Zepto.js](http://zeptojs.com/) being
loaded on the page to work.

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

### Using Bower

Make sure Bower is installed, then run:

    $ bower install selectivity

### Using Component

Include as a [component(1)](https://github.com/componentjs/component) dependency.

In your `component.json`:

    {
        "dependencies": {
            ...
            "arendjr/selectivity": "^1.1.0"
            ...
        }
    }

And in your code:

    var $ = require('jquery');
    require('selectivity');

### Ruby on Rails

Detailed information for `selectivity-rails`, including [Installation and usage](https://github.com/msx2/selectivity-rails#installation-and-usage) are provided in the [gem's repository](https://github.com/msx2/selectivity-rails).

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

    $ gulp --modules=<comma-separated-module-list>

The following modules are available:

Module          | Description
----------------|------------
**ajax**        | Convenience module for performing AJAX requests. All options passed into the `ajax` object are provided by this module.
**async**       | Blocks the query function from calling its callback functions if another query has been issued since. This prevents out-of-order replies from remote sources to display incorrect results. This module is only needed if you use the query function and call its callbacks asynchronously.
**backdrop**    | This module provides the backdrop feature which is used by the dropdown. The backdrop is used to guarantee that when the dropdown is open and the user clicks outside the Selectivity area, the dropdown will close. If you omit this module, a simpler implementation is used which will still attempt to close the dropdown when the user clicks outside the area, but which may fail when the user clicks on some element that has a custom click handler which prevents the event from bubbling.
**base**        | The Selectivity base module which is pulled in automatically into every build.
**diacritics**  | Diacritics support. This will make sure that `"Łódź"` will match when the user searches for `"Lodz"`, for example. However, if you always query a server when searching for results, you may want to solve matching of diacritics server-side, in which case this module can be ommitted.
**dropdown**    | Module that implements the dropdown. You will most likely want to include this, unless you only want to use Selectivity without any dropdown or you provide a completely custom implementation instead.
**email**       | Implements the 'Email' input type. This is a special case of the 'Multiple' input type with no dropdown and a specialized tokenizer for recognizing email addresses (including pasted content from address books).
**keyboard**    | Provides keyboard support for navigating through the dropdown. If you don't use a dropdown, or are only targeting mobile, you may want to leave this module out.
**locale**      | Localizable content pulled in by the default templates. You may or may not decide to use these with your own templates. Also used for localizable messages by the ajax module.
**multiple**    | Implements the 'Multiple' input type. If you only want to use Selectivity with single values, you can leave this out.
**single**      | Implements the 'Single' input type. If you only want to use Selectivity with multiple values, you can leave this out.
**submenu**     | Extends the default dropdown so that multiple levels of submenus can be created.
**templates**   | Default templates to use with Selectivity. If you provide your own templates, you may want to skip this.
**tokenizer**   | Default tokenizer implementation. This module adds support for the `tokenSeparators` option which is used by the default tokenizer. Support for tokenizers themselves is already included in the "multiple" module, so you can omit this module if you don't want to use any tokenizers or want to specify your own tokenizer.
**traditional** | This module allows you to convert an HTML5 &lt;select&gt; form element into a Selectivity instance. The items will be initialized from the &lt;option&gt; and &lt;optgroup&gt; elements.

Note that the build system automatically resolves dependencies between modules, so you never need to
explicitly specify that you want to include the base module, as it will be pulled in by others.

Example:

    $ gulp --modules=multiple,dropdown

This will create a custom build with support for selecting multiple values and a dropdown. The build
will be saved in `dist/selectivity-custom.js`. The dropdown will not feature a backdrop, there will
be no diacritics support, you will have to provide your own templates with their localizable
content, and you cannot use this build for creating a single-select input.

Note that because Selectivity uses Browserify internally, the build will contain various `require()`
calls, which may sometimes interfere with build systems that scan for those calls. If this gives
problems for you, you can pass the `--derequire` parameter to rename those calls. Of course, if
you're using Browserify in your own project you may even decide to skip the whole build process and
just copy the relevant modules from the `src/` directory straight into your project.

To display any other options available for custom builds, run `gulp help`.

### Development server

While developing, you can start a development server like this:

    $ gulp dev [--modules=<comma-separated-module-list>] [--source-map]

You may want to pass the `--source-map` parameter to generate a source map for debugging. The file
`demos/custom.html` is set up to work with custom builds, which you can also use for development.

Unit Tests
----------

Unit tests are available and can be ran using the following command:

    $ gulp unit-tests

Migrating from Select2
----------------------

Before you decide to migrate from Select2 to Selectivity, you should consider that not every feature
supported by Select2 is supported by Selectivity. So check beforehand whether Selectivity actually
meets your requirements.

### Unsupported features

The following is an (incomplete) list of features which Selectivity currently lacks:

 * Reordering of selected items. Select2 allows reordering of selected items, for example through
   drag 'n drop. Selectivity doesn't and there are curently no plans to implement this.
 * Options. Selectivity lacks some miscellaneous options supported by Select2. Notable omissions are
   `selectOnBlur` and `maximumSelectionSize`, among others.
 * Events. Select2 currently emits more events than Selectivity does. Notable omissions are
   'select2-clearing', 'select2-focus' and 'select2-blur' among others.

### Notable differences

 * Select2 has explicit support for tags through the `tags` option. With Selectivity, tagging is
   also supported, but works through the regular `items` option.
 * Formatting functions. Select2 allows you to specify a wide range of `format*()` functions in the
   options. With Selectivity, instead of passing various formatting functions, you can customize the
   templates, both globally and per instance.

### Miscellaneous

 * If you have customized the CSS you use with Select2, you will have to take into account that you
   may need to customize it again for Selectivity as the templates are very different.
 * Some properties are named differently, even though they have very similar meaning. Examples:
   * `createSearchChoice` is now `createTokenItem`.
   * The `choice` parameter to events is now called `item`.

Contributing
------------

Patches for bugfixes are always welcome. Please accompany pull requests for bugfixes with a test
case that is fixed by the PR.

If you want to implement a new feature, I advise to open an issue first in the
[GitHub issue tracker](https://github.com/arendjr/selectivity/issues) so we can discuss its merits.

In the absence of a formal style guide, please take the following into consideration:

- Use four spaces, no tabs.
- Prefer single quotes.
- No lines longer than 100 characters.

Also make sure you don't check-in any JSHint violations.

In order to validate your code before pushing, please run the following script:

    $ tools/install-git-hooks.sh

This will install a Git pre-push hook that will run JSHint and all unit tests before pushing.

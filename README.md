select3
=======

Flexible and modular alternative to Select2.

Motivation
----------

I've used [Select2](http://ivaynberg.github.io/select2/) for a long time because I reckon it is the
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

Browser Support
---------------

- Chrome
- Firefox
- Internet Explorer 10+
- Safari 6+

Dependencies
------------

Select3 only relies on [jQuery](http://jquery.com/) or [Zepto.js](http://zeptojs.com/) being loaded
on the page to work.

In addition, the default templates assume that you have included
[FontAwesome](http://fortawesome.github.io/Font-Awesome/) in your page to display the icons.

API
---

Call `$(selector).select3(options)` to initialize a Select3 instance on the element specified by the
given selector. The following options are supported:

Option          | Type                      | Description
--------------- | ------------------------- | -----------
allowClear      | `Boolean`                 | Set to `true` to allow the selection to be cleared. This option only applies to single-value inputs.
backspaceHighlightsBeforeDelete | `Boolean` | If set to `true`, when the user enters a backspace while there is no text in the search field but there are selected items, the last selected item will be highlighted and when a second backspace is entered the item is deleted. If `false`, the item gets deleted on the first backspace. The default value is true on devices that have touch input and false on devices that don't.
closeOnSelect   | `Boolean`                 | Set to `false` to keep the dropdown open after the user has selected an item. This is useful if you want to allow the user to quickly select multiple items. The default value is `true`.
createTokenItem | `Function`                | Function to create a new item from a user's search term. This is used to turn the term into an item when dropdowns are disabled and the user presses Enter. It is also used by the default tokenizer to create items for individual tokens. The function receives a `token` parameter which is the search term (or part of a search term) to create an item for and must return an item object with `id` and `text` properties or `null` if no token can be created from the term. The default is a function that returns an item where the id and text both match the term for any non-empty string and which returns `null` otherwise. This option only applies to multiple-value inputs.
data            | `Object` or `Array`       | Initial selection data to set. This should be an object with `id` and `text` properties in the case of input type 'Single', or an array of such objects otherwise. This option is mutually exclusive with `value`.
value           | `ID` or `Array`           | Initial value to set. This should be an ID (string or number) in the case of input type 'Single', or array of IDs otherwise. This property is mutually exclusive with `data`.
initSelection   | `Function`                | Function to map values by ID to selection data. This function receives two arguments, `value` and `callback`. The value is the current value of the selection, which is an ID or an array of IDs depending on the input type. The callback should be invoked with an object or array of objects, respectively, containing `id` and `text` properties.
inputType       | `String` or `Function`    | The input type to use. Default input types include 'Multiple', 'Single' and 'Email', but you can add custom input types to the `Select3.InputTypes` map or just specify one here as a function. The default value is 'Single', unless `multiple` is `true` in which case it is 'Multiple'.
items           | `Array`                   | Array of items from which to select. Should be an array of objects with `id` and `text` properties. As convenience, you may also pass an array of strings, in which case the same string is used for both the ID and the text. If items are given, all items are expected to be available locally and all selection operations operate on this local array only. If `null`, items are not available locally, and the `query` option should be provided to fetch remote data.
matcher         | `Function`                | Function to determine whether text matches a given search term. Note this function is only used if you have specified an array of items. Receives two arguments: `term` and `text`. The term is the search term, which for performance reasons has always been already processed using `Select3.transformText()`. The text is the text that should match the search term.
placeholder     | `String`                  | Placeholder text to display when the element has no focus and selected items.
query           | `Function`                | Function to use for querying items. Receives a single object as argument with the `callback`, `offset` and `term` properties. The callback should be invoked when the results are available. It should be passed a single object with `results` and `more` properties. The first is an array with result items and the latter is an optional boolean that may be set to `true` indicate more results are available through pagination. Offset is a property is only used for pagination and indicates how many results should be skipped when returning more results. The term is the search term the user is searching for. Unlike with the matcher function, the term has not been processed using `Select3.transformText()`. This option is ignored if the `items` option is used.
showDropdown    | `Boolean`                 | Set to false if you don't want to use any dropdown (you can still open still open it programmatically using `open()`).
templates       | `Object`                  | Object with instance-specific templates to override the global templates assigned to `Select3.Templates`.
tokenizer       | `Function`                | Function for tokenizing search terms. Will receive the `input` (the input string to tokenize), `selection` (the current selection data), `createToken` (callback to create a token from the search terms, should be passed an item object with `id` and `text` properties) and `options` (the options set on the Select3 instance) arguments. Any string returned by the tokenizer function is treated as the remainder of untokenized input. This option only applies to multiple-value inputs.
tokenSeparators | `Array`                   | Array of string separators which are used to separate the search term into tokens. If specified and the tokenizer property is not set, the tokenizer property will be set to a function which splits the search term into tokens separated by any of the given separators. The tokens will be converted into selectable items using the `createTokenItem` function. The default tokenizer also filters out already selected items. This option only applies to multiple-value inputs.

For documentation about all the available methods once Select3 has been instantiated, I refer to the
inline documentation in the source files for now.

Events
------

All of these events are emitted on the element to which the Select3 instance is attached and can be
listened to using jQuery's `on()` method.

Event                 | Description
--------------------- | -----------
`"change"`            | Emitted when the selection has been changed. Additional properties on the event object: `added`, `removed` and `val`.
`"select3-closed"`    | Emitted when the dropdown is closed.
`"select3-highlight"` | Emitted when an item in the dropdown is highlighted. Additional properties on the event object: `item` and `val`.
`"select3-open"`      | Emitted when the dropdown is opened.
`"select3-opening"`   | Emitted when the dropdown is about to be opened. You can call `preventDefault()` on the event object to cancel the opening of the dropdown.
`"select3-selected"`  | Emitted when an item has been selected. Additional properties on the event object: `id` and `item`.
`"select3-selecting"` | Emitted when an item is about to be selected. You can call `preventDefault()` on on the event object to prevent the item from being selected. Additional properties on the event object: `id` and `item`.

Migrating from Select2
----------------------

Before you decide to migrate from Select2 to Select3, you should consider that not every feature
supported by Select2 is supported by Select3. So check beforehand whether Select3 actually meets
your requirements.

### Unsupported features

The following is an (incomplete) list of features which Select3 currently lacks:

 * Labels (optgroups). This is a planned TODO item and Select3 will support this in the (near)
   future.
 * There is no search field in the dropdown for single-select inputs. This is a planned TODO item
   and Select3 will support this in the (near) future.
 * Nested items. Select3 lacks upport for nested items, ie. the dropdown cannot display hierarchical
   results. No support for this is currently planned.
 * Reordering of selected items. Select2 allows reordering of selected items, for example through
   drag 'n drop. Select3 doesn't and there are curently no plans to implement this.
 * AJAX. Select2 has a built-in AJAX query function that makes it easier to perform AJAX requests
   for fetching requests. This is a convenience feature as you can achieve the same result by
   calling `$.ajax()` in the query function, but it is one Select3 currently lacks.
 * Formatting functions. Select2 allows you to specify a wide range of `format*()` functions in the
   options. With Select3, it is hoped you won't have much need for these as Select3 allows for much
   easier customization of templates. However, practice will have to show if some of these are still
   desired.
 * Options. Select3 lacks some miscellaneous options supported by Select2. Notable omissions are
   `selectOnBlur`, `maximumSelectionSize`, and `minimumInputLength` among others.
 * Events. Select2 currently emits more events than Select3 does. Notable omissions are
   'select2-clearing', 'select2-focus' and 'select2-blur' among others.

### Notable differences

 * With Select2, you can take a &lt;select&gt; or &lt;input&gt; element in the DOM and initialize
   your Select2 instance based on that. Instead, to position a Select3 instance in the DOM you
   attach it to an empty &lt;div&gt; element and all options you want pass to Select3 are specified
   through the constructor method. An additional module is planned for Select3 that will simulate
   the Select2 approach, but this is not a high priority right now.
 * Select2 has explicit support for tags through the `tags` option. With Select3, tagging is also
   supported, but works through the regular `items` option.

### Miscellaneous

 * If you have customized the CSS you use with Select2, you will have to take into account that you
   may need to customize it again for Select3 as the templates are very different.
 * Some properties are named differently, even though they have very similar meaning. Examples:
   * `createSearchChoice` is now `createTokenItem`.
   * The `choice` parameter to events is now called `item`.

Build System
------------

Select3 is built modularly and uses Gulp as a build system to build its distributable files. To
install the necessary dependencies, please run:

    $ npm install -g gulp
    $ npm install

Then you can generate new distributable files from the sources, using:

    $ npm run build

### Creating custom builds

If you want to create your own Select3 library that contains just the modules you need, you can use
the following command:

    $ gulp custom --modules=<comma-separated-module-list>

The following modules are available:

Module         | Description
---------------|------------
**backdrop**   | This module provides the backdrop feature which is used by the dropdown. The backdrop is used to guarantee that when the dropdown is open and the user clicks outside the Select3 area, the dropdown will close. If you omit this module, a simpler implementation is used which will still attempt to close the dropdown when the user clicks outside the area, but which may fail when the user clicks on some element that has a custom click handler which prevents the event from bubbling.
**base**       | The Select3 base module which is pulled in automatically into every build.
**diacritics** | Diacritics support. This will make sure that `"Łódź"` will match when the user searches for `"Lodz"`, for example. However, if you always query a server when searching for results, you may want to solve matching of diacritics server-side, in which case this module can be ommitted.
**dropdown**   | Module that implements the dropdown. You will most likely want to include this, unless you only want to use Select3 without any dropdown or you provide a completely custom implementation instead.
**email**      | Implements the 'Email' input type. This is a special case of the 'Multiple' input type with no dropdown and a specialized tokenizer for recognizing email addresses (including pasted content from address books).
**locale**     | Localizable content pulled in by the default templates. You may or may not decide to use these with your own templates.
**multiple**   | Implements the 'Multiple' input type. If you only want to use Select3 with single values, you can leave this out.
**single**     | Implements the 'Single' input type. If you only want to use Select3 with multiple values, you can leave this out.
**templates**  | Default templates to use with Select3. If you provide your own templates, you may want to skip this.
**tokenizer**  | Default tokenizer implementation. This module adds support for the `tokenSeparators` option which is used by the default tokenizer. Support for tokenizers themselves is already included in the "multiple" module, so you can omit this module if you don't want to use any tokenizers or want to specify your own tokenizer.

Note that the build system automatically resolves dependencies between modules, so you never need to
explicitly specify that you want to include the base module, as it will be pulled in by others.

Example:

    $ gulp custom --modules=multiple,dropdown

This will create a custom build with support for selecting multiple values and a dropdown. The build
will be saved in `dist/select3-custom.js`. The dropdown will not feature a backdrop, there will be
no diacritics support, you will have to provide your own templates with their localizable content,
and you cannot use this build for creating a single-select input.

Finally, you may wish to specify the `--minify` option to minimize the size of your custom builds.
This will run Browserify's bundle-collapser plugin on the build and minimize the code using
UglifyJS. The resulting build will be saved in `dist/select3-custom.min.js`.

### Development server

While developing, you can start a development server like this (note this will overwrite some
distributable files with development versions which you are not supposed to check in, so either make
a new build, or revert the changes in the dist/ directory before committing):

    $ gulp dev

Unit Tests
----------

Unit tests are available and can be ran using the following command:

    $ gulp unit-tests

Project Status
--------------

Select3 is in an early stage of development. The following items are on the short-term TODO list:

 * Implement automatic pagination.
 * Add search input to dropdown for single-value inputs.
 * Add support for labels (optgroup).
 * Add module that will easily perform AJAX requests instead of doing this through the query()
   function.
 * Add module that can transform an existing &lt;select&gt; input in the DOM into a Select3 instance.

Contributing
------------

Patches for bugfixes are always welcome. Please accompany pull requests for bugfixes with a test
case that is fixed by the PR.

If you want to implement a new feature, I advise to open an issue first in the
[GitHub issue tracker](https://github.com/arendjr/select3/issues) so we can discuss its merits.

In the absence of a formal style guide, please take the following into consideration:

- Use four spaces, no tabs.
- Prefer single quotes.
- No lines longer than 100 characters.

Also make sure you don't check-in any JSHint violations.

In order to validate your code before pushing, please run the following script:

    $ tools/install-git-hooks.sh

This will install a Git pre-push hook that will run JSHint and all unit tests before pushing.

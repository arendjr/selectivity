select3
=======

Flexible and modular alternative to Select2.

Motivation
----------

I've used Select2 for a long time because I reckon it is the best and most feature-rich selection
library out there.

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
  been accepted in Select2, but unfortunately it's a moving target causing repeated breakage.
- Personally, I preferred a more modern codebase to work with, rather than the huge monolithic
  library that is Select2. At this point also support for any IE version older than 10 can be
  dropped.

Having said that, if you're a user of Select2 and don't recognize yourself in any of these issues,
I advise you to keep using Select2. It's feature-rich and actively supported, so don't fix what
ain't broken ;)

Build System
------------

Select3 is built modularly and uses Gulp as a build system to build its distributable files. To
install the necessary dependencies, please run:

    $ npm install -g gulp
    $ npm install

Then you can generate new distributable files from the sources, using:

    $ npm run build

While developing, you can start a development server like this (note this will overwrite some
distributable files with development versions which you are not supposed to check in, so either make
a new build, or revert the changes in the dist/ directory before committing):

    $ gulp dev

Contributing
------------

Patches for bugs are always welcome. If you want to implement a new feature, I advise to open an
issue first in the [GitHub issue tracker](https://github.com/arendjr/select3/issues) so we can
discuss its merits.

In the absence of a formal style guide, please take the following into consideration:

- Use four spaces, no tabs.
- Prefer single quotes.
- No lines longer than 100 characters.

Also make sure you don't check-in any JSHint violations. In order to validate your code before
pushing, please run the following script:

    $ tools/install-git-hooks.sh

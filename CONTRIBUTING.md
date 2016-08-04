Contributing
============

Patches for bugfixes are always welcome. Please accompany pull requests for bugfixes with a test
case that is fixed by the PR.

If you want to implement a new feature, I advise to open an issue first in the
[GitHub issue tracker](https://github.com/arendjr/selectivity/issues) so we can discuss its merits.

In the absence of a formal style guide, please take the following into consideration:

- Use four spaces, no tabs.
- Prefer single quotes.
- No lines longer than 100 characters.

Also make sure you don't check-in any ESLint violations.

In order to validate your code before pushing, please run the following script:

    $ tools/install-git-hooks.sh

This will install a Git pre-push hook that will run ESLint and all unit tests before pushing.

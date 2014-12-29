#!/bin/bash

dir=`pwd`
while [ ! -d "$dir/.git" ]; do
    dir=`dirname $dir`
    if [ "$dir" == "/" ]; then
        echo "Cannot find .git directory."
        exit 1
    fi
done

if [ -e "$dir/.git/hooks/pre-push" ]; then
    echo "A pre-push hook is already installed. Please remove the following file"
    echo "if you wish to (re)install this pre-push hook:"
    echo "  $dir/.git/hooks/pre-push"
    exit 1
else
    ln -s "$dir/tools/git-pre-push" "$dir/.git/hooks/pre-push"
    echo "Git pre-push hook installed."
fi

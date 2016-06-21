version=$1
if [ "x$version" = "x" ]; then
    echo "Usage: tools/create_release.sh <version>"
    exit 1
fi

echo "Creating release tarball $version..."

mkdir release/selectivity-$1
npm run build
cp build/selectivity-full.* release/selectivity-$1
cp CHANGELOG.md LICENSE README.md release/selectivity-$1
tar czf release/selectivity-$1.tar.gz release/selectivity-$1
rm -R release/selectivity-$1

echo "Creating NPM package $version..."

if [[ -e release/selectivity ]]; then
    rm -R release/selectivity
fi

mkdir release/selectivity
cp -R LICENSE package.json src/* release/selectivity
rm -R selectivity
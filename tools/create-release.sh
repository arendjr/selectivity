version=$1
echo "Creating release $version..."

mkdir selectivity-$1
npm run build
cp dist/selectivity-full.* selectivity-$1
cp LICENSE README.md selectivity-$1
tar czf selectivity-$1.tar.gz selectivity-$1
rm -R selectivity-$1

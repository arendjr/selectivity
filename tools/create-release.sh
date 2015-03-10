version=$1
echo "Creating release $version..."

mkdir select3-$1
npm run build
cp dist/select3-full.* select3-$1
cp LICENSE README.md select3-$1
tar czf select3-$1.tar.gz select3-$1
rm -R select3-$1

#!/bin/bash -e
#
# Package Augury into crx format Chrome extension
# (This will not be needed for official distribution)
# Based on https://developer.chrome.com/extensions/crx#scripts

node -v
npm -v

dir="temp"
key="key.pem"
name="augury"
files="manifest.json build images index.html frontend.html popup.html popup.js"

crx="$name.crx"
pub="$name.pub"
sig="$name.sig"
zip="$name.zip"

# assign build name to zip and crx file in circleci env
if [ $CIRCLE_BUILD_NUM ] || [ $CIRCLE_ARTIFACTS ]; then
  crx="$name-$CIRCLE_BUILD_NUM.crx"
  zip="$name-$CIRCLE_BUILD_NUM.zip"
fi

trap 'rm -f "$pub" "$sig"' EXIT

# copy all the files we need
rm -rf $dir
mkdir $dir
cp -R $files $dir/
rm $dir/build/*.map

# generate private key key.pem if it doesn't exist already
if [ ! -f $key ]; then
  echo "$key doesn't exist."
  openssl genrsa -out key.pem 1024
fi

# zip up the crx dir
cwd=$(pwd -P)
(cd "$dir" && zip -qr -9 -X "$cwd/$zip" .)

# signature
openssl sha1 -sha1 -binary -sign "$key" < "$zip" > "$sig"

# public key
openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

byte_swap () {
  # Take "abcdefgh" and return it as "ghefcdab"
  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
}

crmagic_hex="4372 3234" # Cr24
version_hex="0200 0000" # 2
pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
(
  echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
  cat "$pub" "$sig" "$zip"
) > "$crx"

echo "Wrote $crx"

# move crx to artifacts folder in circleci
if [ $CIRCLE_ARTIFACTS ]; then
  mv $crx $CIRCLE_ARTIFACTS
  mv $zip $CIRCLE_ARTIFACTS
fi


echo "<script>window.location.href = 'https://s3.amazonaws.com/batarangle.io/$crx';</script>" > download.html
echo "Wrote file"

# clean up
rm -rf $dir
echo "Fin."

#!/bin/bash -e
#
# Package batarangle into crx format Chrome extension
# (This will not be needed for official distribution)
# Based on https://developer.chrome.com/extensions/crx#scripts

node -v
npm -v

dir="temp"
key="key.pem"
name="batarangle"
files="build frontend styles images index.html manifest.json"

crx="$name.crx"
pub="$name.pub"
sig="$name.sig"
zip="$name.zip"
trap 'rm -f "$pub" "$sig" "$zip"' EXIT

# copy all the files we need
rm -rf $dir
mkdir $dir
cp -R $files $dir/

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

# clean up
rm -rf $dir
echo "Fin."
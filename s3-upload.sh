#!/bin/bash -e
#
# Push the latest build to batarangle s3 bucket

echo "Start"

# bucket name
bucket=batarangle.io
dateValue=$(date -u +'%Y%m%dT%H%M%SZ')

# filename generated using circleci
file="batarangle-$CIRCLE_BUILD_NUM.crx"
resource="/${bucket}/${file}"
contentType="application/x-compressed-tar"

# create signed token
stringToSign="PUT\n\n${contentType}\n${dateValue}\n${resource}"

# fetch aws credentials from env variables
s3Key=$AWS_ACCESS_KEY_ID
s3Secret=$AWS_SECRET_ACCESS_KEY

# create hmac signature
signature=`echo -en ${stringToSign} | openssl sha1 -hmac ${s3Secret} -binary | base64`

# curl request to put the file
curl -X PUT -T "${file}" \
  -H "Host: ${bucket}.s3.amazonaws.com" \
  -H "Date: ${dateValue}" \
  -H "Content-Type: ${contentType}" \
  -H "Authorization: AWS ${s3Key}:${signature}" \
  http://${bucket}.s3.amazonaws.com/${file}


file="download.html"
resource="/${bucket}/${file}"
contentType="text/html"

# curl request to put the file
curl -X PUT -T "${file}" \
  -H "Host: ${bucket}.s3.amazonaws.com" \
  -H "Date: ${dateValue}" \
  -H "Content-Type: ${contentType}" \
  -H "Authorization: AWS ${s3Key}:${signature}" \
  http://${bucket}.s3.amazonaws.com/${file}

echo "Finish"

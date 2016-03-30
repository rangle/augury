#!/bin/bash -e
#
# Push the latest build to batarangle s3 bucket

echo "Start"

# filename generated using circleci
file=batarangle.crx

# bucket name
bucket=batarangle.io
resource="/${bucket}/${file}"
contentType="application/x-compressed-tar"
dateValue=$(date -u +'%Y%m%dT%H%M%SZ')

# create signed token
stringToSign="PUT\n\n${contentType}\n${dateValue}\n${resource}"

echo $CIRCLE_BUILD_NUM
echo $AWS_ACCESS_KEY_ID

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

echo "Finish"
# tests/integration/lab-9-s3.hurl
# This file contains tests for S3 integration

# 1. Authenticated json POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment, but with a specific charset
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`Hello S3!`

# We expect to get back HTTP 201
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
[Captures]
url: header "Location"


# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"


# 3. Try to DELETE the fragment we just posted by its ID
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200


# 4. Try to GET the fragment we just deleted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 404
HTTP/1.1 404
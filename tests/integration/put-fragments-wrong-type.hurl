# tests/integration/put-fragments-unsupported-type.hurl

# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`This is an unedited fragment!`

# Expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"


# 2. Try to GET the fragment we just posted by its URL (verify it exists)
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200
Content-Type: text/plain
Content-Length: 29
[Asserts]
body == "This is an unedited fragment!"


# 3. Try to PUT on the fragment we just posted BUT with the wrong type by its URL
PUT {{url}}
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
# Body of the request
`This is an edited fragment BUT with the wrong type!`

# Expect to get back HTTP 400
HTTP/1.1 400
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 400
jsonpath "$.error.message" == "Failed to update fragment data. Fragment type mismatch: expected text/plain, received text/markdown"


# 4. Try to GET the fragment we just attempted to update by its URL (Verify it was not updated)
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200
Content-Type: text/plain
Content-Length: 29
[Asserts]
body == "This is an unedited fragment!"


# 5. CLEANUP: Authenticated DELETE to /v1/fragments/:id
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200


# 6. CLEANUP: Authenticated GET to /v1/fragments/:id to make sure the fragment was deleted
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 404
HTTP/1.1 404
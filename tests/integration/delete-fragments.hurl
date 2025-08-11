# tests/integration/delete-fragments.hurl


# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`This is a fragment!`

# Expect to get back an HTTP 201
HTTP/1.1 201
# Check various assertions about the response
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

# 2. Try to GET the fragment we just posted by its URL (verify it exists)
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200
Content-Type: text/plain
Content-Length: 19
[Asserts]
body == "This is a fragment!"


# 3. Authenticated DELETE to /v1/fragments/:id
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"


# 4. Authenticated GET to /v1/fragments/:id to make sure the fragment was deleted
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 404
HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "Failed to get fragment data. Fragment with id={{id}} does not exist"
# tests/integration/post-fragments-json.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`{"data": "This is a fragment!"}`

# Expect to get back HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 31
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"


# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200
Content-Type: application/json
Content-Length: 31
[Asserts]
body == `{"data": "This is a fragment!"}`


# 3. CLEANUP: Authenticated DELETE to /v1/fragments/:id
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 200
HTTP/1.1 200


# 4. CLEANUP: Authenticated GET to /v1/fragments/:id to make sure the fragment was deleted
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 404
HTTP/1.1 404
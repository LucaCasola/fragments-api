# tests/integration/lab-10-dynamodb.hurl
# This file contains tests for DynamoDB integration

# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a json fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`{"service": "DynamoDB"}`

# We expect to get back HTTP 201
HTTP/1.1 201
# Capture the Location header and fragment ID for further tests
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"


# 2. Authenticated GET to /v1/fragments/:id/info for the fragment we just created
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" > 0


# 3. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

# We expect to get back HTTP 201
HTTP/1.1 201
# Capture the Location header and fragment ID for further tests
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"


# 4. Authenticated GET to /v1/fragments/:id/info for the fragment we just created
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22


# 5. Authenticated GET to /v1/fragments, which should return both fragments' IDs
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
# The response should contain both IDs for the fragments we created
jsonpath "$.userFragments" count == 2
jsonpath "$.userFragments[0]" == "{{fragment1_id}}"
jsonpath "$.userFragments[1]" == "{{fragment2_id}}"


# 6. Authenticated DELETE to /v1/fragments/:id for the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200


# 7. Authenticated GET to /v1/fragments/:id for the fragment we just deleted
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 404
HTTP/1.1 404


# 8. Authenticated GET to /v1/fragments
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
# The response should contain only the second fragment ID, as the first one was deleted
jsonpath "$.userFragments[0]" == "{{fragment2_id}}"


# 9. CLEANUP: Authenticated DELETE to /v1/fragments/:id for the second fragment
DELETE {{fragment2_url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 200
HTTP/1.1 200


# 10. CLEANUP: Authenticated GET to /v1/fragments/:id to make sure the second fragment was deleted
GET {{fragment2_url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back HTTP 404
HTTP/1.1 404
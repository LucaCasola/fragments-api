# tests/integration/put-fragments-404.hurl


# Authenticated PUT to /v1/fragments/:id for fragment that does not exist
PUT http://localhost:8080/v1/fragments/123
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`This is an edited fragment`

# Expect to get back HTTP 404
HTTP/1.1 404
# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "Failed to update fragment data. Fragment with id=123 does not exist"
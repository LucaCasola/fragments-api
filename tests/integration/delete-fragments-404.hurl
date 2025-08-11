# tests/integration/delete-fragments-404.hurl


# Authenticated DELETE to /v1/fragments/:id for fragment that does not exist
DELETE http://localhost:8080/v1/fragments/123
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Expect to get back HTTP 404
HTTP/1.1 404
# Check various assertions about the response
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "Failed to delete fragment. Fragment with id=123 does not exist"
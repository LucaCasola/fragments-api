# tests/integration/delete-fragments.hurl


# unauthenticated DELETE to /v1/fragments
DELETE http://localhost:8080/v1/fragments/123
# Include HTTP Basic Auth credentials
[BasicAuth]
fake@email.com:password222

# Expect to get back HTTP 401
HTTP/1.1 401
# Check various assertions about the response
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" == "Unauthorized"
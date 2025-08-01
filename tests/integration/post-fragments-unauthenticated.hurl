# tests/integration/post-fragments-unauthenticated.hurl

# unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
fake@email.com:password222
# Body of the request
`This should be denied!`

# We expect to get back HTTP 401
HTTP/1.1 401
# We have various assertions about the response that we want to check
[Asserts]
# Status should be error
jsonpath "$.status" == "error"
# The error code should be 401 for unsupported content type
jsonpath "$.error.code" == 401
# The error message should indicate unsupported content type and specify the type
jsonpath "$.error.message" == "Unauthorized"
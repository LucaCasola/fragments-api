# tests/integration/post-fragments-unsupported-type.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment of unsupported type
Content-Type: text/unsupported-type
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`This is an unsupported fragment!`

# We expect to get back HTTP 415
HTTP/1.1 415
# We have various assertions about the response that we want to check
[Asserts]
# Status should be error
jsonpath "$.status" == "error"
# The error code should be 415 for unsupported content type
jsonpath "$.error.code" == 415
# The error message should indicate unsupported content type and specify the type
jsonpath "$.error.message" == "Unsupported Content-Type: text/unsupported-type"
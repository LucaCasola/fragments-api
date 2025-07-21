# tests/integration/post-fragments-charset.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment, but with a specific charset
Content-Type: text/plain; charset=utf-8
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
`Fragment with UTF-8 encoding!`

# We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"


# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"


# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Fragment with UTF-8 encoding!"
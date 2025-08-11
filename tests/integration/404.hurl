# tests/integration/404.hurl
# This file contains tests for 404 responses

# Authenticated GET to a non-existent fragment
GET http://localhost:8080/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

# Expect to get back HTTP 404
HTTP/1.1 404
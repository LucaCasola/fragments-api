# tests/integration/health-check.hurl
# This file contains tests for the health check endpoint

# Authenticated GET to /
GET http://localhost:8080

# Expect to get back HTTP 200
HTTP/1.1 200
# Should get back a non-cacheable response (cache-control header)
Cache-Control: no-cache
# Check various assertions about the response
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
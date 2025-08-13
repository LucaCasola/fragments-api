# Fragment Storage & Conversion API

The **Fragment Storage & Conversion API** is a scalable HTTP REST service for storing, managing, and transforming small pieces of data—called *fragments*. A fragment can be text, structured data, or an image, with full support for format conversion while storing only the original data to minimize storage costs.


## Key Features

- Full **CRUD** operations for all supported fragment types.  
- **Format conversion** between compatible types (e.g., Markdown → HTML, CSV → JSON, JPEG → PNG).  
- **Metadata storage** for each fragment, including size, type, and creation/modification timestamps.  
- **Secure access control**, with strict user isolation and no public endpoints.  
- **Massive scalability** to handle high volumes of stored data.  
- Fully automated **GitHub-based CI/CD pipeline** for build, test, and deployment to AWS.


## Supported Fragment Types & Valid Conversions

| Type | Valid Conversion Extensions |
|------|------------------------------|
| `text/plain` | `.txt` |
| `text/markdown` | `.md`, `.html`, `.txt` |
| `text/html` | `.html`, `.txt` |
| `text/csv` | `.csv`, `.txt`, `.json` |
| `application/json` | `.json`, `.yaml`, `.yml`, `.txt` |
| `application/yaml` | `.yaml`, `.txt` |
| `image/png` | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/jpeg` | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/webp` | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/avif` | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/gif` | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |


## Scripts

_**'npm run lint'**_: check for any linting errors in the codebase

_**'npm start'**_: run the server normally

_**'npm run dev'**_: run the server via nodemon which watches the src/ folder for any changes, restarting the server when a change is detected

_**'npm run debug'**_: run the server the same as dev, but also start the node inspector on port 9229 so that you can attach a debugger (in my case, VSCode's debugger)

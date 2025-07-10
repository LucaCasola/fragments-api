# Stage 0: install dependencies
FROM node:22.15.0-alpine3.21@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS dependencies

# Define metadata about the image
LABEL maintainer="Luca Casola <lucacasola0@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false  

WORKDIR /app
COPY package.json package-lock.json ./
# Install node dependencies defined in package-lock.json & based on the NODE_ENV
RUN npm ci

################################################################################

# Stage 1: build and run the site
FROM node:22.15.0-alpine3.21@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS build

WORKDIR /app
# Copy generated dependencies from the previous stage
COPY --from=dependencies /app /app
# Copy the source code
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd
# Build the application
CMD ["npm", "start"]
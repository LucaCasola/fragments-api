# Use node version 22.15.0 & alpine version 3.21 as our base image
FROM node:22.15.0-alpine3.21@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS builder
  # Define metadata about the image
  LABEL maintainer="Luca Casola <lucacasola0@gmail.com>"
  LABEL description="Fragments node.js microservice"

  # Set the environment to production. Ensures that we do not install any devDependencies
  ENV NODE_ENV=production

  # We default to use port 8080 in our service
  ENV PORT=8080

  # Reduce npm spam when installing within Docker
  ENV NPM_CONFIG_LOGLEVEL=warn

  # Disable colour when run inside Docker
  ENV NPM_CONFIG_COLOR=false  


# Copy all required files into the image
FROM builder AS copyfiles
  # Use /app as our working directory
  WORKDIR /app

  # Copy the package.json and package-lock.json files into the working dir (/app)
  COPY package.json package-lock.json ./

  # Install node dependencies defined in package-lock.json & based on the NODE_ENV
  RUN npm ci --$NODE_ENV

  # Copy src (all server source code) to /app/src/
  COPY ./src ./src

  # Copy our HTPASSWD file
  COPY ./tests/.htpasswd ./tests/.htpasswd


# Run server and expose port 8080
FROM copyfiles AS final
  # Start the container by running our server
  CMD ["npm", "start"]

  # We run our service on port 8080
  EXPOSE $PORT
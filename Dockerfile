# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and bun.lockb to the container
COPY package.json bun.lockb ./

# Install Bun
RUN npm install -g bun
RUN bun upgrade

# Install project dependencies using Bun
RUN mkdir static
RUN bun install

# Copy the rest of the application code to the container
COPY . .

# Build your SvelteKit application using Bun
RUN bun run build

# Expose the port your SvelteKit app will run on
ENV PORT=3000
EXPOSE $PORT

# Start the SvelteKit application
CMD ["bun", "./build/index.js"]
# Load Node from DockerHub
FROM node

WORKDIR /ticket_server

COPY . .

# Install project dependencies
RUN npm install

RUN npx prisma migrate dev

# Start NodeJS server
CMD ["npm", "run", "dev"]

# Expose NodeJS port
EXPOSE 3000
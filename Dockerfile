# Load Node from DockerHub
FROM node:18-alpine

WORKDIR /ticket_server

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]
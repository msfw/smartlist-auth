FROM node:13.12.0-alpine3.11
WORKDIR /usr/auth/src
COPY ./package*.json ./
RUN npm install
COPY . /usr/auth
CMD ["npm", "start"]
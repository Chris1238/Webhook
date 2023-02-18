FROM node:16-alpine
WORKDIR /usr/app
COPY src package.json ./

RUN npm i
ENTRYPOINT ["node", "src/app.js"]

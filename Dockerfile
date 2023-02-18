FROM node:16-alpine
COPY src package.json ./

RUN npm i
ENTRYPOINT ["node", "src/app.js"]
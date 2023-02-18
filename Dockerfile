FROM node:gallium-alpine3.16
    WORKDIR /usr/app
    COPY src package.json ./

    RUN npm i
    ENTRYPOINT ["node", "/usr/app/src/app.js"]

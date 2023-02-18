FROM node:gallium-alpine3.16
    WORKDIR /usr/app
    COPY ./package.json /usr/app/package.json
    COPY ./src /usr/app/src

    RUN npm i
    ENTRYPOINT ["node", "/usr/app/src/app.js"]
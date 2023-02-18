FROM node:gallium-alpine3.16
    WORKDIR /usr/app
    COPY src package.json /usr/app/

    RUN npm i
    ENTRYPOINT ["node", "/usr/app/src/app.js"]
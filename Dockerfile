FROM alpine:latest
MAINTAINER pangpond
LABEL Description="NodeJS Terminal Bot Container" Version="1.0"
ENV NODE_VERSION=v9.4.0 NPM_VERSION=2.14.12 TITLE=NODEJS_BOT_NOTIFY INTERVAL=60s HEAP_HIGH=70 MEM_HIGH=30 SH_OS=Y


RUN apk update && \
    apk add tzdata && \
    apk add git && \
    rm /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    apk add nodejs curl vim bash
RUN mkdir /nodejs
COPY /index.js /nodejs/index.js
COPY /.babelrc /nodejs/.babelrc
RUN mkdir /nodejs/src
COPY /src/notify.js /nodejs/src/notify.js
WORKDIR /nodejs
RUN npm install dotenv moment moment-timezone pg request fs path --save
RUN npm install babel-preset-node5 babel-register eslint eslint-plugin-import --save-dev

ENTRYPOINT ["node","index.js"]
EXPOSE 3000

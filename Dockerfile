FROM node:16-alpine

WORKDIR /app

COPY . .

RUN apk add sqlite-dev && \
    apk add --virtual build-deps python3 g++ make && \
    npm run rPi-install && \ 
    npm run build && \
    npm prune --production && \
    apk del build-deps && \
    cd ./client && \
    # leave only build directory in client
    mv build .. && \
    rm -rf * && \
    mv ../build . && \
    cd ..

EXPOSE 3001

CMD [ "npm", "start" ]

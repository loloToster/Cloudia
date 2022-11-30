FROM --platform=linux/arm/v7 node:16

WORKDIR /app

COPY . .

RUN npm i && \ 
    npm run build && \
    npm prune --production && \
    cd ./client && \
    # leave only build directory in client
    mv build .. && \
    rm -rf * && \
    mv ../build . && \
    cd ..

EXPOSE 3001

CMD [ "npm", "start" ]

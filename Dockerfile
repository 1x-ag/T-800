FROM node:12.10.0
#FROM PYTHON:2.7

WORKDIR /home/node/app
ADD dist .
ADD package.json .
ADD package-lock.json .

RUN npm i

EXPOSE 8545

CMD [ "node", "index.js" ]

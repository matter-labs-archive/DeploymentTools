FROM node:9.11.1
WORKDIR /usr/src/app
RUN npm install -g ganache-cli
RUN npm install -g truffle@4.1.3 
RUN npm install -g lodash 
RUN cd /usr/local/lib/node_modules/truffle && npm install solc@0.4.24 && cd -
COPY . .
EXPOSE 8545
CMD ["./start.sh"]

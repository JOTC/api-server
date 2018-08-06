FROM node:4.2.6

RUN mkdir /app
WORKDIR /app

#RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
#RUN curl -s https://raw.githubusercontent.com/lovell/sharp/master/preinstall.sh | bash -

ADD ./package.json .

RUN npm install

CMD node es6-wrapper.js
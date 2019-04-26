FROM node:10.15.3-jessie-slim

# download relaxed dependencies
RUN apt-get update
RUN apt-get install -qq -y libx11-6 libx11-xcb-dev libxcomposite1 libxcursor1 libxdamage1 libxext6 \
                           libxi6 libxtst6 libglib2.0-0 libnss3 libcups2 libxss1 libxrandr-dev \
                           libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0

# download and install newest version of relaxed globally
RUN mkdir /opt/relaxed
WORKDIR /opt/relaxed
RUN wget https://github.com/Boilertalk/ReLaXed/archive/master.tar.gz
RUN tar -xzf master.tar.gz -C . --strip-components=1
RUN rm master.tar.gz
RUN npm install
RUN npm link --unsafe-perm=true

# add app
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# install dependencies
RUN npm install

# run app
CMD node index.js

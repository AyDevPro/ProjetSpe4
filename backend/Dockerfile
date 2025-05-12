FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install -g nodemon && npm install

COPY . .

CMD ["nodemon", "index.js"]
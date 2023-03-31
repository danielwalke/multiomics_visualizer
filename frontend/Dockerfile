FROM node:12.2.0-alpine as react_build 
WORKDIR /app
COPY . /app
RUN npm install --silent
RUN npm install react-scripts@3.0.1 -g --silent
RUN npm run build
FROM nginx:1.16.0-alpine
COPY --from=react_build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY server/server.conf /etc/nginx/conf.d

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
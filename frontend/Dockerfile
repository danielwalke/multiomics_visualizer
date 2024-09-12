# Use a lightweight web server to serve the static files
FROM nginx:alpine
#RUN npm install
#RUN npm run build

# Copy the build output to the web server's directory
# COPY build /usr/share/nginx/html
COPY build /etc/nginx/html/multiomics

# Copy a custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

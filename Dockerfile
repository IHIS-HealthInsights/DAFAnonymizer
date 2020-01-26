FROM nginx:stable

RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY ./build/ /var/www
COPY ./deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./deployment/certs/ /etc/nginx/certs

CMD ["nginx"]

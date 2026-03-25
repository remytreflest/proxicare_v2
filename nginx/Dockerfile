FROM nginx:alpine

COPY nginx.conf /etc/nginx/ssl-nginx.conf
COPY init-nginx.conf /etc/nginx/init-nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

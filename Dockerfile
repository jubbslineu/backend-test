FROM postgres:16.2-alpine3.19

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=toygers

EXPOSE 5432

# ENTRYPOINT ["tail", "-f", "/dev/null"]
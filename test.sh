#!/usr/bin/env bash

echo -e "\033[0;32mGenerate hasura auth image\033[0m"
build_image_log=$(docker build .)
image_key=$(grep 'Successfully built' <<< $build_image_log | awk '{print $NF}')

hasura_version="v1.0.0"
test_id="test_$image_key_$(date +%s)"

database_name=${test_id}
network_name="network_$test_id"

# Container names
app_container="app_$test_id"
hasura_container="hasura_$test_id"
postgres_container="postgres_$test_id"

echo -e "\033[0;32mCreate a network\033[0m"
docker network create ${network_name} > /dev/null 2>&1

echo -e "\033[0;32mCreate a postgres container\033[0m"
docker run \
  -it \
  -d \
  --rm \
  --name ${postgres_container} \
  --network ${network_name} \
  postgres:12-alpine > /dev/null 2>&1

echo -e "\033[0;32mWaiting for postgres\033[0m"
retries=5
until docker exec -it ${postgres_container} psql -U "postgres" -c '\q' > /dev/null 2>&1; do
  if [ $retries -eq 0 ] ; then
    echo -e "\033[0;31mPostgres is unavailable\033[0m"
    echo -e "\033[0;33mCleanup\033[0m"
    docker stop ${postgres_container} > /dev/null 2>&1
    docker image rm -f ${image_key} > /dev/null 2>&1
    docker network rm ${network_name} > /dev/null 2>&1
    exit 1
  fi

  retries=$((--retries))
  sleep 1
done

echo -e "\033[0;32mCreate a empty database\033[0m"
docker exec \
  -i \
  ${postgres_container} \
  psql -U "postgres" -c "create database $database_name" > /dev/null 2>&1


echo -e "\033[0;32mCreate a hasura container\033[0m"
docker run \
  -it \
  -d \
  --rm \
  --link "${postgres_container}:postgres" \
  -e HASURA_GRAPHQL_DATABASE_URL=postgres://postgres:@postgres:5432/${database_name} \
  -v "$(pwd)/migrations":/tmp/hasura-test/migrations \
  --name ${hasura_container} \
  --network ${network_name} \
  hasura/graphql-engine:${hasura_version}.cli-migrations > /dev/null 2>&1

echo -e "\033[0;32mWaiting for hasura\033[0m"
retries=5
until docker exec -it ${hasura_container} nc -z "localhost" "8080" > /dev/null 2>&1; do
  if [ $retries -eq 0 ] ; then
    echo -e "\033[0;Hasura is unavailable\033[0m"
    echo -e "\033[0;33mCleanup\033[0m"
    docker stop ${hasura_container} > /dev/null 2>&1
    docker stop ${postgres_container} > /dev/null 2>&1
    docker image rm -f ${image_key} > /dev/null 2>&1
    docker network rm ${network_name} > /dev/null 2>&1
    exit 1
  fi

  retries=$((--retries))
  sleep 4
done

echo -e "\033[0;32mApply hasura migrations\033[0m"

docker exec \
  -it \
  ${hasura_container} \
  sh -c "$( cat <<-EOF
    cd /tmp/hasura-test &&
    echo "endpoint: http://localhost:8080" > config.yaml &&
    echo "show_update_notification: false" >> config.yaml &&
    hasura-cli migrate apply &&
    if [ -f metadata.json ] || [ -f metadata.yaml ] ; then hasura-cli metadata apply; fi
EOF
)"

docker run \
  -it \
  -d \
  --rm \
  --network ${network_name} \
  --link "${hasura_container}:hasura" \
  --name ${app_container} \
  ${image_key} \
  yarn start:test > /dev/null 2>&1

echo -e "\033[0;32mWaiting for app\033[0m"
retries=5
until docker exec -it ${app_container} sh -c "netstat -nlt | grep '::4000'" > /dev/null 2>&1; do
  if [ $retries -eq 0 ] ; then
    echo -e "\033[0;App is unavailable\033[0m"
    docker logs ${app_container}
    echo -e "\033[0;33mCleanup\033[0m"
    docker stop ${app_container} > /dev/null 2>&1
    docker stop ${hasura_container} > /dev/null 2>&1
    docker stop ${postgres_container} > /dev/null 2>&1
    docker image rm -f ${image_key} > /dev/null 2>&1
    docker network rm ${network_name} > /dev/null 2>&1
    exit 1
  fi

  retries=$((--retries))
  sleep 4
done

docker exec \
  -it \
  ${app_container} \
  yarn test --ci

jest_exit_code="$?"

echo -e "\033[0;33mCleanup\033[0m"
docker stop ${app_container} > /dev/null 2>&1
docker stop ${hasura_container} > /dev/null 2>&1
docker stop ${postgres_container} > /dev/null 2>&1
docker image rm -f ${image_key} > /dev/null 2>&1
docker network rm ${network_name} > /dev/null 2>&1

exit $jest_exit_code
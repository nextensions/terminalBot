# terminalBot

```
docker build -t terminalbot:latest .

docker swarm init
echo "postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}" | docker secret create PG_CONNECTION_STRING -
echo "{line token from https://notify-bot.line.me}" | docker secret create LINETOKEN -

docker deploy -c docker-compose.yml terminal
```

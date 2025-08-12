# Este passo a passo é para subir o cardápio usando o docker compose

# 1. Build o `docker-compose.yml


- Para subir tanto os dockerfile's do `frontend` + `backend` juntos

```sh
docker-compose build
```

```sh
docker build -t frontend .
```

```sh
docker run -p 5173:5173 frontend:latest
```

- Para subir um dos dois, `front` ou `back`:

```sh
docker-compose build frontend
```
```sh
docker-compose build backend
```

# 2. Validações

Ao aparecer essas mensagens significa que os dockers foram buildados e você estará pronto para subi-los.

```
 => [frontend] resolving provenance for metadata file                                                                                              0.0s 
[+] Building 2/2
 ✔ backend   Built                                                                                                                                 0.0s 
 ✔ frontend  Built
 ```

 ## 2.1 Subindo os containers:

 ```sh
 docker-compose up -d
 ```

 ## 2.2 Verificando se os containers subiram corretamente:

 ```sh
 docker ps -a
 ```

 Se a coluna `PORTS` não estiver mostrando nada significa que deu falha.

 ```sh
 docker logs delivery_ess_g2-backend-1
 ```

# 3. Removendo containers

## 3.1 - Parando todos os containers

```sh
for /F "tokens=*" %i in ('docker ps -q') do docker stop %i
```

## 3.2 - Excluindo todos os containers

```sh
for /F "tokens=*" %i in ('docker ps -aq') do docker rm -f %i
```

```
docker compose build --no-cache
docker compose up
```
# postman-to-swagger

An api spec converter from Postman Collection to Swagger documentation.

## Usage

```sh
$ git clone https://github.com/hados99/postman-to-swagger.git
$ cd postman-to-swagger
$ npm i
$ node index.js {postman.collection.json}
```

```sh
$ git clone https://github.com/hados99/postman-to-swagger.git
$ cd postman-to-swagger
$ ./dist/postman-to-swagger-linux {postman.collection.json}
```

##
- postman-collection-transformer
  - postman collection version converting (v2.1, v2.0 -> v1.0)

- api-spec-transformer
  - postman collection v1.0 -> swagger yaml

## Reference

- https://newbedev.com/how-can-i-generate-swagger-based-off-of-existing-postman-collection
- https://github.com/postmanlabs/postman-collection-transformer
- https://github.com/stoplightio/api-spec-converter (api-spec-transformer)
- https://github.com/antonshell/postman2swagger
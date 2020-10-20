## Code Challenge

Este modulo de Terraform creará los siguientes recursos en una cuenta de AWS.
* Cuatro funciones Lambda, una para cada entidad (Albums, Tracks y Artists) y una adicional para crear las tablas en la base de datos.
* Un API Gateway con 4 recursos, cada uno con un metodo POST y una integracion a Lambda configurada.
* Una instancia de mySQL en RDS.
* Un Security Group para permitir la conexion a la base de datos.
* Todos los roles y permisos para integrar los servicos.

Requerimientos
* Una cuenta en AWS.
* Un usuario en IAM con un access key y secret access key.
* Terraform instalado en la maquina que creará los recursos (el modulo fue testeado con Terraform v0.12.20).
* Algun metodo para correr comandos POST (curl, postman, etc).
* Opcionalmente: MySQLWorkbench para comprobar los datos.

Instrucciones
* Bajar Terraform.
* Copiar el archivo terraform.exe en la carpeta "run".
* Abrir el archivo "main.tf" que se encuentra en la carpeta "run" y cambiar las siguientes configuraciones en el provider:
  * Ingresar la "access_key" y "secret_key".
  * Actualizar la region si es necesario.
* Dentro de la carpeta "run", executar los siguientes comandos:
```ruby
terraform init
```
```ruby
terraform plan
```
```ruby
terraform apply --auto-approve
```
* Deberia recibir 2 outpus:
  * api_url
  * db_hostname

* Antes de usar la aplicación por primera vez, realizar un request POST a la url:
  * <api_url>/tables
  * Ejemplo: https://jdxqw293c1.execute-api.ap-northeast-1.amazonaws.com/challenge/tables
  * Esto va a generar todas las tablas necesarias.

* Opcionalmente, se puede conectar a la instancia de mySQL usando la siguiente información:
  * Hostname: <db_hostname> (obtenido en el output)
  * Username: admin
  * password: d!nxaYQ;T?u($9y*

## USO DEL API
### ALBUMS
POST request a:
<api_url>/albums

ADD
```ruby
{	
	"action": "add",
	"data": {
		"title": "myAlbum",
		"release_date": "2010-03-12",
		"album_type": "compilation",
		"tracks": ["track1", "track2"],
		"artists": ["artist1", "artist2"]		
	}
}
```

GET
```ruby
{	
	"action": "get",
	"data": {
	  "title": "myAlbum"
	}
}
```

UPDATE
```ruby
{	
	"action": "update",
	"data": {
		"title": "myAlbum",
		"release_date": "2010-03-12",
		"album_type": "compilation",
		"tracks": ["track1", "track2"],
		"artists": ["artist1", "artist2"]		
	}
}
```

DELETE
```ruby
{	
	"action": "delete",
	"data": {
	  "title": "myAlbum"
	}
}
```

### TRACKS
POST request a:
<api_url>/tracks

ADD
```ruby
{	
	"action": "add",
	"data": {
		"title": "myTrack",
		"duration": "30",
		"disc_number": "3",
		"track_number": "2",	
		"artists": ["artist1", "artist2"],
		"album": "myAlbum"
	}
}
```
GET
```ruby
{	
	"action": "get",
	"data": {
	  "title": "myTrack"
	}
}
```
UPDATE
```ruby
{	
	"action": "update",
	"data": {
		"title": "myTrack",
		"duration": "30",
		"disc_number": "3",
		"track_number": "2",	
		"artists": ["artist1", "artist2"],
		"album": "myAlbum"
	}
}
```
DELETE
```ruby
{	
	"action": "delete",
	"data": {
		"title": "myTrack"
	}
}
```

### ARTISTS
POST request a:
<api_url>/artists

ADD
```ruby
{	
	"action": "add",
	"data": {
		"name": "artist1"
	}
}
```
GET
```ruby
{	
	"action": "get",
	"data": {
		"name": "artists1"
	}
}
```
UPDATE
```ruby
{	
	"action": "update",
	"data": {
		"name": "artist1",
		"new_name": "artist100"
	}
}
```
DELETE
```ruby
{	
	"action": "delete",
	"data": {
		"name": "artist1"
	}
}
```
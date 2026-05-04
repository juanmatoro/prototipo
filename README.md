# Prototipo — API REST de Productos

Prototipo de API REST en **Node.js + Express + TypeScript** para gestionar la entidad `Product` mediante operaciones CRUD. Los datos se almacenan en memoria (no hay persistencia): al reiniciar el servidor, los productos vuelven al estado inicial definido en el mock.

## Stack

- **Node.js** — entorno de ejecución.
- **Express 5** — framework HTTP.
- **TypeScript** — tipado estático.
- **ts-node** — ejecución directa de `.ts` sin compilar.

## Estructura

```
prototipo/
├── server.ts          # Aplicación Express y definición de rutas
├── mockProducts.ts    # Interface Product y datos iniciales
├── postman.json       # Colección de Postman para probar la API
├── tsconfig.json
└── package.json
```

## Modelo `Product`

| Campo        | Tipo      | Descripción                                |
|--------------|-----------|--------------------------------------------|
| `id`         | `string`  | UUID generado por el servidor              |
| `name`       | `string`  | Nombre del producto                        |
| `price`      | `number`  | Precio                                     |
| `stock`      | `number`  | Unidades disponibles                       |
| `is_active`  | `boolean` | Si el producto está activo o dado de baja  |
| `created_at` | `Date`    | Fecha de creación (la asigna el servidor)  |
| `updated_at` | `Date`    | Fecha de última actualización              |

## Instalación

```bash
npm install
```

## Ejecución

Modo desarrollo (con `ts-node`):

```bash
npm run dev
```

Compilar a JavaScript y ejecutar:

```bash
npm run build
npm start
```

El servidor escucha por defecto en `http://localhost:3000`. Se puede cambiar con la variable de entorno `PORT`.

## Endpoints

Base URL: `http://localhost:3000`

| Método | Ruta             | Descripción                          | Códigos                       |
|--------|------------------|--------------------------------------|-------------------------------|
| GET    | `/products`      | Listar todos los productos           | 200                           |
| GET    | `/products/:id`  | Obtener un producto por id           | 200, 404                      |
| POST   | `/products`      | Crear un producto                    | 201, 400                      |
| PATCH  | `/products/:id`  | Actualización parcial de un producto | 200, 400, 404                 |
| DELETE | `/products/:id`  | Eliminar un producto                 | 200, 404                      |

### Crear producto — `POST /products`

Body esperado:

```json
{
  "name": "Teclado mecánico RGB",
  "price": 79.99,
  "stock": 25,
  "is_active": true
}
```

Los campos `id`, `created_at` y `updated_at` los genera el servidor automáticamente.

### Actualizar producto — `PATCH /products/:id`

Solo se envían los campos que se quieren modificar. `id`, `created_at` y `updated_at` no se pueden cambiar manualmente.

```json
{
  "price": 69.99,
  "stock": 30
}
```

## Pruebas con Postman

El archivo `postman.json` contiene una colección con peticiones de ejemplo para los cinco endpoints. Importarlo en Postman desde *File → Import*.

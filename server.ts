/**
 * ============================================================================
 *  ARCHIVO: server1.ts
 * ============================================================================
 *  Prototipo de API REST para gestionar la entidad "Product" mediante
 *  operaciones CRUD (Create, Read, Update, Delete).
 *
 *  Tecnologías utilizadas:
 *    - Node.js  -> Entorno de ejecución de JavaScript en el servidor.
 *    - Express  -> Framework minimalista para construir APIs REST sobre Node.
 *    - TypeScript -> Superset de JavaScript que añade tipado estático.
 *
 *  Almacenamiento:
 *    - En memoria: usamos un array importado del fichero mockProducts.ts.
 *    - Esto significa que NO hay persistencia: al reiniciar el servidor
 *      los datos vuelven al estado inicial del mock.
 *
 *  Para ejecutar (desde la carpeta "prototipo"):
 *    npm init -y
 *    npm install express
 *    npm install -D typescript ts-node @types/node @types/express
 *    npx ts-node server1.ts
 *
 *  El servidor quedará escuchando en http://localhost:3000
 * ============================================================================
 */

// -----------------------------------------------------------------------------
// IMPORTACIONES
// -----------------------------------------------------------------------------
// 'express' es el framework principal. Importamos también los tipos Request
// y Response para tipar correctamente los manejadores de ruta. En TypeScript
// es muy recomendable tipar req/res para tener autocompletado y detectar
// errores en tiempo de compilación, no en producción.
// -----------------------------------------------------------------------------
import express, { Request, Response } from "express";

// 'randomUUID' viene del módulo nativo 'crypto' de Node. Genera identificadores
// únicos universales (UUID v4). Lo usamos para asignar el "id" a los productos
// nuevos creados mediante POST. Es preferible a un autoincremental porque
// evita colisiones y no expone información sobre el orden/cantidad de datos.
import { randomUUID } from "crypto";

// Importamos el array mock y la interface Product desde nuestro fichero
// auxiliar. Gracias a la palabra clave 'export' en el otro archivo podemos
// reutilizar esos elementos aquí. Renombramos el array a 'products' (mediante
// "as products") simplemente porque lo vamos a tratar como nuestra "BBDD".
import { mockProducts as products, Product } from "./mockProducts";

// -----------------------------------------------------------------------------
// CONFIGURACIÓN DE LA APLICACIÓN EXPRESS
// -----------------------------------------------------------------------------
// express() es una factory: al llamarla nos devuelve una instancia de
// aplicación Express, sobre la que registraremos middlewares y rutas.
//
// -----------------------------------------------------------------------------
const app = express();

// Puerto en el que escuchará el servidor. Si existe la variable de entorno
// PORT (típica en plataformas como Heroku/Render) la usamos; si no, 3000.
// El operador "||" devuelve el primer valor "truthy", por lo que si PORT
// no está definida tomará el valor por defecto.
const PORT = process.env.PORT || 3000;

// -----------------------------------------------------------------------------
// MIDDLEWARES GLOBALES
// -----------------------------------------------------------------------------
// express.json() es un middleware integrado que parsea el body de las
// peticiones cuyo Content-Type sea "application/json" y lo expone en req.body.
// Sin esto, req.body sería 'undefined' y no podríamos leer los datos enviados
// en peticiones POST/PATCH.
// -----------------------------------------------------------------------------
app.use(express.json());

// Middleware "logger" muy sencillo: registra en consola cada petición que
// llega al servidor (método y URL). Sirve para depurar y demostrar cómo
// funciona el patrón middleware en Express. La función 'next()' es esencial:
// sin llamarla la petición se quedaría colgada porque Express no sabría que
// puede continuar con el siguiente middleware o el manejador de ruta.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =============================================================================
//                                    RUTAS
// =============================================================================
// En Express se definen rutas con app.METODO(path, handler). El handler recibe
// dos parámetros principales: req (la petición entrante) y res (la respuesta
// que enviaremos al cliente). Los métodos de res más usados son:
//   - res.status(code)   -> establece el código HTTP de respuesta
//   - res.json(obj)      -> envía un JSON y cierra la respuesta
//   - res.send(text)     -> envía texto/HTML y cierra la respuesta
// =============================================================================

// -----------------------------------------------------------------------------
// GET /products
// -----------------------------------------------------------------------------
// Endpoint de LECTURA en colección: devuelve TODOS los productos almacenados.
// Código de respuesta: 200 OK.
// -----------------------------------------------------------------------------
app.get("/products", (req: Request, res: Response) => {
  // Devolvemos directamente el array de productos serializado en JSON.
  // Express convierte automáticamente las fechas (Date) a string ISO 8601.
  res.status(200).json(products);
});

// -----------------------------------------------------------------------------
// GET /products/:id
// -----------------------------------------------------------------------------
// Endpoint de LECTURA individual: devuelve un único producto buscado por su id.
// El ":id" es un PARÁMETRO DE RUTA. Express lo expone en req.params.id.
// Códigos de respuesta:
//   - 200 OK        -> producto encontrado
//   - 404 Not Found -> no existe ningún producto con ese id
// -----------------------------------------------------------------------------
app.get("/products/:id", (req: Request, res: Response) => {
  // Extraemos el id de los parámetros de ruta usando destructuring.
  const { id } = req.params;

  // Array.prototype.find recorre el array y devuelve el primer elemento que
  // cumpla la condición del callback, o 'undefined' si no hay coincidencias.
  const product = products.find((p) => p.id === id);

  // Si no se encuentra, devolvemos 404 con un mensaje de error.
  // 'return' es importante para evitar enviar la respuesta dos veces (lo cual
  // produciría el error "Cannot set headers after they are sent to the client").
  if (!product) {
    return res.status(404).json({ error: `Producto con id '${id}' no encontrado` });
  }

  // Si lo encontramos, lo devolvemos serializado a JSON con código 200.
  res.status(200).json(product);
});

// -----------------------------------------------------------------------------
// POST /products
// -----------------------------------------------------------------------------
// Endpoint de CREACIÓN: añade un nuevo producto al array.
// El cliente debe enviar en el body los campos: name, price, stock, is_active.
// Los campos id, created_at y updated_at los genera el servidor automáticamente.
// Códigos de respuesta:
//   - 201 Created      -> recurso creado correctamente
//   - 400 Bad Request  -> datos faltantes o inválidos
// -----------------------------------------------------------------------------
app.post("/products", (req: Request, res: Response) => {
  // Extraemos los campos esperados del body. Si alguno no viene, será 'undefined'.
  const { name, price, stock, is_active } = req.body;

  // VALIDACIÓN básica de los datos recibidos.
  // Comprobamos que cada campo tenga el tipo correcto. Esto es fundamental
  // en una API: nunca confiar en los datos que envía el cliente.
  // - typeof name !== "string"  -> el nombre debe ser un string
  // - typeof price !== "number" -> el precio debe ser numérico
  // - typeof stock !== "number" -> el stock debe ser numérico
  // - typeof is_active !== "boolean" -> debe ser true o false
  if (
    typeof name !== "string" ||
    typeof price !== "number" ||
    typeof stock !== "number" ||
    typeof is_active !== "boolean"
  ) {
    return res.status(400).json({
      error:
        "Datos inválidos. Se requieren: name (string), price (number), stock (number), is_active (boolean).",
    });
  }

  // Construimos el nuevo objeto Product respetando la interface importada.
  // El tipado ":Product" garantiza que no se nos olvide ninguna propiedad
  // obligatoria (TypeScript dará un error en compilación si falta alguna).
  const now = new Date(); // Fecha actual: la usamos para created_at y updated_at.
  const newProduct: Product = {
    id: randomUUID(),     // UUID generado por Node, p.ej. "f47ac10b-58cc-4372-..."
    name,                 // Atajo de objeto: equivale a "name: name"
    price,
    stock,
    is_active,
    created_at: now,
    updated_at: now,
  };

  // Añadimos el producto al array en memoria. Como el array es una referencia
  // compartida con el módulo mockProducts.ts, el cambio se mantiene mientras
  // el servidor esté en ejecución.
  products.push(newProduct);

  // Respondemos con 201 Created (estándar REST para creación) y devolvemos
  // el recurso recién creado. Así el cliente conoce el id asignado.
  res.status(201).json(newProduct);
});

// -----------------------------------------------------------------------------
// PATCH /products/:id
// -----------------------------------------------------------------------------
// Endpoint de ACTUALIZACIÓN PARCIAL: modifica uno o varios campos de un
// producto existente. A diferencia de PUT (que reemplaza todo el recurso),
// PATCH solo cambia los campos enviados en el body.
// Códigos de respuesta:
//   - 200 OK        -> producto actualizado correctamente
//   - 400 Bad Request -> tipos de datos incorrectos
//   - 404 Not Found -> no existe el producto
// -----------------------------------------------------------------------------
app.patch("/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Buscamos el ÍNDICE (no el elemento) para poder modificarlo en su sitio.
  // findIndex devuelve -1 si no encuentra coincidencia.
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Producto con id '${id}' no encontrado` });
  }

  // Extraemos solo los campos modificables del body. Excluimos id, created_at
  // y updated_at porque son gestionados por el servidor (no se permiten
  // cambiar manualmente para mantener la integridad de los datos).
  const { name, price, stock, is_active } = req.body;

  // VALIDACIÓN de tipos SOLO si la propiedad viene en la petición.
  // En PATCH los campos son OPCIONALES, así que solo validamos los presentes.
  // Si el cliente no envía 'name', no debemos exigirlo.
  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ error: "El campo 'name' debe ser string." });
  }
  if (price !== undefined && typeof price !== "number") {
    return res.status(400).json({ error: "El campo 'price' debe ser number." });
  }
  if (stock !== undefined && typeof stock !== "number") {
    return res.status(400).json({ error: "El campo 'stock' debe ser number." });
  }
  if (is_active !== undefined && typeof is_active !== "boolean") {
    return res.status(400).json({ error: "El campo 'is_active' debe ser boolean." });
  }

  // Construimos el producto actualizado fusionando el existente con los campos
  // nuevos mediante el spread operator (...). El orden importa: las propiedades
  // que aparecen DESPUÉS sobrescriben a las anteriores.
  // Finalmente forzamos updated_at a la fecha actual para reflejar el cambio.
  const updatedProduct: Product = {
    ...products[index],          // Copia todos los campos actuales
    ...req.body,                 // Sobrescribe los enviados por el cliente
    id: products[index].id,      // Aseguramos que el id NO cambie
    created_at: products[index].created_at, // Tampoco la fecha de creación
    updated_at: new Date(),      // Marcamos la actualización
  };

  // Reemplazamos el producto en el array por la versión actualizada.
  products[index] = updatedProduct;

  // Devolvemos el producto actualizado al cliente.
  res.status(200).json(updatedProduct);
});

// -----------------------------------------------------------------------------
// DELETE /products/:id
// -----------------------------------------------------------------------------
// Endpoint de ELIMINACIÓN: borra un producto por su id.
// Códigos de respuesta:
//   - 200 OK        -> eliminado correctamente (se devuelve el producto borrado)
//   - 404 Not Found -> el producto no existe
//
// NOTA: en algunas APIs REST se usa 204 No Content (sin body) para DELETE.
// Aquí elegimos 200 + body para que el cliente vea exactamente qué se borró.
// -----------------------------------------------------------------------------
app.delete("/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Buscamos el índice del elemento a eliminar.
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Producto con id '${id}' no encontrado` });
  }

  // Array.prototype.splice modifica el array eliminando elementos en su sitio
  // y devuelve un array con los elementos eliminados. Aquí eliminamos UNO
  // a partir del índice 'index', y guardamos el producto borrado para
  // devolverlo en la respuesta.
  const [deletedProduct] = products.splice(index, 1);

  // Respondemos con el producto eliminado (útil como confirmación al cliente).
  res.status(200).json(deletedProduct);
});

// -----------------------------------------------------------------------------
// MIDDLEWARE 404 (rutas no definidas)
// -----------------------------------------------------------------------------
// Si una petición no coincide con ninguna de las rutas anteriores, Express
// llegará a este middleware. Le devolvemos un 404 con un mensaje genérico.
// Este middleware DEBE ir DESPUÉS de todas las rutas para que actúe como
// "catch-all" final.
// -----------------------------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.url}` });
});

// =============================================================================
// ARRANQUE DEL SERVIDOR
// =============================================================================
// app.listen(puerto, callback) pone al servidor a escuchar peticiones HTTP
// en el puerto indicado. El callback se ejecuta una sola vez, cuando el
// servidor está listo. Es un buen sitio para mostrar un mensaje de log que
// confirme que todo ha arrancado correctamente.
// =============================================================================
app.listen(PORT, () => {
  console.log(` Servidor escuchando en http://localhost:${PORT}`);
  console.log(` ${products.length} productos cargados desde el mock inicial.`);
});

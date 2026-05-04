/**
 * Archivo: mockProducts.ts
 * Descripción: Contiene la definición de la interfaz Product y un array de productos de ejemplo (mockProducts) para simular una base de datos en memoria.
 * Autor: [Juanma]
 * Fecha: 2026-01-01
 */

// La interfaz Product define la estructura de un producto en nuestro sistema.

export interface Product {
  id: string;          // Identificador único del producto (UUID en formato string)
  name: string;        // Nombre del producto
  price: number;       // Precio del producto (número decimal)
  stock: number;       // Cantidad disponible en almacén (número entero)
  is_active: boolean;  // Indica si el producto está activo o ha sido dado de baja
  created_at: Date;    // Fecha y hora de creación del producto
  updated_at: Date;    // Fecha y hora de la última actualización del producto
}

// El array mockProducts contiene una lista de productos de ejemplo para usar en pruebas o como datos iniciales en la aplicación.
export const mockProducts: Product[] = [
  {
    // Producto 1 — id sencillo para facilitar las pruebas
    id: "1",
    name: "Teclado mecánico RGB",
    price: 79.99,
    stock: 25,
    is_active: true,
    // new Date() crea un objeto Date con la fecha/hora actual del sistema.
    created_at: new Date("2026-01-10T09:00:00Z"),
    updated_at: new Date("2026-01-10T09:00:00Z"),
  },
  {
    // Producto 2
    id: "2",
    name: "Ratón inalámbrico ergonómico",
    price: 35.5,
    stock: 60,
    is_active: true,
    created_at: new Date("2026-02-15T11:30:00Z"),
    updated_at: new Date("2026-02-15T11:30:00Z"),
  },
  {
    // Producto 3 — ejemplo de producto NO activo (dado de baja)
    id: "3",
    name: "Monitor 24'' Full HD",
    price: 149.0,
    stock: 0,
    is_active: false,
    created_at: new Date("2026-03-01T08:45:00Z"),
    updated_at: new Date("2026-04-20T14:10:00Z"),
  },
  {
    // Producto 4
    id: "4",
    name: "Auriculares Bluetooth",
    price: 59.95,
    stock: 120,
    is_active: true,
    created_at: new Date("2026-03-22T16:20:00Z"),
    updated_at: new Date("2026-03-22T16:20:00Z"),
  },
  {
    // Producto 5
    id: "5",
    name: "Webcam HD 1080p",
    price: 42.0,
    stock: 18,
    is_active: true,
    created_at: new Date("2026-04-05T10:15:00Z"),
    updated_at: new Date("2026-04-05T10:15:00Z"),
  },
];

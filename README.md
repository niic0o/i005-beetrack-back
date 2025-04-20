[![GCP Production CI/CD Pipeline](https://github.com/IgrowkerTraining/i005-beetrack-back/actions/workflows/backend.yaml/badge.svg)](https://github.com/IgrowkerTraining/i005-beetrack-back/actions/workflows/backend.yaml)

# Backend de Beetrack

## Para probar localmente

### - Clonar el repositorio:

```bash
git clone https://github.com/IgrowkerTraining/i005-beetrack-back.git
```
### - Instalar las dependencias:
```bash
npm install
```
### - Crear un archivo .env en la raiz del proyecto con las variables del .env.example.

### - Correr el proyecto en modo de  desarrollo:
```bash
npm run dev
```
### La API estará corriendo en http://localhost:3000

# API de Beetrack

## Endpoints

| Método | Ruta              | Descripción                          | Body requerido                                     | Respuestas posibles                           |
|--------|-------------------|--------------------------------------|---------------------------------------------------|----------------------------------------------|
| POST   | `/api/auth/register` | Registra un nuevo usuario            | Ver ejemplo abajo    | `201 OK` Usuario creado<br>`400` Error de validación<br>`500` Error interno |
| POST   | `/api/auth/login`    | Crea la cookie con el token           | `{ "email": string, "password": string }`         | `200 OK` Login exitoso<br>`400/401` Error credenciales<br>`500` Error interno |
| POST   | `/api/auth/logout`   | Destruye la cookie        | _Sin body_                                        | `202 OK` Logout exitoso<br>`500` Error interno | 
| GET  | `/api/products`  | Devuelve todos los productos | _Sin body_ | `200 OK` Lista de productos<br>`500` Error interno |
| POST |  `/api/products` | Crea un nuevo producto | formData (ver campos requeridos abajo) | `201 OK` Producto creado<br>`400` Error de validación<br>`500` Error interno |
| PATCH |  `/api/products/:id` | Actualiza un producto | formData (1 o más campos del ejemplo de crear producto) | `200 OK` Producto actualizado<br>`400` Error de validación<br>`500` Error interno |
| POST  | `/api/orders`   | Crea una nueva orden  | ver ejemplo más abajo |  `201 OK` Orden creada<br>`400` Error de validación<br>`500` Error interno |

## Ejemplo de Body para /api/auth/register
```json
{
    "name": "Juan",
    "last_name": "Pérez",
    "email": "example@email.com",
    "birthdate": "1985-05-02",
    "password": "1234",
    "storeName": "Super Juan",
    "storeAddress": "Calle Siempre Viva 123",
    "storeTel": "12345678"
}
```
## Ejemplo de Body para /api/orders
```json
{
    "discountRate": 5,
    "paymentMethod": "CASH",
    "orderItems": [
        {
            "productId": "e3a6880b-d9f2-481d-9721-71f24b689754",
            "quantity": 1
        },
        {
            "productId": "690f9906-7893-4ae7-b958-998ebf66e0ac",
            "quantity": 1
        }
    ]
}
```

## Campos requeridos en el formData para /api/products
```

  name: string,
  barcode: string,
  salesPrice: string,
  costPrice: string,
  stock: string,
  stock_optimus: string,
  stock_min: string,
  file: File,(*)
  description: string (opcional)

```

(*) La imágen del producto debe ser de hasta 2MB y estar en formato jpg/jpeg/png/webp

## Autenticación

- El token JWT se entrega en una cookie con las siguientes características:
  - `httpOnly: true`
  - `secure: true` (en producción)
  - `sameSite: 'lax'`
  - `maxAge: 1 día` 
  - `path: '/'`

## Notas

- Como todavía no se van a implementar roles desde el frontend, los usuarios se crean con un rol "ADMIN" por defecto.


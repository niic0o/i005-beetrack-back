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
| POST   | `/api/auth/logout`   | Destruye la cookie        | _Sin body_                                        | `204 No-Content` Logout exitoso<br>`500` Error interno |

## Ejemplo de Body para /api/auth/register
```json
{
    "name": "Juan",
    "last_name": "Pérez",
    "email": "example@email.com",
    "birthdate": "1985-05-02",
    "password": "1234"
}
```

## Autenticación

- El token JWT se entrega en una cookie con las siguientes características:
  - `httpOnly: true`
  - `secure: true` (en producción)
  - `sameSite: 'lax'`
  - `maxAge: 1 día` 
  - `path: '/'`

## Notas

- Como todavía no se van a implementar roles desde el frontend, los usuarios se crean con un rol "admin" por defecto.

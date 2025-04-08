/*
El usuario se loguea, generamos un token y se lo damos para que el navegador lo guarde en una cookie
*/

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Simulación de base de datos
const users = [
  { id:1, email: "admin@admin.com", password: "1234", name: "pedro"},
  { id:2, email: "user@user.com", password: "1234", name: "juan"},
  { id:3, email: "nico@user.com", password: "nico", name: "nico"}
];

// Simula búsqueda asincrónica de usuario
async function findUserByEmail(email) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return users.find(u => u.email === email);
}

// Que el body que me manda el front tenga datos
async function validateRequestBody(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos");
    }
    return { email, password };
  } catch {
    throw new Error("Error al procesar la solicitud");
  }
}
// que el email exista
async function authenticateUser(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Datos incorrectos"); // No especificamos si el mail está mal
  }

  if (user.password !== password) {
    throw new Error("Contraseña incorrecta");
  }

  return user;
}

// generamos el token con el email rescatado de la bdd
function generateToken(email) {
  const secret = process.env.SECRET_KEY;
  if (!secret) throw new Error("SECRET_KEY no definida");

  return jwt.sign({ email }, secret, { expiresIn: "24h" });
}

//respondemos con una cookie y adentro el token
function sendAuthResponse(token) {
  const response = NextResponse.json(
    {
      status: "OK",
      token,
      message: "Usuario autenticado correctamente",
    },
    { status: 200 }
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}

//Logica del login
export async function POST(req) {
  try {
    const { email, password } = await validateRequestBody(req);
    await authenticateUser(email, password);
    const token = generateToken(email);
    return sendAuthResponse(token);
  } catch (err) {
    const isAuthError = [
      "Datos incorrectos",
      "Contraseña incorrecta",
      "Email y contraseña son requeridos",
    ].includes(err.message);

    return NextResponse.json(
      {
        status: "ERROR",
        message: err.message,
      },
      { status: isAuthError ? 401 : 500 } // 401 si es un error de autenticación y si no error fatal 500
    );
  }
}



/* POR SI SE ROMPE ESTO FUNCIONA
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  if (email === "admin@admin.com" && password === "1234") {
    if (!process.env.SECRET_KEY)
    throw new Error('SECRET_KEY no está definida en las variables de entorno');
    
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });

    const response = NextResponse.json(
      {
        status: "OK",
        token,
        message: "Usuario autenticado correctamente",
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true, // No accesible desde JS del cliente (previene XSS)
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS par production
      sameSite: "strict", // Protege de CSRF
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/", // Disponible en toda la app
    });
    return response;
  } else {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Credenciales inválidas",
      },
      { status: 401 }
    );
  }
}
*/
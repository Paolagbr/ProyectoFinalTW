// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

admin.initializeApp();

const db = admin.firestore();

exports.registrarUsuarioSecure = functions.https.onCall(
  async (data, context) => {
    const {nombre, email, password, tipo} = data; // Espacios eliminados aquí

    if (
      !nombre || typeof nombre !== "string" ||
      !email || typeof email !== "string" ||
      !password || typeof password !== "string" ||
      password.length < 6
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Datos de entrada inválidos. Asegúrate de " +
        "proporcionar nombre, email y una contraseña " +
        "de al menos 6 caracteres.",
      );
    }

    try {
      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);

      await db.collection("usuarios").add({
        nombre: nombre,
        email: email,
        passwordHash: hash,
        tipo: tipo || "normal",
        fechaCreacion:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Usuario ${email} registrado con éxito.`);

      return {
        status: "success",
        message: "Usuario registrado correctamente.",
      };
    } catch (error) {
      console.error(
        "Error al registrar usuario en Cloud Function:",
        error,
      );

      throw new functions.https.HttpsError(
        "internal",
        "Ocurrió un error interno al intentar " +
        "registrar al usuario. Por favor, inténtalo " +
        "de nuevo más tarde.",
      );
    }
  });

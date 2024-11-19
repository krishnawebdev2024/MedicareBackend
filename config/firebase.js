import admin from "firebase-admin";
import { config } from "dotenv";
config();
/* import {
  FIREBASE_SERVICE_ACCOUNT_FILE_NAME,
  FIREBASE_SERVICE_BUCKET_NAME,
} from "./config/config.js"; */

import {
  PORT,
  MONGO_URI,
  SESSION_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CLIENT_URL,
  FIREBASE_SERVICE_ACCOUNT_FILE_NAME,
  FIREBASE_SERVICE_BUCKET_NAME,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
} from "./config.js";

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

console.log(process.env.FIREBASE_SERVICE_BUCKET_NAME);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_SERVICE_BUCKET_NAME, // Directly from .env
});
// admin.initializeApp({
//   credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT_FILE_NAME),
//   storageBucket: FIREBASE_SERVICE_BUCKET_NAME,
// });

export const bucket = admin.storage().bucket();

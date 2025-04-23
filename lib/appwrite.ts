import {
  Client,
  Account,
  ID,
  OAuthProvider,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

// Konfigurasi Appwrite
export const config = {
  endpoint: "https://cloud.appwrite.io/v1", // Ganti dengan endpoint Appwrite-mu
  projectId: "YOUR_PROJECT_ID", // Ganti dengan Project ID-mu
  databaseId: "YOUR_DATABASE_ID",
  usersCollectionId: "YOUR_USERS_COLLECTION_ID",
};

// Inisialisasi Client Appwrite
export const client = new Client();
client.setEndpoint(config.endpoint).setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatar = new Avatars(client);

// 💡 Login dengan Google OAuth2
export async function loginWithGoogle() {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("OAuth2 login failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    if (!secret || !userId) throw new Error("OAuth2 token response is invalid");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

// 💡 Registrasi User Baru
export async function registerUser(email, password, name) {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    return user;
  } catch (error) {
    console.error("Register error:", error);
  }
}

// 💡 Login Manual (Email & Password)
export async function loginUser(email, password) {
  try {
    return await account.createSession(email, password);
  } catch (error) {
    console.error("Login error:", error);
  }
}

// 💡 Logout User
export async function logoutUser() {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// 💡 Mendapatkan Data Pengguna Saat Ini
export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

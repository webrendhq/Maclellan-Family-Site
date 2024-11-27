import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

// Define a User type for more structured return values if needed
type AuthenticatedUser = User | null;

// Login function
export const login = async (email: string, password: string): Promise<AuthenticatedUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw new Error(error.message);
  }
};

// Register function
export const register = async (email: string, password: string): Promise<AuthenticatedUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Registration error:", error.message);
    throw new Error(error.message);
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("Logged out successfully");
  } catch (error: any) {
    console.error("Logout error:", error.message);
    throw new Error(error.message);
  }
};

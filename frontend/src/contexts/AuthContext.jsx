import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { auth } from "../firebase";
import api from "../services/api";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );

      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      // Exchange Firebase user for backend JWT token immediately
      const { user } = result;
      const res = await api.post("/auth/google-login", {
        name: user.displayName,
        email: user.email,
      });

      if (res.data && res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
      }

      return result;
    } catch (error) {
      console.error(
        "Google Login Error:",
        error
      );

      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await api.post("/auth/google-login", {
            name: user.displayName,
            email: user.email,
          });
          if (res.data && res.data.accessToken) {
            localStorage.setItem("token", res.data.accessToken);
          }
        } catch (err) {
          console.warn("Auth session sync warning (backend cold start / offline):", err.message);
        }

        setCurrentUser(user);
        setLoading(false);
      } else {
        const token = localStorage.getItem("token");
        if (import.meta.env.DEV && token) {
          setCurrentUser({
            displayName: "Dev User",
            email: "dev@example.com",
            uid: "dev-user-id",
          });
          setLoading(false);
        } else {
          localStorage.removeItem("token");
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const user = currentUser
    ? {
        uid: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
      }
    : null;

  const value = {
    currentUser,
    user,
    loginWithGoogle,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
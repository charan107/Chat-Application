import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { db } from "../firebase/firebase";
import { doc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userRef = null;
    let cleanup = null;

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Update online status when user logs in
      if (currentUser) {
        try {
          userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            isOnline: true,
            status: 'online',
            lastSeenTimestamp: serverTimestamp(),
          });

          // Set offline when user closes tab/window
          const handleBeforeUnload = () => {
            if (userRef) {
              updateDoc(userRef, {
                isOnline: false,
                status: 'offline',
                lastSeenTimestamp: serverTimestamp(),
              }).catch(console.error);
            }
          };

          window.addEventListener('beforeunload', handleBeforeUnload);

          // Cleanup function
          cleanup = () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (userRef) {
              updateDoc(userRef, {
                isOnline: false,
                status: 'offline',
                lastSeenTimestamp: serverTimestamp(),
              }).catch(console.error);
            }
          };
        } catch (error) {
          console.error("Error updating online status:", error);
        }
      } else {
        // User logged out, cleanup if exists
        if (cleanup) {
          cleanup();
        }
      }
    });

    return () => {
      unsub();
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const logout = async () => {
    if (user) {
      try {
        // Set offline status before logout
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          isOnline: false,
          status: 'offline',
          lastSeenTimestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    }
    
    await logoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

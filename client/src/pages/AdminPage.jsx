import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminDashboard from "../components/AdminDashboard";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check Firestore "admins" collection for admin status
        const ref = doc(db, "admins", currentUser.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Checking access...</p>;

  if (!user) {
    return (
      <div className="page-container">
        <h1 className="section-title">Admin Login</h1>
        <p>Please sign in with your admin account.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-container">
        <h1 className="section-title">Access Denied</h1>
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return <AdminDashboard />;
}

// src/admin/AdminGate.js
import React, { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import AdminPanel from "./AdminPanel"; // you already import AdminPanel in App.js
import "../firebase"; // ensures Firebase is initialized

export default function AdminGate() {
  const auth = getAuth();
  const [stage, setStage] = useState("checking"); // 'checking' | 'login' | 'denied' | 'granted'
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStage("login");
        return;
      }
      try {
        // refresh token to get latest custom claims
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.claims?.admin === true) {
          setStage("granted");
        } else {
          setStage("denied");
        }
      } catch (e) {
        console.error(e);
        setStage("denied");
      }
    });
    return () => unsub();
  }, [auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const email = e.currentTarget.email.value.trim();
    const password = e.currentTarget.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will re-run and set stage accordingly
    } catch (err) {
      console.error("Admin login failed:", err);
      setError("Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setStage("login");
  };

  if (stage === "checking") return <p style={{ padding: 16 }}>Checking admin...</p>;

  if (stage === "login") {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "48px auto", padding: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Email</label>
            <input name="email" type="email" required style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Password</label>
            <input name="password" type="password" required style={{ width: "100%" }} />
          </div>
          <button type="submit" className="btn">Sign In</button>
          {error && <p style={{ color: "crimson", marginTop: 10 }}>{error}</p>}
        </form>
      </div>
    );
  }

  if (stage === "denied") {
    return (
      <div style={{ maxWidth: 520, margin: "48px auto", padding: 24 }}>
        <h2>Access Denied</h2>
        <p>Your account is signed in but does not have admin access.</p>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    );
  }

  // stage === 'granted'
  return <AdminPanel />;
}

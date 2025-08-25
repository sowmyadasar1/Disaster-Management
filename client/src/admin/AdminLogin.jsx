import React, { useState } from "react";
import { 
  getAuth, 
  setPersistence, 
  browserSessionPersistence, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { app } from "../firebase";

const auth = getAuth(app);

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence); // Force sign-out when tab closes
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Optional: redirect to admin panel after successful login
      // window.location.href = "/admin";
    } catch (error) {
      console.error("Admin login failed:", error);
      setErr(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-card">
      <h2>Admin Sign In</h2>
      {err && <div className="alert error">{err}</div>}
      <form onSubmit={handleLogin} className="admin-form">
        <label>Email</label>
        <input
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const token = localStorage.getItem("adminToken");

  if (!isAdmin || !token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

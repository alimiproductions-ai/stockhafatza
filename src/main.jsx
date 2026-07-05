import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/**
 * Polyfill de window.storage (API disponible nativement dans les Artifacts Claude.ai)
 * pour un déploiement web classique : on utilise simplement le localStorage du navigateur.
 * Le paramètre "shared" est ignoré ici puisqu'il n'y a plus de notion multi-utilisateur
 * côté serveur — chaque navigateur a ses propres données.
 */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return null;
      return { key, value: raw, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      const existed = localStorage.getItem(key) !== null;
      localStorage.removeItem(key);
      return { key, deleted: existed, shared: false };
    },
    async list(prefix) {
      const keys = Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix));
      return { keys, prefix, shared: false };
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

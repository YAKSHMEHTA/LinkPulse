import { useState, useEffect } from "react";
import LinksTab from "./admin/LinksTab";
import UsersTab from "./admin/UsersTab";
import AnalyticsTab from "./admin/AnalyticsTab";
import "./AdminDashboard.css";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("links");
  const [status, setStatus] = useState("checking");

  async function logout() {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    navigate("/login", { replace: true });
  }
}

  useEffect(() => {
    api("/admin/blocklist")
      .then(() => setStatus("ok"))
      .catch((e) => {
        if (e.status === 401 || e.status === 403) {
          navigate("/", { replace: true });
        } else {
          setStatus("error");
        }
      });
  }, [navigate]);

  if (status === "checking") return <p>Loading...</p>;

  if (status === "error") {
    return <p>Could not reach the server. Refresh to try again.</p>;
  }

  const tabs = {
    links: <LinksTab />,
    users: <UsersTab />,
    analytics: <AnalyticsTab />,
  };

  return (
    <div className="dashboard">
      <aside className="side">
        <div className="logo">LinkPulse</div>

        <nav aria-label="Admin sections">
          {["links", "users", "analytics"].map((t) => (
            <button
              key={t}
              className={tab === t ? "is-on" : ""}
              onClick={() => setTab(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main">
        <h1>Admin Dashboard</h1>
        {tabs[tab]}
      </main>
    </div>
  );
}
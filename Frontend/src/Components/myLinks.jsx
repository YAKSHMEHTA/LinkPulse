import "./myLinks.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyLinks({refreshKey}){

  const [search, setSearch] = useState("");
  const [copiedURL, setCopiedURL] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadLinks() {

      setLoading(true);
      setError("");

      try{
        const res = await fetch(`${import.meta.env.VITE_API_URL}/links`, {
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Could not load links");
          return;
        }

        setLinks(data.items ?? []);
      }catch(err){
        setError("Cannot reach the server. Try again later.");
      }finally {
        setLoading(false);
      }
    }

    loadLinks();
  }, [navigate, refreshKey]);

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedURL(url);
      setTimeout(() => setCopiedURL(""), 2000);
    } catch (err) {
      // ignore
    }
  }

  async function deleteLink(id) {
    const confirmed = window.confirm("Delete this short link?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/links/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.msg || data.error || "Could not delete link");
        return;
      }

      setLinks((prev) => prev.filter((link) => (link._id ?? link.id) !== id));
    } catch (err) {
      setError("Could not delete link. Try again later.");
    }
  }

  async function openQrCode(id) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/links/${id}/qr?format=png&size=300`, {
        credentials: "include",
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError("Could not load QR code");
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        setError("Your browser blocked the QR window. Please allow popups and try again.");
      }
    } catch (err) {
      setError("Could not load QR code. Try again later.");
    }
  }

  const query = search.toLowerCase();
  const filteredLinks = links.filter(
    (link) =>
      (link.destination ?? "").toLowerCase().includes(query) ||
      (link.shortUrl ?? "").toLowerCase().includes(query)
  );

  return(
    <section className="my-links" id="my-links">
      <h2>My Links</h2>
      <p className="links-subtitle">Manage and track all your shortened URLs</p>

      <input
        type="text"
        className="links-search"
        placeholder="Search your links"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="links-message">Loading your links...</p>}
      {error && <p className="links-message links-error">{error}</p>}
      {!loading && !error && filteredLinks.length === 0 && (
        <p className="links-message">
          {links.length === 0 ? "No links yet. Create your first one above." : "No links match your search."}
        </p>
      )}

      {filteredLinks.map((link) => (
        <div className="links-row" key={link._id ?? link.id ?? link.shortUrl}>
          <div className="links-main">
            <h3>{link.destination}</h3>
            <p className="links-short">
              <a href={link.shortUrl} target="_blank" rel="noreferrer">
                {link.shortUrl}
              </a>
            </p>
            <button type="button" className="links-copy" onClick={() => copyLink(link.shortUrl)}>
              {copiedURL === link.shortUrl ? "Copied" : "Copy link"}
            </button>
          </div>

          <div className="links-info">
            <span>{link.clickCount ?? 0} clicks</span>
            <span
              className={
                link.effectiveStatus === "active"
                  ? "links-status links-status-active"
                  : "links-status links-status-inactive"
              }
            >
              {link.effectiveStatus}
            </span>
            <div className="links-actions">
              <button type="button" className="links-button links-button-qr" onClick={() => openQrCode(link._id ?? link.id)}>
                QR
              </button>
              <button type="button" className="links-button links-button-delete" onClick={() => deleteLink(link._id ?? link.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default MyLinks;
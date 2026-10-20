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
          </div>
        </div>
      ))}
    </section>
  );
}

export default MyLinks;
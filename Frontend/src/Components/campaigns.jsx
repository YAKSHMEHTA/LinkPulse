import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./campaigns.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
const number = (value) => new Intl.NumberFormat().format(Number(value || 0));
const date = (value) => value ? new Date(value).toLocaleDateString() : "—";

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};
  if (!response.ok) {
    throw new Error(body.error || body.msg || body.message || `Request failed (${response.status})`);
  }
  return body;
}

function Metric({ label, value, detail }) {
  return <article className="campaign-metric"><span>{label}</span><strong>{number(value)}</strong>{detail && <small>{detail}</small>}</article>;
}

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(7);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCampaigns = useCallback(async (preferredId = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await api("/campaigns");
      const items = result.items || [];
      setCampaigns(items);
      const nextId = preferredId || items[0]?._id || "";
      setSelectedId(nextId);
    } catch (err) {
      if (/authentication|required|token|expired|unauthorized/i.test(err.message)) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  useEffect(() => {
    if (!selectedId) {
      setStats(null);
      setSelectedLinks([]);
      return;
    }

    let cancelled = false;
    setError("");

    api(`/campaigns/${selectedId}/stats?days=${days}`)
      .then((result) => { if (!cancelled) setStats(result); })
      .catch((err) => { if (!cancelled) setError(err.message); });

    api(`/links?campaignId=${selectedId}&page=1&limit=50`)
      .then((result) => { if (!cancelled) setSelectedLinks(result.items || []); })
      .catch(() => { if (!cancelled) setSelectedLinks([]); });

    return () => { cancelled = true; };
  }, [selectedId, days]);

  async function createCampaign(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await api("/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const createdId = result.campaign?._id || "";
      setName("");
      setDescription("");
      setNotice("Campaign created successfully.");
      await loadCampaigns(createdId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createLinkInCampaign(event) {
    event.preventDefault();
    if (!selectedId) {
      setError("Select a campaign first.");
      return;
    }

    const value = newLinkUrl.trim();
    if (!value) {
      setError("Enter a URL to create a short link.");
      return;
    }

    setLinkSaving(true);
    setError("");
    setNotice("");

    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("URL must start with http:// or https://");
      }

      const result = await api("/links", {
        method: "POST",
        body: JSON.stringify({ destination: url.href, campaignId: selectedId }),
      });

      setNewLinkUrl("");
      setNotice(`Short link created: ${result.link?.shortUrl || "success"}`);
      await loadCampaigns(selectedId);
      if (stats) {
        const refreshed = await api(`/campaigns/${selectedId}/stats?days=${days}`);
        setStats(refreshed);
      }
    } catch (err) {
      setError(err.message || "Could not create short link in this campaign.");
    } finally {
      setLinkSaving(false);
    }
  }

  async function deleteCampaign() {
    if (!selectedId) return;
    const confirmed = window.confirm("Delete this campaign and remove it from its links?");
    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const result = await api(`/campaigns/${selectedId}`, { method: "DELETE" });
      if (result.ok) {
        setSelectedId("");
        setSelectedLinks([]);
        setStats(null);
        setNotice("Campaign deleted successfully.");
        await loadCampaigns();
      }
    } catch (err) {
      setError(err.message || "Could not delete campaign.");
    }
  }

  async function logout(){
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  const selected = campaigns.find((campaign) => campaign._id === selectedId);
  const maxClicks = Math.max(1, ...(stats?.timeseries || []).map((item) => item.clicks || 0));

  return (
    <main className="campaign-page">
      <header className="campaign-header">
        <div>
          <p className="campaign-eyebrow">LINKPULSE WORKSPACE</p>
          <h1>Campaign management</h1>
          <p className="campaign-subtitle">Group short links and track campaign performance using live data.</p>
        </div>
        <div className="campaign-header-actions">
          <button className="campaign-button campaign-button-light" type="button" onClick={() => navigate("/")}>Home</button>
          {selected && (
            <button className="campaign-button campaign-button-light" type="button" onClick={deleteCampaign}>Delete campaign</button>
          )}
          <button className="campaign-button campaign-button-light" type="button" onClick={logout}>Log out</button>
        </div>
      </header>

      {notice && <div className="campaign-alert campaign-success" role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}
      {error && <div className="campaign-alert campaign-error" role="alert">{error}<button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}

      <div className="campaign-layout">
        <section className="campaign-panel campaign-create-panel">
          <div className="campaign-panel-heading"><div><h2>Create a campaign</h2><p>Name must be unique within your account.</p></div></div>
          <form onSubmit={createCampaign} className="campaign-form">
            <label htmlFor="campaign-name">Campaign name <span>*</span></label>
            <input id="campaign-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={1} maxLength={80} placeholder="e.g. October product launch" />
            <label htmlFor="campaign-description">Description</label>
            <textarea id="campaign-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} rows={3} placeholder="What are you promoting? (optional)" />
            <div className="campaign-form-footer"><small>{description.length}/300 characters</small><button className="campaign-button campaign-button-primary" type="submit" disabled={saving}>{saving ? "Creating…" : "＋ Create campaign"}</button></div>
          </form>
        </section>

        <section className="campaign-panel campaign-list-panel">
          <div className="campaign-panel-heading"><div><h2>Your campaigns</h2><p>{campaigns.length} campaign{campaigns.length === 1 ? "" : "s"} found</p></div><button className="campaign-button campaign-button-light" type="button" onClick={() => loadCampaigns()} disabled={loading}>Refresh</button></div>
          {loading ? <p className="campaign-muted">Loading campaigns…</p> : campaigns.length === 0 ? <div className="campaign-empty"><strong>No campaigns yet</strong><p>Create your first campaign using the form.</p></div> : (
            <div className="campaign-list">
              {campaigns.map((campaign) => (
                <button type="button" key={campaign._id} className={`campaign-list-item ${selectedId === campaign._id ? "is-selected" : ""}`} onClick={() => setSelectedId(campaign._id)}>
                  <span className="campaign-list-icon">◉</span>
                  <span className="campaign-list-copy"><strong>{campaign.name}</strong><small>{campaign.description || "No description"}</small><small>Created {date(campaign.createdAt)}</small></span>
                  <span className="campaign-link-count">{number(campaign.linkCount)} links</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <>
          <section className="campaign-panel campaign-create-link-panel">
            <div className="campaign-panel-heading">
              <div>
                <h2>Create link in {selected.name}</h2>
                <p>Shorten a new URL and assign it to the selected campaign.</p>
              </div>
            </div>
            <form onSubmit={createLinkInCampaign} className="campaign-inline-form">
              <input
                type="url"
                value={newLinkUrl}
                onChange={(event) => setNewLinkUrl(event.target.value)}
                placeholder="https://example.com"
                required
              />
              <button className="campaign-button campaign-button-primary" type="submit" disabled={linkSaving}>
                {linkSaving ? "Creating…" : "Create link"}
              </button>
            </form>
          </section>

          <section className="campaign-panel campaign-links-panel">
            <div className="campaign-panel-heading">
              <div>
                <h2>Links in {selected.name}</h2>
                <p>{selectedLinks.length} link{selectedLinks.length === 1 ? "" : "s"} in this campaign.</p>
              </div>
            </div>

            {selectedLinks.length === 0 ? (
              <div className="campaign-empty"><strong>No links yet</strong><p>Create a short link above to add one to this campaign.</p></div>
            ) : (
              <div className="campaign-links-list">
                {selectedLinks.map((link) => (
                  <div key={link.id || link._id} className="campaign-link-item">
                    <div className="campaign-link-main">
                      <strong>{link.destination}</strong>
                      <a href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortUrl}</a>
                    </div>
                    <div className="campaign-link-meta">
                      <span>{link.clickCount ?? 0} clicks</span>
                      <span className={link.effectiveStatus === "active" ? "campaign-link-status campaign-link-status-active" : "campaign-link-status campaign-link-status-inactive"}>{link.effectiveStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="campaign-panel campaign-analytics-panel">
        <div className="campaign-panel-heading campaign-analytics-heading">
          <div><p className="campaign-eyebrow">PERFORMANCE</p><h2>{selected ? selected.name : "Campaign analytics"}</h2><p>{selected ? "Statistics are loaded from the LinkPulse API." : "Select a campaign to see its performance."}</p></div>
          <label className="campaign-period">Period <select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 365 days</option></select></label>
        </div>
        {selectedId && stats ? <>
          <div className="campaign-metrics-grid">
            <Metric label="Links in campaign" value={stats.links?.total ?? selected?.linkCount ?? 0} />
            <Metric label="Human clicks" value={stats.clicks} detail={`${number(stats.botClicks)} bot clicks excluded`} />
            <Metric label="Unique visitors" value={stats.uniqueVisitors} />
            <Metric label="Disabled links" value={stats.links?.disabled} />
          </div>
          <div className="campaign-analytics-grid">
            <div className="campaign-subpanel"><h3>Daily clicks</h3><p className="campaign-muted">Human clicks per day over the selected period.</p>
              {(stats.timeseries || []).length ? <div className="campaign-chart">{stats.timeseries.map((point) => <div className="campaign-chart-column" key={point.date} title={`${point.date}: ${number(point.clicks)} clicks`}><span className="campaign-chart-value">{point.clicks ? number(point.clicks) : ""}</span><div className="campaign-chart-bar" style={{ height: `${Math.max(point.clicks ? 5 : 1, (point.clicks / maxClicks) * 100)}%` }} /><small>{point.date.slice(5)}</small></div>)}</div> : <p className="campaign-muted">No click data for this period.</p>}
            </div>
            <div className="campaign-subpanel"><h3>Top links</h3><p className="campaign-muted">Best-performing links in this campaign.</p>
              {(stats.topLinks || []).length ? <div className="campaign-top-links">{stats.topLinks.map((link) => <div className="campaign-top-link" key={link.id}><div><strong>{link.code ? `/${link.code}` : "Short link"}</strong><small title={link.destination}>{link.destination || "Destination unavailable"}</small></div><b>{number(link.clicks)}</b></div>)}</div> : <p className="campaign-muted">No clicks recorded yet for this campaign.</p>}
            </div>
          </div>
        </> : <div className="campaign-empty campaign-analytics-empty">{loading ? "Loading campaign data…" : "Choose a campaign above to load its analytics."}</div>}
      </section>
      <p className="campaign-disclaimer">Campaign analytics are based on recorded backend click events. New campaigns may show zero clicks until their short links are visited.</p>
    </main>
  );
}
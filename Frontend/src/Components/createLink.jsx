import "./createLink.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateLink({ onCreated }){

  const [dest, setDest] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/campaigns`, {
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          return;
        }

        const items = data.items || [];
        setCampaigns(items);
        if (items.length > 0) {
          setSelectedCampaignId(items[0]._id);
        }
      } catch {
        // Ignore campaign load errors; link creation still works without a campaign
      }
    }

    loadCampaigns();
  }, [navigate]);

  async function copyLink(){
    try{
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }catch {
      setError("Unable to copy link");
    }
  }

  async function shorten(event){
    event.preventDefault();

    const value = dest.trim();
    if (value === "") {
      setError("Please enter a URL");
      return;
    }

    let url;
    try{
      url = new URL(value);
    }catch {
      setError("Please enter a valid URL, ex: https://example.com");
      return;
    }

    if(url.protocol !== "http:" && url.protocol !== "https:"){
      setError("URL must start with http:// or https://");
      return;
    }

    setError("");
    setCopied(false);
    setLoading(true);

    try{
      const payload = {
        destination: url.href,
        ...(selectedCampaignId ? { campaignId: selectedCampaignId } : {}),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/links`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if(res.status === 401){
        navigate("/login");
        return;
      }

      const data = await res.json();

      if(!res.ok || !data.link){
        setError(data.msg || "Failed to create link");
        return;
      }

      setShortUrl(data.link.shortUrl);
      setDest("");
      if (onCreated) onCreated();
    }catch (err){
      setError("Couldn't connect to the server, please try again");
    }finally{
      setLoading(false);
    }
  }

  return(
    <section className="create-link" id="create-link">
      <h2>Shorten a URL</h2>
      <p>Paste your long URL below to create a short link</p>

      <form className="create-row" onSubmit={shorten}>
        <input
          type="text"
          placeholder="Paste your URL"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
        />
        <select
          className="campaign-select"
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          aria-label="Choose campaign"
        >
          <option value="">No campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign._id} value={campaign._id}>{campaign.name}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {loading? "Shortening..":  "Shorten URL"}
        </button>
      </form>

      <p className="error">{error || " "}</p>

      {shortUrl && (
        <div className="short-url">
          <p>Your short link:</p>
          <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
          <button type="button" onClick={copyLink}>
            {copied? "Copied!": "Copy Link"}
          </button>
        </div>
      )}
    </section>
  );
}

export default CreateLink;
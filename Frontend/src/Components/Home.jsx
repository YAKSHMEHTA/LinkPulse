import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const isLoggedIn = () => {
  try {
    return Boolean(localStorage.getItem("token"));
  } catch {
    return false;
  }
};

const features = [
  {
    title: "Navigation & Link Details",
    text: "Manage links, campaigns, QR codes, analytics, and settings in one place.",
  },
  {
    title: "Link Creation",
    text: "Create short links, configure rules, validate URLs, and generate QR codes.",
  },
  {
    title: "Bulk Import",
    text: "Upload CSV files, identify errors and duplicates, and import valid links.",
  },
  {
    title: "Redirect Engine",
    text: "Check link status, expiry, click limits, and passwords before redirecting.",
  },
  {
    title: "QR Codes",
    text: "Generate downloadable QR codes and track scans.",
  },
  {
    title: "Link Analytics",
    text: "Track clicks, unique visitors, traffic sources, devices, and browsers.",
  },
  {
    title: "Analytics Dashboard",
    text: "View key metrics, campaign performance, top links, and link alerts.",
  },
];


export default function Home() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  const handleGetStarted = () => {
    navigate(loggedIn ? "/dashboard" : "/login");
  };

  return (
    <div className="home">
      <header className="nav">
        <span className="logo">LinkPulse</span>
        <nav className="nav-links">
          <a href="#features">Features</a>
          {loggedIn ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          )}
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Short links you can actually measure.</h1>
          <p className="sub">
            Turn any long URL into a clean link, then watch the clicks come in.
            Sign in to create your own.
          </p>

          <button type="button" className="btn btn-primary btn-large" onClick={handleGetStarted}>
            Get started
          </button>

          <div className="example" aria-label="Example of a short link">
            <div className="example-row">
              <span className="example-label">Long URL</span>
              <span className="example-long">
                https://example.com/blog/2026/10/how-to-build-a-portfolio?ref=newsletter
              </span>
            </div>
            <div className="example-row">
              <span className="example-label">Short link</span>
              <span className="example-short">lp.dev/portfolio</span>
            </div>
            <div className="example-row">
              <span className="example-label">Clicks</span>
              <span>1,240</span>
            </div>
          </div>
        </section>
        <section id="features" className="features">
          <h2 className="features-title">Everything you need to manage your links</h2>
          {features.map((f) => (
            <article key={f.title} className="feature">
              <h2>{f.title}</h2>
              <p>{f.text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="footer">LinkPulse © 2026. Simple links, meaningful insights.</footer>
    </div>
  );
}

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
            <div className="example-bar" aria-hidden="true">
              <i /><i /><i />
            </div>
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
              <span className="example-clicks">1,240</span>
            </div>
          </div>
        </section>
 
        <section id="features" className="features">
          <h2 className="features-title">Everything you need to manage your links</h2>
          <div className="feature-grid">
            {features.map((f) => (
              <article key={f.title} className="feature">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-inner">LinkPulse © 2026. Simple links, meaningful insights.</div>
      </footer>
    </div>
  );
}

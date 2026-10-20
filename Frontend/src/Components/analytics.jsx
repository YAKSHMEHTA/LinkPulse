import "./analytics.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BarList({ items, labelKey, className = "click-bars" }) {
  if (!items || items.length === 0) {
    return <p className="analytics-empty">No data yet</p>;
  }

  const max = Math.max(...items.map((item) => item.clicks ?? 0), 1);

  return(
    <div className={className}>
      {items.map((item, i) => (
        <div className="bar-item" key={item.id ?? item._id ?? item[labelKey] ?? i}>
          <div className="bar-area">
            <div
              className="bar"
              style={{ height: `${((item.clicks ?? 0) / max) * 150}px` }}
            ></div>
          </div>
          <p title={item[labelKey]}>{item[labelKey]}</p>
          <span>{item.clicks ?? 0} clicks</span>
        </div>
      ))}
    </div>
  );
}

function Analytics({ refreshKey }){
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats(){

      setLoading(true);
      setError("");

      setError("");
      try{
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/analytics/overview?days=7`,
          { credentials: "include" }
        );

        if(res.status === 401){
          navigate("/login");
          return;
        }

        const data = await res.json();

        if(!res.ok){
          setError(data.msg || "Could not load analytics");
          return;
        }

        setStats(data);
      }catch (err) {
        setError("Cannot reach the server. Try again later.");
      }finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [navigate, refreshKey]);

  const timeseries = stats?.timeseries ?? [];
  const maxDaily = Math.max(...timeseries.map((day) => day.clicks ?? 0), 1);

  return(
    <section className="analytics" id="analytics">
      <h2>Analytics Overview</h2>
      <p>Track the performance of your shortened links</p>

      {loading && <p className="analytics-empty">Loading analytics...</p>}
      {error && <p className="analytics-error">{error}</p>}

      <div className="analytics-stats">
        <div className="analytics-card">
          <h3>{stats?.links?.total ?? 0}</h3>
          <p>Total Links</p>
        </div>
        <div className="analytics-card">
          <h3>{stats?.clicks ?? 0}</h3>
          <p>Total Clicks (last seven days)</p>
        </div>
        <div className="analytics-card">
          <h3>{stats?.links?.active ?? 0}</h3>
          <p>Active Links</p>
        </div>
        <div className="analytics-card">
          <h3>{stats?.links?.expired ?? 0}</h3>
          <p>Expired Links</p>
        </div>

      </div>

      <div className="click-performance">
        <h2>Click Performance</h2>
        <p>Clicks across your shortened links</p>
        <BarList items={stats?.topLinks} labelKey="destination" />
      </div>

      <div className="click-performance">
        <h2>Clicks Over Time</h2>
        <p>Daily clicks over the last 7 days</p>

        {timeseries.length === 0 ? (
          <p className="analytics-empty">No data yet</p>
        ) : (
          <div className="timeseries-chart">
            {timeseries.map((day, i) => (
              <div className="timeseries-point" key={day.date ?? i}>
                <div
                  className="timeseries-bar"
                  style={{ height: `${((day.clicks ?? 0) / maxDaily) * 120}px` }}
                ></div>
                <span>{day.clicks ?? 0}</span>
                <small>{String(day.date ?? "").slice(5)}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-breakdown">
        <div className="click-performance">
          <h2>Browser Usage</h2>
          <p>Clicks grouped by browser</p>
          <BarList items={stats?.browsers} labelKey="name" className="breakdown-bars" />
        </div>

        <div className="click-performance">
          <h2>Device Usage</h2>
          <p>Clicks grouped by device</p>
          <BarList items={stats?.devices} labelKey="name" className="breakdown-bars" />
        </div>
      </div>
    </section>
  );
}

export default Analytics;
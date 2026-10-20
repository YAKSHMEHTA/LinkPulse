import { useEffect, useState } from "react";
import { api } from "../../api";

const date = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function AnalyticsTab() {
  const [days, setDays] = useState(7);
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/admin/stats?days=${days}`)
      .then((d) => {
        setS(d);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [days]);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!s) return <p>Loading...</p>;

  const max = Math.max(1, ...s.timeseries.map((t) => t.clicks));
  const { expiringSoon, limitAlerts, recentlyDisabled } = s.alerts;

  return (
    <>
      <div className="tools">
        <select
          aria-label="Time range"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <section className="stats" aria-label="Summary">
        <Stat label="Users" value={s.users} />
        <Stat label="Total links" value={s.links.total} />
        <Stat label="Active links" value={s.links.active} />
        <Stat label="Clicks" value={s.clicks} />
        <Stat label="Unique visitors" value={s.uniqueVisitors} />
        <Stat label="Bot clicks" value={s.botClicks} />
      </section>

      <section className="panel chart-box">
        <h2>Clicks per day</h2>

        <div className="chart">
          {s.timeseries.map((t) => (
            <div
              key={t.date}
              className="bar"
              title={`${t.date}: ${t.clicks} clicks`}
              style={{
                height: `${(t.clicks / max) * 100}%`,
              }}
            />
          ))}
        </div>
      </section>

      <div className="grid">
        <List
          title="Top links"
          rows={s.topLinks.map((l) => [l.code, l.clicks])}
        />

        <List
          title="Campaigns"
          rows={s.campaigns.map((c) => [c.name, c.clicks])}
        />

        <List
          title="Traffic sources"
          rows={s.referrers.map((r) => [r.name, r.clicks])}
        />

        <List
          title="Devices"
          rows={s.devices.map((r) => [r.name, r.clicks])}
        />

        <List
          title="Browsers"
          rows={s.browsers.map((r) => [r.name, r.clicks])}
        />

        <List
          title="Countries"
          rows={s.countries.map((r) => [r.name, r.clicks])}
        />

        <List
          title="Expiring soon"
          rows={expiringSoon.map((l) => [l.code, date(l.expiresAt)])}
        />

        <List
          title="Close to click limit"
          rows={limitAlerts.map((l) => [
            l.code,
            `${l.clickCount}/${l.clickLimit}`,
          ])}
        />

        <List
          title="Recently disabled"
          rows={recentlyDisabled.map((l) => [
            l.code,
            l.disabledReason || "-",
          ])}
        />
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{Number(value).toLocaleString()}</strong>
    </div>
  );
}

function List({ title, rows }) {
  return (
    <section className="panel list">
      <h2>{title}</h2>

      {rows.length === 0 ? (
        <p className="empty">No data yet.</p>
      ) : (
        <ul>
          {rows.map(([name, value], i) => (
            <li key={i}>
              <span>{name}</span>
              <b>{value}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
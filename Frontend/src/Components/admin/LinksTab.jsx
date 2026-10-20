import { useEffect, useState } from "react";
import { api } from "../../api";

const statusLabel = {
  active: "Active",
  disabled: "Disabled",
  expired: "Expired",
  limit_reached: "Limit reached",
};

export default function LinksTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [owners, setOwners] = useState({});
  const [error, setError] = useState("");

  const limit = 20;

  useEffect(() => {
    api("/admin/users")
      .then((d) =>
        setOwners(
          Object.fromEntries(
            d.items.map((u) => [u._id, u.username || u.email])
          )
        )
      )
      .catch(() => {});
  }, []);

  async function load() {
    try {
      const params = new URLSearchParams({
        scope: "all",
        page,
        limit,
      });

      if (q) params.set("q", q);
      if (status) params.set("status", status);

      const data = await api(`/links?${params}`);

      setItems(data.items);
      setTotal(data.total);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);

    return () => clearTimeout(t);
  }, [page, q, status]);

  async function toggle(link) {
    try {
      if (link.status === "active") {
        await api(
          `/admin/links/${link.id}/disable`,
          "PATCH",
          { reason: "Disabled by admin" }
        );
      } else {
        await api(
          `/admin/links/${link.id}/enable`,
          "PATCH",
          {}
        );
      }

      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="panel">
      <div className="tools">
        <input
          type="search"
          placeholder="Search by code or destination"
          aria-label="Search links"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="expired">Expired</option>
          <option value="limit_reached">Limit reached</option>
        </select>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Link</th>
              <th>Short URL</th>
              <th>Owner</th>
              <th>Clicks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((l) => (
              <tr key={l.id}>
                <td>
                  <b>{l.code}</b>
                  <small>{l.destination}</small>
                </td>

                <td>{l.shortUrl}</td>

                <td>{owners[l.ownerId] || "-"}</td>

                <td>{l.clickCount.toLocaleString()}</td>

                <td>
                  <span
                    className={`pill pill-${l.effectiveStatus}`}
                  >
                    {statusLabel[l.effectiveStatus]}
                  </span>
                </td>

                <td className="actions">
                  <button
                    className={
                      l.status === "active" ? "danger" : ""
                    }
                    onClick={() => toggle(l)}
                  >
                    {l.status === "active"
                      ? "Disable"
                      : "Enable"}
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">
                  No links found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {pages} ({total} links)
        </span>

        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
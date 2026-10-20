import { useEffect, useState } from "react";
import { api } from "../../api";

const date = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/users")
      .then((d) => setUsers(d.items))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="panel">
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <b>{u.username || u.email}</b>
                </td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{date(u.createdAt)}</td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
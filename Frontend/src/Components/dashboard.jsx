import { useState } from "react";
import CreateLink from "./createLink";
import MyLinks from "./myLinks";
import Analytics from "./analytics";
import "./dashboard.css";

function Dashboard(){
  const [refreshKey, setRefreshKey] = useState(0);

  return(
    <div className="dashboard-layout">
      <main id="dashboard">
        <section className="welcome">
          <h1>Welcome to LinkPulse</h1>
          <p>Shorten, share, and track your links.</p>
        </section>

        <CreateLink onCreated={() => setRefreshKey((k) => k+1)} />
        <MyLinks refreshKey={refreshKey} />
        <Analytics refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default Dashboard;
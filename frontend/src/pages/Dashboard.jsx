import { useState } from "react";

/* ─── KPI CARD ───────────────────────── */
// Add these constants at the TOP of Dashboard.jsx, before the components

const KPI_CARDS = [
  { label: "Units Produced", value: "1,284", unit: "units", delta: "↑ 8%", deltaUp: true },
  { label: "Downtime", value: "3.2", unit: "hrs", delta: "↓ 1hr", deltaUp: false },
  { label: "OEE", value: "87%", unit: "efficiency", delta: "→ stable", deltaUp: null },
];

const FLOW_PIPELINE = [
  { id: 1, label: "Cutting",    count: 42, pct: 80, status: "active" },
  { id: 2, label: "Assembly",   count: 31, pct: 60, status: "warn"   },
  { id: 3, label: "Packaging",  count: 12, pct: 25, status: "low"    },
];

const ACTIVITY = [
  { time: "08:14", type: "alert", text: "Line 2 conveyor speed reduced" },
  { time: "07:52", type: "info",  text: "Shift A handover completed"    },
  { time: "07:30", type: "ok",    text: "Daily calibration passed"      },
];

const INVENTORY_ITEMS = [
  { name: "Steel Coil",    category: "raw",      qty: 4200, unit: "kg",  pct: 72 },
  { name: "Plastic Resin", category: "raw",      qty: 980,  unit: "kg",  pct: 35 },
  { name: "Finished Gear", category: "finished", qty: 560,  unit: "pcs", pct: 55 },
];
function KpiCard({ card }) {
  return (
    <div className={`kpiCard`}>
      <div className="kpiLabel">{card.label}</div>
      <div className="kpiValue">{card.value}</div>
      <div className="kpiUnit">{card.unit}</div>

      <div
        className={`kpiDelta ${
          card.deltaUp === null
            ? "neutral"
            : card.deltaUp
            ? "up"
            : "down"
        }`}
      >
        {card.delta}
      </div>
    </div>
  );
}

/* ─── FLOW PIPELINE ─────────────────── */

function FlowPipeline() {
  return (
    <div className="panel">
      <div className="panelHeader">
        <span className="panelTitle">Flow pipeline</span>
        <span className="panelBadge orange">Live</span>
      </div>

      <div className="pipelineWrap">
        {FLOW_PIPELINE.map((row) => (
          <div key={row.id} className="pipelineRow">
            <div className="pipelineMeta">
              <span className="pipelineName">{row.label}</span>

              <div style={{ display: "flex", gap: 8 }}>
                <span className="pipelineCount">{row.count}</span>
                <span className={`pipelineStatus ${row.status}`}>
                  {row.status}
                </span>
              </div>
            </div>

            <div className="pipelineTrack">
              <div
                className={`pipelineBar ${row.status}`}
                style={{ width: `${row.pct}%` }}  // dynamic part stays inline
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ACTIVITY FEED ─────────────────── */

function ActivityFeed() {
  return (
    <div className="panel">
      <div className="panelHeader">
        <span className="panelTitle">Activity feed</span>
        <span className="panelBadge green">Today</span>
      </div>

      <div className="activityList">
        {ACTIVITY.map((item, i) => (
          <div key={i} className="activityRow">
            <span className="activityTime">{item.time}</span>
            <span className="navBadge">{item.type}</span>
            <span className="activityText">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── INVENTORY ─────────────────────── */

function InventorySnapshot() {
  const [filter, setFilter] = useState("all");

  const filtered = INVENTORY_ITEMS.filter(
    (i) => filter === "all" || i.category === filter
  );

  return (
    <div className="panel">
      <div className="panelHeader">
        <span className="panelTitle">Inventory snapshot</span>

        <div style={{ display: "flex", gap: 4 }}>
          {["all", "raw", "finished"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`refreshBtn ${
                filter === f ? "text-primary" : "text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <table className="invTable">
        <thead>
          <tr>
            <th className="invTh">Material</th>
            <th className="invTh">Type</th>
            <th className="invTh" style={{ textAlign: "right" }}>
              Quantity
            </th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((item, i) => (
            <tr key={i} className="activityRow">
              <td className="invTd">
                <span className="invName">{item.name}</span>

                <div className="miniBarWrap">
                  <div
                    className={`miniBar ${
                      item.pct < 40
                        ? "low"
                        : item.pct < 70
                        ? "warn"
                        : ""
                    }`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </td>

              <td className="invTd">
                <span className={`catPill ${item.category}`}>
                  {item.category}
                </span>
              </td>

              <td className="invTd" style={{ textAlign: "right" }}>
                <span className="qtyText">
                  {item.qty.toLocaleString()} {item.unit}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── MAIN DASHBOARD ────────────────── */

export default function Dashboard() {
  return (
    <div className="page">

      {/* Header */}
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Operations Overview</div>

          <div className="pageSubtitle">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}Shift A
          </div>
        </div>

        <button className="refreshBtn">↻ Refresh</button>
      </div>

      {/* KPI */}
      <div className="kpiGrid">
        {KPI_CARDS.map((card, i) => (
          <KpiCard key={i} card={card} />
        ))}
      </div>

      {/* Bottom */}
      <div className="bottomGrid">
        <FlowPipeline />
        <ActivityFeed />
        <InventorySnapshot />
      </div>

    </div>
  );
}
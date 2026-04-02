import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Production from "./pages/Production";
import Finances from "./pages/Finances";
import Inventory from "./pages/Inventory";
import "./styles.css";

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard",  icon: "▦" },
  { id: "procurement", label: "Procurement", icon: "⬡" },
  { id: "production",  label: "Production",  icon: "⚙" },
  { id: "inventory",   label: "Inventory",   icon: "▤" },
  { id: "sales",       label: "Sales",       icon: "◈" },
  { id: "finance",     label: "Finance",     icon: "◎" },
];

function Clock() {
  const [time, setTime] = useState(new Date());
  useState(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  });
  return (
    <span className="clock">
      {time.toLocaleTimeString("en-GB", { hour12: false })}
    </span>
  );
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const activeItem = NAV_ITEMS.find((n) => n.id === active);

  return (
    <div className="root">
      <aside className="sidebar">
        <div className="logoWrap">
          <div className="logoMark">
            <div className="logoIcon">P</div>
            <div>
              <div className="logoText">Prodigo</div>
              <div className="logoSub">Management System</div>
            </div>
          </div>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`navItem${active === item.id ? " active" : ""}`}
              onClick={() => setActive(item.id)}
            >
              <span className="navIcon">{item.icon}</span>
              {item.label}
              {item.id === "sales" && <span className="navBadge">3</span>}
              {item.id === "procurement" && <span className="navBadge">7</span>}
            </div>
          ))}
        </nav>

        
      </aside>

      <main className="main">
        

        <div className="content">
          {active === "dashboard" ? (
            <Dashboard />
          ) : active === "procurement" ? (
            <Purchases />
          ) : active === "production" ? (
            <Production />
          ) : active === "sales" ? (
            <Sales />
          ) : active === "finance" ? (
            <Finances />
          ) : active === "inventory" ?(
            <Inventory />
          )
          : (
            <div className="placeholder">
              <div className="placeholderTitle">{activeItem?.label} module</div>
              <div className="placeholderSub">Component not yet implemented</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
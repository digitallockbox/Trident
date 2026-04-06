
import RevenueOverview from "./RevenueOverview";
import TransactionFeed from "./TransactionFeed";
import SplitPaymentBreakdown from "./SplitPaymentBreakdown";
import PayoutControls from "./PayoutControls";
import ApiUsagePanel from "./ApiUsagePanel";
import BusinessSettingsPanel from "./BusinessSettingsPanel";
import "./UserDashboard.css";
import { useLocation } from "react-router-dom";

const SIDEBAR_LINKS = [
  { label: "Dashboard", icon: "🏛️", href: "/dashboard" },
  { label: "Transactions", icon: "💸", href: "/transactions" },
  { label: "Payouts", icon: "🚀", href: "/payouts" },
  { label: "API Keys", icon: "🔑", href: "/api-keys" },
  { label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function UserDashboard() {
  const location = useLocation();
  return (
    <div className="user-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">Trident</div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <a
                key={link.label}
                href={link.href}
                className={`sidebar-link${isActive ? " active" : ""}`}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-label">{link.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="sidebar-engines">
          {/* Sovereign engine icons (example) */}
          <span title="Aegis" className="engine-icon engine-aegis">
            🛡️
          </span>
          <span title="Apex" className="engine-icon engine-apex">
            ⚡
          </span>
          <span title="Hyperion" className="engine-icon engine-hyperion">
            ⚙️
          </span>
          <span title="Oracle" className="engine-icon engine-oracle">
            🔮
          </span>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-actions">
            <button className="topbar-action-btn" title="Instant Payout">
              🚀 Instant Payout
            </button>
            <button className="topbar-action-btn" title="Show QR Code">
              📱 QR Code
            </button>
            <button className="topbar-action-btn" title="Send/Request">
              💸 Send/Request
            </button>
          </div>
          <div className="topbar-user">
            <span className="user-avatar">👤</span>
            <span className="user-name">User</span>
          </div>
        </header>
        <section className="dashboard-grid">
          <RevenueOverview />
          <TransactionFeed />
          <SplitPaymentBreakdown />
          <PayoutControls />
          <ApiUsagePanel />
          <BusinessSettingsPanel />
        </section>
      </main>
    </div>
  );
}

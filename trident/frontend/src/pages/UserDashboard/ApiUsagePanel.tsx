export default function ApiUsagePanel() {
  // P1: Implement API key management, usage graph, error logs, webhook status
  return (
    <div className="dashboard-card api-usage-panel">
      <h2>API Usage & Keys</h2>
      <div className="api-usage-section">
        <b>API Keys</b>
        <div className="api-usage-placeholder">TODO: List and manage API keys (P1)</div>
      </div>
      <div className="api-usage-section">
        <b>Usage Graph</b>
        <div className="api-usage-placeholder">TODO: Show API usage graph (P1)</div>
      </div>
      <div className="api-usage-section">
        <b>Error Logs</b>
        <div className="api-usage-placeholder">TODO: Show error logs (P1)</div>
      </div>
      <div className="api-usage-section">
        <b>Webhooks</b>
        <div className="api-usage-placeholder">TODO: Manage webhooks (P1)</div>
      </div>
    </div>
  );
}

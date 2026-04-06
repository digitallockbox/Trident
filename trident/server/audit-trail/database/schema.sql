CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    severity TEXT NOT NULL,
    outcome TEXT NOT NULL,
    description TEXT NOT NULL,
    operator_wallet TEXT NOT NULL,
    operator_role TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    correlation_id TEXT,
    previous_checksum TEXT,
    checksum TEXT NOT NULL,
    CONSTRAINT audit_logs_severity_check CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
    CONSTRAINT audit_logs_outcome_check CHECK (outcome IN ('success', 'failure', 'denied'))
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs (severity);
CREATE INDEX IF NOT EXISTS idx_audit_outcome ON audit_logs (outcome);
CREATE INDEX IF NOT EXISTS idx_audit_operator_wallet ON audit_logs (operator_wallet);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs (module);
CREATE INDEX IF NOT EXISTS idx_audit_correlation_id ON audit_logs (correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts_severity ON audit_logs (timestamp DESC, severity);

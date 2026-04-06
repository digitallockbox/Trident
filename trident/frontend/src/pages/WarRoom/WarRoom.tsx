import { useState, useCallback } from "react";
import { useSession } from "../../state/hooks/useSession";
import { useLiveEvents, LiveEvent } from "../../state/hooks/useLiveEvents";
import RpcWidget from "../../components/widgets/RpcWidget";
import MetricsWidget from "../../components/widgets/MetricsWidget";
import CycleWidget from "../../components/widgets/CycleWidget";
import FraudWidget from "../../components/widgets/FraudWidget";
import PayoutHistoryWidget from "../../components/widgets/PayoutHistoryWidget";
import CycleLogWidget from "../../components/widgets/CycleLogWidget";
import "./WarRoom.css";
import RpcControls from "../../components/widgets/RpcControls";
import CycleOverrideControls from "../../components/widgets/CycleOverrideControls";
import OperatorAuditTrailWidget from "../../components/widgets/OperatorAuditTrailWidget";

const MAX_EVENTS = 50;

export default function WarRoom() {
  const { role, wallet, loading } = useSession();
  const [events, setEvents] = useState<LiveEvent[]>([]);

  const handleEvent = useCallback((event: LiveEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
  }, []);

  useLiveEvents(handleEvent);

  if (loading)
    return <p className="warroom-status-msg">Checking permissions…</p>;
  if (role !== "admin" && role !== "founder") {
    return (
      <p className="warroom-status-msg">
        Access denied. Admin or Founder role required.
      </p>
    );
  }

  return (
    <section className="warroom-page">
      <h1 className="warroom-heading">War Room</h1>

      <div className="warroom-events">
        <h2 className="warroom-events-title">Live Events</h2>
        {events.length === 0 ? (
          <p className="warroom-events-empty">Waiting for events…</p>
        ) : (
          <ul className="warroom-events-list">
            {events.map((e, i) => (
              <li key={i} className="warroom-event">
                <span className="warroom-event-type">{e.type}</span>
                <span className="warroom-event-data">
                  {JSON.stringify(e.data)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="warroom-grid">
        <RpcWidget />
        <MetricsWidget />
        <CycleWidget />
        <FraudWidget actorWallet={wallet} actorRole={role} />
        <PayoutHistoryWidget actorWallet={wallet} actorRole={role} />
        <CycleLogWidget />
        <OperatorAuditTrailWidget actorWallet={wallet} actorRole={role} />
      </div>

      <div className="warroom-controls">
        <h2 className="warroom-controls-heading">Operator Controls</h2>
        <div className="warroom-controls-grid">
          <RpcControls actorWallet={wallet} actorRole={role} />
          <CycleOverrideControls actorWallet={wallet} actorRole={role} />
        </div>
      </div>
    </section>
  );
}

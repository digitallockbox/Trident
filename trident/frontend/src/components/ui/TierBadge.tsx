import "./TierBadge.css";

interface Props {
  tier: string;
}

export default function TierBadge({ tier }: Props) {
  const tierKey = tier.toLowerCase();
  return <span className={`tier-badge tier-badge--${tierKey}`}>{tier}</span>;
}

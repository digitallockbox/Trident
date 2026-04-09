// Placeholder for Card component
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}
export default function Card({ children, title, subtitle }: CardProps) {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      {subtitle && <h4>{subtitle}</h4>}
      {children}
    </div>
  );
}

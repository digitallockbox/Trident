import { FC } from "react";
import { Link } from "react-router-dom";

interface AdminActionLinkProps {
  to: string;
  children: React.ReactNode;
}

interface AdminActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const AdminActionLink: FC<AdminActionLinkProps> = ({ to, children }) => {
  return (
    <Link to={to} className="admin-action-btn">
      {children}
    </Link>
  );
};

export const AdminActionButton: FC<AdminActionButtonProps> = ({
  onClick,
  disabled,
  children,
}) => {
  return (
    <button onClick={onClick} disabled={disabled} className="admin-action-btn">
      {children}
    </button>
  );
};

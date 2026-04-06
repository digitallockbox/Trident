import { FC } from "react";

interface AdminStatusMessageProps {
  message: string;
}

const AdminStatusMessage: FC<AdminStatusMessageProps> = ({ message }) => {
  return <p className="admin-status-msg">{message}</p>;
};

export default AdminStatusMessage;

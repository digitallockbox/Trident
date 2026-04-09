// Placeholder for Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({ children, loading, ...props }: ButtonProps) {
  return (
    <button disabled={loading} {...props}>
      {loading ? "Loading..." : children}
    </button>
  );
}

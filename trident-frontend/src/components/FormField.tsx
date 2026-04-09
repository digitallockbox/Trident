// Placeholder for FormField component
interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
}
export default function FormField({ children, label }: FormFieldProps) {
  return (
    <div className="form-field">
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

import Button from "../ui/Button";
import Input from "../ui/Input";

export default function LoginForm() {
  return (
    <form>
      <Input placeholder="Email" />
      <Input placeholder="Password" type="password" />
      <Button>Login</Button>
    </form>
  );
}

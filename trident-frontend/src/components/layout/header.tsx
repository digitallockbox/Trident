import Link from "next/link";

export const Header = () => {
  return (
    <header style={{ padding: 20, borderBottom: "1px solid #ddd" }}>
      <Link href="/">Home</Link> | <Link href="/system">System</Link> |{" "}
      <Link href="/engines">Engines</Link> | <Link href="/login">Login</Link>
    </header>
  );
};

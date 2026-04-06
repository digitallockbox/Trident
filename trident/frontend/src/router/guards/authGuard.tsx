export function authGuard(children: JSX.Element) {
  const isAuthed = true; // placeholder
  return isAuthed ? children : null;
}

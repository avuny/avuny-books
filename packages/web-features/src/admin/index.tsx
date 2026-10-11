import { Link, useLocale, useMessages } from "../core";

export const adminPaths = {
  dashboard: "/admin",
} as const;

export function AdminDashboardPage() {
  const { locale, setLocale } = useLocale();
  const messages = useMessages();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Admin Dashboard</h1>
      <p>Current Locale: {locale}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => setLocale("en")}>
          English
        </button>
        <button type="button" onClick={() => setLocale("ar")}>
          العربية
        </button>
      </div>
      <p>Common save text: {messages.common.save}</p>
      <nav>
        <Link to={adminPaths.dashboard}>Admin Home</Link>
      </nav>
    </div>
  );
}

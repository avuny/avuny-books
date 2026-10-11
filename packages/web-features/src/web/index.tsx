import { Link, useLocale, useMessages } from "../core";

export const productPaths = {
  list: "/products",
  detailPattern: "/products/:id",
  detail: (id: string | number) => `/products/${id}`,
} as const;

export function DashboardPage() {
  const { locale, setLocale } = useLocale();
  const messages = useMessages();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Dashboard</h1>
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
        <Link to={productPaths.list}>Go to Products</Link>
      </nav>
    </div>
  );
}

export function ProductsPage() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Products</h1>
      <ul>
        <li>
          <Link to={productPaths.detail(1)}>Product 1</Link>
        </li>
        <li>
          <Link to={productPaths.detail(2)}>Product 2</Link>
        </li>
      </ul>
      <Link to="/">Back to Dashboard</Link>
    </div>
  );
}

export function ProductDetailsPage() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Product Details</h1>
      <Link to={productPaths.list}>Back to Products</Link>
    </div>
  );
}

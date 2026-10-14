
import "@avuny/ui/globals.css"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CreditCard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Button } from "@avuny/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@avuny/ui/components/card";
import { Link, useLocale, useMessages } from "../core";

export const productPaths = {
  list: "/products",
  detailPattern: "/products/:id",
  detail: (id: string | number) => `/products/${id}`,
} as const;

const stats = [
  {
    title: "Total Products",
    value: "1,284",
    change: "+12.5%",
    description: "Compared to last month",
    icon: Package,
    positive: true,
  },
  {
    title: "Total Customers",
    value: "856",
    change: "+8.2%",
    description: "Compared to last month",
    icon: Users,
    positive: true,
  },
  {
    title: "Total Orders",
    value: "342",
    change: "+4.3%",
    description: "Compared to last month",
    icon: ShoppingCart,
    positive: true,
  },
  {
    title: "Revenue",
    value: "$24,680",
    change: "-2.4%",
    description: "Compared to last month",
    icon: CreditCard,
    positive: false,
  },
];

const activities = [
  {
    title: "New product added",
    detail: "Wireless Headphones",
    time: "10 minutes ago",
    status: "Completed",
  },
  {
    title: "New order received",
    detail: "Order #ORD-1042",
    time: "35 minutes ago",
    status: "Processing",
  },
  {
    title: "Customer registered",
    detail: "Alexandra Morgan",
    time: "1 hour ago",
    status: "Completed",
  },
  {
    title: "Stock running low",
    detail: "USB-C Adapter",
    time: "2 hours ago",
    status: "Attention",
  },
];

export function DashboardPage() {
  const { locale, setLocale } = useLocale();
  const messages = useMessages();
  const isArabic = locale === "ar";

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}

    >
      <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Page heading */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Boxes className="size-4" />
              <span>Workspace</span>
              <span>/</span>
              <span>Overview</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              {isArabic ? "لوحة التحكم" : "Dashboard"}
            </h1>

            <p className="text-sm text-muted-foreground">
              {isArabic
                ? "مرحباً بعودتك! إليك ملخص نشاطك اليوم."
                : "Welcome back! Here's what's happening with your business today."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border bg-background p-1">
              <Button
                type="button"
                size="sm"
                variant={locale === "en" ? "secondary" : "ghost"}
                onClick={() => setLocale("en")}
              >
                English
              </Button>
              <Button
                type="button"
                size="sm"
                variant={locale === "ar" ? "secondary" : "ghost"}
                onClick={() => setLocale("ar")}
              >
                العربية
              </Button>
            </div>

            <Button>
              <Link to={productPaths.list}>
                <Package className="me-2 size-4" />
                {isArabic ? "عرض المنتجات" : "View products"}
                <ArrowRight className="ms-2 size-4" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:p-8">
          <div className="relative z-10 max-w-2xl space-y-3">
            <p className="text-sm font-medium text-primary-foreground/75">
              AVUNY · BUSINESS OVERVIEW
            </p>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {isArabic
                ? "كل أعمالك، في مكان واحد."
                : "Your business, at a glance."}
            </h2>

            <p className="max-w-lg text-sm leading-6 text-primary-foreground/80">
              {isArabic
                ? "تابع منتجاتك وعملاءك وطلباتك من مساحة عمل واحدة."
                : "Monitor your products, customers, and orders from one organized workspace."}
            </p>

            <Button

              variant="secondary"
              className="mt-2"
            >
              <Link to={productPaths.list}>
                {isArabic ? "إدارة المخزون" : "Manage inventory"}
                <ArrowRight className="ms-2 size-4" />
              </Link>
            </Button>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-10 -top-24 size-72 rounded-full border border-primary-foreground/10"
          >
            <div className="absolute inset-8 rounded-full border border-primary-foreground/10" />
            <div className="absolute inset-16 rounded-full border border-primary-foreground/10" />
          </div>
        </section>

        {/* Stat cards */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {isArabic ? "نظرة عامة" : "Business overview"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isArabic
                ? "ملخص سريع لأهم مؤشرات أعمالك."
                : "A snapshot of your key business metrics."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card
                  key={stat.title}
                  className="gap-4 border-border/70 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-3 pb-0">
                    <CardDescription className="font-medium">
                      {stat.title}
                    </CardDescription>

                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-3xl font-semibold tracking-tight tabular-nums">
                      {stat.value}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={
                          stat.positive
                            ? "inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"
                            : "inline-flex items-center gap-1 font-medium text-destructive"
                        }
                      >
                        {stat.positive ? (
                          <ArrowUpRight className="size-3.5" />
                        ) : (
                          <ArrowDownRight className="size-3.5" />
                        )}
                        {stat.change}
                      </span>

                      <span className="text-muted-foreground">
                        {isArabic ? "مقارنة بالشهر الماضي" : "vs. last month"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Lower dashboard */}
        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>
                {isArabic ? "النشاط الأخير" : "Recent activity"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "آخر التحديثات في مساحة عملك."
                  : "The latest updates from your workspace."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {activities.map((activity) => (
                  <div
                    key={activity.title}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Boxes className="size-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-medium">
                          {activity.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {activity.detail}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1">
                      <span
                        className={
                          activity.status === "Completed"
                            ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                            : activity.status === "Attention"
                              ? "rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                              : "rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400"
                        }
                      >
                        {activity.status}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>
                {isArabic ? "الوصول السريع" : "Quick access"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "انتقل مباشرة إلى ما تحتاجه."
                  : "Jump straight to the tools you use most."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Link
                to={productPaths.list}
                className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/60"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {isArabic ? "المنتجات" : "Products"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isArabic
                      ? "إدارة المنتجات والمخزون"
                      : "Manage your products and inventory"}
                  </p>
                </div>

                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </Link>

              <div className="rounded-xl border border-dashed p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Boxes className="size-5 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {isArabic
                        ? "مساحة عملك جاهزة"
                        : "Your workspace is ready"}
                    </p>
                    <p className="text-sm leading-5 text-muted-foreground">
                      {isArabic
                        ? "ابدأ بإدارة منتجاتك لتبقى بياناتك منظمة."
                        : "Start with your products to keep your business organized."}
                    </p>
                  </div>
                </div>
              </div>

              <p className="px-1 pt-1 text-xs text-muted-foreground">
                {messages.common.save}
              </p>
            </CardContent>
          </Card>
        </div>

        <footer className="flex flex-col gap-1 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Avuny · Business management made simple</span>
          <span>
            {isArabic ? "مساحة عملك، منظمة ببساطة." : "Your workspace, beautifully organized."}
          </span>
        </footer>
      </div>
    </main>
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



import { authPaths } from "./modules/user/paths"
import { SignInScreen } from "./modules/user/screens/sign-in-screen"
import { SignUpScreen } from "./modules/user/screens/sign-up-screen"
const WebAppRouter = [{ path: "/", element: <DashboardPage /> },
{ path: authPaths.signIn, element: <SignInScreen /> },
{ path: authPaths.signUp, element: <SignUpScreen /> },
]

export { WebAppRouter }

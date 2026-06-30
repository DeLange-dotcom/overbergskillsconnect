import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "@/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Overberg Skills Connect" },
      {
        name: "description",
        content:
          "The Overberg Skills Connect — supporting Skills, Mentorship, Apprenticeships and Community Opportunities. A Khulisa Group platform delivering programmes including Hineni in the Overberg.",
      },
      { property: "og:site_name", content: "Overberg Skills Connect" },
      { property: "og:title", content: "Overberg Skills Connect" },
      {
        property: "og:description",
        content:
          "Powered by Overberg Skills Connect. Programmes include Hineni — vetted local people for households, farms, churches and businesses in the Overberg.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Overberg Skills Connect" },
      { name: "description", content: "A trusted community skills platform connecting local service providers with those needing help, while facilitating donations." },
      { property: "og:description", content: "A trusted community skills platform connecting local service providers with those needing help, while facilitating donations." },
      { name: "twitter:description", content: "A trusted community skills platform connecting local service providers with those needing help, while facilitating donations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f39acce-7dcc-44c0-9796-e7e0c45227ec/id-preview-de3eb8dc--f294ef0d-e1d7-4c98-a3cd-6eca3d4f17b1.lovable.app-1782823879888.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9f39acce-7dcc-44c0-9796-e7e0c45227ec/id-preview-de3eb8dc--f294ef0d-e1d7-4c98-a3cd-6eca3d4f17b1.lovable.app-1782823879888.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Restore stored language on client
  useEffect(() => {
    import("@/i18n").then(({ default: i18n, getStoredLanguage }) => {
      const stored = getStoredLanguage();
      if (stored && stored !== i18n.language) i18n.changeLanguage(stored);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      if (cancelled) return;
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      (window as unknown as { __hineniAuthSub?: { unsubscribe: () => void } }).__hineniAuthSub =
        sub.subscription;
    });
    return () => {
      cancelled = true;
      (
        window as unknown as { __hineniAuthSub?: { unsubscribe: () => void } }
      ).__hineniAuthSub?.unsubscribe();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

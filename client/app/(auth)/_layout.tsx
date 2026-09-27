import { Slot, usePathname } from "expo-router";
import { AuthFlow, type AuthRoute } from "@/components/organisms/AuthFlow";
import { AuthSplitLayout } from "@/components/organisms/AuthSplitLayout";
import { useT } from "@/lib/i18n";

const FLOW_ROUTES: Record<string, AuthRoute> = {
  "/login": "login",
  "/register": "register",
  "/forgot-password": "forgot",
  "/verify-email": "verify",
};

/**
 * One persistent shell for every auth screen. Login, sign-up, reset and
 * "check your inbox" are rendered here by AuthFlow (their route files are
 * empty), so moving between them morphs the form instead of swapping pages.
 * Other auth routes (setup-password) render through the Slot inside the shell.
 */
export default function AuthLayout() {
  const t = useT();
  const pathname = usePathname();
  const flowRoute = FLOW_ROUTES[pathname];

  const back =
    pathname === "/login"
      ? { href: "/", label: t("common.backToHome") }
      : pathname === "/verify-email"
        ? { href: "/(auth)/register", label: t("auth.ve.backToRegister") }
        : { href: "/(auth)/login", label: t("auth.backToLogin") };

  return (
    <AuthSplitLayout backHref={back.href} backLabel={back.label}>
      {flowRoute && <AuthFlow route={flowRoute} />}
      <Slot />
    </AuthSplitLayout>
  );
}

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Platform, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { BrandButton, GoogleIcon, Input } from "@/components/atoms";
import { EmailFlight, type Flight, type Point } from "@/components/molecules/EmailFlight";
import { Fold } from "@/components/molecules/Fold";
import { NewPasswordFields } from "@/components/molecules/NewPasswordFields";
import { RollingTitle } from "@/components/molecules/RollingTitle";
import { AuthAlert, AuthTextLink } from "@/components/organisms/AuthSplitLayout";
import { authApi, identityApi } from "@/lib/api";
import { useT } from "@/lib/i18n";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  setupPasswordSchema,
} from "@/lib/schemas";
import { startGoogleOAuth } from "@/lib/oauth";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { getApiErrorMessage } from "@/lib/utils/apiErrors";
import { getBrandTokens } from "@/lib/utils/uiTokens";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

export type AuthRoute = "login" | "register" | "forgot" | "verify";
/** Registration and reset have a second step on the same route. */
type Mode = AuthRoute | "registerPassword" | "code";

const DEPTH: Record<Mode, number> = { login: 0, register: 1, forgot: 1, registerPassword: 2, code: 2, verify: 3 };
const hasEmailField = (m: Mode) => m === "login" || m === "register" || m === "forgot";
const hasEmailLine = (m: Mode) => m === "registerPassword" || m === "code" || m === "verify";

type Rect = { x: number; y: number; w: number; h: number };

function pick(issues: Record<string, string>, keys: string[]) {
  return Object.fromEntries(Object.entries(issues).filter(([k]) => keys.includes(k)));
}

function issuesOf(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  const out: Record<string, string> = {};
  if (result.success || !result.error) return out;
  for (const issue of result.error.issues) {
    const key = String(issue.path[0]);
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** "Sent to" sentence with the address on its own line, so it can be measured for the flight. */
function EmailLine({
  lead,
  email,
  hint,
  lineRef,
  hidden,
}: {
  lead: string;
  email: string;
  hint: ReactNode;
  lineRef: RefObject<Text | null>;
  hidden: boolean;
}) {
  return (
    <View>
      {/* Separate Text siblings (not nested) so the address can be measured for the flight. */}
      <View className="flex-row flex-wrap">
        <Text className="text-brand-muted font-body text-base leading-6" style={{ marginRight: 5 }}>
          {lead}
        </Text>
        <Text
          ref={lineRef}
          className="text-brand-ink font-headline text-base leading-6"
          style={{ opacity: hidden ? 0 : 1 }}
        >
          {email}
        </Text>
      </View>
      {typeof hint === "string" ? (
        <Text className="text-brand-muted font-body text-base leading-6">{hint}</Text>
      ) : (
        hint
      )}
    </View>
  );
}

/**
 * Login, sign-up, password reset and "check your inbox" as ONE form that changes
 * shape. The routes stay (/login, /register, /forgot-password, /verify-email); the
 * (auth) layout keeps this component mounted, so shared fields never remount:
 * the email keeps its value and position, other sections fold in and out, the
 * title rolls, and the address flies into the sentence that names it.
 */
export function AuthFlow({ route }: { route: AuthRoute }) {
  const router = useRouter();
  const t = useT();
  const { width, height } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;
  // Short laptop windows get tighter spacing so every step fits without scrolling.
  const compact = isWide && height < 800;
  const g = (n: number) => (compact ? Math.round(n * 0.6) : n);
  const reduce = useReducedMotion();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);
  const params = useGlobalSearchParams<{ email?: string }>();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [registerStep, setRegisterStep] = useState<"details" | "password">("details");
  const mode: Mode =
    route === "forgot" && resetStep === "code"
      ? "code"
      : route === "register" && registerStep === "password"
        ? "registerPassword"
        : route;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [terms, setTerms] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [attempted, setAttempted] = useState<Mode | null>(null);
  const [busy, setBusy] = useState<null | "primary" | "google" | "resend">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const verifyEmail = typeof params.email === "string" ? params.email : email;
  // Keep the last text while an alert folds away.
  const lastError = useRef(error);
  const lastNotice = useRef(notice);
  if (error) lastError.current = error;
  if (notice) lastNotice.current = notice;

  // Derived per mode change: title direction, and a clean slate for secrets and messages.
  const [track, setTrack] = useState({ mode, dir: 1 as 1 | -1 });
  if (track.mode !== mode) {
    setTrack({ mode, dir: DEPTH[mode] >= DEPTH[track.mode] ? 1 : -1 });
    if (route !== "forgot" && resetStep !== "email") setResetStep("email");
    if (route !== "register" && registerStep !== "details") setRegisterStep("details");
    setPassword("");
    setNewPassword("");
    setConfirm("");
    setCode("");
    setAttempted(null);
    setError(null);
    setNotice(null);
  }

  // ---- email flight ----
  const rootRef = useRef<View>(null);
  const emailFieldRef = useRef<View>(null);
  const codeLineRef = useRef<Text>(null);
  const accountLineRef = useRef<Text>(null);
  const verifyLineRef = useRef<Text>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [flying, setFlying] = useState<"line" | "field" | null>(null);
  const lastMode = useRef(mode);

  function measure(ref: RefObject<View | Text | null>, cb: (r: Rect) => void) {
    const root = rootRef.current;
    const node = ref.current;
    if (!root || !node) return;
    root.measureInWindow((rx, ry) =>
      node.measureInWindow((x, y, w, h) => cb({ x: x - rx, y: y - ry, w, h })),
    );
  }
  // Text inside the field: 1px border + 14px padding, one 24px line centred.
  const fieldText = (r: Rect): Point => ({ x: r.x + 15, y: r.y + (r.h - 24) / 2 });
  const lineRefFor = (m: Mode) =>
    m === "code" ? codeLineRef : m === "registerPassword" ? accountLineRef : verifyLineRef;

  useLayoutEffect(() => {
    const prev = lastMode.current;
    lastMode.current = mode;
    if (reduce || prev === mode) return;
    const toLine = hasEmailField(prev) && hasEmailLine(mode);
    const toField = hasEmailLine(prev) && hasEmailField(mode);
    if (!toLine && !toField) return;

    const text = toLine
      ? mode === "code"
        ? resetEmail
        : mode === "registerPassword"
          ? email.trim()
          : verifyEmail
      : email;
    if (!text) return;
    const start = (from: Point) => {
      setFlying(toLine ? "line" : "field");
      setFlight({
        id: Date.now(),
        text,
        from,
        fromClass: toLine ? "font-body" : "font-headline",
        toClass: toLine ? "font-headline" : "font-body",
        measureTarget: (cb) =>
          toLine
            ? measure(lineRefFor(mode), (r) => cb({ x: r.x, y: r.y }))
            : measure(emailFieldRef, (r) => cb(fieldText(r))),
      });
    };
    if (toLine) measure(emailFieldRef, (r) => start(fieldText(r)));
    else measure(lineRefFor(prev), (r) => start({ x: r.x, y: r.y }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ---- validation (live after the first submit attempt of the current mode) ----
  function validate(m: Mode) {
    switch (m) {
      case "login":
        return issuesOf(loginSchema.safeParse({ email: email.trim(), password }));
      case "register":
      case "registerPassword": {
        const all = issuesOf(
          registerSchema.safeParse({
            fullName,
            email: email.trim(),
            rawPassword: newPassword,
            confirmPassword: confirm,
            termsAccepted: terms,
          }),
        );
        return m === "register"
          ? pick(all, ["fullName", "email", "termsAccepted"])
          : pick(all, ["rawPassword", "confirmPassword"]);
      }
      case "forgot":
        return issuesOf(forgotPasswordSchema.safeParse({ email: email.trim() }));
      case "code":
        return issuesOf(setupPasswordSchema.safeParse({ newPassword, confirmPassword: confirm }));
      default:
        return {};
    }
  }
  const errors: Record<string, string> = attempted === mode ? validate(mode) : {};

  async function sendResetCode(target: string, isResend: boolean) {
    setBusy(isResend ? "resend" : "primary");
    setError(null);
    setNotice(null);
    try {
      await authApi.requestPasswordReset(target);
      setResetEmail(target);
      setResetStep("code");
      if (isResend) setNotice(t("auth.fp.resent"));
    } catch (e: any) {
      setError(getApiErrorMessage(e, t("auth.fp.sendError")));
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (busy) return;
    if (mode === "verify") {
      router.replace("/(auth)/login");
      return;
    }
    setAttempted(mode);
    if (Object.keys(validate(mode)).length > 0) return;
    if (mode === "code" && !code.trim()) {
      setError(t("auth.sp.enterCode"));
      return;
    }
    if (mode === "forgot") {
      await sendResetCode(email.trim(), false);
      return;
    }
    if (mode === "register") {
      setRegisterStep("password");
      return;
    }

    setBusy("primary");
    setError(null);
    setNotice(null);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else if (mode === "registerPassword") {
        const { userId } = await register(fullName, email.trim(), newPassword);
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { userId, email: email.trim() },
        } as never);
      } else if (mode === "code") {
        await authApi.resetPassword({ email: resetEmail, resetCode: code.trim(), newPassword });
        await login(resetEmail, newPassword);
      }
    } catch (e: any) {
      if (mode === "login" && e.response?.data?.title === "Identity.PasswordNotSet") {
        router.push({ pathname: "/(auth)/setup-password", params: { email: email.trim() } } as never);
        return;
      }
      const fallback =
        mode === "login"
          ? "auth.invalidCredentials"
          : mode === "registerPassword"
            ? "auth.registerError"
            : "auth.sp.codeInvalid";
      setError(getApiErrorMessage(e, t(fallback)));
    } finally {
      setBusy(null);
    }
  }

  async function onGoogle() {
    if (mode === "register" && !terms) {
      setError(t("auth.acceptTermsFirst"));
      return;
    }
    setBusy("google");
    setError(null);
    try {
      await startGoogleOAuth();
    } catch (e: unknown) {
      const fallback = mode === "register" ? "auth.googleRegisterFailed" : "auth.googleLoginFailed";
      setError(e instanceof Error ? e.message : t(fallback));
    } finally {
      setBusy(null);
    }
  }

  async function resendVerification() {
    if (!verifyEmail || busy) return;
    setBusy("resend");
    setError(null);
    setNotice(null);
    try {
      await identityApi.resendConfirmationEmail(verifyEmail);
      setNotice(t("auth.ve.resent"));
    } catch (e: any) {
      setError(getApiErrorMessage(e, t("auth.ve.resendError")));
    } finally {
      setBusy(null);
    }
  }

  const title = {
    login: t("auth.login"),
    register: t("auth.registerTitle"),
    registerPassword: t("auth.reg.passwordTitle"),
    forgot: t("auth.fp.title"),
    code: t("auth.fp.sentTitle"),
    verify: t("auth.ve.title"),
  }[mode];
  const primary = {
    login: t("auth.login"),
    register: t("auth.reg.next"),
    registerPassword: t("auth.registerTitle"),
    forgot: t("auth.fp.send"),
    code: t("auth.fp.submit"),
    verify: t("auth.ve.goLogin"),
  }[mode];

  const fold = { reduceMotion: reduce };
  const forgotLink = (
    <TouchableOpacity
      accessibilityRole="link"
      onPress={() => router.push("/(auth)/forgot-password")}
      className={isWide ? "" : "self-end min-h-11 justify-center"}
    >
      <Text className="text-brand-muted font-body text-sm underline">{t("auth.forgotPassword")}</Text>
    </TouchableOpacity>
  );

  return (
    <View ref={rootRef} style={{ position: "relative" }}>
      <RollingTitle title={title} direction={track.dir} reduceMotion={reduce} compact={compact} />

      <Fold open={mode === "login"} gap={g(10)} {...fold}>
        <View className="flex-row flex-wrap items-center gap-1">
          <Text className="text-brand-muted font-body text-base">{t("auth.noAccount")}</Text>
          <AuthTextLink label={t("auth.createFreeAccount")} onPress={() => router.push("/(auth)/register")} />
        </View>
      </Fold>
      <Fold open={mode === "register"} gap={g(10)} {...fold}>
        <View className="flex-row flex-wrap items-center gap-1">
          <Text className="text-brand-muted font-body text-base">{t("auth.haveAccount")}</Text>
          <AuthTextLink label={t("auth.login")} onPress={() => router.push("/(auth)/login")} />
        </View>
      </Fold>
      <Fold open={mode === "registerPassword"} gap={g(10)} {...fold}>
        <EmailLine
          lead={t("auth.reg.accountFor")}
          email={email.trim()}
          hint={
            <View className="self-start">
              <AuthTextLink label={t("auth.reg.changeDetails")} tone="ink" onPress={() => setRegisterStep("details")} />
            </View>
          }
          lineRef={accountLineRef}
          hidden={flying === "line" && mode === "registerPassword"}
        />
      </Fold>
      <Fold open={mode === "forgot"} gap={g(10)} {...fold}>
        <Text className="text-brand-muted font-body text-base leading-6">{t("auth.fp.subtitle")}</Text>
      </Fold>
      <Fold open={mode === "code"} gap={g(10)} {...fold}>
        <EmailLine
          lead={t("auth.fp.codeSentTo")}
          email={resetEmail}
          hint={t("auth.fp.codeSentHint")}
          lineRef={codeLineRef}
          hidden={flying === "line" && mode === "code"}
        />
      </Fold>
      <Fold open={mode === "verify"} gap={g(10)} {...fold}>
        <EmailLine
          lead={t("auth.ve.sentTo")}
          email={verifyEmail}
          hint={t("auth.ve.sentHint")}
          lineRef={verifyLineRef}
          hidden={flying === "line" && mode === "verify"}
        />
      </Fold>

      <Fold open={!!error} gap={g(20)} {...fold}>
        <AuthAlert message={lastError.current ?? ""} />
      </Fold>
      <Fold open={!!notice} gap={g(20)} {...fold}>
        <AuthAlert message={lastNotice.current ?? ""} tone="success" />
      </Fold>

      <Fold open={mode === "register"} gap={g(24)} {...fold}>
        <Input
          tone="brand"
          label={t("auth.fullName")}
          placeholder={t("auth.namePlaceholder")}
          autoCapitalize="words"
          autoComplete="name"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
        />
      </Fold>
      <Fold open={hasEmailField(mode)} gap={g(20)} {...fold}>
        <Input
          tone="brand"
          fieldRef={emailFieldRef}
          label={t("auth.emailLabel")}
          placeholder={t("auth.emailPlaceholder")}
          keyboardType="email-address"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          returnKeyType={mode === "login" ? "next" : "go"}
          onSubmitEditing={mode === "login" ? undefined : submit}
          style={flying === "field" ? { color: "transparent" } : undefined}
        />
      </Fold>
      <Fold open={mode === "code"} gap={g(24)} {...fold}>
        <Input
          tone="brand"
          label={t("auth.fp.codeLabel")}
          placeholder={t("auth.fp.codePlaceholder")}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="one-time-code"
          value={code}
          onChangeText={setCode}
        />
      </Fold>
      <Fold open={mode === "login"} gap={g(20)} {...fold}>
        <View className="flex-row justify-between items-baseline mb-2">
          <Text className="text-brand-ink font-headline text-[15px]">{t("auth.password")}</Text>
          {isWide && forgotLink}
        </View>
        <Input
          tone="brand"
          accessibilityLabel={t("auth.password")}
          secureToggle
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {!isWide && forgotLink}
      </Fold>
      <Fold open={mode === "registerPassword" || mode === "code"} gap={g(20)} {...fold}>
        <NewPasswordFields
          password={newPassword}
          confirm={confirm}
          onChangePassword={setNewPassword}
          onChangeConfirm={setConfirm}
          passwordLabel={mode === "code" ? t("auth.sp.newPassword") : t("auth.password")}
          confirmLabel={mode === "code" ? t("auth.sp.repeatPassword") : t("auth.confirmPassword")}
          passwordError={errors.rawPassword ?? errors.newPassword}
          confirmError={errors.confirmPassword}
          onSubmitEditing={submit}
          compact={compact}
        />
      </Fold>
      <Fold open={mode === "register"} gap={g(16)} {...fold}>
        <TouchableOpacity
          accessibilityRole="checkbox"
          accessibilityState={{ checked: terms }}
          onPress={() => setTerms((v) => !v)}
          className="flex-row items-center gap-3 min-h-11"
        >
          <MaterialIcons
            name={terms ? "check-box" : "check-box-outline-blank"}
            size={22}
            color={terms ? brand.accent : brand.field}
          />
          <Text className="flex-1 text-brand-ink font-body text-[15px] leading-6">
            {t("auth.acceptPrefix")}{" "}
            <Text
              className="text-brand-accent-text font-headline underline"
              onPress={() => router.push("/terms-of-service" as never)}
            >
              {t("auth.terms")}
            </Text>{" "}
            {t("auth.and")}{" "}
            <Text
              className="text-brand-accent-text font-headline underline"
              onPress={() => router.push("/privacy-policy" as never)}
            >
              {t("auth.privacy")}
            </Text>
          </Text>
        </TouchableOpacity>
        <View accessibilityLiveRegion="polite">
          {errors.termsAccepted && (
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="error-outline" size={16} color={brand.error} />
              <Text className="flex-1 text-brand-error font-body text-sm">{errors.termsAccepted}</Text>
            </View>
          )}
        </View>
      </Fold>
      <Fold open={mode === "verify"} gap={g(24)} {...fold}>
        <View className="rounded-input bg-brand-accent-soft px-4 py-3.5">
          <Text className="text-brand-ink font-body text-[15px] leading-6">{t("auth.ve.banner")}</Text>
        </View>
      </Fold>

      <View style={{ marginTop: g(24) }}>
        <BrandButton
          label={primary}
          size="lg"
          fullWidth
          loading={busy === "primary"}
          disabled={busy === "google"}
          onPress={submit}
        />
      </View>

      <Fold open={mode === "login" || mode === "register"} gap={g(20)} {...fold}>
        <View className="gap-5">
          <View className="flex-row items-center gap-4">
            <View className="flex-1 h-px bg-brand-line" />
            <Text className="text-brand-muted font-body text-sm">{t("auth.or")}</Text>
            <View className="flex-1 h-px bg-brand-line" />
          </View>
          <BrandButton
            label={
              busy === "google"
                ? t("common.redirecting")
                : mode === "register"
                  ? t("auth.registerWithGoogle")
                  : t("auth.loginWithGoogle")
            }
            variant="surface"
            size="lg"
            fullWidth
            disabled={busy !== null}
            leading={<GoogleIcon />}
            onPress={onGoogle}
          />
        </View>
      </Fold>
      <Fold open={mode === "forgot"} gap={g(12)} {...fold}>
        <View className="self-start">
          <AuthTextLink label={t("auth.backToLogin")} tone="ink" onPress={() => router.push("/(auth)/login")} />
        </View>
      </Fold>
      <Fold open={mode === "code"} gap={g(12)} {...fold}>
        <View className="flex-row flex-wrap" style={{ columnGap: 24 }}>
          <AuthTextLink
            label={t("auth.fp.resend")}
            tone="ink"
            onPress={() => {
              if (!busy) sendResetCode(resetEmail, true);
            }}
          />
          <AuthTextLink label={t("auth.fp.changeEmail")} tone="ink" onPress={() => setResetStep("email")} />
        </View>
      </Fold>
      <Fold open={mode === "verify"} gap={g(12)} {...fold}>
        <BrandButton
          label={t("auth.ve.resend")}
          variant="surface"
          size="lg"
          fullWidth
          loading={busy === "resend"}
          onPress={resendVerification}
        />
      </Fold>

      {flight && (
        <EmailFlight
          flight={flight}
          onDone={() => {
            setFlight(null);
            setFlying(null);
          }}
        />
      )}
    </View>
  );
}

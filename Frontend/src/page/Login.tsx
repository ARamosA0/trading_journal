import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../component/auth/AuthLayout";
import GoogleSignInButton from "../component/auth/GoogleSignInButton";
import PasswordField from "../component/auth/PasswordField";
import { getApiErrorMessage, googleAuth, loginAuth } from "../api/auth";
import { useAuth } from "../authContext/context";

function Login() {
    const [userLogin, setUserLogin] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectAfterLogin = useCallback(() => {
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
        navigate(from || "/journal", { replace: true });
    }, [location.state, navigate]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserLogin((current) => ({ ...current, [name]: value }));
        setError("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const response = await loginAuth({
                email: userLogin.email,
                password: userLogin.password,
                rememberMe,
            });

            login(response.token, {
                userName: response.userName,
                email: response.email,
                role: response.rol,
            });

            redirectAfterLogin();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Email or password is incorrect. Check your details and try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleCredential = useCallback(async (credential: string) => {
        setError("");
        setIsSubmitting(true);
        try {
            const response = await googleAuth({ credential, rememberMe });
            login(response.token, {
                userName: response.userName,
                email: response.email,
                role: response.rol,
            });
            redirectAfterLogin();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Google sign-in failed. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    }, [login, redirectAfterLogin, rememberMe]);

    return (
        <AuthLayout title="Welcome back" description="Log in to continue to your trading journal.">
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-text">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        name="email"
                        value={userLogin.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-4 py-3.5 text-sm text-text placeholder:text-[var(--text3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                </div>

                <PasswordField
                    id="login-password"
                    name="password"
                    label="Password"
                    value={userLogin.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="inline-flex items-center gap-2.5 text-text2">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                            aria-describedby="remember-session-note"
                            className="size-4 rounded border-border2 accent-primary"
                        />
                        <span>Remember me</span>
                    </label>
                    <Link
                        to="/forgot-password"
                        className="rounded-sm text-text2 transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Forgot password?
                    </Link>
                </div>
                <p id="remember-session-note" className="sr-only">When selected, your secure session can be restored for up to 30 days on this device.</p>

                {error && <p className="rounded-lg border border-[var(--red)]/25 bg-[var(--red-dim)] px-3.5 py-3 text-sm text-[var(--red)]" role="alert">{error}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
                    style={{ backgroundImage: "linear-gradient(110deg, var(--primary), var(--accent))" }}
                >
                    {isSubmitting ? "Logging in…" : "Log in"}
                </button>

                <div className="flex items-center gap-4" aria-hidden="true">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-[var(--text3)]">OR</span>
                    <span className="h-px flex-1 bg-white/10" />
                </div>

                <GoogleSignInButton
                    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                    onCredential={handleGoogleCredential}
                />

                <p className="pt-1 text-center text-sm text-text2">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="font-semibold text-[var(--primary2)] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        Sign up
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default Login;

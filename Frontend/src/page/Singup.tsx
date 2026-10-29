import { useCallback, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../component/auth/AuthLayout";
import GoogleSignInButton from "../component/auth/GoogleSignInButton";
import PasswordField from "../component/auth/PasswordField";
import { getApiErrorMessage, googleAuth, register } from "../api/auth";
import { useAuth } from "../authContext/context";

const passwordRules = [
    { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
    { id: "uppercase", label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
    { id: "lowercase", label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
    { id: "number", label: "One number", test: (value: string) => /[0-9]/.test(value) },
];

function Signup() {
    const [userRegister, setUserRegister] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const passwordStatus = passwordRules.map((rule) => ({ ...rule, passed: rule.test(userRegister.password) }));
    const missingRules = passwordStatus.filter((rule) => !rule.passed);
    const passwordIsValid = missingRules.length === 0;
    const confirmError = (confirmTouched || submitAttempted) && userRegister.password !== userRegister.confirmPassword
        ? userRegister.confirmPassword.length > 0 ? "Passwords don’t match." : "Please confirm your password."
        : undefined;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserRegister((current) => ({ ...current, [name]: value }));
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);
        setError("");
        setSuccess("");

        if (!passwordIsValid) {
            passwordRef.current?.focus();
            return;
        }

        if (userRegister.password !== userRegister.confirmPassword) {
            setConfirmTouched(true);
            confirmPasswordRef.current?.focus();
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await register({
                userName: userRegister.userName,
                email: userRegister.email,
                password: userRegister.password,
            }) as { message?: string };

            setSuccess(response?.message || "Your account is ready. You can now log in.");
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "We couldn’t create your account. Check your details and try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleCredential = useCallback(async (credential: string) => {
        setError("");
        setIsSubmitting(true);
        try {
            const response = await googleAuth({ credential, rememberMe: false });
            login(response.token, {
                userName: response.userName,
                email: response.email,
                role: response.rol,
            });
            navigate("/journal", { replace: true });
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Google sign-in failed. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    }, [login, navigate]);

    return (
        <AuthLayout title="Create your account" description="Start building a clearer record of your trading decisions.">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="signup-username" className="mb-2 block text-sm font-medium text-text">Username</label>
                    <input
                        id="signup-username"
                        type="text"
                        name="userName"
                        value={userRegister.userName}
                        onChange={handleChange}
                        autoComplete="username"
                        placeholder="Choose a username…"
                        required
                        className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-4 py-3.5 text-sm text-text placeholder:text-[var(--text3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                </div>

                <div>
                    <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-text">Email</label>
                    <input
                        id="signup-email"
                        type="email"
                        name="email"
                        value={userRegister.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-4 py-3.5 text-sm text-text placeholder:text-[var(--text3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                </div>

                <PasswordField
                    id="signup-password"
                    name="password"
                    label="Password"
                    value={userRegister.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Create a password…"
                    inputRef={passwordRef}
                    describedBy="password-requirements"
                    invalid={submitAttempted && !passwordIsValid}
                    error={submitAttempted && !passwordIsValid ? "Meet each requirement to continue." : undefined}
                >
                    <div id="password-requirements" className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                        <p className="text-xs font-medium text-text2">Your password must include:</p>
                        <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                            {passwordStatus.map((rule) => (
                                <li key={rule.id} className={`flex items-center gap-2 text-xs ${rule.passed ? "text-[var(--green)]" : "text-[var(--text3)]"}`}>
                                    <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px]" style={{ borderColor: rule.passed ? "var(--green)" : "var(--border2)" }}>
                                        {rule.passed ? "✓" : "·"}
                                    </span>
                                    <span>{rule.label}</span>
                                    <span className="sr-only">{rule.passed ? " — met" : " — required"}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="sr-only" aria-live="polite" aria-atomic="true">
                            {passwordIsValid ? "All password requirements are met." : `Password requirements remaining: ${missingRules.map((rule) => rule.label).join(", ")}.`}
                        </p>
                    </div>
                </PasswordField>

                <PasswordField
                    id="signup-confirm-password"
                    name="confirmPassword"
                    label="Confirm password"
                    value={userRegister.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => setConfirmTouched(true)}
                    autoComplete="new-password"
                    placeholder="Enter your password again…"
                    inputRef={confirmPasswordRef}
                    invalid={Boolean(confirmError)}
                    error={confirmError}
                />

                {error && <p className="rounded-lg border border-[var(--red)]/25 bg-[var(--red-dim)] px-3.5 py-3 text-sm text-[var(--red)]" role="alert">{error}</p>}

                {success && (
                    <div className="rounded-lg border border-[var(--green)]/25 bg-[var(--green-dim)] px-3.5 py-3 text-sm text-[var(--green)]" role="status" aria-live="polite">
                        <p>{success}</p>
                        <Link to="/login" className="mt-2 inline-block font-semibold text-text underline decoration-[var(--green)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary">
                            Go to login
                        </Link>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || Boolean(success)}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
                    style={{ backgroundImage: "linear-gradient(110deg, var(--primary), var(--accent))" }}
                >
                    {isSubmitting ? "Creating account…" : success ? "Account created" : "Create account"}
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
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-[var(--primary2)] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        Log in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

export default Signup;

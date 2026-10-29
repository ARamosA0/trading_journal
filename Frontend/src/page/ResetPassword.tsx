import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../component/auth/AuthLayout";
import PasswordField from "../component/auth/PasswordField";
import { getApiErrorMessage, resetPassword } from "../api/auth";

function ResetPassword() {
    const location = useLocation();
    const token = new URLSearchParams(location.hash.slice(1)).get("token")
        ?? new URLSearchParams(location.search).get("token")
        ?? "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            setError("Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords don’t match.");
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "This link is invalid or has expired. Request a new reset link."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Choose a new password" description="Use a strong password you haven’t used before.">
            {success ? (
                <div className="space-y-5" role="status" aria-live="polite">
                    <p className="rounded-xl border border-[var(--green)]/25 bg-[var(--green-dim)] px-4 py-4 text-sm leading-6 text-[var(--green)]">
                        Your password has been reset. You can now log in with your new password.
                    </p>
                    <Link to="/login" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" style={{ backgroundImage: "linear-gradient(110deg, var(--primary), var(--accent))" }}>
                        Go to login
                    </Link>
                </div>
            ) : !token ? (
                <div className="space-y-5">
                    <p className="rounded-xl border border-[var(--red)]/25 bg-[var(--red-dim)] px-4 py-4 text-sm leading-6 text-[var(--red)]" role="alert">
                        This password reset link is missing or invalid. Request a new one to continue.
                    </p>
                    <Link to="/forgot-password" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-text transition-colors hover:border-white/20 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        Request another link
                    </Link>
                </div>
            ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <PasswordField
                        id="reset-password"
                        name="password"
                        label="New password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Create a new password…"
                    />
                    <PasswordField
                        id="reset-confirm-password"
                        name="confirmPassword"
                        label="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Enter your new password again…"
                    />

                    {error && <p className="rounded-lg border border-[var(--red)]/25 bg-[var(--red-dim)] px-3.5 py-3 text-sm text-[var(--red)]" role="alert">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
                        style={{ backgroundImage: "linear-gradient(110deg, var(--primary), var(--accent))" }}
                    >
                        {isSubmitting ? "Updating password…" : "Reset password"}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
}

export default ResetPassword;

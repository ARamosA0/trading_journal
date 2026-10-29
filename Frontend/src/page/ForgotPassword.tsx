import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../component/auth/AuthLayout";
import { getApiErrorMessage, requestPasswordReset } from "../api/auth";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestAccepted, setRequestAccepted] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await requestPasswordReset(email);
            setRequestAccepted(true);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "We couldn’t process your request. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout title="Reset your password" description="Enter the email address connected to your account.">
            {requestAccepted ? (
                <div className="space-y-5" role="status" aria-live="polite">
                    <p className="rounded-xl border border-[var(--green)]/25 bg-[var(--green-dim)] px-4 py-4 text-sm leading-6 text-[var(--green)]">
                        If an account exists for that email, password reset instructions will be sent shortly.
                    </p>
                    <Link to="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-text transition-colors hover:border-white/20 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        Back to login
                    </Link>
                </div>
            ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-text">Email</label>
                        <input
                            id="forgot-email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            placeholder="you@example.com"
                            required
                            className="w-full rounded-xl border border-[var(--border2)] bg-[var(--bg)] px-4 py-3.5 text-sm text-text placeholder:text-[var(--text3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        />
                    </div>

                    {error && <p className="rounded-lg border border-[var(--red)]/25 bg-[var(--red-dim)] px-3.5 py-3 text-sm text-[var(--red)]" role="alert">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-bg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
                        style={{ backgroundImage: "linear-gradient(110deg, var(--primary), var(--accent))" }}
                    >
                        {isSubmitting ? "Sending…" : "Send reset instructions"}
                    </button>

                    <p className="text-center text-sm text-text2">
                        Remembered your password?{" "}
                        <Link to="/login" className="font-semibold text-[var(--primary2)] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            Log in
                        </Link>
                    </p>
                </form>
            )}
        </AuthLayout>
    );
}

export default ForgotPassword;

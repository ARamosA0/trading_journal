import { useState, type ChangeEventHandler, type FocusEventHandler, type ReactNode, type Ref } from "react";

type PasswordFieldProps = {
    id: string;
    name: string;
    label: string;
    value: string;
    autoComplete: "current-password" | "new-password";
    placeholder: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    inputRef?: Ref<HTMLInputElement>;
    describedBy?: string;
    error?: string;
    invalid?: boolean;
    children?: ReactNode;
};

function PasswordField({
    id,
    name,
    label,
    value,
    autoComplete,
    placeholder,
    onChange,
    onBlur,
    inputRef,
    describedBy,
    error,
    invalid = false,
    children,
}: PasswordFieldProps) {
    const [isVisible, setIsVisible] = useState(false);
    const errorId = `${id}-error`;
    const descriptionIds = [describedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-text">
                {label}
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={isVisible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    required
                    aria-invalid={invalid || undefined}
                    aria-describedby={descriptionIds}
                    className="rounded-xl border text-sm text-text placeholder:text-[var(--text3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    style={{
                        backgroundColor: "var(--bg)",
                        borderColor: invalid ? "var(--red)" : "var(--border2)",
                        padding: "0.875rem 3.5rem 0.875rem 1rem",
                    }}
                />
                <button
                    type="button"
                    onClick={() => setIsVisible((visible) => !visible)}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                    aria-pressed={isVisible}
                    className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text3)] transition-colors hover:bg-white/5 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                >
                    {isVisible ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.1 9.5 7-.4 1.1-1.2 2.4-2.4 3.6M6.2 6.2C4.2 7.5 3 9.5 2.5 12c1 2.9 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" />
                        </svg>
                    ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z" />
                            <circle cx="12" cy="12" r="2.5" />
                        </svg>
                    )}
                </button>
            </div>
            {children}
            {error && <p id={errorId} className="mt-2 text-sm text-[var(--red)]" role="alert">{error}</p>}
        </div>
    );
}

export default PasswordField;

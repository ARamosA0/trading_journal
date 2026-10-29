import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = {
    credential: string;
};

type GoogleIdentityApi = {
    initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode: "popup";
    }) => void;
    renderButton: (element: HTMLElement, options: {
        theme: "filled_black";
        size: "large";
        shape: "rectangular";
        text: "continue_with";
        width: number;
        logo_alignment: "left";
    }) => void;
};

declare global {
    interface Window {
        google?: {
            accounts: {
                id: GoogleIdentityApi;
            };
        };
    }
}

type GoogleSignInButtonProps = {
    clientId?: string;
    onCredential: (credential: string) => void;
};

const scriptId = "google-identity-services";

function GoogleSignInButton({ clientId, onCredential }: GoogleSignInButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const onCredentialRef = useRef(onCredential);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        onCredentialRef.current = onCredential;
    }, [onCredential]);

    useEffect(() => {
        if (!clientId || !buttonRef.current) {
            return;
        }

        let disposed = false;
        const button = buttonRef.current;
        let script: HTMLScriptElement | null = null;
        const renderGoogleButton = () => {
            if (disposed || !button || !window.google?.accounts.id) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                ux_mode: "popup",
                callback: ({ credential }) => onCredentialRef.current(credential),
            });
            button.replaceChildren();
            window.google.accounts.id.renderButton(button, {
                theme: "filled_black",
                size: "large",
                shape: "rectangular",
                text: "continue_with",
                width: Math.min(button.clientWidth || 360, 360),
                logo_alignment: "left",
            });
        };
        const handleLoadError = () => setLoadError(true);

        if (window.google?.accounts.id) {
            renderGoogleButton();
        } else {
            script = document.getElementById(scriptId) as HTMLScriptElement | null;
            if (!script) {
                script = document.createElement("script");
                script.id = scriptId;
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.defer = true;
            }
            script.addEventListener("load", renderGoogleButton);
            script.addEventListener("error", handleLoadError);
            if (!script.isConnected) {
                document.head.append(script);
            }
        }

        return () => {
            disposed = true;
            script?.removeEventListener("load", renderGoogleButton);
            script?.removeEventListener("error", handleLoadError);
        };
    }, [clientId]);

    if (!clientId) {
        return (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center text-sm text-text2" role="status">
                Google sign-in is not configured yet.
            </p>
        );
    }

    return (
        <div>
            <div ref={buttonRef} className="flex min-h-11 justify-center overflow-hidden rounded-xl" />
            {loadError && <p className="mt-2 text-center text-sm text-[var(--red)]" role="alert">Google sign-in could not load. Please try again later.</p>}
        </div>
    );
}

export default GoogleSignInButton;

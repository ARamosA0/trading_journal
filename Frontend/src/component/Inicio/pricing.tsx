import { PaypalIcon } from "../reusable/paypalIcon";
import { CoffeIcon } from "../reusable/coffeIcon";
import { CriptoIcon } from "../reusable/cryptoIcon";

const supportMethods = [
    {
        title: "PayPal",
        description: "A quick, familiar way to contribute to the project.",
        icon: <PaypalIcon />,
    },
    {
        title: "Buy Me a Coffee",
        description: "Support ongoing development with a one-time contribution.",
        icon: <CoffeIcon />,
    },
    {
        title: "Crypto",
        description: "Contribute using BTC, ETH, USDT, and other supported assets.",
        icon: <CriptoIcon />,
    },
];

function Pricing() {
    return (
        <section id="pricing" aria-labelledby="support-title" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Community supported</p>
                    <h2 id="support-title" className="mt-4 text-balance text-3xl font-semibold tracking-tight text-text sm:text-5xl">
                        Help keep <span translate="no">TradeVault</span> growing.
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-text2 sm:text-lg">
                        Your support helps us keep improving the tools traders use to learn from their decisions.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-14">
                    {supportMethods.map((method) => (
                        <article key={method.title} className="flex h-full flex-col items-center rounded-2xl border border-white/[0.08] bg-[var(--bg2)] p-6 text-center transition-colors hover:border-white/15 sm:p-7">
                            <div aria-hidden="true">
                                {method.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-text">{method.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-text2">{method.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Pricing;

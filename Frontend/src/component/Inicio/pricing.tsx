import { useState } from "react";
import Card from "../reusable/card";
import { PaypalIcon } from "../reusable/paypalIcon";
import { CoffeIcon } from "../reusable/coffeIcon";
import { CriptoIcon } from "../reusable/cryptoIcon";


function Pricing () {
    const [suport, setSuport] = useState([
        {
            title: "PayPal",
            description: "Fast and secure payment with your PayPal account",
            icon: <PaypalIcon />,
            btntext: "donate via PayPal",
            titleversion: 1
        },
        {
            title: "Buy Me a Coffee",
            description: "Support us with a coffee or more through BMC",
            icon: <CoffeIcon />,
            btntext: "Buy me a coffee",
            titleversion: 1
        },
        {
            title: "Crypto",
            description: "BTC, ETH, USDT and more supported",
            icon: <CriptoIcon />,
            btntext: "View Addresses",
            titleversion: 1
        },
    ])
    return (
        <>
            <section id="pricing" className="flex flex-col gap-4 items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8 mt-10">
                <div
                >
                    <span className="text-6xl text-text md:text-7xl font-black ">Love TradeVault? </span> 
                    <span className="text-6xl md:text-7xl font-black  text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient)" }}>Support us</span>
                </div>
                <div className="mt-5">
                    <p className="text-lg text-text2">Help us keep TradeVault free and improve it. Choose your preferred method to make a donation.</p>
                </div>
                <div className="w-full max-w-7xl mx-auto mt-5 flex flex-wrap gap-4 py-20 px-4 sm:px-6 lg:px-8 mt-10 justify-items-center">
                    { suport.map((item, index) => (
                        <Card key={index} title={item.title} description={item.description} iconSvg={item.icon} btnText={item.btntext} titleVersion={1} width={"md"} descriptionVersion={2} haveHover={false} high={100} />
                    ))}   
                 </div>
            </section>
        </>
    )
}
export default Pricing;
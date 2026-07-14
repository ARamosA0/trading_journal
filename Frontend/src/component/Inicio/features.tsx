import {useState} from 'react'
import Card from '../reusable/card'

import graphic from "../../assets/icons/hero.png"
import analitics from "../../assets/icons/analitics.png"
import calendario from "../../assets/icons/calendario.png"
import campana from "../../assets/icons/campana.png"
import micro from "../../assets/icons/micro.png"
import money from "../../assets/icons/money.png"

function Features () {

    const [features, setFeatures] = useState([
        {
            title: "Trade Journal",
            description: "Log every trade with detailed parameters, notes, screenshots, and emotional state tracking. Full history at your fingertips.",
            icon: graphic
        },
        {
            title: "Advanced Analytics",
            description: "Visualize your performance with charts and metrics. Filter by days, weeks, months. Track win rate, P&L, drawdown, and more.",
            icon: analitics 
        },
        {
            title: "Crypto Payments",
            description: "Pay for your subscription with cryptocurrency. Support for BTC, ETH, USDT and more. Private and seamless.",
            icon: money
        },
        {
            title: "Smart Alerts",
            description: "Set custom price alerts and get notified in real-time. Never miss an opportunity or a risk threshold again.",
            icon: campana
        },
        {
            title: "Position Calculator",
            description: "Calculate optimal position sizes based on your risk management rules. Works for forex, crypto, and stocks.",
            icon: calendario
        },
        {
            title: "Backtesting",
            description: "Create and backtest your strategies against historical data. Validate your edge before risking real capital.",
            icon: micro
        },
    ])

    const [items, setItems] = useState([
        {
            title: "Dashboard",
            img:""
        },
        {
            title: "Calendar View",
            img:""
        },
        {
            title: "Trade Detail",
            img:""
        },
        {
            title: "Tools",
            img:""
        },
    ])

    return (
        <>
            <div id="features">
            <section className="flex flex-col gap-4 items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8 mt-10">
                <div
                >
                    <span className="text-6xl text-text md:text-7xl font-black ">Everything you need to </span> 
                    <span className="text-6xl md:text-7xl font-black  text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient)" }}>level up</span>
                </div>
                <div className="mt-5">
                    <p className="text-lg text-text2">Comprehensive tools designed to help you track, analyze, and improve your trading performance.</p>
                </div>
            </section>
            <section className="w-full max-w-7xl mx-auto mt-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-20 px-4 sm:px-6 lg:px-8 mt-10 justify-items-center">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            img=""
                            titleVersion={1}
                            haveHover={true}
                        />
                    ))}
                </div>
            </section>
            <section className="flex flex-col gap-4 items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8 mt-10">
                <div
                >
                    <span className="text-6xl text-text md:text-7xl font-black ">See it in </span> 
                    <span className="text-6xl md:text-7xl font-black  text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient)" }}>action</span>
                </div>
            </section>
            <section className="w-full max-w-7xl mx-auto mt-5">
                <div className="flex flex-wrap gap-4 py-20 px-4 sm:px-6 lg:px-8 mt-10 justify-items-center">
                    {items.map((item, index) => (
                        <Card
                            key={index}
                            img={item.img}
                            title={item.title}
                            titleVersion={1}
                            width={"md"}
                            descriptionVersion={2}
                            haveHover={true}
                        />
                    ))}
                </div>
            </section>
            </div>
        </>
    )
}

export default Features;
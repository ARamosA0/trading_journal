
function About () {

    return (
        <>
            <div id="about" className="flex flex-col gap-4 items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8 mt-10">
                <h1
                    className="text-6xl md:text-7xl font-black leading-none tracking-tight text-text"
                >
                    Track every trade.
                </h1>

                <h1
                    className="text-6xl md:text-7xl font-black  text-transparent bg-clip-text"
                    style={{ backgroundImage: "var(--gradient)" }}
                >
                    Master your edge.
                </h1>
                <div className="mt-5">
                    <p className="text-lg text-text2">The trading journal built for serious traders. Log, analyze and improve your performance with powerful analytics, crypto payments, and smart alerts.</p>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <a
                        href="/signup"
                        className="inline-block font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg bg-primary text-bg"
                        style={{ background: 'var(--gradient)' }}
                    >
                        Start Free
                    </a>
                </div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center text-center py-20 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center py-20 px-4">
  <div
    className="w-full max-w-6xl rounded-[32px] border border-indigo-500/20 bg-bg3/90 backdrop-blur-xl px-12 py-16"
    style={{
      boxShadow:
        "0 0 40px rgba(59,130,246,.22),0 0 80px rgba(168,85,247,.14)",
    }}
  >
    <div className="flex flex-col lg:flex-row items-center justify-center gap-24">

      {/* IZQUIERDA */}
      <div className="flex flex-col items-center flex-1">

        <span className="text-xs text-text2">
          Portfolio Balance
        </span>

        <h2 className="text-5xl font-bold text-violet-500 mt-2">
          $48,352.80
        </h2>

        <span className="text-green-400 mt-2 text-sm">
          +12.4% this month
        </span>

        <div className="mt-8 w-[420px] h-[170px] rounded-2xl bg-black/40 overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            className="text-violet-500"
          >
            <defs>
              <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="rgba(212,168,67,.3)"
                />
                <stop
                  offset="100%"
                  stopColor="rgba(212,168,67,0)"
                />
              </linearGradient>
            </defs>

            <path
              d="M0,120 C40,110 80,90 120,85 C160,80 200,60 240,50 C280,40 320,55 360,30 L400,20 L400,160 L0,160Z"
              fill="url(#grd)"
            />

            <path
              d="M0,120 C40,110 80,90 120,85 C160,80 200,60 240,50 C280,40 320,55 360,30 L400,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* DERECHA */}
      <div className="w-[220px]">

        <div className="text-xs text-text2 text-center">
          Win Rate
        </div>

        <div className="flex items-center justify-center gap-4 mt-3">

          <div className="w-20 h-20 rounded-full bg-gray-700">
            <div className="pie-mock" style={{ width: 80, height: 80 }}></div>
          </div>

          <div>
            <div className="text-3xl font-bold text-text">
              68%
            </div>

            <div className="text-xs text-text2">
              42 wins / 20 losses
            </div>
          </div>

        </div>

        <div className="text-xs text-text2 text-center mt-8">
          Recent Trades
        </div>

        <div className="mt-4 space-y-2 text-sm">

          <div className="flex justify-between">
            <span>EUR/USD</span>
            <span className="text-green-400">+$240</span>
          </div>

          <div className="flex justify-between">
            <span>BTC/USDT</span>
            <span className="text-red-400">-$85</span>
          </div>

          <div className="flex justify-between">
            <span>GBP/JPY</span>
            <span className="text-green-400">+$180</span>
          </div>

        </div>

      </div>

    </div>
  </div>
</div>
            </div>
        </>
    )
}     
export default About;

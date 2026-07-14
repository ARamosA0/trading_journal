import  {Link} from "react-router-dom";
function Signup() {

    return (
        <>  
            <section className="min-h-screen flex items-center justify-center bg-[var(--bg2)] px-4">
                <div>
                    <Link
                        to="/"
                        className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 text-[var(--text2)] hover:text-[var(--primary)] transition-colors bg-[var(--bg4)] px-3 py-2 rounded-md border border-[var(--border)] shadow-sm"
                    >
                        {/* <ArrowLeft size={20} /> */}
                        <span>Back</span>
                    </Link>
                </div>
                <div className="w-full max-w-md bg-[var(--bg4)] rounded-2xl shadow-xl p-8 border border-[var(--border)]">
                    {/* Header */}
                    <div className="text-center mb-8">
                    <h1
                        className="text-xl md:text-3xl font-black text-transparent bg-clip-text"
                        style={{ backgroundImage: "var(--gradient)" }}
                    >
                        KyroTrade
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Create your account and start tracking your trades.
                    </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                        </label>
                        <input
                        type="text"
                        placeholder="Enter your username"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                        </label>
                        <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                        </label>
                        <input
                        type="password"
                        placeholder="Create a password"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                        </label>
                        <input
                        type="password"
                        placeholder="Confirm your password"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg text-white"
                        style={{ background: "var(--gradient)" }}
                    >
                        Sign Up
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-sm text-gray-500">
                        or continue with
                        </span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <button
                        type="button"
                        className="w-full border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition"
                    >
                        Continue with Google
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                        to="/login"
                        className="text-indigo-600 font-medium hover:underline"
                        >
                        Log In
                        </Link>
                    </p>
                    </form>
                </div>
            </section>
        </>
    )
}

export default Signup;

import Navbar from "../component/Inicio/navbar";
import Features from "../component/Inicio/features";
import About from "../component/Inicio/about";
import Pricing from "../component/Inicio/pricing";
import Footer from "../component/Inicio/footer";

function Landing () {

    return (
        <div className="min-h-screen overflow-x-clip bg-bg text-text">
            <a
                href="#main-content"
                className="sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:not-sr-only focus-visible:rounded-lg focus-visible:bg-primary focus-visible:px-4 focus-visible:py-3 focus-visible:font-semibold focus-visible:text-bg"
            >
                Skip to content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1}>
                <About />
                <Features />
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}

export default Landing;

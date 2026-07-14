
import Navbar from "../component/Inicio/navbar";
import Features from "../component/Inicio/features";
import About from "../component/Inicio/about";
import Pricing from "../component/Inicio/pricing";
import Footer from "../component/Inicio/footer";

function Landing () {

    return (
        <>
            <Navbar />
            <About />
            <Features />
            <Pricing />
            <Footer />
        </>
    )
}

export default Landing;
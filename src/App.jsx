import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Activities from "./components/Activities";
import Essence from "./components/Essence";
import Gallery from "./components/Gallery";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsappButton from "./components/WhatsappButton";
import Testimonials from "./components/Testimonials";

import { useEffect } from "react";
import AOS from "aos";

function App() {

  useEffect(() => {
   AOS.init({
    duration: 750,
    once: true,
    easing: "ease-out-cubic",
    offset: 80,
    delay: 0,
  });
}, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Essence />
      <Features />
      <Activities />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsappButton />
    </>
  );
}

export default App;
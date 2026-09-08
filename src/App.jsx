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
import Consultorios from "./components/Consultorios";

import { useEffect, useState } from "react";
import LoginProfesional from "./components/LoginProfesional";
import { supabase } from "./lib/supabase";
import PanelProfesional from "./components/PanelProfesional";
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

const [usuarioProfesional, setUsuarioProfesional] = useState(null);

useEffect(() => {
  const cargarSesion = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUsuarioProfesional(session?.user ?? null);
  };

  cargarSesion();
}, []);

const esPanelProfesional =
  window.location.pathname === "/profesionales";

if (esPanelProfesional) {
  if (!usuarioProfesional) {
    return (
      <LoginProfesional
        onLogin={(user) => setUsuarioProfesional(user)}
      />
    );
  }

    return (
      <PanelProfesional
        usuario={usuarioProfesional}
        onLogout={() => setUsuarioProfesional(null)}
      />
    );
}

  return (
    <>
      <Navbar />
      <Hero />
      <Essence />
      <Features />
      <Activities />
      <Consultorios />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsappButton />
    </>
  );
}

export default App;
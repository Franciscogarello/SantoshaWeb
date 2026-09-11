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
import PanelProfesional from "./components/PanelProfesional";

import LoginAdmin from "./components/LoginAdmin";
import PanelAdmin from "./components/PanelAdmin";

import { supabase } from "./lib/supabase";

import AOS from "aos";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 750,
      once: true,
      easing: "ease-out-cubic",
      offset: 80,
      delay: 0,
    });
  }, []);

  useEffect(() => {
    const cargarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUsuario(session?.user ?? null);
      setCargandoSesion(false);
    };

    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const ruta = window.location.pathname;

  const esPanelProfesional = ruta === "/profesionales";
  const esPanelAdmin = ruta === "/admin";

  if (esPanelProfesional || esPanelAdmin) {
    if (cargandoSesion) {
      return (
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <p className="text-gray-500">
            Cargando...
          </p>
        </div>
      );
    }
  }

  if (esPanelProfesional) {
    if (!usuario) {
      return (
        <LoginProfesional
          onLogin={(user) => setUsuario(user)}
        />
      );
    }

    return (
      <PanelProfesional
        usuario={usuario}
        onLogout={() => setUsuario(null)}
      />
    );
  }

  if (esPanelAdmin) {
    if (!usuario) {
      return (
        <LoginAdmin
          onLogin={(user) => setUsuario(user)}
        />
      );
    }

    return (
      <PanelAdmin
        usuario={usuario}
        onLogout={() => setUsuario(null)}
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
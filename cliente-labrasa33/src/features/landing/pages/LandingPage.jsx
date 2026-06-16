import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { getRestaurantsPublic } from '../../../shared/api/client.js';
import imgLogo from '../../../assets/img/sarten33.png';

const ORANGE = '#E17522';

const FEATURES = [
  { Icon: CalendarIcon, title: 'Reserva tu mesa', desc: 'Agenda en los mejores restaurantes de la red La 33.' },
  { Icon: ClipboardDocumentListIcon, title: 'Explora menús', desc: 'Descubre platos, precios y categorías antes de pedir.' },
  { Icon: BuildingStorefrontIcon, title: 'Gestiona tu restaurante', desc: 'Herramientas para gerentes: mesas, menú, pedidos y reportes.' },
];

const formatTime = (t) => (t ? String(t).slice(0, 5) : null);

export const LandingPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRest, setLoadingRest] = useState(true);

  useEffect(() => {
    getRestaurantsPublic()
      .then((res) => setRestaurants(res.data ?? res ?? []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoadingRest(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0D', color: '#F2F2F2' }}>
      {/* HERO */}
      <section
        className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in"
        style={{
          backgroundImage: `linear-gradient(rgba(13,13,13,0.88), rgba(13,13,13,0.95)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img src={imgLogo} alt="La 33" className="h-24 w-24 object-contain mb-6 opacity-90" />
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">La 33</h1>
        <p className="text-lg md:text-xl max-w-xl mb-10" style={{ color: '#A6A6A6' }}>
          La plataforma definitiva para gestionar y descubrir restaurantes
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl font-semibold text-white transition hover:opacity-90 text-center"
            style={{ background: ORANGE }}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-xl font-semibold border-2 border-white text-white transition hover:bg-white/10 text-center"
          >
            Registrarse
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">¿Por qué La 33?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border p-6 text-center"
              style={{ background: '#1A1A1A', borderColor: '#2a2a2a' }}
            >
              <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(225,117,34,0.12)' }}>
                <Icon className="h-6 w-6" style={{ color: ORANGE }} />
              </div>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-sm" style={{ color: '#A6A6A6' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t" style={{ borderColor: '#2a2a2a' }}>
        <h2 className="text-2xl font-bold text-center mb-10">Restaurantes destacados</h2>
        {loadingRest ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse bg-[#2a2a2a]" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <p className="text-center" style={{ color: '#A6A6A6' }}>No hay restaurantes registrados aún</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.filter((r) => r.is_active !== false).slice(0, 9).map((r) => (
              <div key={r.id} className="rounded-2xl border overflow-hidden" style={{ background: '#1A1A1A', borderColor: '#333' }}>
                <div className="h-36 bg-[#2a2a2a]">
                  {r.logo_url && <img src={r.logo_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">{r.name}</h3>
                    {r.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(225,117,34,0.15)', color: ORANGE }}>
                        {r.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-2 flex items-start gap-1" style={{ color: '#A6A6A6' }}>
                    <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {r.address}
                  </p>
                  {formatTime(r.opening_time) && formatTime(r.closing_time) && (
                    <p className="text-xs mt-1" style={{ color: '#666' }}>
                      {formatTime(r.opening_time)} - {formatTime(r.closing_time)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 text-center text-sm" style={{ borderColor: '#2a2a2a', color: '#A6A6A6' }}>
        <p className="font-semibold text-[#F2F2F2]">La 33 — Brasa-33</p>
        <p className="mt-1">Fundación Kinal · {new Date().getFullYear()}</p>
      </footer>

    </div>
  );
};

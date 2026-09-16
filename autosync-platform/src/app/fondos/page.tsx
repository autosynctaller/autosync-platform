'use client'
import { Car } from 'lucide-react'

export default function FondosPage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ============== OPCIÓN A: MESH GRADIENT ANIMADO ============== */}
      <section className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(at 20% 30%, hsla(220, 90%, 55%, 0.8) 0px, transparent 50%),
              radial-gradient(at 80% 20%, hsla(280, 90%, 60%, 0.7) 0px, transparent 50%),
              radial-gradient(at 30% 80%, hsla(190, 90%, 55%, 0.7) 0px, transparent 50%),
              radial-gradient(at 90% 90%, hsla(340, 90%, 60%, 0.6) 0px, transparent 50%)
            `,
            backgroundSize: '200% 200%',
            animation: 'meshGradient 12s ease infinite',
          }}
        />
        <style>{`
          @keyframes meshGradient {
            0%, 100% { background-position: 0% 50%, 100% 50%, 50% 100%, 100% 100% }
            25% { background-position: 100% 50%, 0% 50%, 100% 0%, 50% 50% }
            50% { background-position: 50% 100%, 50% 0%, 0% 50%, 0% 100% }
            75% { background-position: 0% 0%, 100% 100%, 50% 50%, 50% 0% }
          }
        `}</style>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">OPCIÓN A</span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">Mesh Gradient Animado</span>
          </div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 backdrop-blur-md">
            <Car className="h-6 w-6" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">El historial digital de tu vehículo</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">Consultá todos los trabajos realizados en tu auto, gestiona VTV y GNC, y conectá con talleres de confianza.</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-black">Crear cuenta gratis</button>
            <button className="rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white">Buscar vehículo</button>
          </div>
        </div>
      </section>

      {/* ============== OPCIÓN B: PARTÍCULAS / NETWORK ============== */}
      <section className="relative h-screen overflow-hidden bg-zinc-950">
        <canvas id="particles-canvas" className="absolute inset-0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const canvas = document.getElementById('particles-canvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                let w, h, particles;
                function resize() {
                  w = canvas.width = canvas.offsetWidth;
                  h = canvas.height = canvas.offsetHeight;
                  particles = [];
                  for (let i = 0; i < 60; i++) {
                    particles.push({
                      x: Math.random() * w,
                      y: Math.random() * h,
                      vx: (Math.random() - 0.5) * 0.4,
                      vy: (Math.random() - 0.5) * 0.4,
                      r: Math.random() * 2 + 1
                    });
                  }
                }
                resize();
                window.addEventListener('resize', resize);
                function draw() {
                  ctx.clearRect(0, 0, w, h);
                  for (let i = 0; i < particles.length; i++) {
                    const p1 = particles[i];
                    for (let j = i+1; j < particles.length; j++) {
                      const p2 = particles[j];
                      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                      if (d < 130) {
                        ctx.strokeStyle = 'rgba(96, 165, 250, ' + (1 - d/130) * 0.4 + ')';
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                      }
                    }
                  }
                  for (const p of particles) {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                    ctx.fillStyle = 'rgba(147, 197, 253, 0.9)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                  }
                  requestAnimationFrame(draw);
                }
                draw();
              })();
            `
          }}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">OPCIÓN B</span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">Partículas / Network</span>
          </div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 backdrop-blur-md ring-1 ring-blue-400/40">
            <Car className="h-6 w-6 text-blue-300" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">El historial digital de tu vehículo</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">Consultá todos los trabajos realizados en tu auto, gestiona VTV y GNC, y conectá con talleres de confianza.</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-lg bg-blue-500 px-6 py-3 text-base font-semibold text-white hover:bg-blue-600">Crear cuenta gratis</button>
            <button className="rounded-lg border border-blue-400/40 px-6 py-3 text-base font-semibold text-blue-100">Buscar vehículo</button>
          </div>
        </div>
      </section>

      {/* ============== OPCIÓN C: AURORA SUAVE ============== */}
      <section className="relative h-screen overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <div
            className="absolute -top-1/4 left-1/4 h-2/3 w-2/3 rounded-full opacity-60 blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsla(168, 80%, 55%, 0.7), transparent 70%)',
              animation: 'aurora1 14s ease-in-out infinite alternate',
            }}
          />
          <div
            className="absolute top-1/3 -right-1/4 h-2/3 w-2/3 rounded-full opacity-50 blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsla(280, 80%, 60%, 0.7), transparent 70%)',
              animation: 'aurora2 16s ease-in-out infinite alternate',
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-1/2 w-1/2 rounded-full opacity-40 blur-3xl"
            style={{
              background: 'radial-gradient(circle, hsla(33, 100%, 60%, 0.6), transparent 70%)',
              animation: 'aurora3 18s ease-in-out infinite alternate',
            }}
          />
        </div>
        <style>{`
          @keyframes aurora1 {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(80px, 60px) scale(1.2); }
          }
          @keyframes aurora2 {
            0% { transform: translate(0, 0) scale(1.1); }
            100% { transform: translate(-60px, 80px) scale(0.9); }
          }
          @keyframes aurora3 {
            0% { transform: translate(0, 0) scale(0.9); }
            100% { transform: translate(40px, -50px) scale(1.3); }
          }
        `}</style>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white/80">
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">OPCIÓN C</span>
            <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">Aurora Suave</span>
          </div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 backdrop-blur-md">
            <Car className="h-6 w-6" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">El historial digital de tu vehículo</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">Consultá todos los trabajos realizados en tu auto, gestiona VTV y GNC, y conectá con talleres de confianza.</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-black">Crear cuenta gratis</button>
            <button className="rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white">Buscar vehículo</button>
          </div>
        </div>
      </section>

    </div>
  )
}

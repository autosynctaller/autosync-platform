import { Header } from '@/components/site/Header'
import { Hero } from '@/components/site/Hero'
import { ServiciosSection } from '@/components/site/ServiciosSection'
import { SobreNosotros } from '@/components/site/SobreNosotros'
import { RegistrarVehiculo } from '@/components/site/RegistrarVehiculo'
import { ConsultarHistorial } from '@/components/site/ConsultarHistorial'
import { Contacto } from '@/components/site/Contacto'
import { Footer } from '@/components/site/Footer'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <ServiciosSection />
        <SobreNosotros />
        <RegistrarVehiculo />
        <ConsultarHistorial />
        <Contacto />
      </main>
      <Footer />
    </div>
  )
}

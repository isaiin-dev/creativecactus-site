import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRegister from './pages/AdminRegister';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminServices from './pages/AdminServices';
import AdminContent from './pages/AdminContent';
import Services from './pages/Services';
import Contact from './pages/Contact';
import AdminTeam from './pages/AdminTeam';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Brush, 
  Code, 
  LineChart, 
  MessageSquare, 
  Rocket, 
  Zap,
  Star,
  Users,
  Video,
  Megaphone,
  CheckCircle2
} from 'lucide-react';

const useAdminShortcut = () => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.href = '/admin';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  useAdminShortcut();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRoles={['viewer', 'editor', 'admin', 'super_admin']}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/services" 
            element={
              <ProtectedRoute requiredRoles={['editor', 'admin', 'super_admin']}>
                <AdminLayout>
                  <AdminContent defaultSection="services" />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/content" 
            element={
              <ProtectedRoute requiredRoles={['editor', 'admin', 'super_admin']}>
                <AdminLayout>
                  <AdminContent />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/team" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminTeam />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/unauthorized" 
            element={
              <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {t('admin.unauthorized.title')}
                  </h1>
                  <p className="text-gray-400">
                    {t('admin.unauthorized.message')}
                  </p>
                </div>
              </div>
            }
          />
          
          {/* Home Route */}
          <Route path="/" element={
            <div>
              <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#96C881]/20 via-[#1a1a1a] to-[#E4656E]/20">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                    {t('hero.title')}
                    <span className="text-[#E4656E]"> {t('hero.creative')}</span>
                    <span className="text-[#96C881]"> {t('hero.solutions')}</span>
                  </h1>
                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    {t('hero.subtitle')}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a 
                      href="/contact" 
                      className="inline-flex items-center px-8 py-3 rounded-full bg-[#96C881] text-white hover:bg-[#86b873] transition-colors"
                    >
                      {t('hero.getStarted')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                    <a 
                      href="/services" 
                      className="inline-flex items-center px-8 py-3 rounded-full border-2 border-[#E4656E] text-[#E4656E] hover:bg-[#E4656E] hover:text-white transition-colors"
                    >
                      {t('hero.ourServices')}
                    </a>
                  </div>
                  </div>
                </div>
              </section>

              {/* Services Section */}
              <section className="py-20 px-4 bg-[#1a1a1a]">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <span className="text-[#96C881] text-sm font-medium mb-2 block">NUESTROS SERVICIOS</span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                    Soluciones que <span className="text-[#96C881]">Impulsan</span> tu Crecimiento
                  </h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Más de 200 empresas ya han transformado su presencia digital con nuestras soluciones.
                    Descubre cómo podemos ayudarte a alcanzar tus objetivos.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                  {/* Success Stats */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#96C881]/10 backdrop-blur-sm border border-[#96C881]/20 rounded-full py-2 px-6 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#96C881]" />
                      <span className="text-white">98% Satisfacción</span>
                    </div>
                    <div className="h-4 w-px bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#96C881]" />
                      <span className="text-white">200+ Clientes</span>
                    </div>
                  </div>

                  {[
                    {
                      icon: <MessageSquare className="h-8 w-8 text-[#96C881]" />,
                      title: "Social Media",
                      description: "Estrategias que conectan con tu audiencia y generan resultados medibles. Nuestros clientes han visto un aumento promedio del 300% en engagement.",
                      stats: "300% más engagement"
                    },
                    {
                      icon: <Brush className="h-8 w-8 text-[#96C881]" />,
                      title: "Diseño Gráfico",
                      description: "Diseños que capturan la esencia de tu marca y la hacen memorable. Más de 500 marcas han transformado su imagen con nosotros.",
                      stats: "500+ marcas diseñadas"
                    },
                    {
                      icon: <Code className="h-8 w-8 text-[#96C881]" />,
                      title: "Desarrollo Web",
                      description: "Sitios web que convierten visitantes en clientes. Nuestras soluciones han ayudado a empresas a duplicar sus ventas online.",
                      stats: "2x ventas online"
                    },
                    {
                      icon: <Megaphone className="h-8 w-8 text-[#96C881]" />,
                      title: "Campañas",
                      description: "Campañas publicitarias que maximizan tu ROI. Nuestros clientes logran un retorno promedio de 10x su inversión.",
                      stats: "10x ROI promedio"
                    },
                    {
                      icon: <Video className="h-8 w-8 text-[#96C881]" />,
                      title: "Videomarketing",
                      description: "Contenido audiovisual que cautiva y convierte. Más de 1 millón de visualizaciones generadas para nuestros clientes.",
                      stats: "1M+ visualizaciones"
                    }
                  ].map((service, index) => (
                    <div 
                      key={index}
                      className="group p-6 rounded-2xl bg-[#242424] border border-gray-800 hover:border-[#96C881] transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="mb-4 transform group-hover:scale-110 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#96C881] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#96C881] text-sm font-medium">{service.stats}</span>
                        <a 
                          href={`/services#${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group/link"
                        >
                          Saber más
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CTA */}
                <div className="mt-12 text-center">
                  <a 
                    href="/services" 
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#96C881] text-white rounded-full hover:bg-[#86b873] transition-colors group"
                  >
                    Explorar Todos los Servicios
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
              </section>

              {/* About Section */}
              <section className="py-20 px-4 bg-[#242424] text-white">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-4xl font-bold mb-6">
                      {t('about.title')}
                      <span className="text-[#96C881]"> {t('about.digitalGrowth')}</span>
                    </h2>
                    <p className="text-gray-400 mb-8">
                      {t('about.description')}
                    </p>
                    <ul className="space-y-4">
                      {t('about.features', { returnObjects: true }).map((item, index) => (
                        <li key={index} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-[#96C881] mr-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <a 
                      href="/about"
                      className="inline-flex items-center mt-8 px-8 py-3 rounded-full bg-[#E4656E] text-white hover:bg-[#96C881] hover:text-white transition-colors"
                    >
                      {t('about.learnMore')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </div>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Team meeting"
                      className="rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#121212]/40 to-transparent rounded-2xl" />
                  </div>
                </div>
              </div>
              </section>
            </div>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
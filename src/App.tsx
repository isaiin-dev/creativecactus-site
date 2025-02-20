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
import { useTranslation } from 'react-i18next';
import { ArrowRight, Brush, Code, LineChart, MessageSquare, Rocket, Zap } from 'lucide-react';

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
                  <h2 className="text-4xl font-bold mb-4 text-white">{t('services.title')}</h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    {t('services.subtitle')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Brush className="h-8 w-8 text-[#96C881]" />,
                      title: t('services.items.brandDesign.title'),
                      description: t('services.items.brandDesign.description')
                    },
                    {
                      icon: <Code className="h-8 w-8 text-[#96C881]" />,
                      title: t('services.items.webDev.title'),
                      description: t('services.items.webDev.description')
                    },
                    {
                      icon: <LineChart className="h-8 w-8 text-[#96C881]" />,
                      title: t('services.items.digitalMarketing.title'),
                      description: t('services.items.digitalMarketing.description')
                    },
                    {
                      icon: <MessageSquare className="h-8 w-8 text-[#96C881]" />,
                      title: t('services.items.socialMedia.title'),
                      description: t('services.items.socialMedia.description')
                    },
                    {
                      icon: <Zap className="h-8 w-8 text-[#96C881]" />,
                      title: t('services.items.content.title'),
                      description: t('services.items.content.description')
                    },
                    {
                      icon: <Rocket className="h-8 w-8 text-[#96C881]" />,
                      title: t('services.items.seo.title'),
                      description: t('services.items.seo.description')
                    }
                  ].map((service, index) => (
                    <div 
                      key={index}
                      className="p-6 rounded-2xl bg-[#242424] border border-gray-800 hover:border-[#96C881] transition-colors"
                    >
                      <div className="mb-4">{service.icon}</div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{service.title}</h3>
                      <p className="text-gray-300">{service.description}</p>
                    </div>
                  ))}
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
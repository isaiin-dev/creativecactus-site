import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Brush, 
  Code, 
  Megaphone, 
  Video,
  ArrowRight,
  Play,
  Sparkles,
  CheckCircle,
  Users,
  BarChart,
  Clock,
  Star
} from 'lucide-react';
import Header from '../components/layout/Header';

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  link: string;
  stats?: {
    value: string;
    label: string;
  }[];
}

export default function Services() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const categories: ServiceCategory[] = [
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Impulsa tu presencia digital con estrategias personalizadas para cada red social. Conecta con tu audiencia y construye una comunidad sólida.',
      icon: <MessageSquare className="h-8 w-8" />,
      benefits: [
        'Gestión integral de redes sociales',
        'Creación de contenido original',
        'Análisis de métricas y resultados',
        'Estrategias de engagement'
      ],
      link: '/services/social-media',
      stats: [
        { value: '300%', label: 'Aumento en engagement' },
        { value: '10K+', label: 'Posts creados' },
        { value: '98%', label: 'Clientes satisfechos' }
      ]
    },
    {
      id: 'design',
      title: 'Diseño Gráfico',
      description: 'Diseños únicos que capturan la esencia de tu marca. Desde logotipos hasta identidad corporativa completa.',
      icon: <Brush className="h-8 w-8" />,
      benefits: [
        'Diseño de marca e identidad',
        'Material publicitario',
        'Diseño para redes sociales',
        'Ilustraciones personalizadas'
      ],
      link: '/services/design',
      stats: [
        { value: '500+', label: 'Marcas diseñadas' },
        { value: '100%', label: 'Diseños originales' },
        { value: '24/7', label: 'Soporte creativo' }
      ]
    },
    {
      id: 'development',
      title: 'Desarrollo Web',
      description: 'Sitios web modernos y funcionales que destacan tu presencia online. Soluciones a medida para cada necesidad.',
      icon: <Code className="h-8 w-8" />,
      benefits: [
        'Desarrollo web responsive',
        'E-commerce personalizado',
        'Optimización SEO',
        'Mantenimiento continuo'
      ],
      link: '/services/web-development',
      stats: [
        { value: '99%', label: 'Uptime garantizado' },
        { value: '200+', label: 'Sitios entregados' },
        { value: '3s', label: 'Tiempo de carga' }
      ]
    },
    {
      id: 'campaigns',
      title: 'Campañas',
      description: 'Campañas publicitarias que generan resultados. Estrategias multicanal para maximizar tu alcance.',
      icon: <Megaphone className="h-8 w-8" />,
      benefits: [
        'Estrategias personalizadas',
        'Gestión de presupuesto',
        'Optimización continua',
        'Reportes detallados'
      ],
      link: '/services/campaigns',
      stats: [
        { value: '10x', label: 'ROI promedio' },
        { value: '1M+', label: 'Alcance mensual' },
        { value: '50%', label: 'Menos CPA' }
      ]
    },
    {
      id: 'video',
      title: 'Videomarketing',
      description: 'Contenido audiovisual que cautiva y convierte. Desde videos corporativos hasta contenido para redes.',
      icon: <Video className="h-8 w-8" />,
      benefits: [
        'Videos corporativos',
        'Contenido para redes',
        'Motion graphics',
        'Edición profesional'
      ],
      link: '/services/video',
      stats: [
        { value: '4K', label: 'Calidad máxima' },
        { value: '300+', label: 'Videos producidos' },
        { value: '48h', label: 'Entrega express' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#96C881]/20 via-[#1a1a1a] to-[#E4656E]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Servicios que 
            <span className="text-[#96C881]"> Transforman</span>
            <span className="text-[#E4656E]"> Ideas</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Soluciones digitales integrales diseñadas para impulsar tu negocio al siguiente nivel.
            Creatividad, estrategia y resultados medibles.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#categories" 
              className="inline-flex items-center px-8 py-3 rounded-full bg-[#96C881] text-white hover:bg-[#86b873] transition-colors group"
            >
              Explorar Servicios
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button 
              onClick={() => {
                const video = document.getElementById('demo-video') as HTMLVideoElement;
                if (video) video.play();
              }}
              className="inline-flex items-center px-8 py-3 rounded-full border-2 border-[#E4656E] text-[#E4656E] hover:bg-[#E4656E] hover:text-white transition-colors group"
            >
              Ver Demo
              <Play className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Users className="h-8 w-8 text-[#96C881]" />, value: '200+', label: 'Clientes Activos' },
            { icon: <Star className="h-8 w-8 text-[#96C881]" />, value: '98%', label: 'Satisfacción' },
            { icon: <BarChart className="h-8 w-8 text-[#96C881]" />, value: '300%', label: 'ROI Promedio' },
            { icon: <Clock className="h-8 w-8 text-[#96C881]" />, value: '24/7', label: 'Soporte' }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-[#242424] rounded-2xl border border-gray-800">
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 px-4 bg-[#121212]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nuestros Servicios</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Soluciones integrales adaptadas a tus necesidades. Cada servicio está diseñado para 
              maximizar el impacto de tu presencia digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800 hover:border-[#96C881] transition-colors overflow-hidden"
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#96C881]/0 via-transparent to-[#E4656E]/0 group-hover:from-[#96C881]/10 group-hover:to-[#E4656E]/10 transition-colors duration-500" />

                {/* Icon with Animation */}
                <div className="relative">
                  <div className="p-3 bg-[#242424] rounded-xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <div className="text-[#96C881] group-hover:animate-pulse">
                      {category.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-[#96C881] transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    {category.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-3 mb-8">
                    {category.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-5 w-5 text-[#96C881]" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Stats Grid */}
                  {category.stats && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {category.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xl font-bold text-[#96C881]">{stat.value}</div>
                          <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <a
                    href={category.link}
                    className="inline-flex items-center gap-2 text-[#96C881] hover:text-white transition-colors group/link"
                  >
                    Conoce más
                    <ArrowRight className="h-5 w-5 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Hover Effects */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-6 w-6 text-[#96C881] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#96C881]/20 via-[#1a1a1a] to-[#E4656E]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para Transformar tu Negocio?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Agenda una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos digitales.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-3 rounded-full bg-[#96C881] text-white hover:bg-[#86b873] transition-colors"
            >
              Contactar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="/portfolio"
              className="inline-flex items-center px-8 py-3 rounded-full border-2 border-[#E4656E] text-[#E4656E] hover:bg-[#E4656E] hover:text-white transition-colors"
            >
              Ver Portfolio
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
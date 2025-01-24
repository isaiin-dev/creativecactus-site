import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import { Award, Heart, LineChart, Users, Building, Target, Star } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { number: '10+', label: t('about.stats.yearsExperience') },
    { number: '200+', label: t('about.stats.happyClients') },
    { number: '500+', label: t('about.stats.projectsDelivered') },
    { number: '98%', label: t('about.stats.clientSatisfaction') },
  ];

  const team = [
    {
      name: 'María González',
      role: t('about.team.roles.ceo'),
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      quote: t('about.team.quotes.ceo'),
    },
    {
      name: 'Carlos Ruiz',
      role: t('about.team.roles.creative'),
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      quote: t('about.team.quotes.creative'),
    },
    {
      name: 'Ana Martínez',
      role: t('about.team.roles.tech'),
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      quote: t('about.team.quotes.tech'),
    },
  ];

  const testimonials = [
    {
      text: t('about.testimonials.first.text'),
      author: t('about.testimonials.first.author'),
      company: t('about.testimonials.first.company'),
    },
    {
      text: t('about.testimonials.second.text'),
      author: t('about.testimonials.second.author'),
      company: t('about.testimonials.second.company'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#121212]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#96C881]/20 via-[#1a1a1a] to-[#E4656E]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {t('about.hero.title')}
            <span className="text-[#96C881]"> {t('about.hero.highlight')}</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">{t('about.story.title')}</h2>
              <p className="text-gray-300 mb-6">{t('about.story.content')}</p>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-[#242424] p-6 rounded-lg">
                    <div className="text-3xl font-bold text-[#96C881]">{stat.number}</div>
                    <div className="text-gray-400 mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Team collaboration"
                className="rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#121212]/40 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 px-4 bg-[#242424]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">{t('about.mission.title')}</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">{t('about.mission.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="h-8 w-8 text-[#96C881]" />,
                title: t('about.mission.vision.title'),
                content: t('about.mission.vision.content'),
              },
              {
                icon: <Building className="h-8 w-8 text-[#96C881]" />,
                title: t('about.mission.mission.title'),
                content: t('about.mission.mission.content'),
              },
              {
                icon: <Heart className="h-8 w-8 text-[#96C881]" />,
                title: t('about.mission.values.title'),
                content: t('about.mission.values.content'),
              },
            ].map((item, index) => (
              <div key={index} className="bg-[#1a1a1a] p-8 rounded-2xl">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">{t('about.team.title')}</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">{t('about.team.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-[#242424] rounded-2xl overflow-hidden group">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#242424] to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                  <p className="text-[#96C881] mb-4">{member.role}</p>
                  <p className="text-gray-300">{member.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 px-4 bg-[#242424]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">{t('about.awards.title')}</h2>
              <p className="text-gray-300 mb-8">{t('about.awards.subtitle')}</p>
              <div className="space-y-6">
                {[
                  {
                    icon: <Award className="h-6 w-6 text-[#96C881]" />,
                    title: t('about.awards.items.first.title'),
                    year: '2023',
                  },
                  {
                    icon: <Star className="h-6 w-6 text-[#96C881]" />,
                    title: t('about.awards.items.second.title'),
                    year: '2022',
                  },
                  {
                    icon: <Users className="h-6 w-6 text-[#96C881]" />,
                    title: t('about.awards.items.third.title'),
                    year: '2021',
                  },
                ].map((award, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-[#1a1a1a] rounded-lg">
                      {award.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{award.title}</h3>
                      <p className="text-gray-400">{award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              ].map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Office and team"
                  className="rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">{t('about.testimonials.title')}</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">{t('about.testimonials.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#242424] p-8 rounded-2xl">
                <div className="text-[#96C881] mb-6">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-6">{testimonial.text}</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#96C881]/20 via-[#1a1a1a] to-[#E4656E]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t('about.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{t('about.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-3 rounded-full bg-[#96C881] text-white hover:bg-[#86b873] transition-colors"
            >
              {t('about.cta.contact')}
            </a>
            <a
              href="/careers"
              className="inline-flex items-center px-8 py-3 rounded-full border-2 border-[#E4656E] text-[#E4656E] hover:bg-[#E4656E] hover:text-white transition-colors"
            >
              {t('about.cta.careers')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
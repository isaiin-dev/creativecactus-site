import React from 'react';
import { Leaf, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-[#96C881]" />
              <span className="ml-2 text-xl font-bold">Creative Cactus</span>
            </div>
            <p className="mt-4 text-gray-400">
              Transforming brands through creative digital solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">{t('nav.about')}</a></li>
              <li><a href="/services" className="text-gray-400 hover:text-white">{t('nav.services')}</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">{t('nav.contact')}</a></li>
              <li><a href="/careers" className="text-gray-400 hover:text-white">{t('footer.careers')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('nav.services')}</h3>
            <ul className="space-y-2">
              <li><a href="/services/digital-marketing" className="text-gray-400 hover:text-white">{t('services.items.digitalMarketing.title')}</a></li>
              <li><a href="/services/branding" className="text-gray-400 hover:text-white">{t('services.items.brandDesign.title')}</a></li>
              <li><a href="/services/web-development" className="text-gray-400 hover:text-white">{t('services.items.webDev.title')}</a></li>
              <li><a href="/services/social-media" className="text-gray-400 hover:text-white">{t('services.items.socialMedia.title')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.connect')}</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-4">
              <p className="text-gray-400">Email: hello@creativecactus.mx</p>
              <p className="text-gray-400">Phone: +52 (55) 1234-5678</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              {t('footer.rights')}
            </p>
            <div className="mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white mx-3">{t('footer.privacy')}</a>
              <a href="/terms" className="text-gray-400 hover:text-white mx-3">{t('footer.terms')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
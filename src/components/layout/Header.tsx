import React from 'react';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <a href="/" className="flex items-center" aria-label="Home">
              <img
                src="/logo.png"
                alt="Company Logo"
                className="h-8 w-auto"
              />
            </a>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.home')}
            </a>
            <a href="/about" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.about')}
            </a>
            <a href="/services" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.services')}
            </a>
            <a href="/contact" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.contact')}
            </a>
            <LanguageSwitcher />
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              Home
            </a>
            <a href="/about" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              About Us
            </a>
            <a href="/services" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              Services
            </a>
            <a href="/contact" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
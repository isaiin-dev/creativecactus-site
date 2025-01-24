import React from 'react';
import { Link } from 'react-router-dom';
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
            <Link to="/" className="flex items-center" aria-label="Home">
              <img
                src="/logo.png"
                alt="Company Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/services" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.services')}
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-[#E4656E] transition-colors">
              {t('nav.contact')}
            </Link>
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
            <Link to="/" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              {t('nav.home')}
            </Link>
            <Link to="/about" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              {t('nav.about')}
            </Link>
            <Link to="/services" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              {t('nav.services')}
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-300 hover:text-[#E4656E]">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
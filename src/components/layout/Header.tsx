import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { getContentBlock, HeaderData, defaultHeaderData } from '../../lib/firebase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useTranslation();
  const [headerData, setHeaderData] = React.useState<HeaderData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  React.useEffect(() => {
    const fetchHeaderData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const contentBlock = await getContentBlock('header');
        
        if (contentBlock && contentBlock.data) {
          setHeaderData(contentBlock.data as HeaderData);
          setRetryCount(0); // Reset retry count on success
        }
      } catch (err) {
        console.error('Error fetching header data:', err);
        
        if (retryCount < maxRetries) {
          // Retry with exponential backoff
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchHeaderData();
          }, retryDelay * Math.pow(2, retryCount));
        } else {
          setError('Failed to load header data');
          // Use default data as fallback
          setHeaderData(defaultHeaderData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeaderData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchHeaderData, 300000);

    return () => clearInterval(interval);
  }, [t]);
  
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  if (error) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" aria-label="Home">
              {headerData?.logo?.url ? (
                <img
                  src={headerData.logo.url}
                  alt={headerData.logo.alt}
                  className="h-8 w-auto"
                />
              ) : (
                <img
                  src="/logo.png"
                  alt="Company Logo"
                  className="h-8 w-auto"
                />
              )}
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {headerData?.navigation
              ?.filter(item => item.status === 'active')
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="text-gray-300 hover:text-[#E4656E] transition-colors"
                  {...(item.isExternal && item.path.startsWith('http') ? {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  } : {})}
                >
                  {item.label}
                </Link>
              ))}
            {headerData?.showLanguageSwitcher && <LanguageSwitcher />}
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
          <div className="px-2 pt-2 pb-3 space-y-2">
            {headerData?.navigation
              ?.filter(item => item.status === 'active')
              ?.sort((a, b) => a.order - b.order)
              ?.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="block px-3 py-2 text-gray-300 hover:text-[#E4656E] transition-colors"
                  {...(item.isExternal ? {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  } : {})}
                >
                  {item.label}
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
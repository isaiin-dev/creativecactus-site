import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { getContentBlock, HeaderData } from '../../lib/firebase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useTranslation();
  const [headerData, setHeaderData] = React.useState<HeaderData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch header data on mount and periodically refresh
  React.useEffect(() => {
    const fetchHeaderData = async () => {
      setIsLoading(true);
      try {
        const contentBlock = await getContentBlock('header');
        if (contentBlock?.data) {
          setHeaderData(contentBlock.data as HeaderData);
          setError(null);
        } else {
          // Use default header data if none exists
          setHeaderData({
            logo: {
              url: '/logo.png',
              alt: 'Creative Cactus',
              width: 160,
              height: 40
            },
            navigation: [
              {
                id: '1',
                label: t('nav.home'),
                path: '/',
                isExternal: false,
                order: 0,
                status: 'active'
              },
              {
                id: '2',
                label: t('nav.about'),
                path: '/about',
                isExternal: false,
                order: 1,
                status: 'active'
              },
              {
                id: '3',
                label: t('nav.services'),
                path: '/services',
                isExternal: false,
                order: 2,
                status: 'active'
              },
              {
                id: '4',
                label: t('nav.contact'),
                path: '/contact',
                isExternal: false,
                order: 3,
                status: 'active'
              }
            ],
            showLanguageSwitcher: true,
            showAdminPortal: true,
            metadata: {
              lastModified: new Date(),
              lastModifiedBy: 'system',
              version: 1
            }
          });
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
        // Use default header data on error
        setHeaderData({
          logo: {
            url: '/logo.png',
            alt: 'Creative Cactus'
          },
          navigation: [
            {
              id: '1',
              label: t('nav.home'),
              path: '/',
              isExternal: false,
              order: 0,
              status: 'active'
            },
            {
              id: '2',
              label: t('nav.about'),
              path: '/about',
              isExternal: false,
              order: 1,
              status: 'active'
            },
            {
              id: '3',
              label: t('nav.services'),
              path: '/services',
              isExternal: false,
              order: 2,
              status: 'active'
            },
            {
              id: '4',
              label: t('nav.contact'),
              path: '/contact',
              isExternal: false,
              order: 3,
              status: 'active'
            }
          ],
          showLanguageSwitcher: true,
          showAdminPortal: true,
          metadata: {
            lastModified: new Date(),
            lastModifiedBy: 'system',
            version: 1
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchHeaderData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchHeaderData, 300000);

    return () => clearInterval(interval);
  }, [t]);

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
              ?.sort((a, b) => a.order - b.order)
              ?.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="text-gray-300 hover:text-[#E4656E] transition-colors"
                  {...(item.isExternal ? {
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
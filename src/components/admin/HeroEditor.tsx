import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Palette,
  Type,
  Link as LinkIcon,
  ArrowRight
} from 'lucide-react';
import { HeroData, defaultHeroData } from '../../lib/firebase';

interface HeroEditorProps {
  data?: HeroData;
  onChange: (data: HeroData) => void;
  onSave: () => void;
  previewMode?: boolean;
}

export default function HeroEditor({
  data,
  onChange,
  onSave,
  previewMode = false
}: HeroEditorProps) {
  const [heroData, setHeroData] = React.useState<HeroData>(defaultHeroData);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { t } = useTranslation();

  // Initialize hero data with defaults or provided data
  React.useEffect(() => {
    if (data) {
      setHeroData({
        ...defaultHeroData,
        ...data
      });
    }
    setLoading(false);
  }, [data]);

  const handleChange = (newData: HeroData) => {
    setHeroData(newData);
    onChange(newData);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('/') ? `http://example.com${url}` : url);
      return true;
    } catch {
      return false;
    }
  };

  const validateColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const validateData = (): boolean => {
    // Title validations
    if (!heroData.title.main || heroData.title.main.length > 100) {
      setError('Main title must be between 1 and 100 characters');
      return false;
    }

    if (!heroData.title.creative || heroData.title.creative.length > 50) {
      setError('Creative text must be between 1 and 50 characters');
      return false;
    }

    if (!heroData.title.solutions || heroData.title.solutions.length > 50) {
      setError('Solutions text must be between 1 and 50 characters');
      return false;
    }

    // Subtitle validation
    if (!heroData.subtitle || heroData.subtitle.length > 200) {
      setError('Subtitle must be between 1 and 200 characters');
      return false;
    }

    // CTA validations
    if (!heroData.cta.primary.text || !heroData.cta.primary.link) {
      setError('Primary CTA text and link are required');
      return false;
    }

    if (!heroData.cta.secondary.text || !heroData.cta.secondary.link) {
      setError('Secondary CTA text and link are required');
      return false;
    }

    if (!validateUrl(heroData.cta.primary.link) || !validateUrl(heroData.cta.secondary.link)) {
      setError('Invalid URL format in CTA links');
      return false;
    }

    // Background color validations
    if (!validateColor(heroData.background.gradientStart) ||
        !validateColor(heroData.background.gradientMiddle) ||
        !validateColor(heroData.background.gradientEnd)) {
      setError('Invalid color format. Use hex colors (e.g., #96C881)');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSave = () => {
    if (validateData()) {
      onSave();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default values?')) {
      handleChange(defaultHeroData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-[#96C881] animate-spin" />
      </div>
    );
  }

  if (previewMode) {
    return (
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${heroData.background.gradientStart}20, ${heroData.background.gradientMiddle}, ${heroData.background.gradientEnd}20)`
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {heroData.title.main}{' '}
              <span className="text-[#E4656E]">{heroData.title.creative}</span>{' '}
              <span className="text-[#96C881]">{heroData.title.solutions}</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {heroData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href={heroData.cta.primary.link}
                className="inline-flex items-center px-8 py-3 rounded-full bg-[#96C881] text-white hover:bg-[#86b873] transition-colors"
              >
                {heroData.cta.primary.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href={heroData.cta.secondary.link}
                className="inline-flex items-center px-8 py-3 rounded-full border-2 border-[#E4656E] text-[#E4656E] hover:bg-[#E4656E] hover:text-white transition-colors"
              >
                {heroData.cta.secondary.text}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
          <p className="text-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </p>
        </div>
      )}

      {/* Title Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-[#96C881]" />
          Title Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Main Title
            </label>
            <input
              type="text"
              value={heroData.title.main}
              onChange={(e) => handleChange({
                ...heroData,
                title: { ...heroData.title, main: e.target.value }
              })}
              maxLength={100}
              className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Creative Text
              </label>
              <input
                type="text"
                value={heroData.title.creative}
                onChange={(e) => handleChange({
                  ...heroData,
                  title: { ...heroData.title, creative: e.target.value }
                })}
                maxLength={50}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Solutions Text
              </label>
              <input
                type="text"
                value={heroData.title.solutions}
                onChange={(e) => handleChange({
                  ...heroData,
                  title: { ...heroData.title, solutions: e.target.value }
                })}
                maxLength={50}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Subtitle</h3>
        <textarea
          value={heroData.subtitle}
          onChange={(e) => handleChange({
            ...heroData,
            subtitle: e.target.value
          })}
          rows={3}
          maxLength={200}
          className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
        />
      </div>

      {/* CTA Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-[#96C881]" />
          Call-to-Action Buttons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary CTA */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Primary Button</h4>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Text
              </label>
              <input
                type="text"
                value={heroData.cta.primary.text}
                onChange={(e) => handleChange({
                  ...heroData,
                  cta: {
                    ...heroData.cta,
                    primary: { ...heroData.cta.primary, text: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Link
              </label>
              <input
                type="text"
                value={heroData.cta.primary.link}
                onChange={(e) => handleChange({
                  ...heroData,
                  cta: {
                    ...heroData.cta,
                    primary: { ...heroData.cta.primary, link: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Secondary Button</h4>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Text
              </label>
              <input
                type="text"
                value={heroData.cta.secondary.text}
                onChange={(e) => handleChange({
                  ...heroData,
                  cta: {
                    ...heroData.cta,
                    secondary: { ...heroData.cta.secondary, text: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Link
              </label>
              <input
                type="text"
                value={heroData.cta.secondary.link}
                onChange={(e) => handleChange({
                  ...heroData,
                  cta: {
                    ...heroData.cta,
                    secondary: { ...heroData.cta.secondary, link: e.target.value }
                  }
                })}
                className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-[#96C881]" />
          Background Gradient
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={heroData.background.gradientStart}
                onChange={(e) => handleChange({
                  ...heroData,
                  background: { ...heroData.background, gradientStart: e.target.value }
                })}
                className="h-10 w-10 rounded bg-[#242424] border border-gray-700"
              />
              <input
                type="text"
                value={heroData.background.gradientStart}
                onChange={(e) => handleChange({
                  ...heroData,
                  background: { ...heroData.background, gradientStart: e.target.value }
                })}
                className="flex-1 px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Middle Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={heroData.background.gradientMiddle}
                onChange={(e) => handleChange({
                  ...heroData,
                  background: { ...heroData.background, gradientMiddle: e.target.value }
                })}
                className="h-10 w-10 rounded bg-[#242424] border border-gray-700"
              />
              <input
                type="text"
                value={heroData.background.gradientMiddle}
                onChange={(e) => handleChange({
                  ...heroData,
                  background: { ...heroData.background, gradientMiddle: e.target.value }
                })}
                className="flex-1 px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={heroData.background.gradientEnd}
                onChange={(e) => handleChange({
                  ...heroData,
                  background: { ...heroData.background, gradientEnd: e.target.value }
                })}
                className="h-10 w-10 rounded bg-[#242424] border border-gray-700"
              />
              <input
                type="text"
                value={heroData.background.gradientEnd}
                onChange={(e) => handleChange({
                  ...heroData,
                  background: { ...heroData.background, gradientEnd: e.target.value }
                })}
                className="flex-1 px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#96C881] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-[#242424] text-gray-300 rounded-lg hover:text-white transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
          Reset to Default
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={validateData}
            className="flex items-center gap-2 px-4 py-2 bg-[#242424] text-gray-300 rounded-lg hover:text-white transition-colors"
          >
            <CheckCircle2 className="h-5 w-5" />
            Validate
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-[#96C881] text-white rounded-lg hover:bg-[#86b873] transition-colors"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
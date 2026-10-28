import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  size = 'sm',
  showIcon = false,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const currentLang = (i18n.language || 'en').slice(0, 2).toLowerCase();

  const handleLanguageChange = async (newLang: 'en' | 'hi' | 'ml') => {
    if (newLang === currentLang) return;

    await i18n.changeLanguage(newLang);
    localStorage.setItem('dd_lang', newLang);
    document.documentElement.lang = newLang;

    // If logged in, persist to user profile in backend database
    const token = localStorage.getItem('dd_token');
    if (token && user) {
      try {
        fetch('/api/auth/profile/language', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: newLang }),
        }).catch(() => {});
      } catch {}
    }
  };

  const languages: { code: 'en' | 'hi' | 'ml'; label: string; name: string }[] = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'hi', label: 'HI', name: 'हिन्दी' },
    { code: 'ml', label: 'ML', name: 'മലയാളം' },
  ];

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <div
      role="radiogroup"
      aria-label="Language switcher"
      className={`inline-flex items-center bg-white rounded-full p-0.5 border border-[#D9D9D9] shadow-2xs ${className}`}
    >
      {showIcon && <Globe className="w-3.5 h-3.5 text-[#FF5A1F] ml-1.5 mr-1 shrink-0" aria-hidden="true" />}
      {languages.map((l) => {
        const isActive = currentLang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${l.name}`}
            onClick={() => handleLanguageChange(l.code)}
            className={`${paddingClass} rounded-full font-mono font-bold transition-all ${
              isActive
                ? 'bg-[#0A0A0A] text-white shadow-xs'
                : 'text-[#4A4A4A] hover:text-[#0A0A0A] hover:bg-neutral-100'
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { Info, X } from 'lucide-react';

interface PilotBannerProps {
  lang: Language;
  onLearnMore: () => void;
}

export const PilotBanner: React.FC<PilotBannerProps> = ({ lang, onLearnMore }) => {
  const [dismissed, setDismissed] = useState(false);
  const t = translations[lang].pilotNotice;

  if (dismissed) return null;

  return (
    <aside aria-label="Pilot notice" className="bg-[#4A5844] text-[#F7F4EE] text-xs py-2.5 px-4 sm:px-6 border-b border-[#3B4636]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Info className="w-4 h-4 text-[#C9D6C4] shrink-0" />
          <p className="truncate sm:text-clip">
            <span className="font-semibold text-[#E2ECE0] mr-2">
              {t.badge}:
            </span>
            <span className="hidden sm:inline text-[#EAE6DD]">
              {t.description}
            </span>
            <span className="sm:hidden text-[#EAE6DD]">
              {t.title}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLearnMore}
            className="text-xs font-medium underline underline-offset-2 text-[#E2ECE0] hover:text-white cursor-pointer"
          >
            {t.learnMore}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#C9D6C4] hover:text-white p-0.5 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

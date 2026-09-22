import React from 'react';
import { AlertCircle, Phone, MessageSquare, ExternalLink, Heart, X, ShieldAlert } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
    >
      <div 
        id="crisis-modal-container"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-rose-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-700/60 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-rose-100" />
            </div>
            <div>
              <h2 id="crisis-title" className="text-xl font-bold tracking-tight">
                Immediate Crisis &amp; Safety Resources
              </h2>
              <p className="text-rose-100 text-sm">
                Confidential, free, 24/7 compassionate human support
              </p>
            </div>
          </div>
          <button
            id="close-crisis-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-rose-700/50 hover:bg-rose-700 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close crisis resources modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Reassurance Banner */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
            <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              <strong>You are not alone, and your life has deep value.</strong> If you or someone you know is in immediate emotional distress, having thoughts of suicide, or facing a mental health crisis, please reach out to the dedicated crisis services below right now.
            </p>
          </div>

          {/* Primary Lifelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 988 Lifeline */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                    US &amp; Canada
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Free &amp; 24/7</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">988 Suicide &amp; Crisis Lifeline</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Call or text for immediate support with trained crisis counselors. English &amp; Spanish available.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <a
                  id="call-988-link"
                  href="tel:988"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call 988
                </a>
                <a
                  id="sms-988-link"
                  href="sms:988"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Text 988
                </a>
              </div>
            </div>

            {/* Crisis Text Line */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800">
                    Text Support
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Free &amp; 24/7</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Crisis Text Line</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Connect with a live crisis counselor via text anytime you need quiet support.
                </p>
              </div>
              <div className="mt-4">
                <a
                  id="sms-crisis-text-line"
                  href="sms:741741?&body=HOME"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Text HOME to 741741
                </a>
              </div>
            </div>

            {/* Trevor Project (LGBTQ+) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    LGBTQ+ Youth
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Free &amp; Confidential</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">The Trevor Project</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Crisis intervention and suicide prevention for LGBTQ young people.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <a
                  id="call-trevor-link"
                  href="tel:18664887386"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  1-866-488-7386
                </a>
              </div>
            </div>

            {/* Veterans Crisis Line */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    Veterans &amp; Families
                  </span>
                  <span className="text-xs text-slate-500 font-medium">24/7 Dedicated</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Veterans Crisis Line</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Dial 988 then press 1, or text 838255 to connect with veteran-specialized responders.
                </p>
              </div>
              <div className="mt-4">
                <a
                  id="call-veterans-link"
                  href="tel:988"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Dial 988, Press 1
                </a>
              </div>
            </div>
          </div>

          {/* International Resources */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-teal-600" />
              International Support Directory (Outside US &amp; Canada)
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              If you are outside the United States, please locate your local crisis hotline via Find A Helpline or contact local emergency medical services:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                id="link-find-a-helpline"
                href="https://findahelpline.com"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                FindAHelpline.com <ExternalLink className="w-3 h-3" />
              </a>
              <a
                id="link-befrienders"
                href="https://www.befrienders.org"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                Befrienders Worldwide <ExternalLink className="w-3 h-3" />
              </a>
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600">
                UK: 111 or 999 • EU: 112 • Australia: 13 11 14
              </span>
            </div>
          </div>

          {/* Calming Grounding Steps */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950">
            <h4 className="font-bold text-sm mb-1.5">Gentle Grounding Reminder While You Reach Out:</h4>
            <ul className="text-xs space-y-1 text-teal-900 list-disc list-inside">
              <li>Place both feet flat on the floor. Feel the support beneath you.</li>
              <li>Take one slow, prolonged exhale through your mouth.</li>
              <li>Reach out to one trusted friend, family member, or professional right now.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            id="close-crisis-footer-btn"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            I am Safe &amp; Return to Chat
          </button>
        </div>
      </div>
    </div>
  );
};

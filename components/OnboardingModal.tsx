import React, { useState } from "react";
import { Language } from "../types";
import { translations } from "../translations";

interface OnboardingModalProps {
  lang: Language;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  lang,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const t = translations[lang].onboarding;

  const steps = [
    { emoji: "🚀", title: t.welcome, desc: "" },
    { emoji: "📸", title: t.step1Title, desc: t.step1Desc },
    { emoji: "⏰", title: t.step2Title, desc: t.step2Desc },
    { emoji: "🍳", title: t.step3Title, desc: t.step3Desc },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-orange-600 z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      {/* Trang trí nền */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-orange-400/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8 z-10">
        <div className="text-[120px] animate-bounce-slow drop-shadow-2xl">
          {currentStep.emoji}
        </div>

        <div className="space-y-4 min-h-[160px]">
          <h2 className="text-3xl font-black text-white leading-tight">
            {currentStep.title}
          </h2>
          <p className="text-orange-50 text-lg font-medium opacity-90 leading-relaxed">
            {currentStep.desc}
          </p>
        </div>

        {/* Tiến trình dots */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-white" : "w-2 bg-white/30"
              }`}
            ></div>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-6 bg-white text-orange-600 rounded-[30px] text-2xl font-black shadow-2xl active:scale-95 transition-all"
        >
          {step === steps.length - 1 ? t.getStarted : t.next}
        </button>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default OnboardingModal;

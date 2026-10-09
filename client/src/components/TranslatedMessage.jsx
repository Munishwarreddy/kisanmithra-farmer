import { useState } from "react";
import { useSelector } from "react-redux";

const languageNames = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
};

const TranslatedMessage = ({ message, userLanguage = "en" }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const { loading } = useSelector((state) => state.ai);
  
  const isTranslating = loading.translation?.[message._id];
  const originalLanguage = message.originalLanguage || "en";
  const translations = message.translations || {};
  
  // Determine which text to display
  const displayLanguage = showOriginal ? originalLanguage : userLanguage;
  const displayText = showOriginal
    ? message.content
    : translations[userLanguage] || message.content;
  
  const isTranslated = originalLanguage !== userLanguage && translations[userLanguage];

  return (
    <div className="space-y-1">
      <div className="text-gray-900">
        {isTranslating ? (
          <div className="flex items-center gap-2 text-gray-500 italic">
            <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            <span>Translating...</span>
          </div>
        ) : (
          displayText
        )}
      </div>
      
      {isTranslated && !isTranslating && (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-200">
            Translated from {languageNames[originalLanguage]}
          </span>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            {showOriginal ? "Show translation" : "View original"}
          </button>
        </div>
      )}
      
      {!isTranslated && originalLanguage !== userLanguage && !isTranslating && (
        <div className="text-xs text-gray-500 italic">
          Translation unavailable
        </div>
      )}
    </div>
  );
};

export default TranslatedMessage;

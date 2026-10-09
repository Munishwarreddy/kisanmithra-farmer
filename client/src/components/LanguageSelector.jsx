import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLanguagePreference } from "../redux/slices/aiSlice";
import { toast } from "react-toastify";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
];

const LanguageSelector = ({ currentLanguage = "en", onUpdate }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.ai);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);
    
    try {
      await dispatch(updateLanguagePreference(languageCode)).unwrap();
      toast.success("Language preference updated successfully");
      if (onUpdate) {
        onUpdate(languageCode);
      }
    } catch (error) {
      toast.error(error || "Failed to update language preference");
      setSelectedLanguage(currentLanguage);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Preferred Language
      </label>
      <div className="flex gap-3">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={loading.languagePreference}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              selectedLanguage === language.code
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-green-400"
            } ${
              loading.languagePreference
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <span className="text-2xl">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
            {selectedLanguage === language.code && (
              <span className="ml-1 text-green-600">✓</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        Messages will be automatically translated to your preferred language
      </p>
    </div>
  );
};

export default LanguageSelector;

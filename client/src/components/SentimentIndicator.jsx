const SentimentIndicator = ({ sentiment }) => {
  if (!sentiment || !sentiment.label) {
    return null;
  }

  const sentimentConfig = {
    positive: {
      emoji: "😊",
      label: "Positive",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    neutral: {
      emoji: "😐",
      label: "Neutral",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
    urgent: {
      emoji: "⚠️",
      label: "Urgent",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      badge: true,
    },
    angry: {
      emoji: "🔴",
      label: "Angry",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      highlight: true,
    },
  };

  const config = sentimentConfig[sentiment.label] || sentimentConfig.neutral;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bgColor} ${config.borderColor} border`}
        title={`Sentiment: ${config.label} (${Math.round(sentiment.confidence * 100)}% confidence)`}
      >
        <span className="text-sm">{config.emoji}</span>
        <span className={`font-medium ${config.color}`}>{config.label}</span>
      </div>
      {config.badge && (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
          PRIORITY
        </span>
      )}
    </div>
  );
};

export default SentimentIndicator;

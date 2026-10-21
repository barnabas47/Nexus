from typing import Tuple

class SentimentAnalyzer:
    """Mock/AWS Comprehend sentiment analysis bridge."""
    
    @staticmethod
    def analyze(text: str) -> Tuple[str, float]:
        lowered = text.lower()
        negative_words = ["broken", "angry", "hate", "terrible", "worst", "fail", "useless", "error", "cancel", "frustrated"]
        positive_words = ["great", "awesome", "love", "thanks", "excellent", "super", "perfect", "good", "helpful", "interested"]
        
        neg_count = sum(1 for w in negative_words if w in lowered)
        pos_count = sum(1 for w in positive_words if w in lowered)

        if neg_count > pos_count:
            score = max(0.12, 0.45 - (neg_count * 0.1))
            return "negative", round(score, 2)
        elif pos_count > neg_count:
            score = min(0.98, 0.65 + (pos_count * 0.08))
            return "positive", round(score, 2)
        else:
            return "neutral", 0.75

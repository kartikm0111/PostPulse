import logging
import json
import httpx
from typing import Dict, Any, List
from app.config import settings
from app.models.schemas import AIGenerateRequest, AIGenerateResponse, ContentTone, PlatformType

logger = logging.getLogger("postpulse.ai_service")

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def generate_social_content(self, req: AIGenerateRequest) -> AIGenerateResponse:
        """
        Generates engaging social posts, platform variations, hashtags, and image prompts.
        """
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                prompt = f"""
                You are a world-class social media copywriter and growth marketer.
                Create a high-performing social media post package for the following request:

                Topic/Product: "{req.topic}"
                Tone: {req.tone.value}
                Target Platform: {req.target_platform.value}
                Include Emojis: {req.include_emojis}
                Call to Action: {req.call_to_action or "Engage with comment/share"}

                Return ONLY a valid JSON object with the following exact keys:
                - "generated_text": Main post text formatted for {req.target_platform.value}
                - "suggested_hashtags": Array of 5-8 relevant trending hashtags (including #)
                - "facebook_variant": Storytelling/longer version suitable for Facebook
                - "instagram_variant": Visual-first version with line breaks and hashtag cluster for Instagram
                - "ai_image_prompt": Detailed prompt description to generate an AI image for this post
                """
                
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                # Clean code blocks if present
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                
                parsed = json.loads(raw_text.strip())
                return AIGenerateResponse(
                    generated_text=parsed.get("generated_text", ""),
                    suggested_hashtags=parsed.get("suggested_hashtags", []),
                    facebook_variant=parsed.get("facebook_variant", ""),
                    instagram_variant=parsed.get("instagram_variant", ""),
                    ai_image_prompt=parsed.get("ai_image_prompt", "")
                )
            except Exception as e:
                logger.warning(f"Gemini API call failed ({e}). Falling back to Smart Rule-Based Engine.")

        # Smart Intelligent Rule-Based Engine fallback
        return self._generate_intelligent_fallback(req)

    def _generate_intelligent_fallback(self, req: AIGenerateRequest) -> AIGenerateResponse:
        tone_map = {
            ContentTone.PROFESSIONAL: ("🚀 Innovation Spotlight", "Here is a strategic perspective on"),
            ContentTone.CASUAL: ("✨ Hey friends!", "Guess what we've been working on? Check out"),
            ContentTone.PUNCHY: ("⚡ Game-Changer Alert!", "Stop scrolling. Here's why you need"),
            ContentTone.VIRAL: ("🔥 Unpopular Opinion:", "Everyone is talking about this! Here's the real story behind"),
            ContentTone.EDUCATIONAL: ("📚 Quick Masterclass:", "Here are 3 key lessons you need to know about"),
            ContentTone.SALES: ("🎉 Exclusive Offer!", "Transform your results today with")
        }

        prefix, intro = tone_map.get(req.tone, ("✨ Update", "Check out"))
        cta = f"\n\n👉 {req.call_to_action}" if req.call_to_action else "\n\n💬 What are your thoughts? Drop a comment below!"

        base_post = f"{prefix}\n\n{intro} {req.topic}! {cta}"
        
        hashtags = [
            f"#{req.topic.replace(' ', '').lower()}",
            "#SocialMediaGrowth",
            "#ContentStrategy",
            "#PostPulseAI",
            "#MarketingTips",
            "#DigitalAutomation"
        ]

        fb_variant = f"{prefix} | Strategic Insights\n\n{intro} {req.topic}. Building a consistent online presence requires the right timing and actionable insights.\n{cta}\n\n" + " ".join(hashtags[:4])
        ig_variant = f"{prefix}\n.\n.\n{intro} {req.topic} ✨\n.\n.\n{cta}\n.\n.\n" + " ".join(hashtags)

        img_prompt = f"Hyper-realistic, modern digital aesthetic representing {req.topic}, vibrant 8k resolution studio lighting, sleek gradient neon background."

        return AIGenerateResponse(
            generated_text=base_post,
            suggested_hashtags=hashtags,
            facebook_variant=fb_variant,
            instagram_variant=ig_variant,
            ai_image_prompt=img_prompt
        )

ai_service = AIService()

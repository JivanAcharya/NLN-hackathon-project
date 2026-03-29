
from app.models.models import DomainExpertise
from app.core.llm import get_basic_response
import re
import json


ALLOWED_DOMAINS = [d.value for d in DomainExpertise if d != DomainExpertise.GENERAL]



def analyze_conversation(conversation: str) -> dict:
    try:
        prompt = f"""
You are a mental health assistant.
Analyze the following conversation and determine the domain of the problem.
You MUST return only one of these exact values:
{ALLOWED_DOMAINS}

If the conversation does not clearly match any of these, return "general".
Return ONLY a JSON object like this, nothing else:
{{
    "domain": "financial"
}}

    Conversation:
    {conversation}
    """

    response = model.generate_content(prompt)

    clean = re.sub(r"```json|```", "", response.text).strip()
    result = json.loads(clean)

        if result.get("domain") not in ALLOWED_DOMAINS:
            result["domain"] = DomainExpertise.GENERAL.value

        return result
    except Exception:
        return {"domain": DomainExpertise.GENERAL.value}
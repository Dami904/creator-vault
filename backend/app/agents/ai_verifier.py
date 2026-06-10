from dataclasses import dataclass
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


@dataclass
class VerificationResult:
    verdict: str
    confidence: float
    reason: str


async def verify_milestone(
    job_brief: str,
    required_elements: list[str],
    post_type: str,
    deliverable_url: str,
) -> VerificationResult:
    elements_str = ", ".join(required_elements) if required_elements else "none specified"

    prompt = f"""You are an impartial content verifier for a creator-brand deal platform.

Job Brief: {job_brief}
Required Post Type: {post_type}
Required Elements: {elements_str}
Deliverable URL: {deliverable_url}

Based on the deliverable URL and the job requirements, assess whether the creator has fulfilled the brief.
Respond in JSON with exactly these fields:
  - verdict: "pass" or "fail"
  - confidence: a float between 0.0 and 1.0
  - reason: a single concise sentence explaining the verdict

JSON only, no other text."""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0,
    )

    import json
    data = json.loads(response.choices[0].message.content)
    return VerificationResult(
        verdict=data.get("verdict", "fail"),
        confidence=float(data.get("confidence", 0.5)),
        reason=data.get("reason", ""),
    )

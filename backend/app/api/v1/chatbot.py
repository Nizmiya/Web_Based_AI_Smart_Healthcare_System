from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
import aiohttp
from app.api.v1.auth import get_current_user
from app.core.config import settings

router = APIRouter()


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


def _build_prompt(message: str) -> str:
    return (
        "You are a medical assistant ONLY. You ONLY answer health, disease, symptoms, and medical questions. "
        "For medical questions: Give concise, non-diagnostic guidance in 2-4 sentences. Explain common "
        "symptoms, risk factors, lifestyle advice, and general next steps. Avoid definitive diagnoses or prescribing. "
        "If symptoms sound serious, recommend seeing a doctor or emergency care.\n\n"
        "If the user asks anything NON-MEDICAL (e.g. sports, movies, general knowledge, jokes, weather, politics, coding, etc.), "
        'reply ONLY with: "I am a medical assistant only. I can help with health and disease-related questions. Please ask about symptoms, risk factors, or lifestyle advice."\n\n'
        f"User message: {message.strip()}\n"
    )


def _normalize_model_name(name: str) -> str:
    if name.startswith("models/"):
        return name.split("/", 1)[1]
    return name


def _build_model_url(model_name: str) -> str:
    return (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
    )


async def _fetch_supported_models(session: aiohttp.ClientSession) -> List[str]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
    async with session.get(url) as response:
        if response.status != 200:
            return []
        data = await response.json()
    models = data.get("models", [])
    supported = [
        _normalize_model_name(model["name"])
        for model in models
        if "supportedGenerationMethods" in model
        and "generateContent" in model.get("supportedGenerationMethods", [])
    ]
    return [name for name in supported if name]


@router.post("/message", response_model=ChatResponse)
async def chatbot_message(
    payload: ChatMessage,
    current_user: dict = Depends(get_current_user),
):
    if not payload.message or not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured."
        )

    prompt = _build_prompt(payload.message)
    request_payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 256}
    }
    preferred = [settings.GEMINI_MODEL, "gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]

    timeout = aiohttp.ClientTimeout(total=12)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            supported = await _fetch_supported_models(session)
            if not supported:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Could not fetch available Gemini models. Check API key."
                )
            # Prefer our list, then append any other available models
            models_to_try = [m for m in preferred if m in supported]
            for m in supported:
                if m not in models_to_try:
                    models_to_try.append(m)

            last_error = None
            for model_name in models_to_try:
                async with session.post(_build_model_url(model_name), json=request_payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        text = (
                            data.get("candidates", [{}])[0]
                            .get("content", {})
                            .get("parts", [{}])[0]
                            .get("text")
                        )
                        if text and isinstance(text, str):
                            return {"reply": text.strip()}
                        last_error = (200, "No text in response")
                        continue
                    error_text = await response.text()
                    if len(error_text) > 500:
                        error_text = f"{error_text[:500]}..."
                    last_error = (response.status, error_text)
                    if response.status == 429:
                        continue  # try next model
                    if response.status == 404:
                        continue  # try next model
                    # 400, 403, 500 etc
                    if model_name == models_to_try[-1]:
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"Gemini API failed ({response.status}). {error_text}"
                        )
                    continue
            # All models failed (429 or 404)
            if last_error and last_error[0] == 429:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="I'm temporarily busy. Please wait about a minute and try again."
                )
            status_code, err = last_error or (500, "Unknown error")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API failed ({status_code}). {err}"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service unavailable."
        )

    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="No response from AI service."
    )


@router.get("/models")
async def list_gemini_models(
    current_user: dict = Depends(get_current_user),
):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured."
        )

    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
    timeout = aiohttp.ClientTimeout(total=12)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url) as response:
                if response.status != 200:
                    error_text = await response.text()
                    if len(error_text) > 500:
                        error_text = f"{error_text[:500]}..."
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Gemini ListModels failed ({response.status}). {error_text}"
                    )
                data = await response.json()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini ListModels unavailable."
        )

    models = data.get("models", [])
    supported = [
        _normalize_model_name(model["name"])
        for model in models
        if "supportedGenerationMethods" in model
        and "generateContent" in model.get("supportedGenerationMethods", [])
    ]
    return {"supported_models": supported, "total": len(supported)}


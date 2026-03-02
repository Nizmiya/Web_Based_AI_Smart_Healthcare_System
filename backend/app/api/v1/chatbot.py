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
        "You are a helpful medical assistant. Answer disease-related and medical questions "
        "with concise, non-diagnostic guidance in 2-4 sentences. You can explain common "
        "symptoms, risk factors, lifestyle advice, and general next steps. Avoid giving "
        "definitive diagnoses or prescribing specific medications. If symptoms sound serious "
        "or urgent, recommend seeing a doctor or emergency care.\n\n"
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
    model_name = settings.GEMINI_MODEL
    request_payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 256}
    }

    timeout = aiohttp.ClientTimeout(total=12)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(_build_model_url(model_name), json=request_payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    if len(error_text) > 500:
                        error_text = f"{error_text[:500]}..."
                    if response.status == 404:
                        supported = await _fetch_supported_models(session)
                        if supported:
                            retry_model = supported[0]
                            async with session.post(
                                _build_model_url(retry_model),
                                json=request_payload
                            ) as retry_response:
                                if retry_response.status == 200:
                                    retry_data = await retry_response.json()
                                    retry_text = (
                                        retry_data.get("candidates", [{}])[0]
                                        .get("content", {})
                                        .get("parts", [{}])[0]
                                        .get("text")
                                    )
                                    if retry_text and isinstance(retry_text, str):
                                        return {"reply": retry_text.strip()}
                                retry_error = await retry_response.text()
                                if len(retry_error) > 500:
                                    retry_error = f"{retry_error[:500]}..."
                            supported_str = ", ".join(supported[:5])
                            raise HTTPException(
                                status_code=status.HTTP_502_BAD_GATEWAY,
                                detail=(
                                    f"Gemini API call failed ({response.status}). {error_text} "
                                    f"Retry with {retry_model} failed: {retry_error}. "
                                    f"Supported models: {supported_str}"
                                )
                            )
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Gemini API call failed ({response.status}). {error_text}"
                    )
                data = await response.json()
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text")
                )
                if text and isinstance(text, str):
                    return {"reply": text.strip()}
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


"""
Email utilities for Smart Healthcare System - Forgot password OTP, etc.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger(__name__)

_PLACEHOLDER_MARKERS = (
    "your-email",
    "your-gmail",
    "example.com",
    "changeme",
    "placeholder",
    "paste_your",
    "abcd efgh",
    "xkwpmjqh",
)


def is_mail_configured() -> bool:
    user = (settings.MAIL_USER or "").strip()
    pwd = (settings.MAIL_PASS or "").strip()
    if not user or not pwd:
        return False
    lower_user = user.lower()
    lower_pwd = pwd.lower()
    return not any(
        marker in lower_user or marker in lower_pwd for marker in _PLACEHOLDER_MARKERS
    )


def _smtp_login_and_send(msg: MIMEMultipart, to: str) -> None:
    """Try Gmail SMTP on port 587 (TLS) then 465 (SSL)."""
    user = settings.MAIL_USER.strip()
    mail_pass = (settings.MAIL_PASS or "").replace(" ", "")
    last_error = None

    attempts = []
    if settings.MAIL_USE_SSL or settings.MAIL_PORT == 465:
        attempts.append(("ssl", settings.MAIL_HOST, 465))
    else:
        attempts.append(("tls", settings.MAIL_HOST, settings.MAIL_PORT or 587))
        attempts.append(("ssl", settings.MAIL_HOST, 465))

    for mode, host, port in attempts:
        try:
            if mode == "ssl":
                with smtplib.SMTP_SSL(host, port, timeout=30) as server:
                    server.login(user, mail_pass)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(host, port, timeout=30) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(user, mail_pass)
                    server.send_message(msg)
            logger.info("Email sent via %s:%s to %s", host, port, to)
            return
        except smtplib.SMTPAuthenticationError as e:
            last_error = e
            break
        except Exception as e:
            last_error = e
            logger.warning("SMTP %s:%s failed: %s", host, port, e)

    if isinstance(last_error, smtplib.SMTPAuthenticationError):
        raise RuntimeError(
            "Gmail login failed for MAIL_USER. Steps: "
            "1) Turn ON 2-Step Verification, "
            "2) Create App Password at https://myaccount.google.com/apppasswords, "
            "3) Paste the 16-character code into MAIL_PASS (not your normal Gmail password), "
            "4) Restart backend."
        ) from last_error
    raise RuntimeError(f"Failed to send email: {last_error}") from last_error


def send_email(to: str, subject: str, body: str) -> None:
    if not is_mail_configured():
        raise RuntimeError(
            "MAIL_PASS is empty in backend/.env. Add your Gmail App Password and restart backend."
        )

    sender = (settings.MAIL_FROM or settings.MAIL_USER).strip()
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    _smtp_login_and_send(msg, to)


def send_password_reset_otp_email(email: str, otp_code: str) -> None:
    subject = "Password Reset OTP - Smart Healthcare System"
    body = f"""Dear User,

You have requested to reset your password for your Smart Healthcare System account.

OTP Code: {otp_code}

This code expires in 10 minutes.

If you did not request this, ignore this email.

Smart Healthcare System"""
    send_email(email, subject, body)

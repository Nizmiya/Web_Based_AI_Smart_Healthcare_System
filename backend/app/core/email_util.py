"""
Email utilities for Smart Healthcare System - Forgot password OTP, etc.
Uses SMTP (Gmail) from app.core.config.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> None:
    """Send a plain-text email via SMTP."""
    if not settings.MAIL_USER or not settings.MAIL_PASS:
        logger.error("MAIL_USER or MAIL_PASS not set. Cannot send email.")
        raise RuntimeError("Email is not configured. Set MAIL_USER and MAIL_PASS in .env")
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.MAIL_USER
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP(settings.MAIL_HOST, settings.MAIL_PORT) as server:
            server.starttls()
            server.login(settings.MAIL_USER, settings.MAIL_PASS)
            server.send_message(msg)
        logger.info("Email sent successfully to: %s", to)
    except Exception as e:
        logger.exception("Error sending email to %s: %s", to, e)
        raise RuntimeError(f"Failed to send email: {e}") from e


def send_password_reset_otp_email(email: str, otp_code: str) -> None:
    """Send password reset OTP to user's email."""
    subject = "Password Reset OTP - Smart Healthcare System"
    body = f"""Dear User,

You have requested to reset your password for your Smart Healthcare System account.

Please use the following OTP code to verify your identity:

OTP Code: {otp_code}

This code will expire in 10 minutes.

After verifying the OTP, you will be able to set a new password.

If you did not request this password reset, please ignore this email.

Best regards,
Smart Healthcare System Team"""
    send_email(email, subject, body)

"""Send a test email to verify SMTP settings. Run: python scripts/test_smtp.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.core.email_util import is_mail_configured, send_email


def main():
    print("MAIL_USER:", settings.MAIL_USER or "(empty)")
    print("MAIL_PASS set:", bool((settings.MAIL_PASS or "").strip()))
    print("Configured:", is_mail_configured())
    if not is_mail_configured():
        print("\nSet MAIL_USER and MAIL_PASS (Gmail App Password) in backend/.env")
        sys.exit(1)

    to = settings.MAIL_USER
    print(f"\nSending test email to {to} ...")
    try:
        send_email(to, "SMTP Test - Healthcare System", "If you see this, SMTP works.")
        print("SUCCESS — check your inbox.")
    except Exception as e:
        print("FAILED:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()

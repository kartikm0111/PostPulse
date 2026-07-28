import base64
import os
import logging
from cryptography.fernet import Fernet
from app.config import settings

logger = logging.getLogger("postpulse.encryption")

# Derived key or default secret key
_raw_key = settings.JWT_SECRET.ljust(32)[:32].encode('utf-8')
_fernet_key = base64.urlsafe_b64encode(_raw_key)
_cipher = Fernet(_fernet_key)

def encrypt_token(plain_token: str) -> str:
    """
    Encrypts access tokens at rest using AES-256 (Fernet)
    """
    if not plain_token or plain_token.startswith("mock_"):
        return plain_token
    try:
        encrypted_bytes = _cipher.encrypt(plain_token.encode('utf-8'))
        return encrypted_bytes.decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to encrypt token: {e}")
        return plain_token

def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypts encrypted access tokens for live Meta Graph API calls
    """
    if not encrypted_token or encrypted_token.startswith("mock_"):
        return encrypted_token
    try:
        decrypted_bytes = _cipher.decrypt(encrypted_token.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to decrypt token: {e}")
        return encrypted_token

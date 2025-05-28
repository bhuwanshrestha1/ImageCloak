from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os

# Generate a 256-bit AES key (32 bytes)
key = os.urandom(32)  # For AES-256
print(f"Generated AES Key: {key.hex()}")

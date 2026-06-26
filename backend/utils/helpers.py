import hashlib
import random
import re

def hash_val(val: str) -> str:
    """
    Generate SHA-256 hash of a string value.
    Used for securing passwords and security PIN codes.
    """
    if not val:
        return ""
    return hashlib.sha256(val.encode("utf-8")).hexdigest()

def gen_num(length: int) -> str:
    """
    Generate a random numeric string of specified length.
    """
    return "".join([str(random.randint(0, 9)) for _ in range(length)])

def generate_debit_card(full_name: str) -> str:
    """
    Generate a mock 16-digit debit card number.
    Format: 4214-XXXX-XXXX-XXXX (standard Visa prefix for local banks)
    """
    return f"4214-{gen_num(4)}-{gen_num(4)}-{gen_num(4)}"

def validate_cnic(cnic: str) -> bool:
    """
    Validate CNIC format.
    Pakistani CNIC matches XXXXX-XXXXXXX-X (e.g. 42101-1234567-1)
    """
    pattern = r"^\d{5}-\d{7}-\d{1}$"
    return bool(re.match(pattern, cnic))

def validate_mobile(mobile: str) -> bool:
    """
    Validate Mobile Number format.
    Matches standard formats (e.g. 03XX-XXXXXXX or 03XXXXXXXXX)
    """
    pattern = r"^03\d{2}-?\d{7}$"
    return bool(re.match(pattern, mobile))

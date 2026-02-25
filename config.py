from pathlib import Path

# Base project directory
BASE_DIR = Path(__file__).resolve().parent

# Input/Output directories
INPUT_PDF_DIR = BASE_DIR / "input_pdf"
TEMPLATES_DIR = BASE_DIR / "templates"
OUTPUT_DIR = BASE_DIR / "output"
LOG_FILE = BASE_DIR / "log.txt"

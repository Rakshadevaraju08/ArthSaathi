# AI Service Structure

Current status: the active mobile prototype uses local mock voice, loan, RTC, and fraud screens. It does not require the AI service to run.

Future AI service responsibilities:

- Speech-to-text for voice questions.
- Financial guidance responses.
- Loan risk explanation.
- Scam text analysis.
- RTC/OCR extraction.

Expected structure:

```txt
ai_service/
├── app/
│   ├── speech/
│   ├── finance_ai/
│   ├── ocr/
│   ├── scam_detection/
│   ├── routes/
│   └── main.py
└── requirements.txt
```

Integration rule: keep the current simulated voice UI and replace only the mock response function with an API call.

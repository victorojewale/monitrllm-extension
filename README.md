# MonitrLLM

**MonitrLLM** is open-source infrastructure for community-centered evaluation of large language models. A Chrome extension runs alongside your LLM chat interface and submits audit reports to a Django backend, enabling communities to collect conversation logs paired with user-reported task intent, outcome assessments, and satisfaction ratings.

This repository contains the full source code for the extension and backend.

---

## Architecture

```
monitrllm/
├── extension/                      — Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── config.js                   — API endpoint configuration
│   ├── background.js               — Service worker, UUID management
│   ├── popup.html / popup.js       — Audit report submission form
│   ├── view_reports.html / .js     — User's own submission history
│   ├── welcome.html / .js          — First-run onboarding
│   ├── icons/
│   └── styles/
│
├── audit_project/                  — Django project configuration
├── audits/                         — Django app (models, views, admin)
├── manage.py
├── requirements.txt
└── Procfile
```

Each report captures the following fields alongside a timestamp and an anonymized UUID:

| Field | Label in UI | Description |
|---|---|---|
| `feedback` | Briefly describe your interaction | Free-text description of the conversation |
| `purpose` | Purpose of this interaction | User's task goal |
| `outcome` | How did this interaction go? | User's assessment of success |
| `conversation_link` | Link to this conversation | LLM interface share URL |
| `rating` | Overall satisfaction | Integer 1–5 |

User identity is a UUID generated on first install and stored in `chrome.storage.sync`. No account registration is required. Participants can view and delete their own reports from the extension's options page.

---

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL (local or hosted)
- Chrome or Chromium

### Backend

```bash
git clone https://github.com/<your-org>/monitrllm.git
cd monitrllm
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Set environment variables (see Configuration below)
export DJANGO_SECRET_KEY="..."
export DATABASE_URL="postgresql://user:password@host:5432/dbname"
export DEBUG=False

python manage.py migrate
python manage.py runserver
```

### Extension

1. Set `API_BASE_URL` in `extension/config.js` to your backend URL
2. In Chrome, go to `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `extension/` folder

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | Yes | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DATABASE_URL` | Yes | PostgreSQL connection string. Falls back to SQLite if unset (development only) |
| `DEBUG` | No | Defaults to `False`. Set to `True` for local development only |
| `ALLOWED_HOSTS` | No | Comma-separated list of hostnames Django will serve. Defaults to localhost |

By default `CORS_ALLOW_ALL_ORIGINS = True` for development convenience. Before going to production, restrict this in `audit_project/settings.py`:

```python
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGIN_REGEXES = [r"^chrome-extension:\/\/[a-z]{32}$"]
```

---

## Deployment

The backend is a standard Django/WSGI application and can be hosted anywhere that supports Python and PostgreSQL The three environment variables above (`DJANGO_SECRET_KEY`, `DATABASE_URL`, `DEBUG`) need to be set on whichever platform you deploy to.

A `Procfile` is included for platforms that use it (e.g. Heroku):

```
web: gunicorn audit_project.wsgi
```

After deploying, run `python manage.py migrate` against your production database, then update `extension/config.js` with your live backend URL.

---

## Running Your Own Study

MonitrLLM is designed to be forked. Each research team should run their own backend so that participant data stays in their own infrastructure.

**Before you start**, make sure you have:
- A place to host the Django backend (see [Deployment](#deployment) above)
- A PostgreSQL database your backend can connect to
- A way to distribute the Chrome extension to your participants

**The steps:**

1. **Fork this repository** and clone your fork locally.
2. **Deploy your own backend** following the setup instructions above. Your deployment is fully independent — you control the database and the data.
3. **Update `extension/config.js`** to point `API_BASE_URL` at your deployed backend URL. This is the most critical step — if this is wrong, participant data will not reach your database.
4. **Customise the form** if your study requires different fields (see [Adapting for Other Communities](#adapting-for-other-communities)).
5. **Distribute the extension** to participants. Share your fork's repository URL and instruct participants to load the `extension/` folder as an unpacked extension in Chrome. Alternatively, zip the `extension/` folder and distribute it directly.
6. **Access your data** via the Django admin panel at `/admin` (CSV export available) or by querying the `/reports/` endpoint directly.

---

## Adapting for Other Communities

**Change the audit fields.** Extend the `Report` model in `audits/models.py` and the form in `extension/popup.html` with community-specific fields. Run `python manage.py makemigrations && python manage.py migrate` after any model changes.

**Change the target platform.** The URL validation regex in `extension/popup.js` and `audits/views.py` currently accepts only ChatGPT share links. Update it to match links from other LLM interfaces.

**Add researcher-side views.** The backend exposes a simple JSON API. A dashboard with filtering, export, or visualization can be added as additional Django views without modifying the extension.

---

## Privacy Notes

- User identity is a locally generated UUID. No personal information is collected.
- Participants can delete any of their own reports from the extension's options page at any time.
- Conversation transcripts are not stored , only the share link. Transcript content is retrieved separately by researchers for analysis.
- The codebase does not implement any tracking, analytics, or third-party data sharing.

---

## Citation

```bibtex
@inproceedings{anonymous2026monitrllm,
  title     = {MonitrLLM: A Community-Centered Evaluation Infrastructure for Large Language Models},
  author    = {Anonymous},
  booktitle = {Proceedings of the AAAI/ACM Conference on AI, Ethics, and Society},
  year      = {2026}
}
```

---

## License

[License TBD]

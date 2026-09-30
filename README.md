# bache-split

Expense splitting for flatmates. Everyone in a house logs the shared groceries and supplies they buy. When someone takes some, the app works out what they owe, keeps a running tally of who owes whom, and makes paying back easy with each person's UPI ID.

## Features

- **Houses**: create a house and invite flatmates with an invite code or a join link
- **Shared store**: add an item with its quantity, unit and total price; the unit price is calculated for you
- **Take what you use**: record how much you took, and your share is calculated from the unit price
- **Settlements**: see who owes whom and mark debts as settled
- **Sign-in**: Google sign-in on the front end, JWT authentication on the API

## Stack

| Part | Tech |
|---|---|
| Front end | React 19, Vite, React Router, Axios |
| Back end | Django 5, Django REST Framework, Simple JWT |
| Database | SQLite in development, Azure SQL in production |
| Deployment | GitHub Actions → Azure Static Web Apps (front end) and Azure App Service (back end) |

## Run it locally

**Back end**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export SECRET_KEY=dev-only-secret DEBUG=True ALLOWED_HOSTS=localhost CORS_ALLOWED_ORIGINS=http://localhost:5173
python manage.py migrate
python manage.py runserver
```

**Front end**

```bash
cd frontend
npm install
npm run dev
```

The front end calls `http://localhost:8000/api` by default. Set `VITE_API_URL` to point it somewhere else.

---

Part of [Aswin AK's projects](https://aswin.xpar.in/projects/).

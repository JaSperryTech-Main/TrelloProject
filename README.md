## Python Backend Setup

```bash
cd backend
python -m venv venv
pip install -r requirements.txt
```

## Backend (Node/PNPM) Setup

```bash
cd backend
pnpm install
```

## Frontend Setup

```bash
cd frontend
pnpm install
```

### Start Development Servers

```bash
# Start backend
cd backend
pnpm dev
```

```bash
cd ../frontend
pnpm dev
```

## Convert Resources Endpoint

Hit the following endpoint to trigger the resource conversion:

```bash
GET http://localhost:3000/api/update
```

## Use Cases:

- All SOC Codes:
  > http://localhost:5173/job/soc
- Specific SOC Code:
  > http://localhost:5173/job/soc/id
- All CIP Codes:
  > http://localhost:5173/job/cip
- Specific CIP Code:
  > http://localhost:5173/job/cip/id

## Docker Notes (Production)

- Frontend runs on port 80 (not 5173) in Dockerized environments.
- Setup/build may take a few minutes on first run.

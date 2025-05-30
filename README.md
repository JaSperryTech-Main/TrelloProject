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

## AWS Codes (NO Luck)

- Compress-Archive -Path .\* -DestinationPath app.zip
- aws elasticbeanstalk create-application-version --application-name cipSoc --version-label v3 --source-bundle S3Bucket="cipsoc-deployments",S3Key="app.zip"
- aws elasticbeanstalk describe-environments --application-name cipSoc --environment-names cipSoc-env-v4
- aws elasticbeanstalk create-environment --application-name cipSoc --environment-name cipSoc-env-v4 --solution-stack-name "64bit Amazon Linux 2023 v6.5.2 running Node.js 22" --version-label v5
- aws elasticbeanstalk update-environment --environment-name cipSoc-env-v4 --version-label v5

## On Render

- Create a web Service
- change to deployment branch
- Leave as docker
- Add PORT and VITE_BACKEND_URL as Environment Variables

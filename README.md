# MyDrive API

GraphQL API for [MyDrive](https://github.com/spevnev/MyDrive) built with NestJS, PostgreSQL, and AWS S3.

## Prerequisites

- Node.js v22+
- PostgreSQL
- AWS S3 bucket (or LocalStack for local development)

## Running

Install dependencies:
```shell
npm install
```

Copy `.env.TEMPLATE` to `.env` and configure environment variables.

### Development
```shell
npm run dev
```

### Production
```shell
npm run build
npm run start
```

### Docker
```shell
npm run build
docker build -t mydrive-api .
docker run --network host --env-file .env mydrive-api
```

**Note:** `--network host` allows the container to connect to PostgreSQL (and LocalStack) running on the host machine.

## LocalStack (S3 Alternative)

For local development without AWS, use [LocalStack](https://github.com/localstack/localstack):

Run LocalStack:
```shell
docker run --name localstack -p 4566:4566 localstack/localstack
```

Create S3 bucket:
```shell
docker exec localstack awslocal s3api create-bucket --bucket BUCKET_NAME
```

Configure `.env` for LocalStack:
```env
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
LOCALSTACK_ENDPOINT=http://localhost:4566
```

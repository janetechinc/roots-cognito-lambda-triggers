# Cognito Triggers for Roots

## Requirements

- `zip`
- `node` version 18+
- `npm`

## Build

Build the lambda zip files with the following commands:

```bash
npm install
npm run build
```

The files will be compiled under `dist` directory:

- `migration-lambda.zip`
- `post-confirmation-lambda.zip`
- `pre-signup-lambda.zip`

## Test

```bash
npm test
```

## Configuration

Set the following environment variables:

```bash
export JANE_CLIENT_ID="<provided by partner success>"
export JANE_CLIENT_SECRET="<provided by partner success>"
# optional, defaults to the following
export JANE_API_URL="https://api.iheartjane.com"
```

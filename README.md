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

# Vinly LK Backend

## Setting up development space

Initialise the shared library with

```sh
cd utils
npm run init
```

Initialise environment variables using the following (you may add these to your `~/.bashrc` if needed)

```sh
export MONGODB_ATLAS_CLUSTER_URI="XXXX"
export COGNITO_USER_POOL_ID="XXXX"
export BUCKET_NAME="XXXX"
export BUCKET_REGION="XXXX"
export CDN_DOMAIN="XXXX"
export NODE_OPTIONS="--enable-source-maps"
```
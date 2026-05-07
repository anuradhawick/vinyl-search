#!/usr/bin/env python3
import hashlib
import json
import os
import shlex
import subprocess
import sys
from pathlib import Path


OAUTH_SCOPES = [
    "phone",
    "email",
    "profile",
    "openid",
    "aws.cognito.signin.user.admin",
]


def require(args, key):
    value = args.get(key)
    if value is None or value == "":
        raise ValueError(f"Missing required build argument: {key}")
    return value


def normalize_url(value):
    return value if value.endswith("/") else f"{value}/"


def ts(value):
    return json.dumps(value)


def ts_array(values, indent):
    padding = " " * indent
    return json.dumps(values, indent=2).replace("\n", f"\n{padding}")


def render_environment(args, production):
    application_urls = [
        normalize_url(url) for url in json.loads(require(args, "application_urls_json"))
    ]
    api_endpoint = normalize_url(require(args, "api_endpoint"))
    cdn_url = normalize_url(require(args, "cdn_url"))

    return f"""export const environment = {{
  production: {str(production).lower()},
  aws_config: {{
    Auth: {{
      Cognito: {{
        identityPoolId: {ts(require(args, "identity_pool_id"))},
        region: {ts(require(args, "region"))},
        userPoolId: {ts(require(args, "user_pool_id"))},
        userPoolClientId: {ts(require(args, "user_pool_client_id"))},
        mandatorySignIn: false,
        loginWith: {{
          oauth: {{
            domain: {ts(require(args, "oauth_domain"))},
            scopes: {ts_array(OAUTH_SCOPES, 12)},
            redirectSignIn: {json.dumps(application_urls)},
            redirectSignOut: {json.dumps(application_urls)},
            responseType: 'code' as any,
          }},
        }},
      }},
    }},
    Storage: {{
      S3: {{
        bucket: {ts(require(args, "storage_bucket_name"))},
        region: {ts(require(args, "region"))},
      }},
    }},
    API: {{
      REST: {{
        {ts(require(args, "application_api_name"))}: {{
          endpoint: {ts(api_endpoint)},
          region: {ts(require(args, "region"))},
        }},
      }},
    }},
  }},
  api_gateway: {ts(api_endpoint)},
  cdn_url: {ts(cdn_url)},
}};
"""


def write_environment_files(webapp_dir, args):
    workspace = require(args, "workspace")
    production = args.get("production", "false").lower() == "true"
    contents = render_environment(args, production)
    env_dir = webapp_dir / "src" / "environments"
    env_dir.mkdir(parents=True, exist_ok=True)

    targets = [env_dir / "environment.ts"]
    if workspace == "prod":
        targets.append(env_dir / "environment.prod.ts")
    else:
        targets.append(env_dir / "environment.development.ts")

    for target in targets:
        target.write_text(contents, encoding="utf-8")
        print(f"updated {target}", file=sys.stderr)


def run_command(command, cwd, label):
    if command.strip() == "":
        print(f"skipping {label}", file=sys.stderr)
        return

    print(f"running {label}: {command}", file=sys.stderr)
    process = subprocess.Popen(
        shlex.split(command),
        cwd=cwd,
        stdout=sys.stderr,
        stderr=sys.stderr,
        text=True,
    )
    code = process.wait()
    if code != 0:
        raise RuntimeError(f"{label} returned non-zero exit code {code}")


def sha1_of_file(root, filepath):
    sha = hashlib.sha1()
    sha.update(str(filepath.relative_to(root)).encode("utf-8"))
    with filepath.open("rb") as file:
        for block in iter(lambda: file.read(1024 * 64), b""):
            sha.update(block)
    return sha.hexdigest()


def hash_dir(dir_path):
    if not dir_path.exists():
        raise FileNotFoundError(f"Build destination does not exist: {dir_path}")

    sha = hashlib.sha1()
    for path, dirs, files in os.walk(dir_path):
        dirs.sort()
        current = Path(path)
        for filename in sorted(files):
            sha.update(sha1_of_file(dir_path, current / filename).encode("utf-8"))
    return sha.hexdigest()


def main():
    args = json.loads(sys.stdin.read())
    webapp_dir = Path(require(args, "webapp_dir"))
    build_destination = Path(require(args, "build_destination"))

    write_environment_files(webapp_dir, args)
    run_command(args.get("install_command", ""), webapp_dir, "install")
    run_command(require(args, "build_command"), webapp_dir, "build")

    json.dump(
        {
            "hash": hash_dir(build_destination),
            "build_destination": str(build_destination),
        },
        sys.stdout,
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)

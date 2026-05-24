resource "null_resource" "mongodb_indexes" {
  triggers = {
    workspace  = terraform.workspace
    database   = local.MONGODB_DATABASE_NAME
    script_sha = filesha256("${path.module}/db_index.js")
    uri_sha    = sha256(nonsensitive(local.MONGODB_ATLAS_CLUSTER_URI))
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-lc"]
    environment = {
      MONGODB_ATLAS_CLUSTER_URI = local.MONGODB_ATLAS_CLUSTER_URI
      MONGODB_DATABASE_NAME     = local.MONGODB_DATABASE_NAME
    }
    command = <<-EOT
      set -euo pipefail
      test -n "$MONGODB_ATLAS_CLUSTER_URI"
      test -n "$MONGODB_DATABASE_NAME"
      mongosh --quiet "$MONGODB_ATLAS_CLUSTER_URI" --file "${path.module}/db_index.js"
    EOT
  }
}

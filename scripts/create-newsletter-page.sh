#!/usr/bin/env bash
# Creates the Online Store page at /pages/mailing-list with template "newsletter".
# Shopify does not allow themes or this repo to create pages without Admin API access.
#
# One-time setup:
#   1. Admin → Settings → Apps and sales channels → Develop apps → Create app
#   2. Configure Admin API scopes: read_content, write_content (or write_online_store_pages)
#   3. Install app, reveal Admin API access token
#
# Usage:
#   export SHOPIFY_STORE="your-store.myshopify.com"
#   export SHOPIFY_ADMIN_TOKEN="shpat_..."
#   ./scripts/create-newsletter-page.sh

set -euo pipefail
STORE="${SHOPIFY_STORE:-}"
TOKEN="${SHOPIFY_ADMIN_TOKEN:-}"
API_VERSION="${SHOPIFY_API_VERSION:-2024-10}"

if [[ -z "$STORE" || -z "$TOKEN" ]]; then
  echo "Set SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN (see comments in this script)." >&2
  exit 1
fi

curl -sS -X POST "https://${STORE}/admin/api/${API_VERSION}/pages.json" \
  -H "X-Shopify-Access-Token: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "page": {
      "title": "Mailing list",
      "body_html": "",
      "handle": "mailing-list",
      "published": true,
      "template_suffix": "newsletter"
    }
  }'

echo

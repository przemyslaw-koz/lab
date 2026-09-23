#!/usr/bin/env bash

set -u

COUNT="${1:-50}"
ACCEPTED=0
FAILED=0

RUN_ID="$(date +%s)"

echo "🚀 Sending $COUNT payments..."
echo "🏷️  Run ID: $RUN_ID"
echo

for i in $(seq 1 "$COUNT"); do
  IDEMPOTENCY_KEY="chaos-${RUN_ID}-${i}"

  HTTP_CODE=$(curl -s \
    -o /tmp/payment-response.json \
    -w "%{http_code}" \
    -X POST http://localhost:3000/payments \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: ${IDEMPOTENCY_KEY}" \
    -d '{"amount":9900,"currency":"PLN"}')

  if [ "$HTTP_CODE" = "202" ]; then
    ACCEPTED=$((ACCEPTED + 1))
    echo "✅ [$i/$COUNT] $IDEMPOTENCY_KEY → HTTP $HTTP_CODE"
  else
    FAILED=$((FAILED + 1))
    RESPONSE=$(cat /tmp/payment-response.json)
    echo "❌ [$i/$COUNT] $IDEMPOTENCY_KEY → HTTP $HTTP_CODE → $RESPONSE"
  fi
done

echo
echo "========================="
echo "📊 GENERATOR RESULT"
echo "========================="
echo "Requested: $COUNT"
echo "Accepted:  $ACCEPTED"
echo "Failed:    $FAILED"
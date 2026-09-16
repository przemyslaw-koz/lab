CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    idempotency_key TEXT UNIQUE NOT NULL,

    amount BIGINT NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL,

    status TEXT NOT NULL
        CHECK (status IN (
            'PENDING',
            'PROCESSING',
            'CAPTURED',
            'FAILED',
            'UNKNOWN'
        )),

    lease_until TIMESTAMPTZ NULL,
    lease_version BIGINT NOT NULL DEFAULT 0,
    lease_owner TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY,

    payment_id UUID NOT NULL
        REFERENCES payments(id),

    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,

    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

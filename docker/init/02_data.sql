INSERT INTO id_tags (id_tag, status, expiry_date, created_at, updated_at)
VALUES (
    'zR9d6pBVii2Hv7lnexyK',  --for authorize
    'Accepted',               -- status
    NOW() + INTERVAL '1 year',-- expiry date 1 year from now
    NOW(),
    NOW()), 
    (
    '233A98A7',  -- for start transaction - connector 1
    'Accepted',               -- status
    NOW() + INTERVAL '1 year',-- expiry date 1 year from now
    NOW(),
    NOW()),
    (
    'TBS2206000589',  -- for start transaction - connector 2
    'Accepted',               -- status
    NOW() + INTERVAL '1 year',-- expiry date 1 year from now
    NOW(),
    NOW())
ON CONFLICT (id_tag) DO NOTHING;


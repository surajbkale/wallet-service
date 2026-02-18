CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO asset_types (id, name)
VALUES 
(gen_random_uuid(), 'Gold Coins'),
(gen_random_uuid(), 'Diamonds'),
(gen_random_uuid(), 'Loyalty Points');

INSERT INTO users (id, name)
VALUES
(gen_random_uuid(), 'User_A'),
(gen_random_uuid(), 'User_B'),
(gen_random_uuid(), 'System_Treasury');

INSERT INTO wallets (id, user_id, asset_type_id, balance, version)
SELECT
    gen_random_uuid(),
    u.id,
    a.id,
    0,
    0
FROM users u
CROSS JOIN asset_types a
WHERE a.name = 'Gold Coins';


INSERT INTO ledger_entries (id, wallet_id, amount, entry_type, reference_id)
SELECT
    gen_random_uuid(),
    w.id,
    100,
    'credit',
    'initial_user_a'
FROM wallets w
JOIN users u ON w.user_id = u.id
JOIN asset_types a ON w.asset_type_id = a.id
WHERE u.name = 'User_A' AND a.name = 'Gold Coins';

INSERT INTO ledger_entries (id, wallet_id, amount, entry_type, reference_id)
SELECT
    gen_random_uuid(),
    w.id,
    50,
    'credit',
    'initial_user_b'
FROM wallets w
JOIN users u ON w.user_id = u.id
JOIN asset_types a ON w.asset_type_id = a.id
WHERE u.name = 'User_B' AND a.name = 'Gold Coins';

UPDATE wallets w
SET balance = sub.total 
FROM (
    SELECT wallet_id, SUM(amount) as total
    FROM ledger_entries
    GROUP BY wallet_id
) sub
WHERE w.id = sub.wallet_id;



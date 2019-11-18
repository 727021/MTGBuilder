\echo 'Seeding common_lookup...'

INSERT INTO common_lookup
  (cl_table, cl_column, cl_type)
VALUES
  ('account', 'type', 'default')
, ('account', 'type', 'admin')
, ('deck', 'view', 'private')
, ('deck', 'view', 'friends')
, ('deck', 'view', 'public')
, ('friend', 'status', 'sent')
, ('friend', 'status', 'accepted');

\echo 'Done.'
\echo 'Creating account with username "testuser" and password "password"'

INSERT INTO account
( username
, email
, password
, type)
VALUES
( 'testuser'
, 'user@example.com'
, '$2b$10$l6shy5NrBC/OMj1ijgOyreuc6Ug28t2Eylil40O8DMK41O7KCkx8K' -- 'password'
, (SELECT common_lookup_id
   FROM common_lookup
   WHERE cl_table = 'account'
   AND cl_column = 'type'
   AND cl_type = 'default')
);

\echo 'Done.'
\echo 'Created user:'

SELECT a.account_id AS id, a.username, a.email, c.cl_type, joined
FROM account a, common_lookup c
WHERE a.account_id = currval('account_account_id_seq')
AND c.common_lookup_id = a.type;

\echo 'Restarting sequences at 1001...'
ALTER SEQUENCE account_account_id_seq RESTART WITH 1001;
ALTER SEQUENCE deck_deck_id_seq RESTART WITH 1001;
ALTER SEQUENCE friend_friend_id_seq RESTART WITH 1001;
\echo Done.

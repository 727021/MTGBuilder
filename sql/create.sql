\echo 'Dropping existing tables...'
DROP TABLE IF EXISTS common_lookup, account, deck, friend;
\echo 'Done.'

\echo 'Creating tables...'
CREATE TABLE common_lookup
( common_lookup_id SERIAL      PRIMARY KEY
, cl_table         VARCHAR(30) NOT NULL
, cl_column        VARCHAR(30) NOT NULL
, cl_type          VARCHAR(30) NOT NULL
);

CREATE TABLE account
( account_id SERIAL       PRIMARY KEY
, username   VARCHAR(30)  NOT NULL UNIQUE
, email      VARCHAR(255) NOT NULL UNIQUE
, password   VARCHAR(255) NOT NULL
, status     VARCHAR(255)
, type       INTEGER      NOT NULL REFERENCES common_lookup(common_lookup_id)
, joined     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
, last_login TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deck
( deck_id    SERIAL       PRIMARY KEY
, account_id INTEGER      NOT NULL REFERENCES account(account_id) ON DELETE CASCADE
, title      VARCHAR(255) NOT NULL
, cards      INTEGER[]
, cover      INTEGER
, view       INTEGER      NOT NULL REFERENCES common_lookup(common_lookup_id)
, created    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
, last_edit  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN deck.cards IS 'Array of card IDs';
COMMENT ON COLUMN deck.cover IS 'ID of the card to use as the decks cover image';

CREATE TABLE friend
( friend_id    SERIAL    PRIMARY KEY
, account_from INTEGER   NOT NULL REFERENCES account(account_id) ON DELETE CASCADE
, account_to   INTEGER   NOT NULL REFERENCES account(account_id) ON DELETE CASCADE
, status       INTEGER   NOT NULL REFERENCES common_lookup(common_lookup_id)
, changed_on   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

\echo 'Done.'
\echo 'Created tables:'

\d+ common_lookup
\d+ account
\d+ deck
\d+ friend
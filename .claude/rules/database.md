# Database Rules
Never drop columns or tables without explicit instruction.
Never modify existing migrations — always create new ones.
All jsonb columns must have TypeScript interfaces in src/types/.
Guest IDs use nanoid() — never crypto.randomUUID().
share_token is always separate from id in contracts table.
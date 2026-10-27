/// <reference types="bun-types" />
// Renames EKAM → Crelix in user-visible database content.
//
//   bun scripts/rebrand-db.ts /var/www/ekamai/db/custom.db           # dry run: report only
//   bun scripts/rebrand-db.ts /var/www/ekamai/db/custom.db --apply   # write, in one transaction
//
// Back up the database file before --apply. Safe to run more than once:
// the replacements only match the old names.
//
// Skipped on purpose:
//   - auth tokens, API key hashes, encrypted secrets (must stay byte-exact)
//   - ContactMessage, Ticket, AuditLog (records of what people wrote or did)
import { Database } from "bun:sqlite";

const REPLACEMENTS: [string, string][] = [
  ["EKAM INNOVATIONS LLP", "CRELIX INNOVATIONS LLP"],
  ["https://ekamai.in", "https://www.crelixai.com"],
  ["www.ekamai.in", "www.crelixai.com"],
  ["ekamai.in", "crelixai.com"],
  ["ekamai.app", "crelixai.com"],
  ["EKAM Admin", "Crelix Admin"],
  ["EKAM AI", "Crelix AI"],
  ["Ekam AI", "Crelix AI"],
];

const SKIP_TABLES = new Set([
  "MagicToken",
  "ApiKey",
  "UserKey",
  "UserSecret",
  "ContactMessage",
  "Ticket",
  "AuditLog",
  "_prisma_migrations",
]);
const SKIP_COLUMN = /(hash|cipher|token|secret)$/i;

const [dbPath, flag] = process.argv.slice(2);
if (!dbPath) {
  console.error("usage: bun scripts/rebrand-db.ts <path-to-sqlite.db> [--apply]");
  process.exit(1);
}
const apply = flag === "--apply";

const rename = (value: string) =>
  REPLACEMENTS.reduce((v, [from, to]) => v.split(from).join(to), value);

const db = new Database(dbPath, { readonly: !apply });
const tables = db
  .query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all() as { name: string }[];

type Change = { table: string; column: string; rowid: number; next: string };
const changes: Change[] = [];

for (const { name: table } of tables) {
  if (SKIP_TABLES.has(table)) continue;
  const columns = db.query(`PRAGMA table_info("${table}")`).all() as { name: string; type: string }[];
  for (const { name: column, type } of columns) {
    if (!/text|char|clob/i.test(type) || SKIP_COLUMN.test(column)) continue;
    const rows = db
      .query(
        `SELECT rowid AS rowid, "${column}" AS value FROM "${table}"
         WHERE typeof("${column}") = 'text' AND lower("${column}") LIKE '%ekam%'`
      )
      .all() as { rowid: number; value: string }[];
    for (const { rowid, value } of rows) {
      const next = rename(value);
      if (next !== value) changes.push({ table, column, rowid, next });
    }
  }
}

const summary = new Map<string, number>();
for (const c of changes) summary.set(`${c.table}.${c.column}`, (summary.get(`${c.table}.${c.column}`) ?? 0) + 1);
console.log(apply ? "Applying:" : "Dry run (no changes written). Would update:");
for (const [col, n] of summary) console.log(`  ${col}: ${n} row${n === 1 ? "" : "s"}`);
if (!changes.length) console.log("  nothing to change");

if (apply && changes.length) {
  const skipped: string[] = [];
  db.transaction(() => {
    for (const c of changes) {
      try {
        db.run(`UPDATE "${c.table}" SET "${c.column}" = ? WHERE rowid = ?`, [c.next, c.rowid]);
      } catch (e) {
        /* e.g. a unique email that already exists under the new domain */
        skipped.push(`${c.table}.${c.column} row ${c.rowid}: ${(e as Error).message}`);
      }
    }
  })();
  if (skipped.length) {
    console.log("Skipped (left unchanged):");
    for (const s of skipped) console.log("  " + s);
  }
  console.log(`Done: ${changes.length - skipped.length} values updated.`);
}
db.close();

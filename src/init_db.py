import sqlite3
from pathlib import Path

DB_PATH = Path("database.db")
SCHEMA_PATH = Path("src/schema.sql")
DATA_PATH = Path("src/data.sql")


def load_sql_file(cursor: sqlite3.Cursor, path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    cursor.executescript(sql)


def main() -> None:
    if DB_PATH.exists():
        DB_PATH.unlink()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        load_sql_file(cursor, SCHEMA_PATH)
        load_sql_file(cursor, DATA_PATH)

        conn.commit()


if __name__ == "__main__":
    main()

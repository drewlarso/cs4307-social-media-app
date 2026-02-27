run: database
	uv run fastapi dev src/main.py

database:
	uv run src/init_db.py

shell: database
	sqlite3 database.db
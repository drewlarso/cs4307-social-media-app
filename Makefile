.PHONY: run database clean shell

run: database
	PYTHONPATH="${PYTHONPATH}:${PWD}/src" uv run fastapi dev src/main.py

database: clean
	uv run src/init_db.py

clean:
	rm -f database.db

shell: database
	sqlite3 database.db

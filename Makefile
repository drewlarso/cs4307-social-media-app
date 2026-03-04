.PHONY: run database clean shell test reset

run: database
	PYTHONPATH="${PYTHONPATH}:${PWD}/src" uv run fastapi dev src/main.py

database: clean
	uv run src/init_db.py

clean:
	rm -f database.db

shell: database
	sqlite3 database.db

test: database
	PYTHONPATH="${PYTHONPATH}:${PWD}/src" uv run python tests/test_queries.py

reset: clean database
	@echo "Database reset complete!"

custom:
	uv run src/init_custom_db.py
	uv run fastapi dev src/main.py
PY = ./venv/bin/python3

# Compiles and then restarts the server
all: build restart

build:
	@echo "[COMPILER] Syncing System State..."
	$(PY) compiler.py

# Kills any existing node process and starts a fresh one
restart:
	@echo "[KERNEL] Re-booting..."
	-pkill -f "node server.js"
	node server.js & 

run:
	@echo "[KERNEL] Booting in foreground..."
	node server.js

clean:
	rm -f sys_data.json
	rm -rf venv
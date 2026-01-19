# Define the python inside the virtual env
PY = ./venv/bin/python3

build:
	@echo "Compiling System State..."
	$(PY) compiler.py

run:
	@echo "Booting Kernel (Node.js Server)..."
	node server.js

clean:
	rm -f sys_data.json
	rm -rf venv
## Book Ecommerce

## Run server node:

- B1: Start mysql server in docker desktop:
- B2: Run: npm run dev => http://localhost:9000

### Run server python:

- B1: Create virtual (node module) py -m venv .venv (Run first only)
- B2: source .venv/Scripts/activate
- B3: Choose options python3 ('.venv', .venv) (If not exit => click add path + .venv + Scripts + python.exe)
- B4: python app.py => http://127.0.0.1:9001

## Run app extension:

- B1: Run in terminal _ngrok agent_: ngrok http 3000
- B2: Copy link forward in terminal _ngrock agent_
- B3: Paste in this and run: yarn dev -- --tunnel-url https://d338-14-224-130-250.ngrok-free.app:3000

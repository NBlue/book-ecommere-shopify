from library import create_app
import os
from dotenv import load_dotenv

load_dotenv()
PORT = os.environ.get('PORT')

if __name__ == '__main__':
  app = create_app()
  app.run(debug=True, port=PORT)
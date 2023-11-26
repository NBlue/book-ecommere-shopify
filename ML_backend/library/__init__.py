from flask import Flask, request, Blueprint
from flask_cors import CORS
from .reviews.controller import reviews
from .common.controler import commons

def create_app(config_file='config.py'):
  app = Flask(__name__)
  app.config.from_pyfile(config_file)

  CORS(app)

  app.register_blueprint(commons)
  app.register_blueprint(reviews)
  return app
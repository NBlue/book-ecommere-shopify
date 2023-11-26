from flask import Blueprint, jsonify

commons = Blueprint("commons", __name__)
@commons.route('/')
def commonRoute():
    return jsonify({"name": 'Hello Python Server'})
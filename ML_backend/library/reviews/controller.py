import io
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import TruncatedSVD
from flask import Blueprint, jsonify, request, send_file

from .services import get_popular_books, get_collab_filters_books, train_collab_modal
from ..database import connect_db, disconnect_db, execute_query
plt.style.use("ggplot")

reviews = Blueprint("reviews", __name__)

@reviews.route('/get-all-reviews')
def get_all_ratings():
    connection = connect_db()
    query = "SELECT * FROM books"
    result = execute_query(connection, query)
    disconnect_db(connection)
    df = pd.DataFrame(result['data'], columns=result['columns'])
    print (df)
    return jsonify({'success': True, 'data': result})

# Download all reviews
@reviews.route('/download-all-reviews')
def download_file():
    connection = connect_db()
    query = "SELECT * FROM reviews"
    result = execute_query(connection, query)
    disconnect_db(connection)
    df = pd.DataFrame(result['data'], columns=result['columns'])
    csv_data = io.StringIO()
    df.to_csv(csv_data, index=False)
    
    # Create a response with the CSV data
    response = send_file(
        io.BytesIO(csv_data.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='reviews.csv'
    )
    
    return response

# Product collab filtering
@reviews.route('/training/collab-filter')
def train_collab():
    is_training = train_collab_modal()
    if is_training:
        return jsonify({'success': True,}), 200
    return jsonify({'success': False,}), 404

# /get-recommend?type=popular&count=10
# /get-recommend?type=collab-filter&count=10
@reviews.route('/get-recommend')
def get_recommend():
    count_param = request.args.get('count', default=10, type=int)
    type_param = request.args.get('type', default='popular', type=str)
    handle_param = request.args.get('handle', type=str)

    if(type_param == 'popular'):
        data = get_popular_books(count_param)
    elif(type_param == 'collab-filter'):
        data = get_collab_filters_books(handle_param, count_param)
    return jsonify({'success': True, 'data': data, 'data_length': len(data) })




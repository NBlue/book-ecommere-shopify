import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import TruncatedSVD
from ..database import connect_db, disconnect_db, execute_query
from ..constant import get_all_books
plt.style.use("ggplot")

def train_collab_modal():
    connection = connect_db()
    query = "SELECT * FROM reviews"
    result = execute_query(connection, query)
    disconnect_db(connection)
    
    df = pd.DataFrame(result['data'], columns=result['columns'])
    df = df.dropna()

    # Create matrix userId and handle
    ratings_matrix = df.pivot_table(values='rating', index='userId', columns='handle', fill_value=0)
    ratings_matrix = ratings_matrix.T

    SVD = TruncatedSVD(n_components=10, random_state=42)
    decomposed_matrix = SVD.fit_transform(ratings_matrix)
    correlation_matrix = np.corrcoef(decomposed_matrix)

    matrices_dict = {
    'ratings_matrix': ratings_matrix,
    'correlation_matrix': correlation_matrix
    }
    print(matrices_dict)
    joblib.dump(matrices_dict, 'collab_result.joblib')
    return True


def get_popular_books(count: int = 10):
    connection = connect_db()
    query = "SELECT * FROM reviews"
    result = execute_query(connection, query)
    disconnect_db(connection)
    
    df = pd.DataFrame(result['data'], columns=result['columns'])
    df = df.dropna()
    popular_products = pd.DataFrame(df.groupby('handle')['rating'].count())
    most_popular = popular_products.sort_values('rating', ascending=False)

    most_popular_top = most_popular.head(count)

    books = get_all_books()
    res = pd.merge(most_popular_top, books, how='left', on='handle').fillna('null')
    data = res.reset_index().to_dict(orient='records')

    return data


def get_collab_filters_books(handle: str, count: int = 10):
    if not os.path.exists('collab_result.joblib'):
        print('Not exists collab_result.joblib')
        train_collab_modal()

    collab_result = joblib.load('collab_result.joblib')
    ratings_matrix = collab_result['ratings_matrix']
    correlation_matrix = collab_result['correlation_matrix']

    books_handle = list(ratings_matrix.index)

    handle_i = books_handle.index(handle)

    correlation_handle = correlation_matrix[handle_i]

    Recommend = list(ratings_matrix.index[correlation_handle > 0.90])
    Recommend.remove(handle)

    if count == -1:
      limit = Recommend[0:]
    else: 
      limit = Recommend[0: count]

    books = get_all_books()
    res =  books[books['handle'].isin(limit)].fillna('null')
    data = res.reset_index().to_dict(orient='records')

    return data
import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import TruncatedSVD
from ..database import connect_db, disconnect_db, execute_query
from ..constant import get_all_books
from .cf import CF
plt.style.use("ggplot")

def train_cf_modal():
    if os.path.exists('collab_result.joblib'):
        os.remove('collab_result.joblib')

    if os.path.exists('cf.joblib'):
        os.remove('cf.joblib')

    connection = connect_db()
    query = "SELECT * FROM reviews"
    result = execute_query(connection, query)
    disconnect_db(connection)
    df = pd.DataFrame(result['data'], columns=result['columns'])
    df = df.dropna()

    # Normalize item
    ratings_matrix = df.pivot_table(values='rating', index='userId', columns='handle', fill_value=0)
    ratings_matrix = ratings_matrix.T

    SVD = TruncatedSVD(n_components=10, random_state=42)
    decomposed_matrix = SVD.fit_transform(ratings_matrix)
    correlation_matrix = np.corrcoef(decomposed_matrix)

    matrices_dict = {
    'ratings_matrix': ratings_matrix,
    'correlation_matrix': correlation_matrix
    }
    joblib.dump(matrices_dict, 'collab_result.joblib')

    # Normalize user
    short_df = df[["userId", "productId", "rating"]]
    rating_arr = short_df.values
    rs = CF(rating_arr, k = 30, uuCF = 1)
    rs.fit()
    rs.save_result('cf.joblib')

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

    books = get_all_books()
    merge_df = pd.merge(most_popular, books, how='left', on='handle').fillna('null')
    res = merge_df[merge_df['id'] != 'null'].head(count)
    data = res.reset_index().to_dict(orient='records')

    return data

def get_collab_filters_books(handle: str, count: int = 10):
    if not os.path.exists('collab_result.joblib'):
        print('Not exists collab_result.joblib')
        train_cf_modal()

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

def get_cf_books(email: str, count: int = 10):
    if not os.path.exists('cf.joblib'):
        print('Not exists cf.joblib')
        train_cf_modal()
    collab_result = joblib.load('cf.joblib')

    connection = connect_db()
    query = f"SELECT userId FROM reviews WHERE email = '{email}' LIMIT 1"
    result = execute_query(connection, query)
    query2 = "SELECT * FROM reviews"
    result2 = execute_query(connection, query2)
    disconnect_db(connection)

    recommendIds = collab_result[result['data'][0][0]][:count]

    df = pd.DataFrame(result2['data'], columns=result2['columns'])
    df = df[["productId", "handle"]].dropna().drop_duplicates()
    df = df[df['productId'].isin(recommendIds)]

    books = get_all_books()
    res = pd.merge(df, books, how='left', on='handle').fillna('null')
    data = res.reset_index().to_dict(orient='records')

    print("Recommend: ", collab_result[result['data'][0][0]][:count])
    return data
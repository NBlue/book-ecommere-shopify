import os
import joblib
import pandas as pd
import numpy as np
from scipy import sparse
from scipy.sparse import coo_matrix
from sklearn.metrics.pairwise import cosine_similarity

class CF(object):
    def __init__(self, Y_data, k, dist_func=cosine_similarity, uuCF=1):
        self.uuCF = uuCF
        self.Y_data = Y_data if uuCF else Y_data[:, [1, 0, 2]]  
        self.k = k 
        self.dist_func = dist_func 
        self.Ybar_data = None 
        self.n_users = int(np.max(self.Y_data[:, 0])) + 1
        self.n_items = int(np.max(self.Y_data[:, 1])) + 1

    # Normalize Matrix: medidum of user
    def normalize_Y(self):
        users = self.Y_data[:, 0]  
        self.Ybar_data = self.Y_data.copy() 
        self.mu = np.zeros((self.n_users,)) 
        for n in range(self.n_users): 
            ids = np.where(users == n)[0]
            item_ids = self.Y_data[ids, 1] 
            ratings = self.Y_data[ids, 2] 
            m = np.mean(ratings) 
            if np.isnan(m): 
                m = 0
            self.Ybar_data[ids, 2] = ratings - m 

        self.Ybar = coo_matrix((self.Ybar_data[:, 2],
            (self.Ybar_data[:, 1], self.Ybar_data[:, 0])), (self.n_items, self.n_users)) 
        
        self.Ybar = self.Ybar.tocsr() 

    # Calculate the similar of user or item
    def similarity(self):
        self.S = self.dist_func(self.Ybar.T, self.Ybar.T)

    def fit(self):
        self.normalize_Y()
        self.similarity()

    def __pred(self, u, i, normalized=1):
        ids = np.where(self.Y_data[:, 1] == i)[0].astype(np.int32) 
        users_rated_i = (self.Y_data[ids, 0]).astype(np.int32) 
        sim = self.S[u, users_rated_i] 
        a = np.argsort(sim)[-self.k:] 
        nearest_s = sim[a] 
        r = self.Ybar[i, users_rated_i[a]] 
        if normalized:
            return (r * nearest_s)[0] / (np.abs(nearest_s).sum() + 1e-8)  

        return (r * nearest_s)[0] / (np.abs(nearest_s).sum() + 1e-8) + self.mu[u] 

    def pred(self, u, i, normalized=1):
        if self.uuCF:
            return self.__pred(u, i, normalized)
        return self.__pred(i, u, normalized)

    # Recommend of each user
    def recommend(self, u, normalized=1):
        ids = np.where(self.Y_data[:, 0] == u)[0]  
        items_rated_by_u = self.Y_data[ids, 1].tolist() 
        recommended_items = []
        ratings = []
        for i in range(self.n_items): 
            if i not in items_rated_by_u:  
                rating = self.__pred(u, i)  
                if rating > 0: 
                    ratings.append((i, rating))
        
        ratings.sort(key=lambda x: x[1], reverse=True)
        recommended_items = [item for item, _ in ratings]

        return recommended_items

    # In ra màn hình
    def save_result(self, output_file='collab_result.joblib'):
        result_dict = {} 
        print("Recommend ...")

        for u in range(self.n_users):
            recommended_items = self.recommend(u)
            result_dict[u] = recommended_items

        joblib.dump(result_dict, output_file)
        print(f'Results saved to {output_file}')
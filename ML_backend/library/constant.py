# Get Dataframe:
import os
import pandas as pd

def get_all_books():
  root_dir = os.path.dirname(__file__)
  data_dir =  os.path.join(root_dir, '..', 'data')
  csv_file_path = os.path.join(data_dir, 'books.csv')
  df = pd.read_csv(csv_file_path)
  df.rename(columns={'Handle': 'handle'}, inplace=True)
  return df

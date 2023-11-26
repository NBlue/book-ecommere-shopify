import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()
DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_DATABASE = os.environ.get('DB_DATABASE')

def connect_db():
    connection = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_DATABASE
    )
    return connection

def disconnect_db(connection):
    connection.close()

def execute_query(connection, query):
    cursor = connection.cursor()
    cursor.execute(query)
    data = cursor.fetchall()
    columns = [column[0] for column in cursor.description]
    cursor.close()
    return {"columns": columns, "data": data}

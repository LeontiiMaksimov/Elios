import numpy as np
import csv
import ctypes

class MatrixLogger:
    def __init__(self):
        self.operations = []

    def log_read(self, matrix_name, row, col, value, address):
        self.operations.append(("read", matrix_name, row, col, value, address))

    def log_write(self, matrix_name, row, col, value, address):
        self.operations.append(("write", matrix_name, row, col, value, address))

    def save_to_csv(self, filename):
        with open(filename, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Operation", "Matrix", "Row", "Column", "Value", "Address"])
            writer.writerows(self.operations)

def get_address(array, row, col):
    return ctypes.addressof(ctypes.c_int.from_buffer(array, row * array.strides[0] + col * array.strides[1]))

def matrix_multiply(A, B, logger):
    assert A.shape[1] == B.shape[0], "Incompatible matrices"
    result = np.zeros((A.shape[0], B.shape[1]))

    for i in range(A.shape[0]):
        for j in range(B.shape[1]):
            sum = 0
            for k in range(A.shape[1]):
                # Get addresses
                address_A = get_address(A, i, k)
                address_B = get_address(B, k, j)

                # Log read operations with addresses
                logger.log_read("A", i, k, A[i, k], address_A)
                logger.log_read("B", k, j, B[k, j], address_B)

                sum += A[i, k] * B[k, j]

            # Get address for the result
            address_result = get_address(result, i, j)

            # Log write operation with address
            logger.log_write("Result", i, j, sum, address_result)
            result[i, j] = sum
    return result

# Define two matrices A and B
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Initialize the logger
logger = MatrixLogger()

# Perform matrix multiplication with logging
result = matrix_multiply(A, B, logger)

# Save the logged operations to a CSV file
logger.save_to_csv("matrix_operations.csv")

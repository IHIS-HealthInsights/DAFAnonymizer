import csv
import random


def generate_nric():
    return f'S{random.randrange(1, 10**7):07}X'


data = []
data.append(['NRIC', 'Field1', 'Field2', 'Field3', 'Field4'])
for i in range(1, 1001):
    data.append([
        generate_nric(),
        f'field1_{i}',
        f'field2_{i}',
        f'field3_{i}',
        f'field4_{i}',
    ])


with open('testdata.csv', 'w+') as f:
    writer = csv.writer(f)
    writer.writerows(data)

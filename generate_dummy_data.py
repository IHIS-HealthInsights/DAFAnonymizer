import csv
import random


def generate_nric():
    return f'S{random.randrange(1, 10**7):07}X'


with open('testdata_large.csv', 'w+') as f:
    writer = csv.writer(f)
    writer.writerow(['NRIC', 'ID', 'City', 'Category', 'Age'])

    for i in range(1, 1000000):
        if i % 100 == 0:
            writer.writerow([
                generate_nric(),
                i,
                random.choice(['China', 'Korea']),
                random.choice(['A', 'B', 'C', 'D', 'E']),
                random.randrange(1, 100),
            ])
        else:
            writer.writerow([
                generate_nric(),
                i,
                random.choice(['Singapore', 'US', 'Taiwan']),
                random.choice(['A', 'B', 'C', 'D', 'E']),
                random.randrange(1, 100),
            ])

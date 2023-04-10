import pandas as pd
import numpy as np
import re

POPULATIONS = 'population.csv'
PRICES = 'prices.csv'
FY20 = 'FY20.csv'
FY21 = 'FY21.csv'
FY22 = 'FY22.csv'
FY23 = 'FY23.csv'

def main():
    pops = pd.read_csv(POPULATIONS).set_index('State')
    stamps = pd.concat([pd.read_csv(FY20), pd.read_csv(FY21), pd.read_csv(FY22), pd.read_csv(FY23)]).reset_index()
    # adds Population info to stamps df
    stamps['Population'] = np.nan
    stamps['Year'] = np.nan
    for i in stamps.index:
        year = '20' + stamps['Date'][i][-2:]
        stamps['Population'][i] = pops[year][stamps['State'][i]]
        stamps['Year'][i] = int(year)
    # adds Percentage of population given food stamps to stamps df
    stamps['Percentage'] = stamps['Persons'] / stamps['Population']
    stamps.drop(['index'], axis=1, inplace=True)
    # export df as csv
    stamps.to_csv('cleanstamps.csv', index=False)

    prices = pd.read_csv(PRICES)
    # drops data from 12/2022 (no population data for that month)
    prices['Year'] = np.nan
    for i in prices.index:
        year = '20' + prices['Date'][i][-2:]
        prices['Year'][i] = int(year)
        if prices['Date'][i].startswith('12') and prices['Date'][i].endswith('22'):
            prices.drop(i, inplace=True)
    prices = prices[prices.Category != "Other"]
    # adds Unit Price to prices df
    prices['Unit Price'] = prices['Dollars'] / prices['Unit sales']
    prices.to_csv('cleanprices.csv', index=False)

    average_prices = prices.groupby(['State', 'Category', 'Year'])['Unit Price'].mean().reset_index()
    average_prices.columns = ['State', 'Category', 'Year', 'Average Unit Price']
    average_prices.to_csv('averageprices.csv', index=False)



if __name__ == '__main__':
    main()

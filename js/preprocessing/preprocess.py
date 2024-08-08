# -*- coding: utf-8 -*-
"""
Created on Wed Nov 30 18:12:53 2022

@author: User
"""

import pandas as pd
import numpy as np

#load data from 2019 and add column with year
#======================================================
data19 = pd.read_csv("./data/2019.csv")
data19["Year"] = 2019
#print(data19.head())

#load data from 2018 and add column with year
#======================================================
data18 = pd.read_csv("./data/2018.csv")
data18["Year"] = 2018
#print(data18.head())


#load data from 2017 and add column with year
#======================================================
data17 = pd.read_csv("./data/2017.csv")
data17["Year"] = 2017

#drop columns that are not in all datasets
data17.drop("Whisker.high", inplace=True, axis=1)
data17.drop("Whisker.low", inplace=True, axis=1)
data17.drop("Dystopia.Residual", inplace=True, axis=1)

#rename columns so its homogeneous across datasets
data17.rename(columns={"Happiness.Rank" : "Overall rank", "Happiness.Score" : "Score"
                       , "Economy..GDP.per.Capita." : "GDP per capita", "Family" : "Social support"
                       , "Health..Life.Expectancy." : "Healthy life expectancy", "Freedom" : "Freedom to make life choices"
                       , "Trust..Government.Corruption." : "Perceptions of corruption", "Country" : "Country or region"}, inplace=True)

#print(data17.head())


#load data from 2016 and add column with year
#======================================================
data16 = pd.read_csv("./data/2016.csv")
data16["Year"] = 2016

#drop columns that are not in all datasets
data16.drop("Lower Confidence Interval", inplace=True, axis=1)
data16.drop("Upper Confidence Interval", inplace=True, axis=1)
data16.drop("Dystopia Residual", inplace=True, axis=1)

#rename columns so its homogeneous across datasets
data16.rename(columns={"Country" : "Country or region", "Happiness Rank" : "Overall rank", "Happiness Score" : "Score"
                       , "Economy (GDP per Capita)" : "GDP per capita", "Family" : "Social support"
                       , "Health (Life Expectancy)" : "Healthy life expectancy", "Freedom" : "Freedom to make life choices"
                       , "Trust (Government Corruption)" : "Perceptions of corruption"}, inplace=True)

#print(data16.head())


#load data from 2016 and add column with year
#======================================================
data15 = pd.read_csv("./data/2015.csv")
data15["Year"] = 2015

#drop columns that are not in all datasets
data15.drop("Standard Error", inplace=True, axis=1)
data15.drop("Dystopia Residual", inplace=True, axis=1)

#rename columns so its homogeneous across datasets
data15.rename(columns={"Country" : "Country or region", "Happiness Rank" : "Overall rank", "Happiness Score" : "Score"
                       , "Economy (GDP per Capita)" : "GDP per capita", "Family" : "Social support"
                       , "Health (Life Expectancy)" : "Healthy life expectancy", "Freedom" : "Freedom to make life choices"
                       , "Trust (Government Corruption)" : "Perceptions of corruption"}, inplace=True)
#print(data15.head())





#Get region of countries for datasets that don't have it
data19 = data19.merge(data15, on=["Country or region", "Country or region"], how="inner", suffixes=('', '_y'))
data19.drop(data19.filter(regex='_y$').columns, axis=1, inplace=True)
data18 = data18.merge(data15, on=["Country or region", "Country or region"], how="inner", suffixes=('', '_y'))
data18.drop(data18.filter(regex='_y$').columns, axis=1, inplace=True)
data17 = data17.merge(data15, on=["Country or region", "Country or region"], how="inner", suffixes=('', '_y'))
data17.drop(data17.filter(regex='_y$').columns, axis=1, inplace=True)



#Concatenate all data in one dataframe, rename columns and sort by countries
data = pd.concat([data19, data18, data17, data16, data15])
data.sort_values(by=["Country or region", "Year"], inplace=True)
data.rename( columns = {"Overall rank" : "OverallRank", "Country or region" : "Country", "GDP per capita" : "GDPpCapita", 
                        "Social support" : "SocialSupport", "Healthy life expectancy" : "HealthyLifeExpectancy",
                        "Freedom to make life choices" : "Freedom", "Perceptions of corruption" : "PerceptionCorruption"}, inplace=True)


#Get Country Codes
dataCodes = pd.read_csv("./data/codes.csv")
data['Country'] = data['Country'].replace(['North Cyprus', 'Palestinian Territories', 'Somaliland Region', 'Sudan', 'Congo (Kinshasa)', 'Congo (Brazzaville)', 'Somaliland region'],
                                          ['Cyprus', 'Palestine', 'Somalia', 'South Sudan', 'Democratic Republic of the Congo', 'Congo', 'Somalia'])
data = data.merge(dataCodes, left_on=["Country"], right_on=["name"], how="left")
data.drop(["name", "pop"], inplace=True, axis=1)
data.rename(columns = {"code" : "Code"}, inplace=True)

pd.set_option('display.max_rows', 1000)
#print(data['Code'].isnull())


#find most similar country (discarding GDP) by calculating euclidean distance
closest = {}
minimum = 10

for i in range((data.shape[0])):
    for j in range(data.shape[0]):
        if i == j:
            continue
        d_ij = np.linalg.norm(data.loc[i][["SocialSupport","HealthyLifeExpectancy","Freedom","Generosity","PerceptionCorruption"]] 
                              - data.loc[j][["SocialSupport","HealthyLifeExpectancy","Freedom","Generosity","PerceptionCorruption"]])
        if(d_ij < minimum and (data.loc[i]["Country"] != data.loc[j]["Country"]) ):
            minimum = d_ij
            closest[data.loc[i]["Country"]] = data.loc[j]["Country"]
    minimum = 10

for i in range(data.shape[0]):
    data.at[i,"ClosestCountry"] = closest[data.loc[i]["Country"]]

data.to_csv("./data/merged_data.csv", index=False)



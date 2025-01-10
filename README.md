# Stock Price Prediction with Machine Learning Models

This project explores the application of machine learning models for predicting stock price movements. By leveraging financial indicators and historical stock price data, the models aim to predict the direction of stock price changes.

> **Note:** This project is for educational purposes only and should not be construed as investment advice. The models presented here are experimental and intended for learning purposes. Their performance may not translate to real-world trading scenarios.

---

## Data Collection

- Historical stock price data for a selected set of BIST100 stocks was gathered from [Yahoo Finance](https://finance.yahoo.com).
- The dataset spans from **Jan 1, 1970**, to **December 13, 2023**.

---

## Feature Engineering

To enhance the predictive power of the models, the following technical indicators were employed:

- **Moving Average Convergence Divergence (MACD)**
- **Relative Strength Index (RSI)**
- **Bollinger Bands**
- **Average Directional Index (ADX)**
- **Exponential Moving Average (EMA)**
- **Simple Moving Average (SMA)**

---

## Data Preprocessing

The collected data underwent preprocessing, including:

1. **Imputation of Missing Values**: Handled using the mean imputation strategy.
2. **Target Variable Generation**: Derived by comparing the closing prices on consecutive days to determine the direction of stock price changes.

---

## How to Execute the Project

### 1. Install Dependencies
Ensure you have Python installed on your system. Install the required libraries by executing:

```bash
pip install -r requirements.txt
```

##  2 Get the data 
get The data by executing:



```bash
get__data_from_finance_yahoo.ipynb
```

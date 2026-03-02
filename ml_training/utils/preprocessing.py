"""
Dataset Preprocessing Utilities
Common preprocessing functions for all disease prediction models
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.impute import SimpleImputer
import warnings
warnings.filterwarnings('ignore')


class DataPreprocessor:
    """Base class for data preprocessing"""
    
    def __init__(self, scaler_type='standard'):
        """
        Initialize preprocessor
        
        Args:
            scaler_type: 'standard' or 'minmax'
        """
        if scaler_type == 'standard':
            self.scaler = StandardScaler()
        else:
            self.scaler = MinMaxScaler()
        
        self.label_encoders = {}
        self.imputer = SimpleImputer(strategy='median')
        self.is_fitted = False
    
    def handle_missing_values(self, df, strategy='median'):
        """Handle missing values in dataset"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        # Handle numeric columns
        if strategy == 'median':
            imputer = SimpleImputer(strategy='median')
            df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
        elif strategy == 'mean':
            imputer = SimpleImputer(strategy='mean')
            df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
        elif strategy == 'zero':
            df[numeric_cols] = df[numeric_cols].fillna(0)
        
        # Handle categorical columns
        df[categorical_cols] = df[categorical_cols].fillna('unknown')
        
        return df
    
    def encode_categorical(self, df, exclude_cols=None):
        """Encode categorical variables"""
        if exclude_cols is None:
            exclude_cols = []
        
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if col not in exclude_cols:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
        
        return df
    
    def scale_features(self, X_train, X_test=None, fit=True):
        """Scale features"""
        if fit:
            X_train_scaled = self.scaler.fit_transform(X_train)
            if X_test is not None:
                X_test_scaled = self.scaler.transform(X_test)
                return X_train_scaled, X_test_scaled
            return X_train_scaled
        else:
            if X_test is not None:
                X_test_scaled = self.scaler.transform(X_test)
                return X_test_scaled
            return self.scaler.transform(X_train)
    
    def remove_outliers(self, df, columns=None, method='iqr'):
        """Remove outliers using IQR method"""
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns
        
        df_clean = df.copy()
        
        for col in columns:
            if method == 'iqr':
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                df_clean = df_clean[(df_clean[col] >= lower_bound) & (df_clean[col] <= upper_bound)]
        
        return df_clean


def preprocess_diabetes_data(df):
    """Preprocess diabetes dataset"""
    df = df.copy()
    
    # Replace zeros with NaN for columns where 0 doesn't make sense
    zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    
    for col in zero_cols:
        if col in df.columns:
            df[col] = df[col].replace(0, np.nan)
            df[col].fillna(df[col].median(), inplace=True)
    
    return df


def preprocess_heart_disease_data(df):
    """Preprocess heart disease dataset"""
    df = df.copy()
    
    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if col != 'target':
            df[col].fillna(df[col].median(), inplace=True)
    
    # Ensure target is binary
    if 'target' in df.columns:
        if df['target'].nunique() > 2:
            df['target'] = (df['target'] > 0).astype(int)
    
    return df


def preprocess_kidney_disease_data(df):
    """Preprocess kidney disease dataset"""
    df = df.copy()
    
    preprocessor = DataPreprocessor()
    
    # Encode categorical columns
    target_col = None
    target_cols = ['classification', 'Class', 'class', 'target', 'ckd', 'CKD']
    for col in target_cols:
        if col in df.columns:
            target_col = col
            break
    
    # Clean target column if it exists (remove tab characters, whitespace, convert to lowercase)
    if target_col and target_col in df.columns:
        df[target_col] = df[target_col].astype(str).str.strip().str.replace('\t', '').str.lower()
        # Remove 'id' column if it exists (it's just an identifier, not a feature)
        if 'id' in df.columns:
            df = df.drop('id', axis=1)
    
    exclude_cols = [target_col] if target_col else []
    df = preprocessor.encode_categorical(df, exclude_cols=exclude_cols)
    
    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if col != target_col:
            df[col].fillna(df[col].median(), inplace=True)
    
    return df, preprocessor




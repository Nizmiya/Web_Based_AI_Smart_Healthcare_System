"""
Model Selection Utilities
Multiple algorithms for comparison and selection
"""

from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier,
    AdaBoostClassifier, ExtraTreesClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
import warnings
warnings.filterwarnings('ignore')


def get_classification_models():
    """
    Get a dictionary of classification models with different configurations
    
    Returns:
        Dictionary of model name -> model instance
    """
    models = {
        'Logistic Regression': LogisticRegression(
            max_iter=1000,
            random_state=42,
            solver='lbfgs'
        ),
        'Random Forest (Regularized)': RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=-1
        ),
        'Random Forest (Deep)': RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            random_state=42,
            n_jobs=-1
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42
        ),
        'XGBoost': XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            eval_metric='logloss',
            use_label_encoder=False
        ),
        'SVM (RBF)': SVC(
            kernel='rbf',
            C=1.0,
            gamma='scale',
            probability=True,
            random_state=42
        ),
        'SVM (Linear)': SVC(
            kernel='linear',
            C=1.0,
            probability=True,
            random_state=42
        ),
        'K-Nearest Neighbors': KNeighborsClassifier(
            n_neighbors=5,
            weights='distance'
        ),
        'Naive Bayes': GaussianNB(),
        'Decision Tree': DecisionTreeClassifier(
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42
        ),
        'Extra Trees': ExtraTreesClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        ),
        'AdaBoost': AdaBoostClassifier(
            n_estimators=50,
            learning_rate=1.0,
            random_state=42
        )
    }
    
    return models


def get_recommended_models_for_disease(disease_type):
    """
    Get recommended models for specific disease types
    
    Args:
        disease_type: 'diabetes', 'heart', 'kidney', 'parkinson'
    
    Returns:
        List of (model_name, model_instance) tuples
    """
    all_models = get_classification_models()
    
    recommendations = {
        'diabetes': [
            'Random Forest (Regularized)',
            'XGBoost',
            'Gradient Boosting',
            'Logistic Regression'
        ],
        'heart': [
            'Logistic Regression',
            'Random Forest (Regularized)',
            'SVM (RBF)',
            'XGBoost'
        ],
        'kidney': [
            'Random Forest (Regularized)',
            'Gradient Boosting',
            'SVM (RBF)',
            'XGBoost'
        ]
    }
    
    recommended = recommendations.get(disease_type.lower(), list(all_models.keys())[:4])
    
    return [(name, all_models[name]) for name in recommended if name in all_models]


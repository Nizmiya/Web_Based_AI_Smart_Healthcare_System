"""
Model Evaluation Utilities
Comprehensive evaluation metrics and visualization
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score,
    roc_curve, precision_recall_curve, average_precision_score
)
from sklearn.model_selection import cross_val_score
import warnings
warnings.filterwarnings('ignore')


class ModelEvaluator:
    """Comprehensive model evaluation"""
    
    def __init__(self):
        self.metrics = {}
    
    def evaluate_classification(self, y_true, y_pred, y_proba=None, cv_scores=None):
        """
        Evaluate classification model
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_proba: Predicted probabilities (optional)
            cv_scores: Cross-validation scores (optional)
        """
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0)
        }
        
        # Add ROC AUC if probabilities provided
        if y_proba is not None and len(np.unique(y_true)) == 2:
            try:
                metrics['roc_auc'] = roc_auc_score(y_true, y_proba[:, 1] if y_proba.ndim > 1 else y_proba)
            except:
                pass
        
        # Add cross-validation scores if provided
        if cv_scores is not None:
            metrics['cv_mean'] = np.mean(cv_scores)
            metrics['cv_std'] = np.std(cv_scores)
        
        self.metrics = metrics
        return metrics
    
    def print_evaluation_report(self, y_true, y_pred, model_name="Model"):
        """Print comprehensive evaluation report"""
        print(f"\n{'='*70}")
        print(f"Evaluation Report: {model_name}")
        print(f"{'='*70}")
        
        metrics = self.evaluate_classification(y_true, y_pred)
        
        print(f"\nMetrics:")
        print(f"  Accuracy:  {metrics['accuracy']:.4f}")
        print(f"  Precision: {metrics['precision']:.4f}")
        print(f"  Recall:    {metrics['recall']:.4f}")
        print(f"  F1-Score:  {metrics['f1_score']:.4f}")
        
        if 'roc_auc' in metrics:
            print(f"  ROC AUC:   {metrics['roc_auc']:.4f}")
        
        if 'cv_mean' in metrics:
            print(f"  CV Score:  {metrics['cv_mean']:.4f} (+/- {metrics['cv_std']*2:.4f})")
        
        print(f"\nClassification Report:")
        print(classification_report(y_true, y_pred, zero_division=0))
        
        print(f"\nConfusion Matrix:")
        cm = confusion_matrix(y_true, y_pred)
        print(cm)
        
        return metrics
    
    def check_overfitting(self, train_acc, test_acc, threshold=0.15):
        """
        Check for overfitting
        
        Args:
            train_acc: Training accuracy
            test_acc: Test accuracy
            threshold: Maximum acceptable gap (default 0.15 = 15%)
        
        Returns:
            (is_overfitting, gap)
        """
        gap = train_acc - test_acc
        is_overfitting = gap > threshold
        
        return is_overfitting, gap
    
    def get_best_model(self, models_results):
        """
        Select best model from multiple candidates
        
        Args:
            models_results: List of dicts with keys: name, model, test_acc, train_acc, cv_scores
        
        Returns:
            Best model dict
        """
        best_model = None
        best_score = -1
        
        for result in models_results:
            # Score based on test accuracy and low overfitting
            train_acc = result.get('train_acc', 0)
            test_acc = result.get('test_acc', 0)
            gap = train_acc - test_acc
            
            # Penalize overfitting
            score = test_acc - max(0, gap - 0.1) * 0.5
            
            if score > best_score and test_acc < 1.0:  # Reject 100% accuracy
                best_score = score
                best_model = result
        
        return best_model


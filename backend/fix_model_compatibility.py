"""
Fix scikit-learn model compatibility issue
This script helps resolve version mismatch errors when loading models
"""
import joblib
import os
import sys
from app.core.config import settings

def fix_model_loading():
    """Try to fix model loading with compatibility workarounds"""
    print("="*70)
    print("Fixing Model Compatibility Issues")
    print("="*70)
    
    model_types = ["diabetes", "heart_disease", "kidney_disease"]
    
    for disease_type in model_types:
        model_path = os.path.join(settings.ML_MODELS_PATH, f"{disease_type}_model.pkl")
        
        if not os.path.exists(model_path):
            print(f"\n⚠️  {disease_type} model not found: {model_path}")
            continue
        
        print(f"\n📦 Loading {disease_type} model...")
        
        try:
            # Try normal loading
            model = joblib.load(model_path)
            print(f"✅ {disease_type} model loaded successfully!")
            
        except (AttributeError, ModuleNotFoundError, ImportError) as e:
            error_msg = str(e)
            print(f"❌ Error loading {disease_type} model: {error_msg}")
            
            if '__pyx_unpickle' in error_msg or 'CyHalfBinomialLoss' in error_msg:
                print(f"\n🔧 This is a scikit-learn version compatibility issue.")
                print(f"   The model was trained with a different scikit-learn version.")
                print(f"\n💡 Solutions:")
                print(f"   1. Retrain the model with current scikit-learn version:")
                print(f"      - Current version: Check with 'pip show scikit-learn'")
                print(f"      - Required: scikit-learn==1.3.2 (as per requirements.txt)")
                print(f"\n   2. Or update scikit-learn to match training version:")
                print(f"      - Check training notebook for scikit-learn version used")
                print(f"      - Install matching version: pip install scikit-learn==X.X.X")
                print(f"\n   3. Quick fix - Reinstall scikit-learn:")
                print(f"      pip uninstall scikit-learn -y")
                print(f"      pip install scikit-learn==1.3.2")
                
                return False
    
    print(f"\n{'='*70}")
    print("Model compatibility check complete!")
    print(f"{'='*70}")
    return True

if __name__ == "__main__":
    try:
        fix_model_loading()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
















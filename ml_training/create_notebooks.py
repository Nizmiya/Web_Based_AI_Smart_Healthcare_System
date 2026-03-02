"""Script to create complete Heart Disease and Kidney Disease training notebooks with EDA"""

import json

# Heart Disease Notebook
heart_cells = [
    {
        "cell_type": "markdown",
        "source": [
            "# Heart Disease Prediction Model Training\n\n",
            "**Algorithm:** Logistic Regression\n",
            "**Dataset:** Heart.csv\n",
            "**Target:** Binary Classification (0 = No Heart Disease, 1 = Heart Disease)\n\n",
            "## Steps:\n",
            "1. Load Dataset\n",
            "2. Exploratory Data Analysis (EDA)\n",
            "3. Data Preprocessing\n",
            "4. Train-Test Split\n",
            "5. Model Training (Logistic Regression)\n",
            "6. Model Evaluation & Accuracy\n",
            "7. Save Model"
        ]
    },
    {
        "cell_type": "code",
        "source": [
            "# Step 1: Install Required Libraries (Run once if needed)\n",
            "# !pip install pandas numpy scikit-learn joblib matplotlib seaborn -q"
        ]
    },
    {
        "cell_type": "code",
        "source": [
            "# Step 2: Import Libraries\n",
            "import pandas as pd\n",
            "import numpy as np\n",
            "import os\n",
            "import warnings\n",
            "warnings.filterwarnings('ignore')\n\n",
            "from sklearn.model_selection import train_test_split, cross_val_score\n",
            "from sklearn.metrics import accuracy_score, classification_report, confusion_matrix\n",
            "from sklearn.linear_model import LogisticRegression\n",
            "from sklearn.preprocessing import StandardScaler\n",
            "import joblib\n\n",
            "# For EDA (optional visualization libraries)\n",
            "try:\n",
            "    import matplotlib.pyplot as plt\n",
            "    import seaborn as sns\n",
            "    plt.style.use('seaborn-v0_8')\n",
            "    VISUALIZATION_AVAILABLE = True\n",
            "    print(\"✅ All libraries imported successfully! (with visualization support)\")\n",
            "except ImportError:\n",
            "    VISUALIZATION_AVAILABLE = False\n",
            "    print(\"✅ All libraries imported successfully! (visualization not available)\")"
        ]
    }
]

# Function to create notebook JSON
def create_notebook_json(cells, notebook_name):
    return {
        "cells": cells,
        "metadata": {
            "language_info": {
                "name": "python"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }

# This is a helper script - actual notebooks will be created using edit_notebook tool
# For now, let me continue building notebooks cell by cell
























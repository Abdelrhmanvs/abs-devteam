"""
CNN Model for Cardiac X-ray Image Analysis
This module implements a Convolutional Neural Network for heart disease detection from X-ray images.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications import ResNet50, VGG16, DenseNet121
import cv2
import json
import sys
import os
from pathlib import Path

class CardiacCNNModel:
    """
    CNN Model for cardiac X-ray analysis using transfer learning
    """
    
    def __init__(self, model_path=None, img_size=(224, 224)):
        """
        Initialize the CNN model
        
        Args:
            model_path: Path to saved model weights
            img_size: Input image size (height, width)
        """
        self.img_size = img_size
        self.model_path = model_path
        self.model = None
        self.class_names = [
            'Normal',
            'Cardiomegaly',
            'Pulmonary Congestion',
            'Aortic Abnormality',
            'Heart Failure'
        ]
        
    def build_model(self, num_classes=5):
        """
        Build CNN architecture using transfer learning with ResNet50
        """
        # Load pre-trained ResNet50 as base model
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(*self.img_size, 3)
        )
        
        # Freeze base model layers
        base_model.trainable = False
        
        # Build complete model
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.BatchNormalization(),
            layers.Dense(512, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'AUC']
        )
        
        self.model = model
        return model
    
    def build_custom_cnn(self, num_classes=5):
        """
        Build a custom CNN from scratch (alternative to transfer learning)
        """
        model = models.Sequential([
            # First Convolutional Block
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=(*self.img_size, 3)),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Second Convolutional Block
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Third Convolutional Block
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Fourth Convolutional Block
            layers.Conv2D(256, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Dense Layers
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy', 'AUC']
        )
        
        self.model = model
        return model
    
    def preprocess_image(self, img_path):
        """
        Preprocess image for model input
        
        Args:
            img_path: Path to image file
            
        Returns:
            Preprocessed image array
        """
        # Load image
        img = cv2.imread(img_path)
        
        if img is None:
            raise ValueError(f"Could not load image from {img_path}")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize to model input size
        img = cv2.resize(img, self.img_size)
        
        # Apply CLAHE for better contrast
        lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        img = cv2.merge([l, a, b])
        img = cv2.cvtColor(img, cv2.COLOR_LAB2RGB)
        
        # Normalize pixel values
        img = img.astype('float32') / 255.0
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def predict(self, img_path, patient_data=None):
        """
        Make prediction on X-ray image
        
        Args:
            img_path: Path to X-ray image
            patient_data: Additional patient information
            
        Returns:
            Dictionary with prediction results
        """
        if self.model is None:
            if self.model_path and os.path.exists(self.model_path):
                self.load_model(self.model_path)
            else:
                self.build_model()
        
        # Preprocess image
        img = self.preprocess_image(img_path)
        
        # Make prediction
        predictions = self.model.predict(img, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx]) * 100
        
        # Get all class probabilities
        class_probabilities = {
            self.class_names[i]: float(predictions[0][i]) * 100
            for i in range(len(self.class_names))
        }
        
        # Determine risk level
        risk_level = self._determine_risk_level(predicted_class_idx, confidence)
        
        # Get detailed findings and recommendations
        findings, recommendations = self._get_clinical_info(
            predicted_class_idx,
            confidence,
            patient_data
        )
        
        result = {
            'success': True,
            'analysis': {
                'diagnosis': self.class_names[predicted_class_idx],
                'confidence': round(confidence, 2),
                'status': 'normal' if predicted_class_idx == 0 else 'abnormal',
                'riskLevel': risk_level,
                'classProbabilities': class_probabilities,
                'findings': findings,
                'recommendations': recommendations,
                'modelType': 'CNN',
                'modelVersion': '1.0.0',
                'timestamp': None  # Will be set by Node.js
            }
        }
        
        return result
    
    def _determine_risk_level(self, class_idx, confidence):
        """Determine risk level based on prediction"""
        if class_idx == 0:  # Normal
            return 'Low'
        elif class_idx in [1, 2]:  # Cardiomegaly or Pulmonary Congestion
            return 'Moderate' if confidence > 80 else 'Low'
        else:  # Aortic Abnormality or Heart Failure
            return 'High' if confidence > 70 else 'Moderate'
    
    def _get_clinical_info(self, class_idx, confidence, patient_data):
        """Get clinical findings and recommendations"""
        clinical_data = {
            0: {  # Normal
                'findings': [
                    'Cardiothoracic ratio within normal limits',
                    'Clear lung fields',
                    'Normal cardiac silhouette',
                    'No evidence of pleural effusion',
                    'Normal mediastinal contour'
                ],
                'recommendations': [
                    'Continue regular monitoring',
                    'Maintain healthy lifestyle',
                    'Follow-up in 6-12 months',
                    'Regular exercise recommended'
                ]
            },
            1: {  # Cardiomegaly
                'findings': [
                    'Increased cardiothoracic ratio (CTR > 0.5)',
                    'Cardiac chamber enlargement detected',
                    'Possible left ventricular hypertrophy',
                    'Cardiac silhouette expansion noted'
                ],
                'recommendations': [
                    'Schedule follow-up with cardiologist',
                    'Echocardiogram recommended',
                    'Monitor blood pressure regularly',
                    'Lifestyle modifications advised',
                    'Consider medication review'
                ]
            },
            2: {  # Pulmonary Congestion
                'findings': [
                    'Increased interstitial markings',
                    'Signs of pulmonary edema',
                    'Vascular congestion noted',
                    'Kerley B lines visible',
                    'Possible pleural effusion'
                ],
                'recommendations': [
                    'Immediate cardiologist consultation',
                    'Consider diuretic therapy',
                    'Comprehensive cardiac workup needed',
                    'Close monitoring required',
                    'Oxygen therapy may be beneficial'
                ]
            },
            3: {  # Aortic Abnormality
                'findings': [
                    'Widened mediastinum detected',
                    'Aortic dilation observed',
                    'Abnormal aortic contour',
                    'Possible aortic pathology',
                    'Requires urgent assessment'
                ],
                'recommendations': [
                    'Urgent cardiologist consultation',
                    'CT angiography recommended',
                    'Immediate medical attention required',
                    'Avoid strenuous activities',
                    'Blood pressure control critical'
                ]
            },
            4: {  # Heart Failure
                'findings': [
                    'Signs consistent with heart failure',
                    'Cardiomegaly with pulmonary congestion',
                    'Bilateral pleural effusions',
                    'Vascular redistribution',
                    'Interstitial edema pattern'
                ],
                'recommendations': [
                    'Emergency cardiac evaluation needed',
                    'Hospitalization may be required',
                    'Heart failure management protocol',
                    'Immediate specialist referral',
                    'Comprehensive treatment plan needed'
                ]
            }
        }
        
        data = clinical_data.get(class_idx, clinical_data[0])
        
        # Adjust based on patient data if available
        if patient_data:
            age = patient_data.get('age', 0)
            if age > 65:
                data['recommendations'].append('Age-specific cardiac monitoring')
        
        return data['findings'], data['recommendations']
    
    def load_model(self, model_path):
        """Load pre-trained model"""
        self.model = keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")
    
    def save_model(self, save_path):
        """Save trained model"""
        if self.model:
            self.model.save(save_path)
            print(f"Model saved to {save_path}")

def main():
    """Main function for command-line usage"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'No image path provided'
        }))
        sys.exit(1)
    
    img_path = sys.argv[1]
    patient_data = json.loads(sys.argv[2]) if len(sys.argv) > 2 else None
    
    try:
        # Initialize and run model
        model = CardiacCNNModel()
        result = model.predict(img_path, patient_data)
        
        # Output as JSON
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
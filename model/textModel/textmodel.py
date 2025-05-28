import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import numpy as np
import tensorflow as tf
from PIL import Image
import imageio
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Allow cross-origin requests
CORS(app)

# Set up directories for image uploads and outputs
UPLOAD_FOLDER = './static/uploads'
OUTPUT_FOLDER = './static/output'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Load the text steganography model
model = tf.keras.models.load_model('models/text_steganography_model.keras', compile=False)

# Preprocessing functions
def preprocess_image(image):
    image = np.array(image) / 255.0  # Normalize pixel values
    return np.expand_dims(image, axis=0)  # Add batch dimension

def decode_image(image):
    image = np.squeeze(image)  # Remove batch dimension
    image = np.uint8(image * 255.0)  # Convert back to image
    return Image.fromarray(image)

# Routes for Flask

@app.route('/upload', methods=['POST'])
def encode_text():
    if 'image' not in request.files or 'hidden_text' not in request.form:
        return jsonify({"error": "No image or hidden text provided"}), 400

    image_file = request.files['image']
    hidden_text = request.form['hidden_text']

    if image_file:
        image_filename = secure_filename(image_file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
        image_file.save(image_path)

        # Call the function to encode hidden text into the image
        stego_image_path = encode_text_into_image(image_path, hidden_text)

        return jsonify({"stego_image_url": stego_image_path})

    return jsonify({"error": "Invalid file type"}), 400

@app.route('/decode', methods=['POST'])
def decode_text():
    if 'stegano_image' not in request.files:
        return jsonify({"error": "No stego image uploaded"}), 400

    stego_image_file = request.files['stegano_image']

    if stego_image_file:
        stego_image_filename = secure_filename(stego_image_file.filename)
        stego_image_path = os.path.join(app.config['UPLOAD_FOLDER'], stego_image_filename)
        stego_image_file.save(stego_image_path)

        # Call the function to decode hidden text from the image
        decoded_text = decode_text_from_image(stego_image_path)

        return jsonify({"decoded_text": decoded_text})

    return jsonify({"error": "Invalid file type"}), 400


# Function to encode text into the image
def encode_text_into_image(image_path, hidden_text):
    # Load the image
    image = Image.open(image_path).convert('RGB')

    # Preprocess the image
    image = preprocess_image(image)

    # Prepare the hidden text (convert it to a numerical format that can be fed into the model)
    text_vector = np.array([ord(c) for c in hidden_text.ljust(100, ' ')])  # Ensure 100 character length
    text_vector = np.expand_dims(text_vector, axis=0)

    # Predict the stego image
    stego_image = model.predict([image, text_vector])

    # Decode the stego image back to an image format
    stego_image = decode_image(stego_image)

    # Save the stego image
    stego_image_filename = 'stego_' + os.path.basename(image_path)
    stego_image_path = os.path.join(app.config['OUTPUT_FOLDER'], stego_image_filename)
    stego_image.save(stego_image_path)

    return stego_image_path

# Function to decode the hidden text from the stego image
def decode_text_from_image(stego_image_path):
    # Load the stego image
    stego_image = Image.open(stego_image_path).convert('RGB')

    # Preprocess the stego image
    stego_image = preprocess_image(stego_image)

    # Predict the hidden text from the stego image
    decoded_vector = model.predict(stego_image)

    # Convert the decoded vector back to text (assuming the model outputs a list of character codes)
    decoded_text = ''.join([chr(int(c)) for c in decoded_vector[0]])

    return decoded_text.strip()

if __name__ == '__main__':
    app.run(debug=True)

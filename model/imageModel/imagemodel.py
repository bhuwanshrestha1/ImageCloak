import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import tensorflow as tf
import numpy as np
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

# Load models
hide_model = tf.keras.models.load_model('models/hide.h5', compile=False)
reveal_model = tf.keras.models.load_model('models/reveal.h5', compile=False)

# Preprocessing functions
def normalize_batch(images):
    return (images - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])

def denormalize_batch(images, should_clip=True):
    images = (images * np.array([0.229, 0.224, 0.225])) + np.array([0.485, 0.456, 0.406])
    if should_clip:
        images = np.clip(images, 0, 1)
    return images

def resize_image(image, target_size=(224, 224)):
    width, height = image.size
    target_width, target_height = target_size
    aspect_ratio = width / height
    if width < height:
        new_width = target_width
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = target_height
        new_width = int(new_height * aspect_ratio)
    image = image.resize((new_width, new_height))
    new_image = Image.new('RGB', target_size, (0, 0, 0))
    new_image.paste(image, ((target_width - new_width) // 2, (target_height - new_height) // 2))
    return new_image

# Routes for Flask

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'cover_image' not in request.files or 'secret_image' not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    cover_image = request.files['cover_image']
    secret_image = request.files['secret_image']

    if cover_image and secret_image:
        cover_image_filename = secure_filename(cover_image.filename)
        secret_image_filename = secure_filename(secret_image.filename)

        cover_image_path = os.path.join(app.config['UPLOAD_FOLDER'], cover_image_filename)
        secret_image_path = os.path.join(app.config['UPLOAD_FOLDER'], secret_image_filename)

        cover_image.save(cover_image_path)
        secret_image.save(secret_image_path)

        # Call the hide_image function to create the stego image
        stego_image_path = hide_image(cover_image_path, secret_image_path)

        return jsonify({"stego_image_url": stego_image_path})
    return jsonify({"error": "Invalid file types"}), 400

@app.route('/reveal', methods=['POST'])
def reveal_image_from_file():
    if 'stego_image' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    stego_image = request.files['stego_image']

    if stego_image:
        stego_image_filename = secure_filename(stego_image.filename)
        stego_image_path = os.path.join(app.config['UPLOAD_FOLDER'], stego_image_filename)
        stego_image.save(stego_image_path)

        # Call the reveal_image function to extract the secret image
        secret_image_out = reveal_image(stego_image_path, reveal_model)

        # Save the revealed image
        secret_image_filename = 'revealed_' + stego_image_filename
        secret_image_out_path = os.path.join(app.config['OUTPUT_FOLDER'], secret_image_filename)
        imageio.imsave(secret_image_out_path, secret_image_out)

        return jsonify({"secret_image_url": secret_image_out_path})

    return jsonify({"error": "Invalid file type"}), 400

def hide_image(cover_image_filepath, secret_image_filepath):
    secret_image_in = Image.open(secret_image_filepath).convert('RGB')
    cover_image_in = Image.open(cover_image_filepath).convert('RGB')

    secret_image_in = resize_image(secret_image_in)
    cover_image_in = resize_image(cover_image_in)

    secret_image_in = np.array(secret_image_in).reshape(1, 224, 224, 3) / 255.0
    cover_image_in = np.array(cover_image_in).reshape(1, 224, 224, 3) / 255.0

    steg_image_out = hide_model.predict([normalize_batch(secret_image_in), normalize_batch(cover_image_in)])

    steg_image_out = denormalize_batch(steg_image_out)
    steg_image_out = np.squeeze(steg_image_out) * 255.0
    steg_image_out = np.uint8(steg_image_out)

    stego_image_path = os.path.join(app.config['OUTPUT_FOLDER'], 'steg_image.png')
    imageio.imsave(stego_image_path, steg_image_out)

    return stego_image_path

def reveal_image(stego_image_filepath, model):
    stego_image = Image.open(stego_image_filepath).convert('RGB')
    stego_image = resize_image(stego_image)
    stego_image = np.array(stego_image).reshape(1, 224, 224, 3) / 255.0

    secret_image_out = model.predict([normalize_batch(stego_image)])
    secret_image_out = denormalize_batch(secret_image_out)

    secret_image_out = np.squeeze(secret_image_out) * 255.0
    secret_image_out = np.uint8(secret_image_out)

    return secret_image_out

if __name__ == '__main__':
    app.run(debug=True)

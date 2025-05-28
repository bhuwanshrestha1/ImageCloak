# ImageCloak: Deep Learning-Based Image Steganography System
ImageCloak is an advanced image steganography web application that enables users to securely embed and extract hidden text or images within digital images using Convolutional Neural Networks (CNNs). Designed for secure communication, it preserves the visual integrity of the cover image while ensuring high imperceptibility and robustness.

# 🔐 Features
User Authentication
Secure Login & Registration: JWT-based authentication to manage user sessions and access controls.

Steganography Capabilities
Text and Image Embedding: Hide secret text or image within a cover image using CNNs.

Data Extraction: Accurately decode the hidden content from stego-images.

Encryption Support: Secure the embedded data with a stego-key before hiding.

File Management
MongoDB Integration: Efficient storage and retrieval of user data and stego-images.

Image Upload & Sharing: Users can upload cover/secret images and share encoded images securely.

Communication
Contact Management: Add trusted contacts for secure file exchanges.

Secure Sharing: Encrypted and validated file transmission between users.

Robust Architecture
MERN Stack: Built using MongoDB, Express.js, React.js, and Node.js for high performance and scalability.

Model Integration: Deep learning models trained in TensorFlow and served via Flask API.

# 🧠 Technology Stack
Frontend
React.js: Interactive and responsive UI

Tailwind CSS: Modern and sleek styling

Axios: Handles HTTP requests

Backend
Node.js + Express.js: REST API & routing

Flask: Serves deep learning models for steganographic processing

Database
MongoDB: Stores users, images, and messages

GridFS: Efficient image storage and retrieval

Machine Learning
TensorFlow: Trained CNNs for encoding/decoding

Jupyter Notebooks: Model experimentation and training

# 📊 Model Performance
Text Encoding Accuracy: 91.48%

Image Embedding Results:

SSIM: 0.8898

PSNR: 31.12 dB

# 🎯 Applications
Confidential communication in corporate, government, and military sectors

Secure digital watermarking

Medical image privacy

Real estate documentation

Academic research confidentiality

🚀 Future Enhancements
GAN-based steganography for even better security

Audio steganography support

Stego image preview and edit options

Certificate-based user access control

Advanced steganalysis detection countermeasures
# 📸 Screenshots
(Insert screenshots showing UI of encoding, decoding, contact list, and file sharing features)

# 📚 Learning Outcomes
Applied CNNs for real-world information security applications

Gained experience in full-stack development using MERN

Integrated machine learning with web development

Learned agile project development and model performance evaluation

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
![image](https://github.com/user-attachments/assets/442a69dc-039f-40ce-90c4-b680f7608461)
![image](https://github.com/user-attachments/assets/258c5c00-aaff-48d1-82a4-505126948446)

![image](https://github.com/user-attachments/assets/8b6f7b26-fc17-4aca-8be2-63e8dff7869d)
![image](https://github.com/user-attachments/assets/caab9ca5-fe0b-4d34-9238-a7869a7fa77b)
![image](https://github.com/user-attachments/assets/12c8b931-f5a1-4a73-9a07-cd13d1e4d066)
![image](https://github.com/user-attachments/assets/f3efe7f2-82d6-47ee-8f18-bd8b1e721830)
![image](https://github.com/user-attachments/assets/06093f61-4664-4652-9576-c967c71e56c4)


# 📚 Learning Outcomes
Applied CNNs for real-world information security applications

Gained experience in full-stack development using MERN

Integrated machine learning with web development

Learned agile project development and model performance evaluation

# ⚙️ Environment Variables
Before running the project, create a .env file in the root directory and add the following variables:

PORT=5000
MONGO_URL=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

⚠️ Be sure to replace the placeholder values with your actual credentials. Never commit your .env file to version control.

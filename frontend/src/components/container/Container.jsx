import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import image from './image.png';

const Container = () => {
  const { authUser } = useAuthContext();

  return (
    <div className="flex-1 p-1 bg-gray-800 text-white overflow-auto">
      <div className="max-w-4xl mx-auto bg-gray-700 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-semibold text-center text-gray-100 mb-6">
          Welcome to ImageCloak, {authUser?.fullname}
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Image Steganography is the practice of concealing secret information within an image. Traditionally, this technique relies on embedding data in the least significant bits (LSBs) of an image's pixel data. However, with the advancement of machine learning, specifically Convolutional Neural Networks (CNNs), the process of image steganography has evolved, allowing for more robust, efficient, and secure data hiding methods.
        </p>

        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-gray-200">Image Steganography Using CNNs:</h2>
          <p className="text-lg text-gray-300 mb-4">
            CNNs are a class of deep learning algorithms that are particularly well-suited for processing images. They consist of multiple layers that extract features from an image, such as edges, textures, and patterns. In the context of image steganography, CNNs can be used to automatically learn how to encode and decode secret messages in a way that is harder to detect by human observers or traditional detection methods.
          </p>
          <p className="text-lg text-gray-300 mb-4">
            A CNN can be trained to hide data within an image by modifying certain pixel patterns in a way that is visually imperceptible. The network learns how to embed the secret data in the image by adjusting the color, brightness, or other properties of the image pixels. This approach allows for more complex, adaptive, and secure steganography techniques compared to traditional methods.
          </p>

          <div className="flex justify-center">
            <img 
              src={image} 
              alt="CNN-based Image Steganography" 
              className="rounded-lg shadow-lg mt-4"
              style={{ width: '500px', height: '150px' }}
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-medium text-gray-200">Applications of CNN-based Image Steganography:</h2>
          <ul className="list-disc pl-6 text-lg text-gray-300 space-y-4">
            <li><strong>Secure Communication:</strong> CNN-based steganography enables secure communication by hiding messages or files in images, making it extremely difficult for unauthorized users to detect the presence of hidden data.</li>
            <li><strong>Digital Watermarking:</strong> CNNs can be used to embed watermarks in images, ensuring that intellectual property is protected and can be traced back to the original owner.</li>
            <li><strong>Medical Imaging:</strong> Sensitive medical data, such as patient records, can be securely embedded within medical images (e.g., MRIs or X-rays) without compromising image quality or patient privacy.</li>
            <li><strong>Digital Forensics:</strong> CNN-based steganography can be used for embedding forensic data or tags into images, helping to trace the origins of digital media and authenticate images in the context of legal investigations.</li>
            <li><strong>Bypassing Censorship:</strong> In regions where access to information is restricted, CNN-based steganography can be used to hide messages in images, allowing users to bypass censorship systems and communicate freely.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Container;

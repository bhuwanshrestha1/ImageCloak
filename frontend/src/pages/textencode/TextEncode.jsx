import React, { useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';

// Encode text into an image by modifying pixel data
const encodeTextToImage = (imageSrc, text) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Encode text onto the image (basic approach, could be improved)
      const encodedImage = ctx.getImageData(0, 0, img.width, img.height);
      const data = encodedImage.data;
      let textIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (textIndex < text.length) {
          data[i] = text.charCodeAt(textIndex); // Store each character's ASCII value in the red channel
          textIndex++;
        } else {
          break;
        }
      }

      ctx.putImageData(encodedImage, 0, 0);
      const stegoImage = canvas.toDataURL('image/png');
      resolve(stegoImage);
    };
  });
};

// Decode text from the image by reading pixel data
const decodeTextFromImage = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const encodedImage = ctx.getImageData(0, 0, img.width, img.height);
      const data = encodedImage.data;
      let text = '';
      let charCode = 0;
      for (let i = 0; i < data.length; i += 4) {
        charCode = data[i]; // Read the character's ASCII value from the red channel
        if (charCode === 0) {
          // Stop decoding when a 0 (null character) is encountered
          break;
        }
        text += String.fromCharCode(charCode);
      }
      resolve(text);
    };
  });
};

const TextEncode = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [text, setText] = useState('');
  const [isEncoding, setIsEncoding] = useState(true);
  const [stegoImage, setStegoImage] = useState(null);
  const [decodedText, setDecodedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Preview uploaded image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    // Reset all states to their initial values
    setImagePreview(null);
    setText('');
    setStegoImage(null);
    setDecodedText(null);
    setIsEncoding(true);
    document.getElementById('image-upload').value = null; // Reset file input
  };

  const handleEncodeClick = async () => {
    if (!imagePreview || !text) return;

    setIsProcessing(true);
    const encodedImage = await encodeTextToImage(imagePreview, text);
    setStegoImage(encodedImage);
    setIsProcessing(false);
  };

  const handleDecodeClick = async () => {
    if (!imagePreview) return;

    setIsProcessing(true);
    const decoded = await decodeTextFromImage(imagePreview);
    setDecodedText(decoded);
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (stegoImage) {
      const a = document.createElement('a');
      a.href = stegoImage;
      a.download = 'stego_image.png'; // Set file name
      document.body.appendChild(a); // Append anchor to body for some browsers
      a.click(); // Trigger download
      document.body.removeChild(a); // Clean up
    } else {
      console.log('No encoded image available to download.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div id="text-encode" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              onClick={() => setIsEncoding(true)}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                flex: 1,
              }}
            >
              Encode Text
            </button>
            <button
              onClick={() => setIsEncoding(false)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                flex: 1,
              }}
            >
              Decode Text
            </button>
          </div>

          {isEncoding ? (
            // Encoding UI
            <div className="card" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Encode Text into Image</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ marginBottom: '10px', width: '100%' }}
                  />
                  <textarea
                    style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                    placeholder="Enter text to encode"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                      onClick={handleEncodeClick}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        flex: 1,
                      }}
                    >
                      {isProcessing ? 'Encoding...' : 'Encode'}
                    </button>
                    <button
                      onClick={handleReset}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        flex: 1,
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div style={{ flex: 2 }}>
                  <div
                    style={{
                      textAlign: 'center',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      padding: '20px',
                    }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                    ) : (
                      <div style={{ color: '#6c757d' }}>No Image Uploaded</div>
                    )}
                  </div>
                </div>
              </div>
              {stegoImage && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={handleDownload}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '4px',
                    }}
                  >
                    Download Encoded Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Decoding UI
            <div className="card" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Decode Text from Image</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ marginBottom: '10px', width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                      onClick={handleDecodeClick}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        flex: 1,
                      }}
                    >
                      {isProcessing ? 'Decoding...' : 'Decode'}
                    </button>
                    <button
                      onClick={handleReset}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        flex: 1,
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div style={{ flex: 2 }}>
                  <div
                    style={{
                      textAlign: 'center',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      padding: '20px',
                    }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                    ) : (
                      <div style={{ color: '#6c757d' }}>No Image Uploaded</div>
                    )}
                  </div>
                </div>
              </div>
              {decodedText && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Decoded Text:</h4>
                  <textarea
                    value={decodedText}
                    readOnly
                    style={{
                      width: '100%',
                      height: '100px',
                      borderRadius: '4px',
                      padding: '10px',
                      border: '1px solid #ced4da',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TextEncode;

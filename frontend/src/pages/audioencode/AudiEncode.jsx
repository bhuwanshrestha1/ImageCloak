import React, { useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';

// Helper function to encode audio into an image
const encodeAudioToImage = (imageSrc, audioSrc) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Read the audio file and extract the audio data using AudioContext
      const audio = new Audio(audioSrc);
      audio.onloadeddata = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();

        reader.onloadend = () => {
          audioContext.decodeAudioData(reader.result, (buffer) => {
            const audioData = buffer.getChannelData(0); // Use the first channel
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let audioIndex = 0;
            for (let i = 0; i < data.length && audioIndex < audioData.length; i += 4) {
              const audioByte = Math.floor(audioData[audioIndex] * 255); // Convert to 8-bit value
              data[i] = (data[i] & 0xFE) | ((audioByte >> 7) & 0x01); // Red channel
              data[i + 1] = (data[i + 1] & 0xFE) | ((audioByte >> 6) & 0x01); // Green channel
              data[i + 2] = (data[i + 2] & 0xFE) | ((audioByte >> 5) & 0x01); // Blue channel
              data[i + 3] = (data[i + 3] & 0xFE) | ((audioByte >> 4) & 0x01); // Alpha channel
              audioIndex++;
            }

            ctx.putImageData(imageData, 0, 0);
            const encodedImageUrl = canvas.toDataURL('image/png');
            resolve(encodedImageUrl); // Resolve with the encoded image URL
          });
        };

        reader.readAsArrayBuffer(audioSrc); // Read the audio file as an ArrayBuffer
      };
    };
  });
};

// Helper function to decode audio from an image
const decodeAudioFromImage = (imageSrc) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let audioArray = [];
      for (let i = 0; i < data.length; i += 4) {
        const audioByte = (
          ((data[i] & 0x01) << 7) |
          ((data[i + 1] & 0x01) << 6) |
          ((data[i + 2] & 0x01) << 5) |
          ((data[i + 3] & 0x01) << 4)
        );
        audioArray.push(audioByte); // Collect bytes for audio data
      }

      // Create a fake audio file from the byte array
      const audioBlob = new Blob([new Uint8Array(audioArray)], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      resolve(audioUrl); // Resolve with the decoded audio URL
    };
  });
};

const AudioImageSteganography = () => {
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [encodedImage, setEncodedImage] = useState(null);
  const [decodedAudio, setDecodedAudio] = useState(null);
  const [isEncoding, setIsEncoding] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAudioPreview(reader.result); // Preview uploaded audio
      };
      reader.readAsDataURL(file);
    }
  };

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
    setAudioPreview(null);
    setImagePreview(null);
    setEncodedImage(null);
    setDecodedAudio(null);
    setIsEncoding(true);
    document.getElementById('audio-upload').value = null;
    document.getElementById('image-upload').value = null;
  };

  const handleEncodeClick = async () => {
    if (!audioPreview || !imagePreview) return;

    setIsProcessing(true);
    const encodedImageUrl = await encodeAudioToImage(imagePreview, audioPreview);
    setEncodedImage(encodedImageUrl);
    setIsProcessing(false);
  };

  const handleDecodeClick = async () => {
    if (!imagePreview) return;

    setIsProcessing(true);
    const decodedAudioUrl = await decodeAudioFromImage(imagePreview);
    setDecodedAudio(decodedAudioUrl);
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (encodedImage) {
      const a = document.createElement('a');
      a.href = encodedImage;
      a.download = 'encoded_image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      console.log('No encoded image available to download.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div id="audio-encode" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
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
              Encode Audio to Image
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
              Decode Audio from Image
            </button>
          </div>

          {isEncoding ? (
            <div className="card" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Encode Audio into Image</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    style={{ marginBottom: '10px', width: '100%' }}
                  />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ marginBottom: '10px', width: '100%' }}
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
                      padding: '10px',
                      borderRadius: '8px',
                    }}
                  >
                    <h5>Image Preview</h5>
                    {imagePreview && <img src={imagePreview} alt="image preview" style={{ width: '100%' }} />}
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      border: '1px solid #ced4da',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '20px',
                    }}
                  >
                    <h5>Audio Preview</h5>
                    {audioPreview && <audio controls src={audioPreview} />}
                  </div>
                  {encodedImage && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>Encoded Image</h4>
                      <img src={encodedImage} alt="encoded" style={{ width: '100%' }} />
                      <button onClick={handleDownload} style={{ marginTop: '10px', padding: '10px 20px' }}>
                        Download Encoded Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Decode Audio from Image</h3>
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
                      padding: '10px',
                      borderRadius: '8px',
                    }}
                  >
                    <h5>Image Preview</h5>
                    {imagePreview && <img src={imagePreview} alt="image preview" style={{ width: '100%' }} />}
                  </div>
                  {decodedAudio && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>Decoded Audio</h4>
                      <audio controls src={decodedAudio} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AudioImageSteganography;

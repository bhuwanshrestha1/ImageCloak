import React, { useState } from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';

// Helper function to encode audio into an image
const encodeAudioToImage = (imageSrc, audioArrayBuffer) => {
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

      // Convert audio ArrayBuffer to Uint8Array
      const audioData = new Uint8Array(audioArrayBuffer);

      // Check if the image can store the audio data
      const maxAudioSize = (data.length / 4) * 1; // 1 bit per pixel
      if (audioData.length > maxAudioSize) {
        alert(`Image too small to store audio. Maximum audio size: ${Math.floor(maxAudioSize / 1024)} KB`);
        return;
      }

      let audioIndex = 0;

      // Embed audio data into the LSBs of the image pixels
      for (let i = 0; i < data.length && audioIndex < audioData.length; i += 4) {
        const audioByte = audioData[audioIndex];
        data[i] = (data[i] & 0xFE) | ((audioByte >> 7) & 0x01); // Red channel
        data[i + 1] = (data[i + 1] & 0xFE) | ((audioByte >> 6) & 0x01); // Green channel
        data[i + 2] = (data[i + 2] & 0xFE) | ((audioByte >> 5) & 0x01); // Blue channel
        data[i + 3] = (data[i + 3] & 0xFE) | ((audioByte >> 4) & 0x01); // Alpha channel
        audioIndex++;
      }

      ctx.putImageData(imageData, 0, 0);
      const encodedImageUrl = canvas.toDataURL('image/png');
      resolve(encodedImageUrl); // Resolve with the encoded image URL
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
          ((data[i + 3] & 0x01) << 4
        ))
        audioArray.push(audioByte); // Collect bytes for audio data
      }

      // Create a WAV file from the decoded audio data
      const wavHeader = createWavHeader(audioArray.length);
      const wavData = new Uint8Array(wavHeader.length + audioArray.length);
      wavData.set(wavHeader, 0);
      wavData.set(new Uint8Array(audioArray), wavHeader.length);

      const audioBlob = new Blob([wavData], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      resolve(audioUrl); // Resolve with the decoded audio URL
    };
  });
};

// Helper function to create a WAV file header
const createWavHeader = (dataLength) => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for mono)
  view.setUint32(24, 44100, true); // SampleRate (44.1kHz)
  view.setUint32(28, 44100 * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // Data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // Subchunk2Size (data size)

  return new Uint8Array(buffer);
};

// Helper function to write a string to a DataView
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
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
    const audioFile = document.getElementById('audio-upload').files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const encodedImageUrl = await encodeAudioToImage(imagePreview, reader.result);
      setEncodedImage(encodedImageUrl);
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(audioFile);
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
          {/* Toggle between Encode and Decode */}
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
import { useEffect, useRef, useState } from "react";


const CameraCapture = ({ label, value, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
     
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      setError("Camera not available on this device or permission was denied - use the file option below.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.72));
    stopCamera();
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="camera-capture">
      {label && <label>{label}</label>}

      {value ? (
        <div className="camera-preview">
          <img src={value} alt="Captured" />
          <button type="button" className="btn btn-outline" onClick={() => onCapture(null)}>
            Retake photo
          </button>
        </div>
      ) : live ? (
        <div className="camera-live">
          <video ref={videoRef} playsInline muted />
          <div className="camera-actions">
            <button type="button" className="btn btn-primary" onClick={capture}>📸 Capture</button>
            <button type="button" className="btn btn-outline" onClick={stopCamera}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="camera-actions">
          <button type="button" className="btn btn-outline" onClick={startCamera}>📷 Open camera</button>
          <label className="btn btn-quiet camera-file-label">
            Upload photo instead
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />
          </label>
        </div>
      )}

      {error && <div className="camera-error">{error}</div>}
    </div>
  );
};

export default CameraCapture;

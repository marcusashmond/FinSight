import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.name.endsWith('.csv')) setFile(f);
    else alert('Please select a CSV file.');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await uploadAPI.upload(file);
      setStatus({ type: 'success', message: `Successfully imported ${res.data.inserted} transactions.` });
      setFile(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Upload Transactions</h1>
      <p className="text-gray-500 text-sm">
        Upload a CSV file with columns: <code className="bg-gray-100 px-1 rounded">date, amount, merchant, category</code>
      </p>

      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />
        {file ? (
          <p className="text-indigo-600 font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-gray-400 text-sm">Drag & drop your CSV here, or click to browse</p>
          </>
        )}
      </div>

      {status && (
        <p className={`text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {status.message}
        </p>
      )}

      <button
        disabled={!file || loading}
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default Upload;

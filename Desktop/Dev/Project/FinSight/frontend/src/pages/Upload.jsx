import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const SAMPLE_CSV = `date,amount,merchant,category
2026-04-01,-45.50,Walmart,Groceries
2026-04-02,-12.00,Starbucks,Dining
2026-04-03,-9.99,Netflix,Subscriptions
2026-04-05,2500.00,Direct Deposit,Income
2026-04-07,-60.00,Shell,Transport`;

const downloadSample = () => {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
};

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.name.endsWith('.csv')) { setFile(f); setStatus(null); setImported(null); }
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
    setImported(null);
    try {
      const res = await uploadAPI.upload(file);
      setImported(res.data.transactions);
      setStatus({ type: 'success', message: `Successfully imported ${res.data.inserted} transaction${res.data.inserted !== 1 ? 's' : ''}.` });
      setFile(null);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Transactions</h1>
        <button onClick={downloadSample}
          className="text-sm border border-indigo-600 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition">
          Download Sample CSV
        </button>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Upload a CSV with columns: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">date, amount, merchant, category</code>
        <br />Negative amounts are treated as expenses, positive as income. Category is auto-detected if omitted.
      </p>

      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
          dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />
        {file ? (
          <div>
            <p className="text-indigo-600 font-medium">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 text-sm">Drag & drop your CSV here, or click to browse</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Max 5MB</p>
          </div>
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

      {imported?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <h2 className="font-semibold">Imported Transactions</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Date', 'Merchant', 'Category', 'Amount'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {imported.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{tx.merchant || '—'}</td>
                  <td className="px-4 py-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs">{tx.category}</span>
                  </td>
                  <td className={`px-4 py-2 font-semibold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {fmt(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Upload;

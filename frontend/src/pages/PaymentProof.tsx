import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, EyeIcon, TrashIcon,
  ExclamationTriangleIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';

interface PaymentProof {
  _id: string;
  commissionId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
  verifiedAt?: string;
}

interface Commission {
  _id: string;
  commissionAmount: number;
  status: string;
  productInfo: {
    name: string;
    price: number;
  };
  saleInfo: {
    amount: number;
    saleDate: string;
  };
  paymentProof?: PaymentProof;
}

const PaymentProof: React.FC = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/commissions/my-commissions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions);
      } else {
        setError('Failed to fetch commissions');
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
      setError('Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid file type (JPEG, PNG, or PDF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCommission) {
      setError('Please select a file and commission');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('commissionId', selectedCommission);

      // Upload file
      const response = await fetch('/api/commissions/upload-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Payment proof uploaded successfully!');
        setSelectedFile(null);
        setSelectedCommission(null);
        setUploadProgress(0);
        
        // Refresh commissions
        await fetchCommissions();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const pendingCommissions = commissions.filter(c => c.status === 'pending' && !c.paymentProof);
  const uploadedProofs = commissions.filter(c => c.paymentProof);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Payment Proof
              </h1>
              <p className="text-gray-600 mt-1">
                Upload proof of payments to receive your commissions
              </p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {pendingCommissions.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Payment Proof
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select a commission and upload proof of payment
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Commission Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Commission
                  </label>
                  <select
                    value={selectedCommission || ''}
                    onChange={(e) => setSelectedCommission(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a commission...</option>
                    {pendingCommissions.map((commission) => (
                      <option key={commission._id} value={commission._id}>
                        {commission.productInfo.name} - {formatCurrency(commission.commissionAmount)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Proof
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {selectedFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF up to 5MB
                        </p>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedCommission || uploading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Proof'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Proofs */}
        {uploadedProofs.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Uploaded Proofs
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Track the status of your uploaded payment proofs
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {uploadedProofs.map((commission) => (
                  <div key={commission._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {commission.productInfo.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Commission: {formatCurrency(commission.commissionAmount)}
                        </p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(commission.paymentProof!.verificationStatus)}`}>
                        {getStatusIcon(commission.paymentProof!.verificationStatus)}
                        <span className="ml-1 capitalize">
                          {commission.paymentProof!.verificationStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        <span>{commission.paymentProof!.fileName}</span>
                      </div>
                      <span>Uploaded: {formatDate(commission.paymentProof!.uploadedAt)}</span>
                    </div>

                    {commission.paymentProof!.verificationNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Admin Notes:</strong> {commission.paymentProof!.verificationNotes}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => window.open(commission.paymentProof!.fileUrl, '_blank')}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Proof
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Proofs Message */}
        {uploadedProofs.length === 0 && pendingCommissions.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payment proofs to upload
            </h3>
            <p className="text-gray-600">
              You don't have any pending commissions that require payment proof.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentProof; 
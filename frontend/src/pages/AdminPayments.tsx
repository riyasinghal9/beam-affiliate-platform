import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Payment {
  paymentId: string;
  resellerId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  status: string;
  adminApproval: string;
  commissionAmount: number;
  createdAt: string;
  adminNotes?: string;
}

interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  totalRevenue: number;
  monthlyStats: {
    payments: number;
    revenue: number;
  };
  weeklyStats: {
    payments: number;
    revenue: number;
  };
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/payments/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/payments/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const endpoint = action === 'approve' 
        ? `http://localhost:5001/api/admin/payments/${paymentId}/approve`
        : `http://localhost:5001/api/admin/payments/${paymentId}/reject`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          notes: approvalNotes,
          reason: approvalNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowApprovalModal(false);
        setApprovalNotes('');
        setSelectedPayment(null);
        fetchPayments();
        fetchStats();
        alert(`Payment ${action}d successfully!`);
      } else {
        alert(data.message || `Failed to ${action} payment`);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Approved
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-4 h-4 mr-1" />
          Rejected
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-4 h-4 mr-1" />
          Pending
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">Payment Management</h1>
              <p className="text-lg text-gray-600">
                Review and approve customer payments for reseller commissions
              </p>
            </div>
          </div>
        </div>

          {/* Stats Cards */}
          <div>
            {stats && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <CurrencyDollarIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <DocumentTextIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPayments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <ClockIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <UserGroupIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved Payments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.approvedPayments}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Requests</h3>
                  <p className="text-gray-600 mt-1">
                    Review and approve payment requests from resellers
                  </p>
                </div>
                <div className="flex items-center text-sm text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-lg">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {stats?.pendingPayments || 0} Pending
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reseller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{payment.paymentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                        <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full inline-block">
                          {payment.resellerId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">${payment.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">${payment.commissionAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.adminApproval)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.adminApproval === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowApprovalModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Review Payment</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Payment ID</p>
                      <p className="text-gray-900 font-semibold">{selectedPayment.paymentId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Customer</p>
                      <p className="text-gray-900 font-semibold">{selectedPayment.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Amount</p>
                      <p className="text-green-600 font-bold">${selectedPayment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Commission</p>
                      <p className="text-blue-600 font-bold">${selectedPayment.commissionAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Add notes about this payment..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(selectedPayment.paymentId, 'reject')}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    border: '2px solid #b91c1c',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => handleApproval(selectedPayment.paymentId, 'approve')}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    border: '2px solid #047857',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#047857';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }}
                >
                  ✅ Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments; 
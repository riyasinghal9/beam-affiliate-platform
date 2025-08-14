import React from 'react';

const Transactions: React.FC = () => {
  const transactions = [
    {
      id: '1',
      productName: 'Beam Wallet Installation',
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      productPrice: 75,
      commissionAmount: 37.50,
      paymentStatus: 'Confirmed',
      commissionStatus: 'Paid',
      date: '2024-01-15T10:30:00Z',
      transactionId: 'TXN-20240115-001'
    },
    {
      id: '2',
      productName: 'Commercial Agent License',
      customerName: 'Maria Garcia',
      customerEmail: 'maria@example.com',
      productPrice: 150,
      commissionAmount: 60,
      paymentStatus: 'Confirmed',
      commissionStatus: 'Paid',
      date: '2024-01-14T14:20:00Z',
      transactionId: 'TXN-20240114-002'
    },
    {
      id: '3',
      productName: 'Premium Support Package',
      customerName: 'David Wilson',
      customerEmail: 'david@example.com',
      productPrice: 200,
      commissionAmount: 70,
      paymentStatus: 'Pending',
      commissionStatus: 'Pending',
      date: '2024-01-13T09:15:00Z',
      transactionId: 'TXN-20240113-003'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Track all your sales and commission payments
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header with Filters */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Transactions</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Status</option>
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {transaction.transactionId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.paymentStatus)}`}>
                        {transaction.paymentStatus}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.commissionStatus)}`}>
                        {transaction.commissionStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer:</span>
                      <span className="text-sm font-medium text-gray-900">{transaction.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Product:</span>
                      <span className="text-sm font-medium text-gray-900">{transaction.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">${transaction.productPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Commission:</span>
                      <span className="text-sm font-medium text-green-600">+${transaction.commissionAmount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.transactionId}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.productName}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${transaction.productPrice}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        +${transaction.commissionAmount}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.paymentStatus)}`}>
                          {transaction.paymentStatus}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.commissionStatus)}`}>
                          {transaction.commissionStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
                <span className="font-medium">3</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Previous
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions; 
  // Send payment (alias for transferCommission)
  async sendPayment(resellerId, amount, transactionId, description) {
    try {
      // Mock implementation for development
      console.log("Mock payment processing for commission:", amount, "to reseller:", resellerId);
      
      // Simulate successful payment
      return {
        success: true,
        transactionId: transactionId || `txn_${Date.now()}`,
        status: "completed",
        amount: amount
      };
    } catch (error) {
      console.error("Send payment error:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

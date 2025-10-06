// components/PaymentForm.jsx
import React, { useState, useEffect } from 'react';

const PaymentForm = ({ order, orderType = 'hold' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState('');

  const handlePayment = async (paymentMethod) => {
    setIsProcessing(true);
    setError('');

    try {
      let response;
      
      if (orderType === 'instant') {
        // For instant orders - create and confirm payment intent
        const intentResponse = await fetch('/api/flights/payment-intent/create/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            offer_amount: order.total_amount,
            offer_currency: order.total_currency,
            customer_currency: order.total_currency
          })
        });
        
        const intentData = await intentResponse.json();
        
        if (!intentResponse.ok) {
          throw new Error(intentData.error || 'Payment failed');
        }

        // Confirm payment intent
        response = await fetch('/api/flights/payment-intent/confirm/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_intent_id: intentData.payment_intent.id,
            payment_method: paymentMethod
          })
        });
      } else {
        // For hold orders - direct payment
        response = await fetch('/api/flights/hold-order/pay/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            amount: order.total_amount,
            currency: order.total_currency,
            payment_type: 'balance' // or 'card' based on your implementation
          })
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setPaymentStatus('succeeded');
      
      // Redirect to success page
      window.location.href = `/flights/payment/success?order_id=${order.id}`;

    } catch (err) {
      setError(err.message);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Redirecting to confirmation page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Complete Payment</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-semibold">
            {order.total_currency} {order.total_amount}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Order: {order.booking_reference || order.id}
        </div>
      </div>

      <button
        onClick={() => handlePayment({ type: 'balance' })}
        disabled={isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#5A53A7] hover:bg-[#4a4490]'
        } transition-colors`}
      >
        {isProcessing ? 'Processing...' : `Pay ${order.total_currency} ${order.total_amount}`}
      </button>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Your payment is secure and encrypted</p>
      </div>
    </div>
  );
};

export default PaymentForm;
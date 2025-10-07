'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiXCircle, FiAlertCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const tran_id = searchParams.get('tran_id');
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    if (status === 'cancelled') {
      return 'You cancelled the payment process.';
    }
    if (error === 'no_transaction') {
      return 'No transaction ID was found.';
    }
    if (error === 'payment_not_found') {
      return 'Payment transaction not found in our system.';
    }
    return 'Your payment could not be processed.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white py-12 px-4 md:px-[190px]">
      <div className="max-w-3xl mx-auto">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <FiXCircle className="text-red-600 text-5xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
          </h1>
          <p className="text-lg text-gray-600">
            {getErrorMessage()}
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
          {tran_id && (
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-start">
                <div className="bg-gray-50 p-2 rounded-lg mr-3">
                  <FiAlertCircle className="text-gray-600 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{tran_id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-600 text-xl mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  What happened?
                </h3>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Your payment was not completed</li>
                  <li>No charges have been made to your account</li>
                  <li>Your booking was not confirmed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Troubleshooting Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Check your payment details</p>
                  <p className="text-sm text-gray-600">
                    Ensure you entered correct card number, expiry date, and CVV
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verify sufficient balance</p>
                  <p className="text-sm text-gray-600">
                    Make sure you have enough funds or credit limit available
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Try a different payment method</p>
                  <p className="text-sm text-gray-600">
                    Use an alternative card or payment option if available
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact your bank</p>
                  <p className="text-sm text-gray-600">
                    Your bank may have declined the transaction for security reasons
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:opacity-90 transition flex items-center justify-center"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 bg-white text-[#5A53A7] px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition border-2 border-[#5A53A7] text-center flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Support Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-800 mb-4">
            If you continue to experience issues, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/support"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition text-center"
            >
              Contact Support
            </Link>
            <Link
              href="/faq"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition border border-blue-200 text-center"
            >
              View FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
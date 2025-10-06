"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaBoxOpen, FaHome } from "react-icons/fa";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tran_id');
  const [orderCreated, setOrderCreated] = useState(false);

  useEffect(() => {
    // Clear cart and any pending checkout data
    localStorage.removeItem("pendingCheckout");
    localStorage.removeItem("appliedDiscounts");
    
    // Optionally clear cart items if needed
    // localStorage.removeItem("cart");
    
    console.log("✅ Payment successful, checkout data cleared");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <FaCheckCircle className="text-4xl text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {tranId && (
          <p className="text-sm text-gray-500 mb-6">
            Transaction ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {tranId}
            </span>
          </p>
        )}

        <div className="flex flex-col gap-4">
          <Link
            href="/profile?tab=orders"
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FaBoxOpen className="mr-2" />
            View My Orders
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <FaHome className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
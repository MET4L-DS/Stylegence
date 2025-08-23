"use client";
import React from "react";
import Script from "next/script";
import axios from "axios";

export default function PaymentButton({ amount, description, userInfo }: { amount: number; description: string; userInfo: any; }) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Create Razorpay order (api route)
      const orderRes = await axios.post("/api/createOrder", { amount: amount * 100, currency: "INR" }); // RxPay expects paise
      const order = orderRes.data;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Fashion Aggregator",
        description,
        order_id: order.id,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        handler: async function (response: any) {
          // Optionally verify payment server-side
          await axios.post("/api/verifyOrder", {
            razorpay_order_id: order.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert("Payment Successful!");
        },
        theme: { color: "#3399cc" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        alert("Payment failed. Please try again.");
        console.error(response.error);
      });
      razorpay.open();
    } catch (error) {
      alert("Payment failed. Please try again.");
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700" onClick={handlePayment} disabled={isLoading}>
        {isLoading ? "Processing..." : "Pay Now"}
      </button>
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
}

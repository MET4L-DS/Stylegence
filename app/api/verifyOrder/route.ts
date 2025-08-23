import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const sign_str = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected_signature = crypto.createHmac("sha256", secret).update(sign_str).digest("hex");
    if (expected_signature === razorpay_signature) {
      // Update payment status in Convex database here
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    }
    return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Verification failure", success: false }, { status: 500 });
  }
}

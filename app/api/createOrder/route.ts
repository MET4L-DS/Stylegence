import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Load from .env.local
const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

const razorpay = new Razorpay({ key_id, key_secret });

export type OrderBody = { amount: number; currency: string; };

export async function POST(req: NextRequest) {
  try {
    const { amount, currency }: OrderBody = await req.json();
    // Amount is in paise. Multiply by 100.
    const options = {
      amount,
      currency: currency || "INR",
      receipt: `receipt#${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Order creation failed", error }, { status: 500 });
  }
}

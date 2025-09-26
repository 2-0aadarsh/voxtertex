import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

console.log("🔑 Razorpay Key ID Loaded:", process.env.RAZORPAY_KEY_ID ? "✅ Present" : "❌ Missing");
console.log("🔑 Razorpay Key Secret Loaded:", process.env.RAZORPAY_KEY_SECRET ? "✅ Present" : "❌ Missing");


let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function createPaymentOrder(amount, currency = "INR", receiptId) {
  if (!razorpay) {
    console.warn("⚠️ Razorpay not configured. Using mock order.");
    return {
      provider: "mock",
      orderId: `mock_${Date.now()}`,
      amount,
      currency
    };
  }

  try {
    const options = {
      amount,
      currency,
      receipt: receiptId,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return {
      provider: "razorpay",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    };
  } catch (error) {
    console.error("❌ Razorpay order creation failed:", error);
    throw new Error(error.error?.description || "Failed to create Razorpay order");
  }
}


export { razorpay };

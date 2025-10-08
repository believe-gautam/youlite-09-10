// src/utils/razorpay.ts
import RazorpayCheckout from 'react-native-razorpay';
import Colors from "./Colors";

interface RazorpayOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  // This is the corrected line
  notes?: Record<string | number, string>;
}

export const initiateRazorpayPayment = (options: RazorpayOptions): Promise<any> => {
  const { amount, currency = 'INR', receipt, notes = {} } = options;

  return new Promise((resolve, reject) => {
    // The CheckoutOptions type from the library is being inferred here.
    // The 'notes' property now correctly matches the expected type.
    let razorpayOptions = {
      description: 'Payment for your order',
      image: 'https://your-logo-url.com/logo.png', // Add your app logo URL
      currency: currency,
      key: 'rzp_test_FJYTnEjRKeWmIK', // Replace with your actual Razorpay key ID
      amount: amount * 100, // Razorpay expects amount in paise (multiply by 100)
      name: 'Youlite', // Replace with your app name
      order_id: '', // You can generate order_id from your server first
      prefill: {
        email: 'customer@example.com', // You can prefill customer details
        contact: '9999999999',
        name: 'Customer Name',
      },
      theme: { color: Colors.PRIMARY }, // Use your app's primary color
      notes: notes,
    };

    RazorpayCheckout.open(razorpayOptions)
      .then((data) => {
        // Handle successful payment
        console.log('Payment successful: ', data);
        resolve(data);
      })
      .catch((error) => {
        // Handle payment failure
        console.error('Payment failed: ', error);
        reject(error);
      });
  });
};
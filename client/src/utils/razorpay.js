import axios from "axios";
import { API_URL } from "./api";

let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout. Please try again."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const startAppointmentPayment = async ({ appointmentId, token, user }) => {
  if (!appointmentId) {
    throw new Error("appointmentId is required to start payment");
  }

  if (!token) {
    throw new Error("Please log in again to continue with payment");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const orderResponse = await axios.post(
    `${API_URL}/payments/create-order`,
    { appointmentId },
    { headers }
  );

  const Razorpay = await loadRazorpayScript();
  const { keyId, order, appointment } = orderResponse.data;

  return new Promise((resolve, reject) => {
    const razorpay = new Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "JustifAi",
      description: "Consultation booking payment",
      order_id: order.id,
      handler: async (response) => {
        try {
          const verificationResponse = await axios.post(
            `${API_URL}/payments/verify`,
            {
              appointmentId,
              ...response,
            },
            { headers }
          );

          resolve({
            order,
            appointment,
            verification: verificationResponse.data,
          });
        } catch (error) {
          reject(
            new Error(
              error.response?.data?.error ||
                "Payment was completed, but verification failed."
            )
          );
        }
      },
      modal: {
        ondismiss: () => {
          reject(
            new Error(
              "Payment window was closed. You can complete payment later from My Appointments."
            )
          );
        },
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: {
        color: "#2563eb",
      },
    });

    razorpay.on("payment.failed", (response) => {
      reject(
        new Error(
          response.error?.description ||
            "Payment failed. Please try again with a different method."
        )
      );
    });

    razorpay.open();
  });
};

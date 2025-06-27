// Razorpay utility functions

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = async ({
  orderId,
  amount,
  currency = 'INR',
  name = 'ReCarNation',
  description,
  orderRzpId,
  userDetails,
  onSuccess,
  onFailure,
  onDismiss
}) => {
  // Load Razorpay script if not already loaded
  const isScriptLoaded = await loadRazorpayScript();
  
  if (!isScriptLoaded) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  // Razorpay options
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay expects amount in paisa
    currency: currency,
    name: name,
    description: description || `Payment for Order #${orderId}`,
    order_id: orderRzpId, // This should be the Razorpay order ID from backend
    handler: function (response) {
      // Payment successful
      onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        orderId: orderId
      });
    },
    prefill: {
      name: userDetails?.name || '',
      email: userDetails?.email || '',
      contact: userDetails?.phone || ''
    },
    notes: {
      order_id: orderId
    },
    theme: {
      color: '#ea580c' // Orange color matching your theme
    },
    modal: {
      ondismiss: function() {
        if (onDismiss) {
          onDismiss();
        }
      }
    }
  };

  // Create Razorpay instance and open payment modal
  const rzp = new window.Razorpay(options);
  
  rzp.on('payment.failed', function (response) {
    onFailure({
      error: response.error,
      orderId: orderId
    });
  });

  rzp.open();
};

// Format amount for display
export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
import React from 'react';


const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I list my car for sale?",
      answer: "To list your car, click on 'Sell Your Car' in the navigation menu, fill out the required information about your vehicle, upload photos, and submit the listing. Make sure to provide accurate details and clear photos."
    },
    {
      question: "How can I contact a seller?",
      answer: "Once you find a car you're interested in, you can contact the seller through the messaging system on our platform. Click the 'Contact Seller' button on the car listing page."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various payment methods including bank transfers, credit cards, and secure payment gateways. The specific payment options will be discussed between the buyer and seller."
    },
    {
      question: "How do I know if a car listing is legitimate?",
      answer: "We verify all sellers and listings. Look for the verified badge on listings and check the seller's profile for reviews and ratings. Always meet in person to inspect the vehicle before making a payment."
    },
    {
      question: "Can I negotiate the price?",
      answer: "Yes, you can negotiate the price with the seller through our messaging system. However, please be respectful and reasonable in your negotiations."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">

      <div className="max-w-4xl mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Still Need Help?</h2>
            <p className="mb-4">If you can't find the answer to your question, our support team is here to help.</p>
            <a href="/contact-us" className="text-blue-600 hover:text-blue-800">
              Contact Support →
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HelpCenter; 
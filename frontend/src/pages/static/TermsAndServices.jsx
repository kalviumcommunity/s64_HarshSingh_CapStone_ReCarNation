import React from 'react';

const TermsAndServices = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using ReCarNation, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
            <p className="text-gray-700">
              Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Listing Guidelines</h2>
            <p className="text-gray-700">
              All car listings must be accurate and truthful. Misrepresentation of vehicles is strictly prohibited and may result in account termination.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Privacy Policy</h2>
            <p className="text-gray-700">
              Our Privacy Policy, which sets out how we will use your information, can be found at our Privacy Policy page. By using this website, you consent to the processing of your information as described in the Privacy Policy.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-700">
              ReCarNation shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>
        </div>
      </div>

    </div>
  );
};

export default TermsAndServices; 
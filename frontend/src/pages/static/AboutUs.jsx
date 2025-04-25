import React from 'react';


const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen">

      <div className="max-w-4xl mx-auto py-8 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6">About ReCarNation</h1>
        <div className="space-y-6">
          <p className="text-gray-700">
            ReCarNation is a premier online marketplace dedicated to connecting car buyers and sellers across the nation. 
            Our platform makes it easy to buy, sell, and trade vehicles with confidence.
          </p>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To revolutionize the car buying and selling experience by providing a secure, transparent, and user-friendly platform 
              that puts the power back in the hands of consumers.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-gray-700">
              To become the most trusted and preferred platform for automotive transactions, known for our commitment to 
              customer satisfaction and innovation in the automotive industry.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutUs; 
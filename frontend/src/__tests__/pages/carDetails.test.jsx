import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import CarDetailsPage from '../../pages/carDetails';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock components
jest.mock('../../components/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('../../components/footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('@/components/ui/tabs', () => {
  const React = require('react');
  return {
    Tabs: ({ defaultValue, children }) => {
      const [activeTab, setActiveTab] = React.useState(defaultValue);
      return (
        <div data-tabs data-active-tab={activeTab}>
          {React.Children.map(children, child =>
            React.cloneElement(child, { activeTab, setActiveTab })
          )}
        </div>
      );
    },
    TabsList: ({ children }) => <div data-tablist>{children}</div>,
    TabsTrigger: ({ value, children, activeTab, setActiveTab }) => (
      <button 
        data-tab-trigger={value}
        data-state={activeTab === value ? 'active' : ''}
        onClick={() => setActiveTab(value)}
      >
        {children}
      </button>
    ),
  TabsContent: ({ value, children, activeTab }) => (
    <div 
      data-tab-content={value}
      data-state={activeTab === value ? 'active' : ''}
      style={{ display: activeTab === value ? 'block' : 'none' }}
      role="region"
      aria-label={value}
    >
      {children}
    </div>
  )
  };
});

// Mock fetch globally
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockCarData)
  })
);

// Mock modules
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-car-id' }),
  useNavigate: () => jest.fn(),
}));

const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Mock car data
const mockCarData = {
  _id: 'test-car-id',
  title: 'Test Car',
  price: 25000,
  images: [
    { url: 'image1.jpg' },
    { url: 'image2.jpg' }
  ],
  year: 2020,
  mileage: 50000,
  fuelType: 'Petrol',
  transmission: 'Automatic',
  location: 'Test Location',
  description: 'Test Description',
  exteriorColor: 'Black',
  interiorColor: 'Beige',
  engine: '2.0L I4',
  drive: 'FWD',
  mpg: '25 city / 32 hwy',
  features: ['GPS Navigation', 'Leather Seats', 'Sunroof'],
  seller: {
    name: 'Test Seller',
    rating: 4.5,
    verified: true,
    avatar: 'https://example.com/avatar.jpg',
    responseRate: 95,
    responseTime: '2 hours',
    memberSince: 'Jan 2023',
    listingsCount: 5
  }
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CarDetailsPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CarDetailsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear fetch mock
    global.fetch.mockClear();
    // Clear axios mock
    axios.get.mockClear();
  });

  // Helper to mock fetch response
  const mockFetchResponse = (data, status = 200) => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: status === 200,
        status,
        json: () => Promise.resolve(data)
      })
    );
  };

  beforeEach(() => {
    // Setup default fetch mock for each test
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCarData)
      })
    );
  });

  // Test 1: Loading State
  it('displays loading state initially', () => {
    // Mock fetch but don't resolve it yet
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading car details...')).toBeInTheDocument();
  });

  // Test 2: Successful Data Loading
  it('displays car details when data is loaded successfully', async () => {
    mockFetchResponse(mockCarData);
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock wishlist check

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockCarData.title)).toBeInTheDocument();
      expect(screen.getByText(`₹${mockCarData.price.toLocaleString()}`)).toBeInTheDocument();
      expect(screen.getByText(mockCarData.description)).toBeInTheDocument();
    });
  });

  // Test 3: Error State
  it('displays error message when data fetching fails', async () => {
    mockFetchResponse(null, 404);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Car not found')).toBeInTheDocument();
    });
  });

  // Test 4: Wishlist Toggle - Not Logged In
  it('redirects to login when trying to add to wishlist without being logged in', async () => {
    mockFetchResponse(mockCarData);
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    renderComponent();
    
    await waitFor(() => {
      const wishlistButton = screen.getByText('Wishlist');
      fireEvent.click(wishlistButton);
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  // Test 5: Edge Case - No Images
  it('displays placeholder when car has no images', async () => {
    const carDataWithNoImages = {
      ...mockCarData,
      images: []
    };
    
    mockFetchResponse(carDataWithNoImages);
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock wishlist check
    
    renderComponent();
    
    // First wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading car details...')).not.toBeInTheDocument();
    });
    
    // Then check for the placeholder
    await waitFor(() => {
      const placeholder = screen.getByText('No images available');
      expect(placeholder).toBeInTheDocument();
    });
  });

  // Test 6: Feature List Display
  it('correctly displays car features when available', async () => {
    const carDataWithFeatures = {
      ...mockCarData,
      features: ['GPS Navigation', 'Leather Seats', 'Sunroof']
    };
    
    mockFetchResponse(carDataWithFeatures);
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock wishlist check
    
    renderComponent();

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading car details...')).not.toBeInTheDocument();
    });
    
    // Find and click the features tab trigger
    await waitFor(() => {
      const featuresTab = screen.getByRole('button', { name: /features/i });
      expect(featuresTab).toBeInTheDocument();
      fireEvent.click(featuresTab);
    });
    
    // Wait for the features tab content to become visible
    await waitFor(() => {
      const featuresContent = screen.getByRole('region', { name: /features/i });
      expect(featuresContent).toBeVisible();
    });
    
    // Check for the features
    await waitFor(() => {
      expect(screen.getByText('GPS Navigation')).toBeVisible();
      expect(screen.getByText('Leather Seats')).toBeVisible();
      expect(screen.getByText('Sunroof')).toBeVisible();
    });
  });
});

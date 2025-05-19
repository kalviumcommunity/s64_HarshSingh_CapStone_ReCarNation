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
axios.get.mockResolvedValue({ data: null }); // Default mock for auth check
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

const renderComponent = async () => {
  const result = render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CarDetailsPage />
      </AuthProvider>
    </BrowserRouter>
  );
  
  // Wait for auth context to initialize
  try {
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  } catch (error) {
    // Ignore timeout errors from auth loading
  }
  
  return result;
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
  it('displays loading state initially', async () => {
    // Mock fetch but don't resolve it yet
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    await renderComponent();
    expect(screen.getByText('Loading car details...')).toBeInTheDocument();
  });

  // Test 2: Successful Data Loading
  it('displays car details when data is loaded successfully', async () => {
    mockFetchResponse(mockCarData);
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock wishlist check

    await renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(mockCarData.title)).toBeInTheDocument();
    });
    
    expect(screen.getByText(`₹${mockCarData.price.toLocaleString()}`)).toBeInTheDocument();
    expect(screen.getByText(mockCarData.description)).toBeInTheDocument();
  });

  // Test 3: Error State
  it('displays error message when data fetching fails', async () => {
    mockFetchResponse(null, 404);
    
    await renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
    expect(screen.getByText('Car not found')).toBeInTheDocument();
  });

  // Test 4: Wishlist Toggle - Not Logged In
  it('redirects to login when trying to add to wishlist without being logged in', async () => {
    mockFetchResponse(mockCarData);
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    await renderComponent();
    
    const wishlistButton = await screen.findByText('Wishlist');
    fireEvent.click(wishlistButton);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });
});

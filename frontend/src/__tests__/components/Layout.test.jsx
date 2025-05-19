import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '@/components/Layout';

// Mock the child components
jest.mock('@/components/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('@/components/footer', () => () => <div data-testid="mock-footer">Footer</div>);

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

describe('Layout Component', () => {
  it('renders header, footer and children', () => {
    const testContent = 'Test Content';
    render(
      <Layout>
        <div>{testContent}</div>
      </Layout>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('has the correct structure', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const container = screen.getByText('Content').parentElement;
    expect(container).toHaveClass('flex-grow');
  });

  it('renders correctly without children', () => {
    render(<Layout />);
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeEmptyDOMElement();
  });
});

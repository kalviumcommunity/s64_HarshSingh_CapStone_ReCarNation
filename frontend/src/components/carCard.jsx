import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Card, Container, Row, Col } from 'react-bootstrap';

const ProductCard = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      // Handle both cases: valid array or missing field
      const data = res.data.products || [];
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
      setProducts([]); // fallback to empty array to avoid crash
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleShowModal = (id) => {
    setDeletingProductId(id);
    setShowModal(true);
  };
  return (
    <Container className="py-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {products.map((product) => (
          <Col key={product._id}>
            <Card className="h-100 shadow">
              <Card.Img
                variant="top"
                src={product.image}
                alt={product.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {product.company} • {product.model} • {product.year}
                </Card.Subtitle>
                <Card.Text>{product.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between bg-white border-top-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert('Edit feature not implemented yet')}
                >
                  <i className="bi bi-pencil-square me-1"></i>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShowModal(product._id)}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default ProductCard;
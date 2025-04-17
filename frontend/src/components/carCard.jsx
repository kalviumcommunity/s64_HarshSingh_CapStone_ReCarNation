import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Container, Row, Col, Modal } from 'react-bootstrap';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deletingCarId, setDeletingCarId] = useState(null);

  const fetchCars = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products');
      // Handle response consistently
      setCars(Array.isArray(res.data) ? res.data : res.data.products || []);
    } catch (error) {
      console.error('Failed to fetch cars:', error.message);
      setCars([]); // fallback to empty array to avoid crash
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleShowModal = (id) => {
    setDeletingCarId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDeletingCarId(null);
  };

  const handleDeleteCar = async () => {
    try {d
      await axios.delete(`http://localhost:3000/api/products/${deletingCarId}`);
      // Refresh the car list after deletion
      fetchCars();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to delete car:', error.message);
    }
  };

  return (
    <Container className="py-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {cars.map((car) => (
          <Col key={car._id}>
            <Card className="h-100 shadow">
              <Card.Img
                variant="top"
                src={car.image}
                alt={car.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{car.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {car.company} • {car.model} • {car.year}
                </Card.Subtitle>
                <Card.Text>{car.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between bg-white border-top-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert('Edit feature not implemented yet')}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleShowModal(car._id)}
                >
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this car?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCar}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CarList;
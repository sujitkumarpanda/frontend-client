import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const HomePage = () => {
 
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Container className="mt-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="mb-4">Welcome to Expense Splitter</h1>
          <p className="lead">
            Easily split bills with friends, track expenses, and settle payments seamlessly.
            Perfect for roommates, trips, and group expenses!
          </p>

          {/* Features Section */}
          <Row className="mt-4">
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <h5>💰 Add Expenses</h5>
                  <p>Log shared expenses and assign contributors.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <h5>📊 Track Balances</h5>
                  <p>View who owes whom and simplify payments.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <h5>✔️ Settle Payments</h5>
                  <p>Mark expenses as settled with easy payment tracking.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          
          {!isAuthenticated && (
            <div className="mt-5">
              <h4>Get Started Now!</h4>
              <p>Create an account or log in to start splitting expenses.</p>
             
                <Link className="btn btn-custom" to="/login">Login</Link>
             
             
                 <Link className="btn btn-custom mx-2" to="/signup">Sign Up</Link>
             
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;

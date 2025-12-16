# 🅱️ Bootstrap Component Examples for Your System

## Quick Reference Guide

---

## 1️⃣ Button Examples

```jsx
import { Button } from 'react-bootstrap';

// Primary Button
<Button variant="primary">Primary</Button>

// Success Button
<Button variant="success">Success</Button>

// Danger Button
<Button variant="danger">Delete</Button>

// Button Sizes
<Button variant="primary" size="lg">Large</Button>
<Button variant="primary" size="sm">Small</Button>

// Disabled Button
<Button variant="primary" disabled>Disabled</Button>

// Button with Icon
<Button variant="primary">
  <span>🔒 Save</span>
</Button>
```

---

## 2️⃣ Card Examples

```jsx
import { Card, Button } from 'react-bootstrap';

// Basic Card
<Card>
  <Card.Header>Header</Card.Header>
  <Card.Body>
    <Card.Title>Title</Card.Title>
    <Card.Text>Content here</Card.Text>
    <Button variant="primary">Go</Button>
  </Card.Body>
</Card>

// Card with Image
<Card>
  <Card.Img variant="top" src="image.jpg" />
  <Card.Body>
    <Card.Title>Title</Card.Title>
    <Card.Text>Description</Card.Text>
  </Card.Body>
</Card>

// Stats Card (for your dashboard)
<Card>
  <Card.Body>
    <Card.Title className="text-success">📊 Total Appointments</Card.Title>
    <h2 className="text-success">24</h2>
  </Card.Body>
</Card>
```

---

## 3️⃣ Table Examples

```jsx
import { Table } from 'react-bootstrap';

// Basic Table
<Table striped bordered hover>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Services</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sarah</td>
      <td>sarah@example.com</td>
      <td>Haircut</td>
      <td>12/16/2025</td>
    </tr>
  </tbody>
</Table>

// Dark Table
<Table striped bordered hover variant="dark">
  {/* Same as above */}
</Table>

// Hover Effect
<Table hover>
  {/* Content */}
</Table>
```

---

## 4️⃣ Modal Examples

```jsx
import { Modal, Button } from 'react-bootstrap';
import { useState } from 'react';

function ModalExample() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        Open Modal
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Form content here
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShow(false)}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalExample;
```

---

## 5️⃣ Form Examples

```jsx
import { Form, Button } from 'react-bootstrap';

<Form>
  <Form.Group className="mb-3">
    <Form.Label>Customer Name</Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter name"
    />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Email</Form.Label>
    <Form.Control
      type="email"
      placeholder="Enter email"
    />
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Label>Select Service</Form.Label>
    <Form.Select>
      <option>Haircut</option>
      <option>Coloring</option>
      <option>Shave</option>
    </Form.Select>
  </Form.Group>

  <Form.Group className="mb-3">
    <Form.Check
      type="checkbox"
      label="Mark as paid"
    />
  </Form.Group>

  <Button variant="primary" type="submit">
    Submit
  </Button>
</Form>
```

---

## 6️⃣ Container & Grid Examples

```jsx
import { Container, Row, Col } from 'react-bootstrap';

// Basic Grid
<Container>
  <Row>
    <Col md={6}>Left Column</Col>
    <Col md={6}>Right Column</Col>
  </Row>
</Container>

// 3-Column Layout
<Container>
  <Row>
    <Col md={4}>Column 1</Col>
    <Col md={4}>Column 2</Col>
    <Col md={4}>Column 3</Col>
  </Row>
</Container>

// Responsive Grid
<Container>
  <Row>
    <Col xs={12} md={6} lg={4}>
      Responsive Column
    </Col>
  </Row>
</Container>

// Sidebar Layout
<Container>
  <Row>
    <Col md={3}>Sidebar</Col>
    <Col md={9}>Main Content</Col>
  </Row>
</Container>
```

---

## 7️⃣ Alert Examples

```jsx
import { Alert } from 'react-bootstrap';

// Success Alert
<Alert variant="success">
  ✅ Appointment created successfully!
</Alert>

// Danger Alert
<Alert variant="danger">
  ❌ Error: Failed to delete appointment
</Alert>

// Warning Alert
<Alert variant="warning">
  ⚠️ Please review your data before saving
</Alert>

// Info Alert
<Alert variant="info">
  ℹ️ This appointment was updated today
</Alert>

// Dismissible Alert
<Alert variant="success" dismissible>
  Appointment saved!
</Alert>
```

---

## 8️⃣ Badge Examples

```jsx
import { Badge } from 'react-bootstrap';

// Success Badge
<Badge bg="success">Paid</Badge>

// Danger Badge
<Badge bg="danger">Pending</Badge>

// Info Badge
<Badge bg="info">Scheduled</Badge>

// Different Styles
<Badge bg="primary">Primary</Badge>
<Badge bg="secondary">Secondary</Badge>
<Badge bg="warning">Warning</Badge>
<Badge bg="light" text="dark">Light</Badge>
```

---

## 9️⃣ Navbar Example

```jsx
import { Navbar, Nav, Container } from 'react-bootstrap';

<Navbar bg="dark" expand="lg" sticky="top">
  <Container>
    <Navbar.Brand href="/">
      🌿 Salon Reception
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ms-auto">
        <Nav.Link href="/">Home</Nav.Link>
        <Nav.Link href="/appointments">Appointments</Nav.Link>
        <Nav.Link href="/settings">Settings</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
```

---

## 🔟 Dropdown Examples

```jsx
import { Dropdown, DropdownButton } from 'react-bootstrap';

// Dropdown Button
<DropdownButton id="dropdown-basic" title="Dropdown">
  <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
  <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
  <Dropdown.Divider />
  <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
</DropdownButton>

// Dropdown without Button
<Dropdown>
  <Dropdown.Toggle variant="success">
    Status
  </Dropdown.Toggle>
  <Dropdown.Menu>
    <Dropdown.Item>Paid</Dropdown.Item>
    <Dropdown.Item>Pending</Dropdown.Item>
    <Dropdown.Item>Cancelled</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
```

---

## 🎨 Color Variants

```
Primary   - bg="primary"    ← #0d6efd (Blue)
Secondary - bg="secondary"  ← #6c757d (Gray)
Success   - bg="success"    ← #198754 (Green)
Danger    - bg="danger"     ← #dc3545 (Red)
Warning   - bg="warning"    ← #ffc107 (Yellow)
Info      - bg="info"       ← #0dcaf0 (Cyan)
Light     - bg="light"      ← #f8f9fa (Light)
Dark      - bg="dark"       ← #212529 (Dark)
```

---

## 💡 Pro Tips

### 1. Spacing Utilities
```jsx
// Margin
<div className="m-3">Margin all sides</div>
<div className="mt-3">Margin top</div>
<div className="mb-3">Margin bottom</div>

// Padding
<div className="p-3">Padding all sides</div>
<div className="pt-3">Padding top</div>
<div className="pb-3">Padding bottom</div>
```

### 2. Text Utilities
```jsx
// Text alignment
<div className="text-center">Centered text</div>
<div className="text-end">Right aligned</div>

// Text colors
<div className="text-success">Green text</div>
<div className="text-danger">Red text</div>

// Font weights
<div className="fw-bold">Bold</div>
<div className="fw-light">Light</div>
```

### 3. Display Utilities
```jsx
// Hide/Show
<div className="d-none d-md-block">
  Hidden on mobile, visible on tablet+
</div>

// Flexbox
<div className="d-flex justify-content-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

### 4. Border & Shadows
```jsx
// Borders
<div className="border">Has border</div>
<div className="border-top">Border top only</div>

// Shadows
<div className="shadow">Drop shadow</div>
<div className="shadow-lg">Large shadow</div>
```

---

## 🚀 Example: Complete Appointment Card

```jsx
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';

function AppointmentCard({ appointment }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Row>
          <Col md={8}>
            <Card.Title className="text-success">
              {appointment.customerName}
            </Card.Title>
            <Card.Text>
              <strong>Email:</strong> {appointment.email}<br />
              <strong>Date:</strong> {appointment.date}<br />
              <strong>Time:</strong> {appointment.time}<br />
              <strong>Services:</strong> {appointment.services?.join(', ')}
            </Card.Text>
          </Col>
          <Col md={4}>
            <div className="mb-2">
              <Badge 
                bg={appointment.payment === 'Paid' ? 'success' : 'warning'}
              >
                {appointment.payment}
              </Badge>
            </div>
            <Button variant="primary" size="sm" className="me-2">
              ✎ Edit
            </Button>
            <Button variant="danger" size="sm">
              🗑 Delete
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default AppointmentCard;
```

---

## 📚 Bootstrap Utility Classes Quick Ref

```
Spacing:      m-1  p-1  mt-1  mb-1  ml-1  mr-1  pt-1  pb-1  pl-1  pr-1
Display:      d-none  d-block  d-flex  d-grid
Text:         text-center  text-end  text-start
Colors:       text-primary  text-success  text-danger  text-warning
Font:         fw-bold  fw-normal  fw-light  fs-1 fs-6
Borders:      border  border-1  border-top  rounded
Shadows:      shadow  shadow-sm  shadow-lg
Flex:         justify-content-center  align-items-center  gap-3
```

---

## 🎉 Ready to Build!

You now have Bootstrap integrated and ready to use. All components above are available in your project.

**Next Steps:**
1. Update components to use Bootstrap
2. Remove custom CSS (optional)
3. Build amazing UI with Bootstrap components
4. Deploy with confidence

Happy coding! 🚀

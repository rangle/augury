import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid';

const FlightRows = ({ flights = [] }) => (
  <Grid fluid>
    <Row>
      <Col xs={6}>Departure City</Col>
      <Col xs={6}>Arrival City</Col>
    </Row>
    <Grid fluid>
    {
      flights.map(flight => (
        <Row key={flight.id}>
          <Col xs={6}>{flight.departure_city}</Col>
          <Col xs={6}>{flight.arrival_city}</Col>
        </Row>
      ))
    }
    </Grid>
  </Grid>
)

export default connect(
  state => ({ flights: state.relevantFlights })
)(FlightRows)

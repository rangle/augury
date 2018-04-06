import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid';

const CurrentOpts = ({ arrivalCity, departureCity }) => (
  <Grid fluid>
    {
      [
        { label: 'Arriving at', value: arrivalCity },
        { label: 'Departing from', value: departureCity }
      ].map(option => (
        option.value ?
          <Row key={option.label}><span>{ option.label + ':' }</span>{option.value}</Row>
          : null
      ))
    }
  </Grid>
)

export default connect(
  state => ({
    arrivalCity: state.conversation.context.arrival_city,
    departureCity: state.conversation.context.departure_city
  })
)(CurrentOpts)

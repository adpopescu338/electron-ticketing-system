import React from 'react';
import { useFormik } from 'formik';
import { TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { systemSettingsValidationSchema } from '@repo/validation';
import swal from 'sweetalert';
import styled from 'styled-components';
import { useSystemSettings } from 'hooks/useSystemSettings';

const Form = styled.form`
  width: 50%;
  max-width: 700px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 5px 0 black;
  margin: 0 auto;
  margin-top: 30px;
`;

export const SystemSettings: React.FC = () => {
  const [initialValues, loading] = useSystemSettings();

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: systemSettingsValidationSchema,
    onSubmit: (values) => {
      axios
        .post('/api/system-settings', values)
        .then(() => {
          swal('Success', 'Settings updated', 'success');
        })
        .catch((error) => {
          swal('Error', 'Failed to update settings', 'error');
          console.error('Failed to update settings:', error);
        });
    },
    enableReinitialize: true, // Ensure the form reinitializes when initialValues change
  });

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div
      style={{
        paddingBottom: '50px',
      }}
    >
      <Form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="MESSAGE_DISPLAY_TIME_SECONDS"
          name="MESSAGE_DISPLAY_TIME_SECONDS"
          label="Message Display Time (seconds)"
          type="number"
          value={formik.values.MESSAGE_DISPLAY_TIME_SECONDS}
          onChange={formik.handleChange}
          error={
            formik.touched.MESSAGE_DISPLAY_TIME_SECONDS &&
            Boolean(formik.errors.MESSAGE_DISPLAY_TIME_SECONDS)
          }
          helperText={
            (formik.touched.MESSAGE_DISPLAY_TIME_SECONDS &&
              formik.errors.MESSAGE_DISPLAY_TIME_SECONDS) ||
            'How long to display a message for before removing it.'
          }
        />

        <TextField
          fullWidth
          name="Q_ITEM_DISPLAY_TIME_SECONDS"
          label="Queue Item Display Time (seconds)"
          type="number"
          value={formik.values.Q_ITEM_DISPLAY_TIME_SECONDS}
          onChange={formik.handleChange}
          error={
            formik.touched.Q_ITEM_DISPLAY_TIME_SECONDS &&
            Boolean(formik.errors.Q_ITEM_DISPLAY_TIME_SECONDS)
          }
          helperText={
            (formik.touched.Q_ITEM_DISPLAY_TIME_SECONDS &&
              formik.errors.Q_ITEM_DISPLAY_TIME_SECONDS) ||
            'How long to keep a number at the top without without incrementing it or displaying a message.'
          }
        />

        <TextField
          fullWidth
          name="MAX_NUMBER"
          label="Max Number"
          type="number"
          value={formik.values.MAX_NUMBER}
          onChange={formik.handleChange}
          error={formik.touched.MAX_NUMBER && Boolean(formik.errors.MAX_NUMBER)}
          helperText={
            (formik.touched.MAX_NUMBER && formik.errors.MAX_NUMBER) ||
            'The maximum number that can be called. After this, the count will go back to the minimum number.'
          }
        />

        <TextField
          fullWidth
          name="START_NUMBER"
          label="Start Number"
          type="number"
          value={formik.values.START_NUMBER}
          onChange={formik.handleChange}
          error={formik.touched.START_NUMBER && Boolean(formik.errors.START_NUMBER)}
          helperText={
            (formik.touched.START_NUMBER && formik.errors.START_NUMBER) ||
            'The number to start counting from. This will be the number displayed when a queue is created, and after the max number is reached.'
          }
        />

        <TextField
          fullWidth
          name="PORT"
          label="Application port."
          type="number"
          value={formik.values.PORT}
          onChange={formik.handleChange}
          error={formik.touched.PORT && Boolean(formik.errors.PORT)}
          helperText={
            (formik.touched.PORT && formik.errors.PORT) || 'The port to run the server on.'
          }
        />

        <Button color="primary" variant="contained" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

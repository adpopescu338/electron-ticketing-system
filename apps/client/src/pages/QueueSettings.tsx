import React from 'react';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { QueueDisplaySettings } from '@repo/types';
import { queueSettingsValidationSchema } from '@repo/validation';
import { useCtx } from 'hooks/useCtx';
import { useParams } from 'react-router-dom';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Grid, Paper } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import styled from 'styled-components';
import axios from 'axios';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';

// Styled components
const FormContainer = styled(Paper)({
  margin: 'auto',
  padding: '20px',
  maxWidth: '800px',
  marginTop: '20px',
});

const ColorPicker: React.FC<{
  formik: ReturnType<typeof useFormik<QueueDisplaySettings>>;
  label: string;
  helperText?: string;
  name: 'color' | 'backgroundColor' | 'borderColor' | 'messageColor' | 'messageBackgroundColor';
}> = ({ formik, label, helperText, name }) => {
  return (
    <TextField
      fullWidth
      type="color"
      label={label}
      value={formik.values[name]}
      name={name}
      onChange={(e) => formik.setFieldValue(name, e.target.value)}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] ? formik.errors[name] : helperText}
    />
  );
};

const DEFAULT_VALUES: QueueDisplaySettings = {
  maxBoxesToDisplay: 4,
  displayTitle: true,
  color: '#FFFFFF', // white,
  backgroundColor: '#0000FF', // blue
  borderColor: '#000000', // black
  name: '',
  messageColor: '#FFFFFF', // white
  messageBackgroundColor: '#FF0000', // red
  tableHeaderNumberText: 'Nr.',
  tableHeaderDeskText: 'Desk',
  messageAudioFileName: '',
  numberAudioFileName: '',
  isSequential: true,
};

const useSubmit = (queueName: string, onSubmit?: (values: QueueDisplaySettings) => void) => {
  const navigate = useNavigate();
  const { refetchQueuesSettings } = useCtx();

  if (typeof onSubmit === 'function') return onSubmit;

  return (values: QueueDisplaySettings) => {
    const endpoint = queueName === '_new' ? '/api/q/_new' : `/api/q/${queueName}`;

    axios
      .post(endpoint, values)
      .then(async (res) => {
        if (!res.data.success) {
          throw new Error(res.data.error?.message || 'Unknown error.');
        }
        refetchQueuesSettings();
        await swal('Success!', 'Queue settings saved.', 'success');

        setTimeout(() => {
          navigate('/');
        }, 400);
      })
      .catch((err) => {
        swal('Error!', err.message || 'Unknown error.', 'error');
      });
  };
};

export const QueueSettings: React.FC<{
  queueName?: string;
  onSubmit?: (values: QueueDisplaySettings) => void;
}> = ({ queueName, onSubmit }) => {
  const params = useParams();
  queueName ??= params.queueName as string;

  const { queuesSettings } = useCtx();
  const queueByName = queuesSettings.find((queue) => queue.name === queueName);
  const [audios, setAudios] = React.useState<string[]>([]);

  const playAudio = (fileName: string) => {
    const audio = new Audio(`/audio/${fileName}`);
    audio.play();
  };

  const selectedQueueSettings = queueByName || DEFAULT_VALUES;

  const handleSubmit = useSubmit(queueName, onSubmit);

  const formik = useFormik({
    initialValues: selectedQueueSettings,
    validationSchema: queueSettingsValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  React.useEffect(() => {
    axios.get('/api/audios').then((res) => {
      setAudios(res.data);

      formik.setFieldValue('messageAudioFileName', res.data[0]);
      formik.setFieldValue('numberAudioFileName', res.data[0]);
    });
  }, []);

  return (
    <FormContainer elevation={3}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              disabled={!!queueByName}
              fullWidth
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={
                formik.touched.name
                  ? formik.errors.name
                  : "The name of the queue. It will be displayed at the top if 'Display Title' is on."
              }
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.displayTitle}
                  onChange={formik.handleChange}
                  name="displayTitle"
                />
              }
              label="Display Queue Title"
            />
            <br />
            <Typography variant="caption">
              The title will be displayed at the top of the queue.
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isSequential}
                  onChange={formik.handleChange}
                  name="isSequential"
                />
              }
              label="Is Sequential?"
            />
            <br />
            <Typography variant="caption">
              If yes, a number is displayed for each desk, else only the desk is displayed.
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <ColorPicker label="Text Color" formik={formik} name="color" />
          </Grid>
          <Grid item xs={6}>
            <ColorPicker label="Background color" formik={formik} name="backgroundColor" />
          </Grid>
          <Grid item xs={6}>
            <ColorPicker
              name="borderColor"
              label="Border Color"
              formik={formik}
              helperText="The color of the display table borders."
            />
          </Grid>

          <Grid item xs={6}>
            <ColorPicker
              name="messageColor"
              formik={formik}
              label="Message Text Color"
              helperText="The color of the message text."
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="maxBoxesToDisplay"
              label="How many numbers to display at the same time"
              type="number"
              value={formik.values.maxBoxesToDisplay}
              onChange={formik.handleChange}
              error={formik.touched.maxBoxesToDisplay && Boolean(formik.errors.maxBoxesToDisplay)}
              helperText={
                formik.touched.maxBoxesToDisplay
                  ? formik.errors.maxBoxesToDisplay
                  : 'Maximum number of boxes to display.'
              }
            />
          </Grid>

          <Grid item xs={6}>
            <ColorPicker
              name="messageBackgroundColor"
              label="Message Background Color"
              formik={formik}
              helperText="The background color of the message area."
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="tableHeaderNumberText"
              name="tableHeaderNumberText"
              label="Table Header Number Text"
              value={formik.values.tableHeaderNumberText}
              onChange={formik.handleChange}
              error={
                formik.touched.tableHeaderNumberText && Boolean(formik.errors.tableHeaderNumberText)
              }
              helperText={
                formik.touched.tableHeaderNumberText
                  ? formik.errors.tableHeaderNumberText
                  : 'The text for the table header number.'
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="tableHeaderDeskText"
              name="tableHeaderDeskText"
              label="Table Header Desk Text"
              value={formik.values.tableHeaderDeskText}
              onChange={formik.handleChange}
              error={
                formik.touched.tableHeaderDeskText && Boolean(formik.errors.tableHeaderDeskText)
              }
              helperText={
                formik.touched.tableHeaderDeskText
                  ? formik.errors.tableHeaderDeskText
                  : 'The text for the table header desk.'
              }
            />
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel id="messageAudioFileName-label">Message Audio File Name</InputLabel>
              <Select
                labelId="messageAudioFileName-label"
                id="messageAudioFileName"
                name="messageAudioFileName"
                value={formik.values.messageAudioFileName}
                label="Message Audio File Name"
                onChange={formik.handleChange}
              >
                {audios.map((audio) => (
                  <MenuItem key={audio} value={audio}>
                    {audio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <IconButton
              color="primary"
              disabled={!formik.values.messageAudioFileName}
              onClick={() => {
                playAudio(formik.values.messageAudioFileName);
              }}
            >
              <PlayCircleOutlineIcon />
            </IconButton>
          </Grid>

          <Grid item xs={5}>
            <FormControl fullWidth>
              <InputLabel id="numberAudioFileName-label">Number Audio File Name</InputLabel>
              <Select
                labelId="numberAudioFileName-label"
                id="numberAudioFileName"
                name="numberAudioFileName"
                value={formik.values.numberAudioFileName}
                label="Number Audio File Name"
                onChange={formik.handleChange}
              >
                {audios.map((audio) => (
                  <MenuItem key={audio} value={audio}>
                    {audio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <IconButton
              color="primary"
              disabled={!formik.values.numberAudioFileName}
              onClick={() => {
                playAudio(formik.values.numberAudioFileName);
              }}
            >
              <PlayCircleOutlineIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <Button color="primary" variant="contained" fullWidth type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </FormContainer>
  );
};

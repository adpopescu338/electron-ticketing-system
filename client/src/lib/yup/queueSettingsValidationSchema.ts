import * as Yup from 'yup';
import { QueueDisplaySettings } from '../../../../types';

export const queueSettingsValidationSchema = Yup.object<QueueDisplaySettings>({
  maxBoxesToDisplay: Yup.number().required('Max Boxes to Display is required').min(1, 'Must be greater than 0').max(10, 'Must be less than 10'),
  displayTitle: Yup.boolean().required('Display Title is required'),
  color: Yup.string().required('Color is required'),
  backgroundColor: Yup.string().required('Background Color is required'),
  borderColor: Yup.string().required('Border Color is required'),
  name: Yup.string().required('Name is required'),
  messageColor: Yup.string().required('Message Color is required'),
  messageBackgroundColor: Yup.string().required('Message Background Color is required'),
  tableHeaderNumberText: Yup.string().required('Table Header Number Text is required'),
  tableHeaderDeskText: Yup.string().required('Table Header Desk Text is required'),
  messageAudioFileName: Yup.string().required('Message Audio File Name is required'),
  numberAudioFileName: Yup.string().required('Number Audio File Name is required'),
});

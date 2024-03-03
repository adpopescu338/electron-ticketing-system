import { SystemSettings } from '@repo/types';
import * as Yup from 'yup';

export const systemSettingsValidationSchema = Yup.object<SystemSettings>({
  MESSAGE_DISPLAY_TIME_SECONDS: Yup.number()
    .min(1, 'Must be at least 1 second')
    .required('Required'),
  Q_ITEM_DISPLAY_TIME_SECONDS: Yup.number()
    .min(1, 'Must be at least 1 second')
    .required('Required'),
  MAX_NUMBER: Yup.number().min(1, 'Must be at least 1').required('Required'),
  START_NUMBER: Yup.number().min(0, 'Must be 0 or positive').required('Required'),
  PORT: Yup.number().min(1, 'Must be at least 1').required('Required'),
});

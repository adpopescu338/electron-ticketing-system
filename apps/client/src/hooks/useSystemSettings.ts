import type { SystemSettings } from '@repo/types';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_SETTINGS } from '@repo/constants';
import swal from 'sweetalert2';

export const useSystemSettings = (): [SystemSettings, boolean] => {
  const [initialValues, setInitialValues] = useState(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/system-settings');
        setInitialValues(response.data);
      } catch (error) {
        console.error('Failed to fetch system settings:', error);
        swal.fire('Error', 'Failed to fetch system settings', 'error');
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  return [initialValues, loading];
};

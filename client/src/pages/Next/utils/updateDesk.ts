import { isSwalNumberValid } from 'lib/isSwalNumberValid';
import swal from 'sweetalert';

export const updateDesk = async (setDesk: (desk: number) => void): Promise<void> => {
  const value: string = await swal({
    title: 'Enter your desk number',
    content: {
      element: 'input',
      attributes: {
        type: 'number',
        min: 0,
      },
    },
    buttons: {
      confirm: true,
    },
    closeOnClickOutside: false,
  });

  if (!isSwalNumberValid(value)) {
    await swal({
      title: 'Invalid desk number',
      icon: 'error',
      buttons: {
        confirm: true,
      },
      closeOnClickOutside: false,
    });

    return updateDesk(setDesk);
  }

  const parsedValue = Number(value);

  localStorage.setItem('desk', String(parsedValue));
  setDesk(parsedValue);
};

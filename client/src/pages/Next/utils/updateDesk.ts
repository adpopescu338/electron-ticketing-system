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

  const parsedValue = Number(value);

  const isInvalid = isNaN(parsedValue) || parsedValue < 0 || parsedValue > 100 || value === '';

  if (isInvalid) {
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

  localStorage.setItem('desk', String(parsedValue));
  setDesk(parsedValue);
};

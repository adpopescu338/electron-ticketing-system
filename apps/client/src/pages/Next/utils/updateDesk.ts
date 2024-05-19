import swal from 'sweetalert';

export const updateDesk = async (setDesk: (desk: string) => void): Promise<void> => {
  let value: string = await swal({
    title: 'Enter your desk id',
    content: {
      element: 'input',
    },
    buttons: {
      confirm: true,
    },
    closeOnClickOutside: false,
  });

  value = value?.trim();

  if (!value) {
    await swal({
      title: 'Invalid desk id',
      icon: 'error',
      buttons: {
        confirm: true,
      },
      closeOnClickOutside: false,
    });

    return updateDesk(setDesk);
  }

  localStorage.setItem('desk', value);
  setDesk(value);
};

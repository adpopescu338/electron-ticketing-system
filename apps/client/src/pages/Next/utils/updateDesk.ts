import swal from 'sweetalert2';

export const updateDesk = async (setDesk: (desk: string) => void): Promise<void> => {
  let { value } = await swal.fire<string>({
    title: 'Enter your desk id',
    input: 'text',
    showCancelButton: false,
    allowOutsideClick: false,
  });

  value = value?.trim();

  if (!value) {
    await swal.fire({
      title: 'Invalid desk id',
      icon: 'error',
      showCancelButton: false,
      allowOutsideClick: false,
    });

    return updateDesk(setDesk);
  }

  localStorage.setItem('desk', value);
  setDesk(value);
};

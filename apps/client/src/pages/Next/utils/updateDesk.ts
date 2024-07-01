import swal from 'sweetalert2';

export const updateDesk = async (setDesk: (desk: string) => void): Promise<void> => {
  const result = await swal.fire<string>({
    title: 'Enter your desk id',
    input: 'text',
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
  // if called inside a useEffect, this will run twice, and by being recursive, it will cause an infinite loop
  // therefore we need to return if the result is dismissed
  if (result.isDismissed) return;

  let value = result?.value?.trim()

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

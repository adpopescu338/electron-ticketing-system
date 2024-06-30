import { useAudios } from 'hooks/useAudios';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import swal from 'sweetalert2';
import { Button, Grid, IconButton, Typography } from '@mui/material';
import AddCircle from '@mui/icons-material/AddCircle';
import { playAudio } from 'lib/playAudio';
import React from 'react';

export const AudioSettings: React.FC = () => {
  const { audios, refetchAudios } = useAudios();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    console.log(file);

    const formData = new FormData();
    formData.set('audio', file);

    axios
      .post('/api/audio', formData)
      .then(() => {
        refetchAudios();
      })
      .catch((e) => {
        swal.fire('Error', e.message, 'error');
      })
      .finally(() => {
        e.target.value = '';
      });
  };

  const deleteFile = (audio: string) => () => {
    swal
      .fire({
        title: 'Delete audio',
        text: 'Are you sure you want to delete this audio?',
        showCancelButton: true,
        showConfirmButton: true,
      })
      .then(({ isConfirmed }) => {
        if (!isConfirmed) {
          return;
        }

        axios
          .delete(`/api/audio/${audio}`)
          .then(() => {
            refetchAudios();
          })
          .catch((e) => {
            swal.fire('Error', e.message, 'error');
          });
      });
  };

  return (
    <div
      style={{
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignContent: 'center',
        alignItems: 'center',
      }}
    >
      {audios.map((audio) => {
        return (
          <Grid
            container
            width="400px"
            alignItems="center"
            justifyContent="space-between"
            key={audio}
            direction="row"
            borderBottom="1px solid #ccc"
          >
            <Grid item xs={4}>
              <Typography>{audio}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <IconButton
                color="primary"
                onClick={() => {
                  playAudio(audio);
                }}
              >
                <PlayCircleOutlineIcon />
              </IconButton>
            </Grid>
            <Grid item xs={4} textAlign="right">
              <IconButton color="error" onClick={deleteFile(audio)}>
                <CancelIcon />
              </IconButton>
            </Grid>
          </Grid>
        );
      })}
      <Button
        color="primary"
        endIcon={<AddCircle />}
        variant="outlined"
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        Add audio file
        <input
          type="file"
          accept="audio/mp3"
          style={{ display: 'none' }}
          onChange={addFile}
          ref={inputRef}
        />
      </Button>
    </div>
  );
};

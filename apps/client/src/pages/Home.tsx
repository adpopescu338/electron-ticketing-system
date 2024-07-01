import { useCtx } from 'hooks/useCtx';
import { Divider, Grid, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TvIcon from '@mui/icons-material/Tv';
import DeleteIcon from '@mui/icons-material/Delete';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import TuneIcon from '@mui/icons-material/Tune';
import AudioIcon from '@mui/icons-material/AudioFile';
import SettingsIcon from '@mui/icons-material/Settings';
import styled from 'styled-components';
import swal from 'sweetalert2';
import axios from 'axios';
import { AddressDisplayer } from 'components/AddressDisplayer';
import { TooltipGridButton } from 'components/TooltipGridButton';

const QueueOptionsContainer = styled(Grid)`
  width: 40%;
  min-width: 250px;
  margin: 0 auto;
  box-shadow: 0 0 5px 0 black;
  border-radius: 5px;
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 0 10px 0 black;
    scale: 1.05;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 10px;
  padding-bottom: 100px;
`;

const displayInstructions =
  "Press 'f' to toggle full screen. Press 'esc' to exit full screen, or to close the display.";

export const Home: React.FC = () => {
  const { queuesSettings = [], refetchQueuesSettings } = useCtx();

  const hasQ = !!queuesSettings?.length;

  const handleDelete = async (queueName: string) => {
    const proceed = await swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${queueName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });

    if (!proceed) return;

    try {
      await axios.delete(`/api/q/${queueName}`);
      refetchQueuesSettings();
      swal.fire('Success', 'Queue deleted', 'success');
    } catch (error) {
      swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleDeleteEverything = async () => {
    const proceed = await swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete everything?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });

    if (!proceed) return;

    try {
      await axios.delete(`/api/all`);
      refetchQueuesSettings();
      swal.fire('Success', 'Everything deleted', 'success');
    } catch (error) {
      swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  return (
    <Container>
      <AddressDisplayer />
      <Typography variant="h4" id="home-page-title">
        Queue Settings
      </Typography>
      <Typography variant="body1">Here you can edit your queues and create new ones.</Typography>
      {queuesSettings.map((queue) => (
        <QueueOptionsContainer key={queue.name} className="queueContainer" container padding="10px">
          <Grid item xs={12}>
            <Typography variant="h5" className="queue-title" textAlign="center">
              {queue.name}
            </Typography>
            <Divider />
          </Grid>

          <Grid container padding="10px" spacing={1}>
            <TooltipGridButton
              gridMd={6}
              text="Open"
              tooltipText="Open the page where you can interact with this queue, by calling the next number, etc."
              href={`/next/${queue.name}`}
              icon={<QueuePlayNextIcon />}
              id="queue-open-operation-page-button"
            />

            <TooltipGridButton
              gridMd={6}
              text="Display"
              tooltipText={`Open this queue in a new display tab. ${displayInstructions}`}
              href={`/display/${queue.name}`}
              icon={<TvIcon />}
              id={'queue-open-display-button-' + queue.name}
              target="_blank"
            />

            <TooltipGridButton
              gridMd={6}
              text="Settings"
              tooltipText="Configure this queue settings."
              href={`/queue/${queue.name}`}
              icon={<EditIcon />}
            />

            <TooltipGridButton
              gridMd={6}
              text="Delete"
              tooltipText="Delete this queue permanently. This action cannot be undone."
              onClick={() => handleDelete!(queue.name)}
              buttonColor="error"
              icon={<DeleteIcon />}
            />
          </Grid>
        </QueueOptionsContainer>
      ))}

      <Grid container spacing={2} direction="column" width="40%" minWidth="250px" margin="0 auto">
        <TooltipGridButton
          text="Create new queue"
          tooltipText="Create a new queue. You will be able to customize the default settings"
          href="/queue/_new"
          icon={<AddCircleIcon />}
          id="create-new-queue-button"
        />

        {hasQ && (
          <TooltipGridButton
            text="Display all"
            tooltipText={`Open all queues in a new display tab. ${displayInstructions}`}
            href="/display"
            icon={<QueuePlayNextIcon />}
            target="_blank"
          />
        )}
        {hasQ && (
          <TooltipGridButton
            text="Custom display session"
            tooltipText="This will not save your settings, but you can use it to display your queues in a personalized way. You will be able to select which queues to display and customize their appearance."
            href="/custom-display"
            icon={<TuneIcon />}
          />
        )}

        <TooltipGridButton
          text="System settings"
          tooltipText="Edit system settings, like number or message duration, max or min number (like 0 and 99), etc."
          href="/system-settings"
          icon={<SettingsIcon />}
        />

        <TooltipGridButton
          text="Audio settings"
          tooltipText="Add or remove audios"
          href="/audio-settings"
          icon={<AudioIcon />}
        />

        <TooltipGridButton
          text="Delete all data"
          tooltipText="This will delete all the application data."
          buttonColor="error"
          onClick={handleDeleteEverything}
          icon={<DeleteIcon />}
        />
      </Grid>
    </Container>
  );
};

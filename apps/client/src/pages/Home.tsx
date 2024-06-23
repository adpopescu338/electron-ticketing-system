import { useCtx } from 'hooks/useCtx';
import { Button, Divider, Grid, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TvIcon from '@mui/icons-material/Tv';
import DeleteIcon from '@mui/icons-material/Delete';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import styled from 'styled-components';
import swal from 'sweetalert';
import axios from 'axios';
import { AddressDisplayer } from 'components/AddressDisplayer';

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

const displayIntructions =
  "Press 'f' to toggle full screen. Press 'esc' to exit full screen, or to close the display.";

export const Home: React.FC = () => {
  const { queuesSettings = [], refetchQueuesSettings } = useCtx();

  const hasQ = !!queuesSettings?.length;

  const handleDelete = async (queueName: string) => {
    const proceed = await swal({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${queueName}?`,
      icon: 'warning',
      buttons: ['Cancel', 'Delete'],
      dangerMode: true,
    });

    if (!proceed) return;

    try {
      await axios.delete(`/api/q/${queueName}`);
      refetchQueuesSettings();
      swal('Success', 'Queue deleted', 'success');
    } catch (error) {
      swal('Error', 'Something went wrong', 'error');
    }
  };

  const handleDeleteEverything = async () => {
    const proceed = await swal({
      title: 'Are you sure?',
      text: `Are you sure you want to delete everything?`,
      icon: 'warning',
      buttons: ['Cancel', 'Delete'],
      dangerMode: true,
    });

    if (!proceed) return;

    try {
      await axios.delete(`/api/all`);
      refetchQueuesSettings();
      swal('Success', 'Everything deleted', 'success');
    } catch (error) {
      swal('Error', 'Something went wrong', 'error');
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
            <Grid item md={6} xs={12}>
              <Tooltip title="Open the page where you can interact with this queue, by calling the next number, etc.">
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  color="primary"
                  href={`/next/${queue.name}`}
                  endIcon={<QueuePlayNextIcon />}
                  id="queue-open-operation-page-button"
                >
                  Open
                </Button>
              </Tooltip>
            </Grid>
            <Grid item md={6} xs={12}>
              <Tooltip title={`Open this queue in a new display tab. ${displayIntructions}`}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  color="primary"
                  href={`/display/${queue.name}`}
                  target="_blank"
                  endIcon={<TvIcon />}
                  id={'queue-open-display-button-' + queue.name}
                >
                  Display
                </Button>
              </Tooltip>
            </Grid>
            <Grid item md={6} xs={12}>
              <Tooltip title="Configure this queue settings.">
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  color="primary"
                  endIcon={<EditIcon />}
                  href={`/queue/${queue.name}`}
                >
                  Settings
                </Button>
              </Tooltip>
            </Grid>
            <Grid item md={6} xs={12}>
              <Tooltip title="Delete this queue permanently. This action cannot be undone.">
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  color="error"
                  onClick={() => handleDelete!(queue.name)}
                  endIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </QueueOptionsContainer>
      ))}

      <Grid container spacing={2} direction="column" width="40%" minWidth="250px" margin="0 auto">
        <Grid item xs={12}>
          <Tooltip title="Create a new queue. You will be able to customize the default settings">
            <Button
              fullWidth
              variant="outlined"
              id="create-new-queue-button"
              size="large"
              href="/queue/_new"
              color="primary"
              endIcon={<AddCircleIcon />}
            >
              Create new queue
            </Button>
          </Tooltip>
        </Grid>
        {hasQ && (
          <Grid item xs={12}>
            <Tooltip title={`Open all queues in a new display tab. ${displayIntructions}`}>
              <Button
                variant="outlined"
                size="large"
                href="/display"
                target="_blank"
                fullWidth
                color="primary"
                endIcon={<QueuePlayNextIcon />}
              >
                Display all
              </Button>
            </Tooltip>
          </Grid>
        )}
        {hasQ && (
          <Grid item xs={12}>
            <Tooltip title="This will not save your settings, but you can use it to display your queues in a personalized way. You will be able to select which queues to display and customize their appearance.">
              <Button
                variant="outlined"
                fullWidth
                size="large"
                href="/custom-display"
                color="primary"
                endIcon={<TuneIcon />}
              >
                Custom display session
              </Button>
            </Tooltip>
          </Grid>
        )}
        <Grid item xs={12}>
          <Tooltip title="Edit system settings, like number or message duration, max or min number (like 0 and 99), etc.">
            <Button
              fullWidth
              variant="outlined"
              size="large"
              color="primary"
              href="/system-settings"
              endIcon={<SettingsIcon />}
            >
              Edit system settings
            </Button>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="This will delete all the application data.">
            <Button
              fullWidth
              variant="outlined"
              size="large"
              color="error"
              onClick={handleDeleteEverything}
              endIcon={<DeleteIcon />}
            >
              Delete all data
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </Container>
  );
};

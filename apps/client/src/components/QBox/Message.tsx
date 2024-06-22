import styled from 'styled-components';
import { QueueDisplaySettings } from '@repo/types';
import { useMaxFontSize } from '../../hooks/useMaxFontSize';

const Container = styled.div.attrs({
  className: 'queue-display-message-container',
})<{
  settings: QueueDisplaySettings;
}>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ settings }) => settings.color};
  background-color: ${({ settings }) => settings.backgroundColor};

  h1 {
    text-align: center;
  }
`;

export const Message: React.FC<{
  text: string;
  settings: QueueDisplaySettings;
  displayingOnDashboard?: boolean;
}> = ({ text, settings }) => {
  const [ref] = useMaxFontSize<HTMLHeadingElement>();

  return (
    <Container settings={settings} ref={ref}>
      <h1 id={'queue-message-text-' + settings.name}>{text}</h1>
    </Container>
  );
};

import { QBoxContainer } from './QBox/QBox';
import styled from 'styled-components';
import { useCtx } from '../../lib/Ctx';

const Wrapper = styled.div<{
  columns: number;
}>`
  display: grid;
  grid-template-columns: ${({ columns }) => new Array(columns).fill('1fr').join(' ')};
  height: 100vh;
  overflow: hidden;
}>`;

export const Display = () => {
  const { queuesSettings } = useCtx();

  if (!queuesSettings.length) {
    return <div>There are no queues to display</div>;
  }
  return (
    <Wrapper columns={queuesSettings.length}>
      {queuesSettings.map((queue) => {
        return <QBoxContainer key={queue.name} settings={queue} />;
      })}
    </Wrapper>
  );
};

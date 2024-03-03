import styled from 'styled-components';
import { QueueDisplaySettings } from '@repo/types';

export const Wrapper = styled.div<
  Pick<QueueDisplaySettings, 'color' | 'backgroundColor' | 'borderColor' | 'displayTitle'>
>`
  width: 100%;
  height: 100vh;
  border-left: ${({ borderColor }) => `3px solid ${borderColor}`};
  border-right: ${({ borderColor }) => `3px solid ${borderColor}`};
  color: ${({ color }) => color};
  background-color: ${({ backgroundColor }) => backgroundColor};
  ${({ displayTitle }) => !displayTitle && 'border-top: none;'}

  &:first-child {
    border-left: none;
  }

  &:last-child {
    border-right: none;
  }
`;

export const H1 = styled.h1`
  height: 15%;
  text-align: center;
  padding: 0;
  margin: 0;
`;

export const TD = styled.td<{
  borderColor: string;
}>`
  text-align: center;
  border-left: none;
  border-right: none;
  &:first-child {
    border-right: ${({ borderColor }) => `0.1vw solid ${borderColor}`};
  }
  &:last-child {
    border-left: ${({ borderColor }) => `0.1vw solid ${borderColor}`};
  }
`;

export const Table = styled.table<Pick<QueueDisplaySettings, 'borderColor' | 'displayTitle'>>`
  width: 100%;
  height: 100%;
  border: ${({ borderColor }) => `0.2vw solid ${borderColor}`};
  ${({ displayTitle }) => !displayTitle && 'border-top: none;'}
  border-collapse: collapse;
  border-left: none;
  border-right: none;
  table-layout: fixed;
`;

export const THead = styled.thead<Pick<QueueDisplaySettings, 'borderColor' | 'displayTitle'>>`
  height: 15%;
  font-size: 50%;
  th {
    border: ${({ borderColor }) => `0.2vw solid ${borderColor}`};
    ${({ displayTitle }) => !displayTitle && 'border-top: none;'}
    border-collapse: collapse;
    padding-right: 5px;
    padding-left: 5px;
    &:first-child {
      border-right: ${({ borderColor }) => `0.1vw solid ${borderColor}`};
      border-left: none;
    }
    &:last-child {
      border-left: ${({ borderColor }) => `0.1vw solid ${borderColor}`};
      border-right: none;
    }
  }
`;

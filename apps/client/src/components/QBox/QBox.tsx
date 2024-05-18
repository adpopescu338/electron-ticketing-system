import React from 'react';
import type { FeUseDataReturnType, QueueDisplaySettings } from '@repo/types';
import { useMaxFontSize } from '../../hooks/useMaxFontSize';
import { Table, Wrapper, H1, THead, TD } from './StyledComponents';
import autoAnimate from '@formkit/auto-animate';
import { Message } from './Message';
import { useQueueData } from '../../hooks/useQueueData';
import { useAudio } from '../../hooks/useAudio';

/**
 * We want to make the th font size as big as possible, but we don't want it to be as big as to exceed the width of the parent.
 * So we use useMaxFontSize to get the biggest font size that doesn't exceed the width of the parent.
 */
const TableHeader: React.FC<{
  settings: QueueDisplaySettings;
}> = ({ settings }) => {
  const [thRef, fs] = useMaxFontSize<HTMLTableCellElement>(undefined);

  const thStyle = React.useMemo(
    () => ({
      fontSize: fs,
    }),
    [fs]
  );

  const numberTextGteDeskText =
    settings.tableHeaderNumberText.length >= settings.tableHeaderDeskText.length;

  return (
    <THead borderColor={settings.borderColor} displayTitle={settings.displayTitle}>
      <tr>
        <th ref={numberTextGteDeskText ? thRef : undefined} style={thStyle}>
          {settings.tableHeaderNumberText}
        </th>

        <th ref={numberTextGteDeskText ? undefined : thRef} style={thStyle}>
          {settings.tableHeaderDeskText}
        </th>
      </tr>
    </THead>
  );
};

const TableBody: React.FC<{
  settings: QueueDisplaySettings;
  data: FeUseDataReturnType;
}> = ({ settings, data }) => {
  const [tbodyRef] = useMaxFontSize<HTMLTableSectionElement>(data.currentItems);

  React.useEffect(() => {
    if (!tbodyRef?.current) return;
    autoAnimate(tbodyRef.current);
  }, [tbodyRef]);

  return (
    <tbody ref={tbodyRef}>
      {data.currentItems.map((item, i) => {
        if (item === null) {
          return (
            <tr key={i}>
              {settings.isSequential && <TD borderColor={settings.borderColor}>-</TD>}
              <TD borderColor={settings.borderColor}>-</TD>
            </tr>
          );
        }
        return (
          <tr key={`${item.number}-${item.desk}-${item.createdAt}`}>
            {settings.isSequential && <TD borderColor={settings.borderColor}>{item.number}</TD>}
            <TD borderColor={settings.borderColor}>{item.desk}</TD>
          </tr>
        );
      })}
    </tbody>
  );
};

const QBox: React.FC<{
  settings: QueueDisplaySettings;
  data: FeUseDataReturnType;
}> = ({ settings, data }) => {
  const [h1Ref] = useMaxFontSize<HTMLHeadingElement>();

  useAudio(
    settings.numberAudioFileName,
    `${data.currentItems[0]?.number}-${data.currentItems[0]?.desk}`
  );

  return (
    <Wrapper {...settings}>
      {settings.displayTitle && <H1 ref={h1Ref}>{settings.name}</H1>}
      <div
        style={{
          height: settings.displayTitle ? `calc(100% - ${h1Ref?.current?.clientHeight}px)` : '100%',
        }}
      >
        <Table
          borderColor={settings.borderColor}
          displayTitle={settings.displayTitle}
          {...(settings.displayTitle && { h1Height: h1Ref?.current?.clientHeight })}
        >
          {settings.isSequential && <TableHeader settings={settings} />}
          <TableBody settings={settings} data={data} />
        </Table>
      </div>
    </Wrapper>
  );
};

export const QBoxContainer: React.FC<{
  settings: QueueDisplaySettings;
}> = ({ settings }) => {
  const data = useQueueData(settings.maxBoxesToDisplay, settings.name, false);

  if (data.message?.displayedAt) {
    return <Message text={data.message.text} settings={settings} displayingOnDashboard={false} />;
  }

  return <QBox settings={settings} data={data} />;
};

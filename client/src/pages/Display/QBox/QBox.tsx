import React from 'react';
import type { FeUseDataReturnType, QueueDisplaySettings } from '../../../../../types';
import { useMaxFontSize } from '../../../lib/useMaxFontSize';
import { Table, Wrapper, H1, THead, TD } from './StyledComponents';
import autoAnimate from '@formkit/auto-animate';
import { Message } from './Message';
import { useQueueData } from '../../../lib/useQueueData';
import { useAudio } from '../../../lib/useAudio';

const QBox: React.FC<{
  settings: QueueDisplaySettings;
  data: FeUseDataReturnType;
}> = ({ settings, data }) => {
  const [tbodyRef] = useMaxFontSize<HTMLTableSectionElement>(data.currentItems);
  const [h1Ref] = useMaxFontSize<HTMLHeadingElement>();
  const [thRef, fs] = useMaxFontSize<HTMLTableCellElement>(undefined);

  const thStyle = React.useMemo(
    () => ({
      fontSize: fs,
    }),
    [fs]
  );

  React.useEffect(() => {
    if (!tbodyRef?.current) return;
    autoAnimate(tbodyRef.current);
  }, [tbodyRef]);

  useAudio(
    settings.numberAudioFileName,
    `${data.currentItems[0]?.number}-${data.currentItems[0]?.desk}`
  );

  const numberTextGteDeskText =
    settings.tableHeaderNumberText.length >= settings.tableHeaderDeskText.length;

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
          <THead borderColor={settings.borderColor} displayTitle={settings.displayTitle}>
            <tr>
              <th ref={numberTextGteDeskText ? undefined : thRef} style={thStyle}>
                {settings.tableHeaderNumberText}
              </th>
              <th ref={numberTextGteDeskText ? thRef : undefined} style={thStyle}>
                {settings.tableHeaderDeskText}
              </th>
            </tr>
          </THead>

          <tbody ref={tbodyRef}>
            {data.currentItems.map((item, i) => {
              if (item === null) {
                return (
                  <tr key={i}>
                    <TD borderColor={settings.borderColor}>-</TD>
                    <TD borderColor={settings.borderColor}>-</TD>
                  </tr>
                );
              }
              return (
                <tr key={`${item.number}-${item.desk}-${item.createdAt}`}>
                  <TD borderColor={settings.borderColor}>{item.number}</TD>
                  <TD borderColor={settings.borderColor}>{item.desk}</TD>
                </tr>
              );
            })}
          </tbody>
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

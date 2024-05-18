export type QueueDisplaySettings = {
  maxBoxesToDisplay: number;
  displayTitle: boolean;
  color: string;
  backgroundColor: string;
  borderColor: string;
  name: string;
  messageColor: string;
  messageBackgroundColor: string;
  tableHeaderNumberText: string;
  tableHeaderDeskText: string;
  messageAudioFileName: string;
  numberAudioFileName: string;
  /**
   * If true, a number will be displayed on the screen.
   * Else, just the desk will be displayed.
   */
  isSequential: boolean;
  /**
   * If false, the desk won't be displayed, because it's assumed that there's only one server (counter).
   */
  isMultiServer: boolean;
};

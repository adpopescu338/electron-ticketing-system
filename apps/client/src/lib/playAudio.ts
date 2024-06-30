export const playAudio = (fileName: string) => {
    const audio = new Audio(`/audio/${fileName}`);
    audio.play();
};
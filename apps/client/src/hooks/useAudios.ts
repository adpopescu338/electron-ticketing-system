import axios from "axios";
import React, { useCallback } from "react";

export const useAudios = (
    onGetData?: (audios: string[]) => void
) => {
    const [audios, setAudios] = React.useState<string[]>([]);

    const fetchData = useCallback(() => {
        axios.get('/api/audios').then((res) => {
            setAudios(res.data);
            if (typeof onGetData === 'function') {
                onGetData(res.data)
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(fetchData, []);



    return {
        audios,
        refetchAudios: fetchData
    }
}
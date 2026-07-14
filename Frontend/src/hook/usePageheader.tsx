import { useContext, useEffect } from 'react';
import { HeaderContext } from "./HeaderContext";

export function usePageHeader(config) {
    const { setHeader } = useContext(HeaderContext);

    useEffect(() => {
        setHeader(config);

        return () =>
            setHeader({
                title: '',
                subtitle: '',
                action: null,
                action2:null
            });
    }, []);
}
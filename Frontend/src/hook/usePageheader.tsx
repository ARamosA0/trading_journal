import { useContext, useEffect } from 'react';
import { HeaderContext } from "./HeaderContext";
import type { HeaderType } from "./HeaderContext";

export function usePageHeader(config: HeaderType) {
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
    }, [config, setHeader]);
}

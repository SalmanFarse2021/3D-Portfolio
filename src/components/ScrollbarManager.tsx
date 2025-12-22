'use client';

import { useEffect } from 'react';

export default function ScrollbarManager() {
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            document.body.classList.add('is-scrolling');

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 1000);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    return null;
}

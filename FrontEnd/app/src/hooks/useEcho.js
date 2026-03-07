import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

const useEcho = () => {
    const [echoInstance, setEchoInstance] = useState(null);

    useEffect(() => {
        // Must be set before Echo tries to use Pusher
        window.Pusher = Pusher;

        const reverbKey = 'amine123';
        const reverbHost = 'localhost';
        const reverbPort = 8080;
        const reverbScheme = 'http';

        const echo = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: reverbHost,
            wsPort: reverbPort,
            wssPort: 443,
            forceTLS: reverbScheme === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        setEchoInstance(echo);

        return () => {
            if (echo) {
                echo.disconnect();
            }
        };
    }, []);
    return echoInstance;
}

export default useEcho;


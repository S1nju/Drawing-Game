import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
  window.Pusher = Pusher;

const useEcho = () => {
   const [echoInstance, setEchoInstance] = useState(null);

   useEffect(() => {
       const reverbKey =  'amine123';
       const reverbHost =  'localhost';
       const reverbPort = 8080;
       const reverbScheme =  'http';

     

       const echo = new Echo({
           broadcaster: 'reverb',
           key: reverbKey,
           wsHost: reverbHost,
           wsPort: reverbPort,
           wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
           forceTLS: (reverbScheme ?? 'https') === 'https',
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


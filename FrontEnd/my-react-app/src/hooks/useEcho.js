import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'amine123',
    wsHost: 'localhost',
    wsPort: 8080,
    forceTLS: false,
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: {
    headers: {
            'Accept': 'application/json',
            // Ensure this is NOT sending an undefined token
            'X-CSRF-TOKEN': null, 
        }
    }
});

export default echo;
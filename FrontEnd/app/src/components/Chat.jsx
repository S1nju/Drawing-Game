import React, { useEffect, useRef, useState } from 'react';
import useEcho from '../hooks/useEcho';

const Chat = ({ gameId, currentUser, drawerId }) => {
    const [messages, setMessages]   = useState([]);
    const [input, setInput]         = useState('');
    const [sending, setSending]     = useState(false);
    const bottomRef                 = useRef(null);
    const echo                      = useEcho();
    const isDrawer                  = currentUser?.id === drawerId;

    // Subscribe to chat channel
    useEffect(() => {
        if (!echo || !gameId) return;

        const channel = echo.channel(`chat.${gameId}`);

        channel.listen('.ChatMessage', (event) => {
            setMessages(prev => [...prev, {
                id:      Date.now() + Math.random(),
                user:    event.user,
                message: event.message,
                correct: event.correct,
            }]);
        });


        return () => {
            echo.leave(`chat.${gameId}`);
        };
    }, [echo, gameId]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending || isDrawer) return;

        setSending(true);
        try {
            await fetch(`http://localhost:8000/api/game/${gameId}/chat`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    user_id:   currentUser?.id,
                    user_name: currentUser?.name,
                    message:   trimmed,
                }),
            });
            setInput('');
        } catch (err) {
            console.error('Chat send failed:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div style={{
            display:        'flex',
            flexDirection:  'column',
            height:         '100%',
            backgroundColor:'#1a1a2e',
            borderLeft:     '2px solid #00c8c8',
            fontFamily:     'inherit',
        }}>
            {/* Header */}
            <div style={{
                padding:         '10px 14px',
                borderBottom:    '1px solid #2a2a4a',
                backgroundColor: '#16213e',
                fontWeight:      700,
                fontSize:        '13px',
                color:           '#00c8c8',
                letterSpacing:   '1px',
            }}>
                💬 CHAT
            </div>

            {/* Messages */}
            <div style={{
                flex:       1,
                overflowY:  'auto',
                padding:    '10px',
                display:    'flex',
                flexDirection: 'column',
                gap:        '6px',
            }}>
                {messages.length === 0 && (
                    <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                        {isDrawer ? 'Waiting for guesses…' : 'Type your guess below!'}
                    </p>
                )}
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        style={{
                            padding:         '6px 10px',
                            borderRadius:    '8px',
                            backgroundColor: msg.correct ? '#1a4a1a' : '#2a2a4a',
                            border:          msg.correct ? '1px solid #4caf50' : '1px solid transparent',
                        }}
                    >
                        <span style={{ fontWeight: 700, color: '#00c8c8', fontSize: '11px' }}>
                            {msg.user?.name || 'Unknown'}
                        </span>
                        {' '}
                        <span style={{ color: msg.correct ? '#81c784' : '#ccc', fontSize: '13px' }}>
                            {msg.message}
                        </span>
                        {msg.correct && (
                            <span style={{ marginLeft: '6px', fontSize: '14px' }}>✅</span>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
                padding:         '10px',
                borderTop:       '1px solid #2a2a4a',
                backgroundColor: '#16213e',
            }}>
                {isDrawer ? (
                    <p style={{
                        textAlign:  'center',
                        color:      '#aaa',
                        fontSize:   '12px',
                        margin:     0,
                        fontStyle:  'italic',
                    }}>
                        You are drawing — watch the guesses roll in!
                    </p>
                ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Type your guess…"
                            style={{
                                flex:            1,
                                padding:         '8px 12px',
                                borderRadius:    '6px',
                                border:          '1px solid #2a2a4a',
                                backgroundColor: '#0f0f23',
                                color:           'white',
                                fontSize:        '13px',
                                outline:         'none',
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !input.trim()}
                            style={{
                                padding:         '8px 14px',
                                borderRadius:    '6px',
                                border:          'none',
                                backgroundColor: sending ? '#333' : '#00c8c8',
                                color:           '#0f0f23',
                                fontWeight:      700,
                                cursor:          sending ? 'not-allowed' : 'pointer',
                                fontSize:        '13px',
                            }}
                        >
                            ↩
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

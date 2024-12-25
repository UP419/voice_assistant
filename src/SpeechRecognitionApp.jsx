import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpeechRecognitionApp = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [answer, setAnswer] = useState('');

    const askChatGPT = async (question) => {
        const apiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
        const endpoint = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: question },
            ],
            max_tokens: 150,
        };

        try {
            const response = await axios.post(endpoint, data, { headers });
            setAnswer(response.data);
            console.log('ChatGPT Response:', response.data);
        } catch (error) {
            console.error('Error from OpenAI API:', error);
        }
    };

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser does not support speech recognition');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            askChatGPT(transcript).then(r => console.log("sending question ", transcript));
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const latestTranscript = event.results[event.resultIndex][0].transcript;
            setTranscript(latestTranscript);
        };

        if (isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }

        return () => {
            recognition.stop();
        };
    }, [isListening]);

    return (
        <div>
            <p>{isListening ? 'Listening...' : 'Click to start listening'}</p>
            <button onClick={() => setIsListening(!isListening)}>
                {isListening ? 'Stop' : 'Start'} Listening
            </button>
            <p>Transcript: {transcript}</p>
            <p>The answer is: {answer}</p>
        </div>
    );
};

export default SpeechRecognitionApp;

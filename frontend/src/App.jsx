import React, { useEffect, useState } from 'react';
import echo from './echo';
import axios from 'axios';

// Configuration d'Axios pour inclure les cookies (pour Sanctum)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

function App() {
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Se connecter au canal et écouter l'événement
        echo.channel('cash-counts')
            .listen('CashCountUpdated', (e) => {
                console.log('Événement reçu !', e);
                setTotal(e.data.total);
            });

        // On pourrait avoir une fonction pour récupérer l'utilisateur connecté
        // axios.get('/api/user').then(response => setUser(response.data));

        return () => {
            echo.leaveChannel('cash-counts');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Pour que cela fonctionne, l'utilisateur doit être authentifié.
            // Il faudrait d'abord faire un appel à /sanctum/csrf-cookie
            await axios.get('/sanctum/csrf-cookie');
            // Puis envoyer la donnée
            await axios.post('/api/counts', { total: inputValue });
            setInputValue('');
        } catch (error) {
            console.error("Erreur lors de l'envoi du comptage", error);
        }
    };

    return (
        <div>
            <h1>Comptage de Caisse en Temps Réel</h1>
            <h2>Total actuel : {total} €</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nouveau total"
                />
                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
}

export default App;


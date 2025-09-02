import React, { useEffect, useState } from 'react';
// On importe directement les dépendances pour Echo
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

// On configure Pusher et on crée l'instance de Echo ici
// Cela résout le problème du fichier './echo' manquant
window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_TLS === 'true',
    enabledTransports: ['ws', 'wss'],
});


// Configuration d'Axios (c'était déjà parfait)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

function App() {
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState('');
    
    // --- NOUVEAUX ÉTATS ---
    // Pour gérer le chargement pendant l'envoi du formulaire
    const [isLoading, setIsLoading] = useState(false);
    // Pour afficher une erreur à l'utilisateur si l'envoi échoue
    const [error, setError] = useState('');

    useEffect(() => {
        // --- NOUVEAU : Récupération du total initial ---
        const fetchInitialCount = async () => {
            try {
                const response = await axios.get('/api/counts');
                // On met à jour le total avec la valeur de la base de données
                setTotal(response.data.total || 0);
            } catch (err) {
                console.error("Impossible de récupérer le total initial.", err);
                setError("Impossible de charger la valeur initiale depuis le serveur.");
            }
        };
        
        fetchInitialCount();

        // Connexion au canal WebSocket (c'était déjà parfait)
        const channel = echo.channel('cash-counts');
        
        channel.listen('CashCountUpdated', (e) => {
            console.log('Événement WebSocket reçu !', e);
            // Met à jour le total en temps réel quand un autre utilisateur le modifie
            setTotal(e.data.total);
        });

        // Nettoyage à la fermeture du composant
        return () => {
            channel.stopListening('CashCountUpdated');
            echo.leaveChannel('cash-counts');
        };
    }, []); // Le tableau vide assure que cet effet ne s'exécute qu'une fois au montage

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- GESTION DU CHARGEMENT ET DES ERREURS ---
        setIsLoading(true); // On active le chargement
        setError('');      // On efface les anciennes erreurs

        try {
            // Logique d'authentification Sanctum (déjà correcte)
            await axios.get('/sanctum/csrf-cookie');
            
            // Envoi de la nouvelle valeur
            await axios.post('/api/counts', { total: parseFloat(inputValue) });
            
            // On ne met pas à jour le total ici, on attend que l'événement WebSocket
            // le fasse pour être sûr que tout le monde est synchronisé.
            
            setInputValue(''); // On vide le champ
        } catch (err) {
            console.error("Erreur lors de l'envoi du comptage", err);
            setError("L'envoi a échoué. Veuillez réessayer."); // On affiche une erreur
        } finally {
            setIsLoading(false); // On désactive le chargement, que ça ait réussi ou non
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1 style={{ textAlign: 'center' }}>Comptage de Caisse en Temps Réel</h1>
            <h2 style={{ textAlign: 'center', fontSize: '2.5em', margin: '20px 0' }}>
                {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    step="0.01"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Nouveau total"
                    disabled={isLoading} // Le champ est désactivé pendant le chargement
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    required
                />
                <button 
                    type="submit" 
                    disabled={isLoading} // Le bouton est désactivé pendant le chargement
                    style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {isLoading ? 'Envoi en cours...' : 'Envoyer'}
                </button>
            </form>

            {/* Affichage du message d'erreur s'il y en a un */}
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
        </div>
    );
}

export default App;


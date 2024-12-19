document.getElementById('connectBtn').addEventListener('click', () => {
    const serverIp = document.getElementById('serverIp').value;
    const serverPort = document.getElementById('serverPort').value;

    if (!serverIp || !serverPort) {
        alert('Veuillez entrer une adresse IP et un port.');
        return;
    }

    const serverAddress = `ws://${serverIp}:${serverPort}`;
    const socket = new WebSocket(serverAddress);

    socket.onopen = () => {
        document.getElementById('connectionStatus').textContent = 'Statut : Connecté';
        socket.send(JSON.stringify({ type: 'join' }));
        console.log('Connexion établie. En attente d’un autre joueur...');
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'assignRole') {
            sessionStorage.setItem('playerRole', message.role);
            sessionStorage.setItem('serverAddress', serverAddress);
            console.log(`Vous êtes le joueur ${message.role}.`);
        }

        if (message.type === 'start') {
            alert('Le jeu commence !');
            window.location.href = './multi.html';
        }
    };

    socket.onerror = (error) => {
        console.error('Erreur WebSocket :', error);
        alert('Erreur de connexion au serveur.');
    };

    socket.onclose = () => {
        document.getElementById('connectionStatus').textContent = 'Statut : Déconnecté';
    };
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables du jeu
let player1 = { x: 50, y: 250, width: 30, height: 30, color: 'green', score: 0, ammo: 15, lastKey: 'right', weaponOffset: { x: 35, y: 12 }, hasBonus: false };
let player2 = { x: 730, y: 250, width: 30, height: 30, color: 'brown', score: 0, ammo: 15, lastKey: 'left', weaponOffset: { x: -5, y: 12 }, hasBonus: false };
let bullets = [];
let ammoDrops = [];
const bulletSpeed = 15;
const bulletHeight = 8;
const bulletWidth = 8;
const playerSpeed = 7;
const maxAmmo = 30;
const keys = {};
let obstacles = [];
let stars = [];

// Génération aléatoire des obstacles
function generateRandomObstacles(count) {
    obstacles = [];
    while (obstacles.length < count) {
        const obstacleX = Math.random() * (canvas.width - 50);
        const obstacleY = Math.random() * (canvas.height - 50);
        const newObstacle = { x: obstacleX, y: obstacleY, width: 50, height: 50 };

        // Vérifie que l'obstacle ne chevauche pas les joueurs ou d'autres obstacles
        const isColliding = obstacles.some(obstacle => checkCollision(obstacle, newObstacle)) ||
            checkCollision(newObstacle, player1) ||
            checkCollision(newObstacle, player2);

        if (!isColliding) {
            obstacles.push(newObstacle);
        }
    }
}

// Timer
let timeRemaining = 60;
let gameOver = false;

// Dessin des joueurs
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

// Dessin de l'arme
function drawWeapon(player) {
    ctx.fillStyle = 'black';
    let weaponX, weaponY;
    if (player.lastKey === 'right') {
        weaponX = player.x + player.width;
        weaponY = player.y + player.height / 2.2 - 5;
    } else if (player.lastKey === 'left') {
        weaponX = player.x - 10;
        weaponY = player.y + player.height / 2.2 - 5;
    } else if (player.lastKey === 'up') {
        weaponX = player.x + player.width / 2.2 - 5;
        weaponY = player.y - 10;
    } else if (player.lastKey === 'down') {
        weaponX = player.x + player.width / 2.2 - 5;
        weaponY = player.y + player.height;
    }
    ctx.fillRect(weaponX, weaponY, 10, 10); // Taille de l'arme
}

// Dessin des obstacles
function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        ctx.strokeStyle = 'black';
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Dessin des cartouches
function drawAmmoDrops() {
    ctx.fillStyle = 'lightblue';
    ammoDrops.forEach(drop => {
        ctx.fillRect(drop.x, drop.y, 10, 15);
    });
}

// Génération des cartouches
function spawnAmmoDrop() {
    const dropX = Math.random() * (canvas.width - 5);
    const dropY = Math.random() * (canvas.height - 5);

    // Vérifier si l'emplacement est libre (pas dans un obstacle)
    const isColliding = obstacles.some(obstacle =>
        checkCollision(
            { x: dropX, y: dropY, width: 5, height: 5 },
            obstacle
        )
    );

    if (!isColliding) {
        ammoDrops.push({ x: dropX, y: dropY });
    }
}

// Vérification de collision entre le joueur et les cartouches
function checkAmmoPickup(player) {
    ammoDrops = ammoDrops.filter(drop => {
        if (checkCollision(player, { x: drop.x, y: drop.y, width: 5, height: 5 })) {
            player.ammo = Math.min(player.ammo + 5, maxAmmo); // Ajoute 5 munitions, sans dépasser maxAmmo
            updateAmmoDisplay();
            return false;
        }
        return true;
    });
}

// Fonction pour afficher le timer
function drawTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    if (seconds < 10) seconds = '0' + seconds;
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Mise à jour du timer
function updateTimer() {
    if (timeRemaining > 0 && !gameOver) {
        timeRemaining--;
    } else if (timeRemaining === 0) {
        gameOver = true;
    }
}

// Vérification de collision entre deux objets
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Vérification des collisions avec les obstacles
function checkObstacleCollisions(player, newX, newY) {
    return obstacles.some(obstacle =>
        checkCollision(
            { x: newX, y: newY, width: player.width, height: player.height },
            obstacle
        )
    );
}

// Vérification de collision entre les joueurs
function checkPlayerCollisions() {
    if (checkCollision(player1, player2)) {
        // Empêcher les joueurs de se superposer
        const overlapX = (player1.x + player1.width / 2) - (player2.x + player2.width / 2);
        const overlapY = (player1.y + player1.height / 2) - (player2.y + player2.height / 2);

        if (Math.abs(overlapX) > Math.abs(overlapY)) {
            // Déplacer horizontalement
            if (overlapX > 0) {
                if (!checkObstacleCollisions(player1, player1.x + 5, player1.y) && player1.x + player1.width + 5 <= canvas.width) {
                    player1.x += playerSpeed;
                }
                if (!checkObstacleCollisions(player2, player2.x - 5, player2.y) && player2.x - 5 >= 0) {
                    player2.x -= playerSpeed;
                }
            } else {
                if (!checkObstacleCollisions(player1, player1.x - 5, player1.y) && player1.x - 5 >= 0) {
                    player1.x -= playerSpeed;
                }
                if (!checkObstacleCollisions(player2, player2.x + 5, player2.y) && player2.x + player2.width + 5 <= canvas.width) {
                    player2.x += playerSpeed;
                }
            }
        } else {
            // Déplacer verticalement
            if (overlapY > 0) {
                if (!checkObstacleCollisions(player1, player1.x, player1.y + 5) && player1.y + player1.height + 5 <= canvas.height) {
                    player1.y += 5;
                }
                if (!checkObstacleCollisions(player2, player2.x, player2.y - 5) && player2.y - 5 >= 0) {
                    player2.y -= 5;
                }
            } else {
                if (!checkObstacleCollisions(player1, player1.x, player1.y - 5) && player1.y - 5 >= 0) {
                    player1.y -= 5;
                }
                if (!checkObstacleCollisions(player2, player2.x, player2.y + 5) && player2.y + player2.height + 5 <= canvas.height) {
                    player2.y += 5;
                }
            }
        }

        console.log("Collision entre les joueurs détectée !");
    }
}

// Gestion des collisions des balles avec obstacles et joueurs
function checkBulletCollisions() {
    bullets = bullets.filter(bullet => {
        // Collision avec obstacles
        for (let obstacle of obstacles) {
            if (
                bullet.x + 5 > obstacle.x &&
                bullet.x < obstacle.x + obstacle.width &&
                bullet.y > obstacle.y &&
                bullet.y < obstacle.y + obstacle.height
            ) {
                return false; // Supprime la balle
            }
        }

        // Collision avec le joueur 2
        if (
            bullet.owner === 'player1' &&
            checkCollision({ x: bullet.x, y: bullet.y, width: 5, height: 5 }, player2)
        ) {
            player1.score++;
            updateScoreDisplay();
            return false; // Supprime la balle
        }

        // Collision avec le joueur 1
        if (
            bullet.owner === 'player2' &&
            checkCollision({ x: bullet.x, y: bullet.y, width: 5, height: 5 }, player1)
        ) {
            player2.score++;
            updateScoreDisplay();
            return false; // Supprime la balle
        }

        return true; // Conserve la balle
    });
}

// Mise à jour des scores
function updateScoreDisplay() {
    document.getElementById('scorePlayer1').textContent = player1.score;
    document.getElementById('scorePlayer2').textContent = player2.score;
}

// Mise à jour des munitions
function updateAmmoDisplay() {
    document.getElementById('ammoPlayer1').textContent = player1.ammo;
    document.getElementById('ammoPlayer2').textContent = player2.ammo;
}

function moveBullets() {
    bullets.forEach(bullet => {
        switch (bullet.direction) {
            case 'right': bullet.x += bulletSpeed; break;
            case 'left': bullet.x -= bulletSpeed; break;
            case 'up': bullet.y -= bulletSpeed; break;
            case 'down': bullet.y += bulletSpeed; break;
            case 'upright': bullet.x += bulletSpeed; bullet.y -= bulletSpeed; break;
            case 'upleft': bullet.x -= bulletSpeed; bullet.y -= bulletSpeed; break;
            case 'downright': bullet.x += bulletSpeed; bullet.y += bulletSpeed; break;
            case 'downleft': bullet.x -= bulletSpeed; bullet.y += bulletSpeed; break;
        }
    });
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height);
}

// Déplacement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0 && !checkObstacleCollisions(player1, player1.x, player1.y - 5)) {
        player1.y -= playerSpeed;
        player1.lastKey = 'up';
    }
    if (keys['s'] && player1.y < canvas.height - player1.height && !checkObstacleCollisions(player1, player1.x, player1.y + 5)) {
        player1.y += playerSpeed;
        player1.lastKey = 'down';
    }
    if (keys['a'] && player1.x > 0 && !checkObstacleCollisions(player1, player1.x - 5, player1.y)) {
        player1.x -= playerSpeed;
        player1.lastKey = 'left';
    }
    if (keys['d'] && player1.x < canvas.width - player1.width && !checkObstacleCollisions(player1, player1.x + 5, player1.y)) {
        player1.x += playerSpeed;
        player1.lastKey = 'right';
    }

    if (keys['ArrowUp'] && player2.y > 0 && !checkObstacleCollisions(player2, player2.x, player2.y - 5)) {
        player2.y -= playerSpeed;
        player2.lastKey = 'up';
    }
    if (keys['ArrowDown'] && player2.y < canvas.height - player2.height && !checkObstacleCollisions(player2, player2.x, player2.y + 5)) {
        player2.y += playerSpeed;
        player2.lastKey = 'down';
    }
    if (keys['ArrowLeft'] && player2.x > 0 && !checkObstacleCollisions(player2, player2.x - 5, player2.y)) {
        player2.x -= playerSpeed;
        player2.lastKey = 'left';
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !checkObstacleCollisions(player2, player2.x + 5, player2.y)) {
        player2.x += playerSpeed;
        player2.lastKey = 'right';
    }

    // Vérification des collisions entre les joueurs
    checkPlayerCollisions();

    // Vérification des ramassages de cartouches
    checkAmmoPickup(player1);
    checkAmmoPickup(player2);
}



// Fonction pour recharger la page
function reloadPage() {
    location.reload();
}

function drawStars() {
    ctx.fillStyle = 'gold';
    stars.forEach(star => {
        drawStar(ctx, star.x + 10, star.y + 10, 5, 10, 5);
    });
}

// Fonction utilitaire pour dessiner une étoile
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function spawnStar() {
    const starX = Math.random() * (canvas.width - 20);
    const starY = Math.random() * (canvas.height - 20);

    const isColliding = obstacles.some(obstacle =>
        checkCollision({ x: starX, y: starY, width: 20, height: 20 }, obstacle)
    );

    if (!isColliding) {
        stars.push({ x: starX, y: starY });
    }
}

// Appeler cette fonction toutes les 10 secondes
setInterval(spawnStar, 10000);

function checkStarPickup(player) {
    stars = stars.filter(star => {
        if (checkCollision(player, { x: star.x, y: star.y, width: 20, height: 20 })) {
            player.hasBonus = true; // Le joueur ramasse l'étoile
            return false; // Supprime l'étoile
        }
        return true;
    });
}

function shootBullet(player) {
    if (player.ammo > 0) {
        if (player.hasBonus) {
            // Tirer dans toutes les directions
            const directions = ['up', 'down', 'left', 'right', 'upleft', 'upright', 'downleft', 'downright'];
            directions.forEach(direction => {
                bullets.push({
                    x: player.x + player.width / 2,
                    y: player.y + player.height / 2,
                    direction: direction,
                    owner: player === player1 ? 'player1' : 'player2'
                });
            });
            player.hasBonus = false; // Consommer le bonus
        } else {
            // Tirer une balle normale
            bullets.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                direction: player.lastKey,
                owner: player === player1 ? 'player1' : 'player2'
            });
        }
        player.ammo--; // Réduire les munitions
        updateAmmoDisplay();
    }
}




// Boucle principale du jeu
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        if (player1.score > player2.score) {
            ctx.fillStyle = 'green';
            ctx.fillText('Player green Wins!', canvas.width / 2, canvas.height / 2.3);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 1.5);
        } else if (player2.score > player1.score) {
            ctx.fillStyle = 'red';
            ctx.fillText('Player red Wins!', canvas.width / 2, canvas.height / 2.3);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 1.5);
        } else {
            ctx.fillText("It's a Draw!", canvas.width / 2, canvas.height / 2.3);
            ctx.font = '40px Arial';
            ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 1.5);
        }
        return;
    }


    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    drawPlayer(player1);
    drawWeapon(player1);
    drawPlayer(player2);
    drawWeapon(player2);
    drawAmmoDrops();
    movePlayers();
    moveBullets();
    drawStars();
    checkStarPickup(player1);
    checkStarPickup(player2);
    

    checkBulletCollisions();

    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.owner === 'player1' ? 'green' : 'brown';
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });

    drawTimer();
    requestAnimationFrame(gameLoop);
}

// Gestion des événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && player1.ammo > 0 && !gameOver) shootBullet(player1);
    if (e.key === 'Enter' && player2.ammo > 0 && !gameOver) shootBullet(player2);
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Génération des obstacles aléatoires
generateRandomObstacles(5);

// Génération des cartouches toutes les 5 secondes 
setInterval(spawnAmmoDrop, 5000);

// Lancer le timer
setInterval(updateTimer, 1000);

// Démarrage du jeu
gameLoop();
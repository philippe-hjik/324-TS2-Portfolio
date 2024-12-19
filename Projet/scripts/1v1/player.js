export const player1 = { x: 50, y: 250, width: 30, height: 30, color: 'green', score: 0, ammo: 15, lastKey: 'right', weaponOffset: { x: 35, y: 12 } };
export const player2 = { x: 730, y: 250, width: 30, height: 30, color: 'brown', score: 0, ammo: 15, lastKey: 'left', weaponOffset: { x: -5, y: 12 } };
export const playerSpeed = 7;
const maxAmmo = 30;

export function drawPlayer(ctx, player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

export function movePlayers(keys, canvas, obstacles, checkObstacleCollisions, checkPlayerCollisions, checkAmmoPickup) {
    // Déplacement des joueurs avec collisions
    // Similaire à votre implémentation
    // Appelez `checkObstacleCollisions` et `checkPlayerCollisions` en tant qu'arguments
}

export function shootBullet(player, bullets, updateAmmoDisplay) {
    if (player.ammo > 0) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            direction: player.lastKey,
            owner: player === player1 ? 'player1' : 'player2'
        });
        player.ammo--;
        updateAmmoDisplay();
    }
}

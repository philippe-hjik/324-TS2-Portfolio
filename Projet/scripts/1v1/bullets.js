import { ctx, bullets, bulletSpeed, bulletHeight, bulletWidth } from './game.js';

export function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.owner === 'player1' ? 'green' : 'brown';
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });
}

export function moveBullets() {
    bullets.forEach(bullet => {
        switch (bullet.direction) {
            case 'right':
                bullet.x += bulletSpeed;
                break;
            case 'left':
                bullet.x -= bulletSpeed;
                break;
            case 'up':
                bullet.y -= bulletSpeed;
                break;
            case 'down':
                bullet.y += bulletSpeed;
                break;
        }
    });
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height);
}

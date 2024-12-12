
export const bulletSpeed = 5;

// Fonction de mouvement des balles
export function moveBullets(bullets, canvas) {
    bullets.forEach(bullet => {
        bullet.x += bullet.direction === 'right' ? bulletSpeed : -bulletSpeed;
    });
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width); // Retire les balles hors de l'écran
    console.log(bullets);  // Log après le filtrage
}
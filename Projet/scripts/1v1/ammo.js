export let ammoDrops = [];

export function spawnAmmoDrop(canvas, obstacles, checkCollision) {
    const dropX = Math.random() * (canvas.width - 5);
    const dropY = Math.random() * (canvas.height - 5);

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

export function drawAmmoDrops(ctx) {
    ctx.fillStyle = 'yellow';
    ammoDrops.forEach(drop => {
        ctx.fillRect(drop.x, drop.y, 10, 15);
    });
}

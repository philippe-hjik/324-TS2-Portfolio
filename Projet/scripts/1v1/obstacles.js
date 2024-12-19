export let obstacles = [];

export function generateRandomObstacles(count, canvas, players, checkCollision) {
    obstacles = [];
    while (obstacles.length < count) {
        const obstacleX = Math.random() * (canvas.width - 50);
        const obstacleY = Math.random() * (canvas.height - 50);
        const newObstacle = { x: obstacleX, y: obstacleY, width: 50, height: 50 };

        const isColliding = obstacles.some(obstacle => checkCollision(obstacle, newObstacle)) ||
            checkCollision(newObstacle, players.player1) ||
            checkCollision(newObstacle, players.player2);

        if (!isColliding) {
            obstacles.push(newObstacle);
        }
    }
}

export function drawObstacles(ctx) {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

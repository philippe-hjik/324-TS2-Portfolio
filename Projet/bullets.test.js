// sum.test.js
import { expect, test } from 'vitest'
import { moveBullets, bulletSpeed } from './scripts/PointStrat/bullet.js'; // Ta fonction à tester

let canvas = { width: 100, height: 100 };

let bullets = [
  { x: 10, direction: 'right' },
  { x: 90, direction: 'left' },
  { x: -5, direction: 'right' }, // Hors de l'écran (gauche)
  { x: 105, direction: 'left' }, // Hors de l'écran (droite)
];

test('déplace les balles dans la bonne direction', () => {
  moveBullets(bullets, canvas);
  expect(bullets).toEqual([
    { x: 10 + bulletSpeed, direction: 'right' },
    { x: 90 - bulletSpeed, direction: 'left' },
    { x: -5 + bulletSpeed, direction: 'right' }, // Hors de l'écran (gauche)
    { x: 105 - bulletSpeed, direction: 'left' }, // Hors de l'écran (droite)
  ]);
});

test('retire les balles hors de l\'écran', () => {
  moveBullets(bullets, canvas);
  // Vérifie que seules les balles valides restent
  expect(bullets.every(bullet => bullet.x > 0 && bullet.x < canvas.width)).toBe(true);
});
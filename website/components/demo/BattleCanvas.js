'use client';

import React, { useRef, useEffect } from 'react';
import { CombatPhase } from '../../utils/combatEngine';

export const BattleCanvas = ({
  playerUnitRef,
  enemyUnitRef,
  trapsRef,
  fxRef,
  terrain,
}) => {
  const canvasRef = useRef(null);
  const terrainImgRef = useRef(null);

  // Preload and cache terrain texture image
  useEffect(() => {
    if (!terrain?.texture) return;
    const img = new Image();
    img.src = terrain.texture;
    img.onload = () => {
      terrainImgRef.current = img;
    };
  }, [terrain?.texture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let trackOffset = 0;

    // High-DPI setup
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Handle Camera Shake
      const shake = fxRef.current.shake || 0;
      let shakeX = 0;
      let shakeY = 0;
      if (shake > 0) {
        shakeX = (Math.random() - 0.5) * shake * 12;
        shakeY = (Math.random() - 0.5) * shake * 12;
        fxRef.current.shake = Math.max(0, shake - 0.08);
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.translate(shakeX, shakeY);

      // --- 1. Draw Battlefield Terrain Ground & Texture ---
      if (terrainImgRef.current && terrainImgRef.current.complete && terrainImgRef.current.naturalWidth > 0) {
        ctx.drawImage(terrainImgRef.current, 0, 0, width, height);
        // Vignette & dark atmospheric tint to ensure runners and particles contrast sharply
        ctx.fillStyle = 'rgba(10, 10, 9, 0.42)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#0a0a09';
        ctx.fillRect(0, 0, width, height);
      }

      // Grid Perspective Lines with terrain accent tint
      ctx.strokeStyle = terrain?.themeColor ? `${terrain.themeColor}2e` : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSpacing = 32;
      trackOffset = (trackOffset + 0.4) % gridSpacing;
      for (let x = -gridSpacing; x < width + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + trackOffset, 0);
        ctx.lineTo(x + trackOffset, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- 2. Track Lanes & Chevron Runways ---
      const laneY = height * 0.5;
      const baseLeftX = width * 0.12;
      const baseRightX = width * 0.88;
      const centerX = width * 0.5;

      // Player Half Track Highway (Blue neon lane)
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.3)';
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(baseLeftX, laneY);
      ctx.lineTo(centerX, laneY);
      ctx.stroke();

      // Enemy Half Track Highway (Red neon lane)
      ctx.strokeStyle = 'rgba(127, 29, 29, 0.3)';
      ctx.lineWidth = 32;
      ctx.beginPath();
      ctx.moveTo(centerX, laneY);
      ctx.lineTo(baseRightX, laneY);
      ctx.stroke();

      // Base Lines
      // Player Base Line (Blue neon)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseLeftX, 10);
      ctx.lineTo(baseLeftX, height - 10);
      ctx.stroke();

      // Enemy Base Line (Red neon)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseRightX, 10);
      ctx.lineTo(baseRightX, height - 10);
      ctx.stroke();

      // Center Combat Line (Gold / Accent Neon)
      ctx.strokeStyle = '#FF4F33';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, 5);
      ctx.lineTo(centerX, height - 5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Line Glow
      ctx.fillStyle = '#FF4F33';
      ctx.beginPath();
      ctx.arc(centerX, laneY, 6, 0, Math.PI * 2);
      ctx.fill();

      // --- 3. Active Traps On Center Line ---
      const traps = trapsRef.current || {};
      if (traps.playerTrap || traps.enemyTrap) {
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, laneY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TRAP', centerX, laneY + 3);
        ctx.restore();
      }

      // --- 4. Render Runners ---
      const player = playerUnitRef.current;
      const enemy = enemyUnitRef.current;
      const time = performance.now() * 0.005;

      // Draw Player Runner (Starts left at baseLeftX, charges right to centerX)
      if (player) {
        const pProgress = player.trackProgress || 0;
        const px = baseLeftX + (centerX - baseLeftX) * pProgress;
        const py = laneY;
        const isRunning = player.currentPhase === CombatPhase.RUN;
        const isRetreating = player.currentPhase === CombatPhase.COOLDOWN;
        const isMoving = isRunning || isRetreating;
        const bob = isMoving ? Math.sin(time * 12) * 4 : 0;
        // When retreating home, player faces left towards base; otherwise faces right
        const facingRight = !isRetreating;

        // Runner Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(px, py + 16, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thruster / Speed Particles
        if (isMoving) {
          ctx.fillStyle = isRunning ? '#38bdf8' : '#f59e0b';
          for (let i = 0; i < 3; i++) {
            // If facing right, exhaust sprays left. If facing left (retreating), exhaust sprays right!
            const partX = facingRight
              ? px - 18 - Math.random() * 12
              : px + 18 + Math.random() * 12;
            const partY = py + (Math.random() - 0.5) * 10;
            ctx.beginPath();
            ctx.arc(partX, partY, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Runner Chassis Box (Chibi Mech)
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.fillRect(px - 14, py - 16 + bob, 28, 28);
        ctx.strokeRect(px - 14, py - 16 + bob, 28, 28);

        // Core Diode Eye (Positioned on the side the bot is facing)
        ctx.fillStyle = player.chip?.diode_color || '#00E5FF';
        const eyeX = facingRight ? px - 4 : px - 10;
        ctx.fillRect(eyeX, py - 8 + bob, 14, 6);

        // Name Tag & Mini ATB Bar
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, px, py - 22 + bob);

        // Mini ATB Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 18, py + 22, 36, 4);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(px - 18, py + 22, (player.actionBar / 100) * 36, 4);
      }

      // Draw Enemy Runner (Starts right at baseRightX, charges left to centerX)
      if (enemy) {
        const eProgress = enemy.trackProgress || 0;
        const ex = baseRightX - (baseRightX - centerX) * eProgress;
        const ey = laneY;
        const isRunning = enemy.currentPhase === CombatPhase.RUN;
        const isRetreating = enemy.currentPhase === CombatPhase.COOLDOWN;
        const isMoving = isRunning || isRetreating;
        const bob = isMoving ? Math.sin(time * 12) * 4 : 0;
        // When retreating home, enemy faces right towards base; otherwise faces left
        const facingLeft = !isRetreating;

        // Runner Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(ex, ey + 16, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thruster / Speed Particles
        if (isMoving) {
          ctx.fillStyle = isRunning ? '#ef4444' : '#f59e0b';
          for (let i = 0; i < 3; i++) {
            // If facing left, exhaust sprays right. If facing right (retreating), exhaust sprays left!
            const partX = facingLeft
              ? ex + 18 + Math.random() * 12
              : ex - 18 - Math.random() * 12;
            const partY = ey + (Math.random() - 0.5) * 10;
            ctx.beginPath();
            ctx.arc(partX, partY, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Runner Chassis Box (Chibi Mech)
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.fillRect(ex - 14, ey - 16 + bob, 28, 28);
        ctx.strokeRect(ex - 14, ey - 16 + bob, 28, 28);

        // Core Diode Eye (Positioned on the side the bot is facing)
        ctx.fillStyle = enemy.chip?.diode_color || '#FFA500';
        const eyeX = facingLeft ? ex - 10 : ex - 4;
        ctx.fillRect(eyeX, ey - 8 + bob, 14, 6);

        // Name Tag & Mini ATB Bar
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, ex, ey - 22 + bob);

        // Mini ATB Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ex - 18, ey + 22, 36, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex - 18, ey + 22, (enemy.actionBar / 100) * 36, 4);
      }

      // --- 5. Kinetic Combat Particles & Attack Animations ---
      const particles = fxRef.current.particles || [];
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        if (p.type === 'slash') {
          ctx.lineWidth = 3;
          ctx.strokeStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, p.angle, p.angle + Math.PI * 0.7);
          ctx.stroke();
        } else if (p.type === 'ring') {
          ctx.lineWidth = 2;
          ctx.strokeStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1.8 - p.life), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // --- 6. Floating Damage Popups ---
      const popups = fxRef.current.popups || [];
      for (let i = popups.length - 1; i >= 0; i--) {
        const pop = popups[i];
        pop.y -= 0.8;
        pop.life -= 0.025;

        if (pop.life <= 0) {
          popups.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.min(1.0, pop.life * 1.5);
        if (typeof pop.damage === 'string') {
          ctx.font = 'bold 13px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.textAlign = 'center';
          ctx.fillText(`⚠️ ${pop.damage} [${pop.slotName}]`, pop.x, pop.y);
        } else {
          ctx.font = pop.isCrit ? 'bold 15px monospace' : 'bold 13px monospace';
          ctx.fillStyle = pop.isCrit ? '#f59e0b' : '#ef4444';
          ctx.textAlign = 'center';
          ctx.fillText(`-${pop.damage} HP [${pop.slotName}]`, pop.x, pop.y);
          if (pop.isCrit) {
            ctx.font = 'bold 9px monospace';
            ctx.fillText('[CRITICAL!]', pop.x, pop.y - 12);
          }
        }
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [playerUnitRef, enemyUnitRef, trapsRef, fxRef]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block rounded-sm bg-black"
    />
  );
};

'use client';

import React, { useRef, useEffect } from 'react';
import { CombatPhase, PartSlot } from '../../utils/combatEngine';

export const BattleCanvas = ({
  playerUnitRef,
  enemyUnitRef,
  playerUnitsRef,
  enemyUnitsRef,
  trapsRef,
  fxRef,
  terrain,
  teamSize = 1,
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
        ctx.fillStyle = 'rgba(10, 10, 9, 0.45)';
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

      // Resolve Units arrays
      const playerUnits = playerUnitsRef?.current || (playerUnitRef?.current ? [playerUnitRef.current] : []);
      const enemyUnits = enemyUnitsRef?.current || (enemyUnitRef?.current ? [enemyUnitRef.current] : []);
      const activeCount = Math.max(playerUnits.length, enemyUnits.length, teamSize);

      // --- 2. Track Lanes & Chevron Runways (Stacked Vertically) ---
      // New bots are placed BELOW the current position of preceding bots
      const laneYPositions =
        activeCount === 3
          ? [height * 0.28, height * 0.50, height * 0.72]
          : activeCount === 2
          ? [height * 0.38, height * 0.64]
          : [height * 0.50];

      const baseLeftX = width * 0.12;
      const baseRightX = width * 0.88;
      const centerX = width * 0.5;
      const trackThickness = activeCount > 1 ? 24 : 32;

      laneYPositions.forEach((laneY, idx) => {
        // Player Half Track Highway (Blue neon lane)
        ctx.strokeStyle = 'rgba(30, 58, 138, 0.28)';
        ctx.lineWidth = trackThickness;
        ctx.beginPath();
        ctx.moveTo(baseLeftX, laneY);
        ctx.lineTo(centerX, laneY);
        ctx.stroke();

        // Enemy Half Track Highway (Red neon lane)
        ctx.strokeStyle = 'rgba(127, 29, 29, 0.28)';
        ctx.lineWidth = trackThickness;
        ctx.beginPath();
        ctx.moveTo(centerX, laneY);
        ctx.lineTo(baseRightX, laneY);
        ctx.stroke();

        // Lane Designation Watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(idx === 0 ? '👑 LANE 1 [LEADER]' : `LANE ${idx + 1} [SUPPORT]`, baseLeftX - 70, laneY + 3);
      });

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

      // Center Line Lane Points
      laneYPositions.forEach((laneY) => {
        ctx.fillStyle = '#FF4F33';
        ctx.beginPath();
        ctx.arc(centerX, laneY, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 3. Active Traps On Center Line ---
      const traps = trapsRef.current || {};
      if (traps.playerTrap || traps.enemyTrap) {
        laneYPositions.forEach((laneY) => {
          ctx.save();
          ctx.fillStyle = '#f59e0b';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, laneY, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TRAP', centerX, laneY + 3);
          ctx.restore();
        });
      }

      // --- 4. Render Runners ---
      const time = performance.now() * 0.005;

      // Draw Player Runners
      playerUnits.forEach((player, idx) => {
        if (!player) return;
        const laneY = laneYPositions[idx] || laneYPositions[0];
        const isDead = (player.integrities?.[PartSlot.HEAD] || 0) <= 0;

        if (isDead) {
          // Deactivated/Defeated Unit representation
          const px = baseLeftX;
          const py = laneY;

          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          ctx.ellipse(px, py + 14, 14, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.fillRect(px - 12, py - 14, 24, 24);
          ctx.strokeRect(px - 12, py - 14, 24, 24);

          // Smoking sparks
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(px + (Math.sin(time * 5 + idx) * 4), py - 18 - (Math.abs(Math.sin(time * 3)) * 8), 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${player.name} [DISABLED]`, px, py - 20);
          return;
        }

        const pProgress = player.trackProgress || 0;
        const px = baseLeftX + (centerX - baseLeftX) * pProgress;
        const py = laneY;
        const isRunning = player.currentPhase === CombatPhase.RUN;
        const isRetreating = player.currentPhase === CombatPhase.COOLDOWN;
        const isMoving = isRunning || isRetreating;
        const bob = isMoving ? Math.sin(time * 12 + idx) * 3 : 0;
        const facingRight = !isRetreating;

        // Runner Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(px, py + 14, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thruster / Speed Particles
        if (isMoving) {
          ctx.fillStyle = isRunning ? '#38bdf8' : '#f59e0b';
          for (let i = 0; i < 2; i++) {
            const partX = facingRight ? px - 16 - Math.random() * 10 : px + 16 + Math.random() * 10;
            const partY = py + (Math.random() - 0.5) * 8;
            ctx.beginPath();
            ctx.arc(partX, partY, 2 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Runner Chassis Box (Chibi Mech)
        ctx.fillStyle = '#2563eb';
        ctx.strokeStyle = idx === 0 ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = idx === 0 ? 2.5 : 2;
        ctx.fillRect(px - 13, py - 15 + bob, 26, 26);
        ctx.strokeRect(px - 13, py - 15 + bob, 26, 26);

        // Core Diode Eye
        ctx.fillStyle = player.chip?.diode_color || '#00E5FF';
        const eyeX = facingRight ? px - 3 : px - 9;
        ctx.fillRect(eyeX, py - 7 + bob, 12, 5);

        // Leader Crown / Tag
        if (idx === 0) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('👑 LEADER', px, py - 26 + bob);
        }

        // Name Tag
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, px, py - (idx === 0 ? 17 : 19) + bob);

        // Mini ATB Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 16, py + 18, 32, 3.5);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(px - 16, py + 18, ((player.actionBar || 0) / 100) * 32, 3.5);
      });

      // Draw Enemy Runners
      enemyUnits.forEach((enemy, idx) => {
        if (!enemy) return;
        const laneY = laneYPositions[idx] || laneYPositions[0];
        const isDead = (enemy.integrities?.[PartSlot.HEAD] || 0) <= 0;

        if (isDead) {
          // Deactivated/Defeated Unit representation
          const ex = baseRightX;
          const ey = laneY;

          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          ctx.ellipse(ex, ey + 14, 14, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.fillRect(ex - 12, ey - 14, 24, 24);
          ctx.strokeRect(ex - 12, ey - 14, 24, 24);

          // Smoking sparks
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(ex + (Math.sin(time * 5 + idx) * 4), ey - 18 - (Math.abs(Math.sin(time * 3)) * 8), 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${enemy.name} [DISABLED]`, ex, ey - 20);
          return;
        }

        const eProgress = enemy.trackProgress || 0;
        const ex = baseRightX - (baseRightX - centerX) * eProgress;
        const ey = laneY;
        const isRunning = enemy.currentPhase === CombatPhase.RUN;
        const isRetreating = enemy.currentPhase === CombatPhase.COOLDOWN;
        const isMoving = isRunning || isRetreating;
        const bob = isMoving ? Math.sin(time * 12 + idx) * 3 : 0;
        const facingLeft = !isRetreating;

        // Runner Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(ex, ey + 14, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thruster / Speed Particles
        if (isMoving) {
          ctx.fillStyle = isRunning ? '#ef4444' : '#f59e0b';
          for (let i = 0; i < 2; i++) {
            const partX = facingLeft ? ex + 16 + Math.random() * 10 : ex - 16 - Math.random() * 10;
            const partY = ey + (Math.random() - 0.5) * 8;
            ctx.beginPath();
            ctx.arc(partX, partY, 2 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Runner Chassis Box (Chibi Mech)
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = idx === 0 ? '#f59e0b' : '#f87171';
        ctx.lineWidth = idx === 0 ? 2.5 : 2;
        ctx.fillRect(ex - 13, ey - 15 + bob, 26, 26);
        ctx.strokeRect(ex - 13, ey - 15 + bob, 26, 26);

        // Core Diode Eye
        ctx.fillStyle = enemy.chip?.diode_color || '#FFA500';
        const eyeX = facingLeft ? ex - 9 : ex - 3;
        ctx.fillRect(eyeX, ey - 7 + bob, 12, 5);

        // Leader Crown / Tag
        if (idx === 0) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('👑 RIVAL LEADER', ex, ey - 26 + bob);
        }

        // Name Tag
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, ex, ey - (idx === 0 ? 17 : 19) + bob);

        // Mini ATB Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ex - 16, ey + 18, 32, 3.5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex - 16, ey + 18, ((enemy.actionBar || 0) / 100) * 32, 3.5);
      });

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
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.textAlign = 'center';
          ctx.fillText(`⚠️ ${pop.damage} [${pop.slotName}]`, pop.x, pop.y);
        } else {
          ctx.font = pop.isCrit ? 'bold 14px monospace' : 'bold 12px monospace';
          ctx.fillStyle = pop.isCrit ? '#f59e0b' : '#ef4444';
          ctx.textAlign = 'center';
          ctx.fillText(`-${pop.damage} HP [${pop.slotName}]`, pop.x, pop.y);
          if (pop.isCrit) {
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText('CRITICAL!', pop.x, pop.y - 14);
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
  }, [terrain, teamSize, playerUnitRef, enemyUnitRef, playerUnitsRef, enemyUnitsRef, trapsRef, fxRef]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

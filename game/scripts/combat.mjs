// Combat system for void fighting game
// Handles health, damage, attacks, knockback, and win conditions

import { Body, Vector } from './physics.mjs';

export class CombatSystem {
    constructor() {
        this.attacks = new Map(); // Track active attacks
    }

    // Apply damage to a player
    applyDamage(attacker, defender, attackType) {
        const damage = this.calculateDamage(attacker, attackType);
        defender.health -= damage;
        defender.damagePercent += damage;
        
        // Clamp health
        if (defender.health < 0) defender.health = 0;
        
        // Apply knockback
        this.applyKnockback(attacker, defender, damage);
        
        // Trigger hit animation
        if (defender.sprite && defender.sprite.setAnimation) {
            defender.sprite.setAnimation('Hit');
        }
        
        return {
            damage: damage,
            remainingHealth: defender.health,
            isDead: defender.health <= 0
        };
    }

    // Calculate damage based on attack type and character stats
    calculateDamage(attacker, attackType) {
        const baseDamage = {
            'light': 5,
            'heavy': 15,
            'special': 20
        };
        
        const damage = baseDamage[attackType] || 5;
        const multiplier = attacker.attackPower || 1.0;
        
        return Math.floor(damage * multiplier);
    }

    // Apply knockback based on damage and defender's current damage percent
    applyKnockback(attacker, defender, damage) {
        if (!defender.body) return;
        
        // Calculate knockback direction (away from attacker)
        const direction = {
            x: defender.body.position.x - attacker.body.position.x,
            y: defender.body.position.y - attacker.body.position.y
        };
        
        // Normalize direction
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
        }
        
        // Knockback increases with damage percent (Smash Bros style)
        const baseKnockback = damage * 0.1;
        const percentMultiplier = 1 + (defender.damagePercent / 100);
        const weightResistance = defender.weight ? (100 / defender.weight) : 1;
        
        const knockbackForce = baseKnockback * percentMultiplier * weightResistance;
        
        // Apply the force
        const force = Vector.create(
            direction.x * knockbackForce,
            direction.y * knockbackForce - 0.5 // Add upward component
        );
        
        Body.applyForce(defender.body, defender.body.position, force);
    }

    // Check if attack hitbox overlaps with defender
    checkHitboxCollision(attacker, defender, attackHitbox) {
        if (!defender.body) return false;
        
        // Simple rectangular hitbox check
        const defenderBounds = this.getBodyBounds(defender.body);
        const hitboxBounds = {
            x: attacker.body.position.x + attackHitbox.offsetX,
            y: attacker.body.position.y + attackHitbox.offsetY,
            width: attackHitbox.width,
            height: attackHitbox.height
        };
        
        return this.rectanglesOverlap(hitboxBounds, defenderBounds);
    }

    // Get bounding box for a physics body
    getBodyBounds(body) {
        return {
            x: body.position.x - body.circleRadius || body.bounds.min.x,
            y: body.position.y - body.circleRadius || body.bounds.min.y,
            width: (body.circleRadius || (body.bounds.max.x - body.bounds.min.x)) * 2,
            height: (body.circleRadius || (body.bounds.max.y - body.bounds.min.y)) * 2
        };
    }

    // Check if two rectangles overlap
    rectanglesOverlap(rect1, rect2) {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect2.x + rect2.width < rect1.x ||
            rect1.y + rect1.height < rect2.y ||
            rect2.y + rect2.height < rect1.y
        );
    }

    // Check win condition
    checkWinCondition(players) {
        const alivePlayers = players.filter(p => p.health > 0 && !p.isOffStage);
        
        if (alivePlayers.length === 1) {
            return { winner: alivePlayers[0], reason: 'knockout' };
        } else if (alivePlayers.length === 0) {
            return { winner: null, reason: 'draw' };
        }
        
        return null;
    }

    // Check if player is off stage (below screen)
    checkOffStage(player, screenHeight) {
        if (!player.body) return false;
        
        const isOffStage = player.body.position.y > screenHeight + 200;
        if (isOffStage) {
            player.isOffStage = true;
            player.health = 0; // Instant death
        }
        
        return isOffStage;
    }
}

// Attack hitbox definitions for different moves
export const AttackHitboxes = {
    light: {
        width: 60,
        height: 60,
        offsetX: 40,
        offsetY: 0,
        duration: 15, // frames
        damage: 5
    },
    heavy: {
        width: 80,
        height: 80,
        offsetX: 50,
        offsetY: -10,
        duration: 25,
        damage: 15
    },
    special: {
        width: 100,
        height: 100,
        offsetX: 60,
        offsetY: -20,
        duration: 30,
        damage: 20
    }
};

import React, { useEffect, useCallback } from 'react';
import { JUMP_VELOCITY } from './GameEngine';

interface GameControlsProps {
  gameActive: boolean;
  isJumping: boolean;
  setIsJumping: (isJumping: boolean) => void;
  setIsDucking: (isDucking: boolean) => void;
  setDinoVelocity: (velocity: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameActive,
  isJumping,
  setIsJumping,
  setIsDucking,
  setDinoVelocity,
  canvasRef
}) => {
  // Handle jump action - memoize to prevent recreating on each render
  const handleJump = useCallback(() => {
    if (!isJumping && gameActive) {
      setIsJumping(true);
      setDinoVelocity(-JUMP_VELOCITY);
    }
  }, [gameActive, isJumping, setIsJumping, setDinoVelocity]);

  // Handle duck action - memoize to prevent recreating on each render
  const handleDuckStart = useCallback(() => {
    if (gameActive) {
      setIsDucking(true);
    }
  }, [gameActive, setIsDucking]);

  const handleDuckEnd = useCallback(() => {
    if (gameActive) {
      setIsDucking(false);
    }
  }, [gameActive, setIsDucking]);

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && gameActive) {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' && gameActive) {
        e.preventDefault();
        handleDuckStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' && gameActive) {
        e.preventDefault();
        handleDuckEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameActive, isJumping, handleJump, handleDuckStart, handleDuckEnd]);

  // Set up touch event listeners for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameActive) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (gameActive) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;

        if (deltaY < -30) {
          // Swipe up - jump
          handleJump();
        } else if (deltaY > 30) {
          // Swipe down - duck
          handleDuckStart();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (gameActive) {
        handleDuckEnd();
      }
    };

    // Ensure canvas exists before adding event listeners
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('touchend', handleTouchEnd);

      // Clean up listeners when component unmounts
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
    
    // Return empty cleanup function if canvas doesn't exist
    return () => {};
  }, [gameActive, canvasRef, handleJump, handleDuckStart, handleDuckEnd]);

  return null; // This component doesn't render anything
};

export default GameControls;

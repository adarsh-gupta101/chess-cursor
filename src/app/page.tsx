"use client";

import { useState, useCallback, useEffect } from 'react';
import { ChessGame } from '../Game';
import { ChessPiece } from '../types';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const [game, setGame] = useState(() => new ChessGame());
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [isInCheck, setIsInCheck] = useState(false);

  useEffect(() => {
    if (isInCheck) {
      toast.error(`${game.getCurrentTurn()} is in check!`, {
        duration: 3000,
        position: 'top-center',
      });
    }
  }, [isInCheck, game]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setGame((currentGame) => {
      const currentTurn = currentGame.getCurrentTurn();
      const clickedPiece = currentGame.getPieceAt(row, col);

      if (selectedPiece) {
        const success = currentGame.movePiece(selectedPiece, `${row},${col}`);
        console.log('Move success:', success);
        console.log('Is game over:', currentGame.isGameOver());
        console.log('Is checkmate:', currentGame.isCheckmate());
        console.log('Is stalemate:', currentGame.isStalemate());
        
        if (success) {
          const newGame = new ChessGame(currentGame.getBoard().map(row => row.map(cell => cell?.toString() || '')));
          setIsInCheck(newGame.isInChecks()); // Assuming isInCheck() method exists
          setMoves(prevMoves => [...prevMoves, `${selectedPiece} to ${row},${col}`]);

          setSelectedPiece(null);
          return newGame;
        }
      }
      
      // Always reset selectedPiece if the move was unsuccessful or if selecting a new piece
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedPiece(`${row},${col}`);
      } else {
        setSelectedPiece(null);
      }
      
      return currentGame;
    });
  }, [selectedPiece]);

  console.log(game.getBoard());

  const getPieceSymbol = (piece: ChessPiece | null): string => {
    if (!piece) return '';
    const symbols: Record<string, string> = {
      'White,King': '♔', 'White,Queen': '♕', 'White,Rook': '♖',
      'White,Bishop': '♗', 'White,Knight': '♘', 'White,Pawn': '♙',
      'Black,King': '♚', 'Black,Queen': '♛', 'Black,Rook': '♜',
      'Black,Bishop': '♝', 'Black,Knight': '♞', 'Black,Pawn': '♟'
    };
    return symbols[`${piece.color},${piece.type}`] || '';
  };

  return (
    <main className="flex min-h-screen flex-row items-center justify-center p-24">
      <Toaster />
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-8 gap-0 border-2 border-gray-800">
          {game.getBoard().map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-16 h-16 flex items-center justify-center text-3xl
                  ${(rowIndex + colIndex) % 2 === 0 ? 'bg-gray-400' : 'bg-gray-600'}
                  ${selectedPiece === `${rowIndex},${colIndex}` ? 'bg-yellow-200' : ''}
                  ${cell?.color === 'Black' ? 'text-black' : 'text-white'}
                  hover:bg-pink-500 transition-colors duration-200 cursor-pointer
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {getPieceSymbol(cell)}
              </div>
            ))
          ))}
        </div>
        <div className="mt-4">
          <p>Current Turn: {game.getCurrentTurn()}</p>
          {game.isGameOver() && <p>Game Over! Winner: {game.getWinner()}</p>}
        </div>
      </div>
      <div className="ml-8 w-64 h-96 overflow-y-auto border border-gray-300 p-4">
        <h2 className="text-xl font-bold mb-2">Moves</h2>
        <ul>
          {moves.map((move, index) => (
            <li key={index}>{`${index + 1}. ${move}`}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

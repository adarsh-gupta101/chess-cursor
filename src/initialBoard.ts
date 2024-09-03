import { Board, PlayerColor, PieceType, ChessPiece } from './types';

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = new ChessPiece(PlayerColor.Black, PieceType.Pawn);
    board[6][i] = new ChessPiece(PlayerColor.White, PieceType.Pawn);
  }

  // Set up other pieces
  const pieceOrder: PieceType[] = [
    PieceType.Rook, PieceType.Knight, PieceType.Bishop, PieceType.Queen,
    PieceType.King, PieceType.Bishop, PieceType.Knight, PieceType.Rook
  ];

  for (let i = 0; i < 8; i++) {
    board[0][i] = new ChessPiece(PlayerColor.Black, pieceOrder[i]);
    board[7][i] = new ChessPiece(PlayerColor.White, pieceOrder[i]);
  }

  return board;
}
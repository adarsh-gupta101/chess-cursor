export enum PieceType {
  Pawn = 'Pawn',
  Rook = 'Rook',
  Knight = 'Knight',
  Bishop = 'Bishop',
  Queen = 'Queen',
  King = 'King',
}

export enum PlayerColor {
  White = 'White',
  Black = 'Black',
}

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
}

export class ChessPiece {
  constructor(public color: PlayerColor, public type: PieceType) {}
}
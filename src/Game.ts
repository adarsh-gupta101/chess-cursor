import { Board, Move, PlayerColor, Position, Piece, PieceType } from './types';
import { createInitialBoard } from './initialBoard';

export class ChessPiece {
  constructor(
    public color: PlayerColor,
    public type: PieceType
  ) {}

  toString(): string {
    const color = this.color === PlayerColor.White ? 'W' : 'B';
    const type = this.type.charAt(0).toUpperCase();
    return color + type;
  }
}

export class ChessGame {
  private board: Board;
  private currentPlayer: PlayerColor;
  private currentTurn: string = 'White';

  constructor(board?: string[][]) {
    if (board) {
      this.board = this.convertStringBoardToPieceBoard(board);
    } else {
      this.board = createInitialBoard();
    }
    this.currentPlayer = PlayerColor.White;
  }

  public makeMove(move: Move): boolean {
    const { from, to } = move;
    const piece = this.board[from.row][from.col];

    if (!piece || piece.color !== this.currentPlayer) {
      return false;
    }

    if (this.isValidMove(move)) {
      this.board[to.row][to.col] = piece;
      this.board[from.row][from.col] = null;
      this.switchPlayer();
      return true;
    }

    return false;
  }

  public isCheckmate(): boolean {
    return this.isInCheck(this.currentPlayer) && this.getAllLegalMoves().length === 0;
  }

  public isStalemate(): boolean {
    return !this.isInCheck(this.currentPlayer) && this.getAllLegalMoves().length === 0;
  }

  public getCurrentPlayer(): PlayerColor {
    return this.currentPlayer;
  }

  public getBoard(): (ChessPiece | null)[][] {
    return this.board;
  }

  public getCurrentTurn(): string {
    return this.currentTurn;
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    this.currentTurn = this.currentTurn === 'White' ? 'Black' : 'White';
  }

  private isValidMove(move: Move): boolean {
    const { from, to } = move;
    const piece = this.board[from.row][from.col];

    if (!piece) return false;

    const validMoves = this.getValidMovesForPiece(from);
    return validMoves.some(validMove => validMove.row === to.row && validMove.col === to.col);
  }

  private getValidMovesForPiece(position: Position): Position[] {
    const piece = this.board[position.row][position.col];
    if (!piece) return [];

    let moves: Position[] = [];

    switch (piece.type) {
      case PieceType.Pawn:
        moves = this.getPawnMoves(position, this.board);
        break;
      case PieceType.Rook:
        moves = this.getRookMoves(position, this.board);
        break;
      case PieceType.Knight:
        moves = this.getKnightMoves(position, this.board);
        break;
      case PieceType.Bishop:
        moves = this.getBishopMoves(position, this.board);
        break;
      case PieceType.Queen:
        moves = [...this.getRookMoves(position, this.board), ...this.getBishopMoves(position, this.board)];
        break;
      case PieceType.King:
        moves = this.getKingMoves(position, this.board);
        break;
    }

    return moves.filter(move => this.isMoveLegal(position, move));
  }

  private isMoveLegal(from: Position, to: Position): boolean {
    const tempBoard = JSON.parse(JSON.stringify(this.board));
    tempBoard[to.row][to.col] = tempBoard[from.row][from.col];
    tempBoard[from.row][from.col] = null;

    return !this.isInCheck(this.currentPlayer, tempBoard);
  }

  private isInCheck(player: PlayerColor, board: Board = this.board): boolean {
    const kingPosition = this.findKing(player, board);
    if (!kingPosition) return false; // Can't be in check if there's no king

    const opponentColor = player === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === opponentColor) {
          const moves = this.getPseudoLegalMoves({ row, col }, board);
          if (moves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private getPseudoLegalMoves(position: Position, board: Board): Position[] {
    const piece = board[position.row][position.col];
    if (!piece) return [];

    switch (piece.type) {
      case PieceType.Pawn:
        return this.getPawnMoves(position, board);
      case PieceType.Rook:
        return this.getRookMoves(position, board);
      case PieceType.Knight:
        return this.getKnightMoves(position, board);
      case PieceType.Bishop:
        return this.getBishopMoves(position, board);
      case PieceType.Queen:
        return [...this.getRookMoves(position, board), ...this.getBishopMoves(position, board)];
      case PieceType.King:
        return this.getKingMoves(position, board);
    }
  }

  private findKing(player: PlayerColor, board: Board): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === PieceType.King && piece.color === player) {
          return { row, col };
        }
      }
    }
    console.error(`King not found for player ${player}`);
    return null; // Return null instead of throwing an error
  }

  private getAllLegalMoves(): Move[] {
    const moves: Move[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentPlayer) {
          const validMoves = this.getValidMovesForPiece({ row, col });
          validMoves.forEach(to => {
            moves.push({ from: { row, col }, to });
          });
        }
      }
    }

    return moves;
  }

  private getPawnMoves(position: Position, board: Board): Position[] {
    const { row, col } = position;
    const piece = this.board[row][col];
    const moves: Position[] = [];

    if (!piece || piece.type !== PieceType.Pawn) return moves;

    const direction = piece.color === PlayerColor.White ? -1 : 1;
    const startRow = piece.color === PlayerColor.White ? 6 : 1;

    // Move forward
    if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
      moves.push({ row: row + direction, col });

      // Double move from starting position
      if (row === startRow && !this.board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

    // Capture diagonally
    for (const captureCol of [col - 1, col + 1]) {
      if (this.isValidPosition(row + direction, captureCol)) {
        const targetPiece = this.board[row + direction][captureCol];
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push({ row: row + direction, col: captureCol });
        }
      }
    }

    return moves;
  }

  private getRookMoves(position: Position, board: Board): Position[] {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return this.getSlidingMoves(position, directions, board);
  }

  private getKnightMoves(position: Position, board: Board): Position[] {
    const { row, col } = position;
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dRow, dCol] of knightMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        if (!targetPiece || targetPiece.color !== this.currentPlayer) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  private getBishopMoves(position: Position, board: Board): Position[] {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return this.getSlidingMoves(position, directions, board);
  }

  private getKingMoves(position: Position, board: Board): Position[] {
    const { row, col } = position;
    const moves: Position[] = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dRow, dCol] of kingMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        if (!targetPiece || targetPiece.color !== this.currentPlayer) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }

    return moves;
  }

  private getSlidingMoves(position: Position, directions: number[][], board: Board): Position[] {
    const { row, col } = position;
    const piece = this.board[row][col];
    const moves: Position[] = [];

    if (!piece) return moves;

    for (const [dRow, dCol] of directions) {
      let newRow = row + dRow;
      let newCol = col + dCol;

      while (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        if (!targetPiece) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
        newRow += dRow;
        newCol += dCol;
      }
    }

    return moves;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  movePiece(from: string, to: string): boolean {
    const [fromRow, fromCol] = from.split(',').map(Number);
    const [toRow, toCol] = to.split(',').map(Number);
    
    const move: Move = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol }
    };

    return this.makeMove(move);
  }

  private convertStringBoardToPieceBoard(stringBoard: string[][]): Board {
    return stringBoard.map(row => row.map(cell => {
      if (cell === '') return null;
      const [color, type] = cell.split('');
      return new ChessPiece(
        color === 'W' ? PlayerColor.White : PlayerColor.Black,
        type as PieceType
      );
    }));
  }

  getPieceAt(row: number, col: number): ChessPiece | null {
    return this.board[row][col];
  }

  isGameOver(): boolean {
    return this.isCheckmate() || this.isStalemate();
  }

  getWinner(): string | null {
    if (this.isCheckmate()) {
      return this.currentPlayer === PlayerColor.White ? 'Black' : 'White';
    }
    if (this.isStalemate()) {
      return 'Draw';
    }
    return null;
  }

  public isInChecks(): boolean {
    return this.isInCheck(this.currentPlayer);
  }
}

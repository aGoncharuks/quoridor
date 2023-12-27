import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameStore } from './game.store';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameStore]
})
export class GameComponent {
  public store = inject(GameStore);
  public cellSize = 80;

  public wallsArray(wallsCount: number): Array<boolean> {
    return Array(wallsCount).fill(true);
  }
}

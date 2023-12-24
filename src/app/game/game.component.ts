import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameStore } from './game.store';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameStore]
})
export class GameComponent {
  public store = inject(GameStore);
  public cellSize = 80;

}

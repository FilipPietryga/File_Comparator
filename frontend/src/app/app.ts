import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Comparator } from "./comparator/comparator";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Comparator],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}

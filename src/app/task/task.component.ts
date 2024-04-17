import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MonthTask } from '../../interfaces/task';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatDialogModule, MatButtonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
})
export class TaskComponent {
  @Input()
  task!: MonthTask;
  @Output() edit = new EventEmitter<MonthTask>();
  @Output() delete = new EventEmitter<MonthTask>();

  constructor(private dialog: MatDialog, private db: AngularFirestore) {}
}

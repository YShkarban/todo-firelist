import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { TaskComponent } from './task/task.component';
import {
  CdkDragDrop,
  DragDropModule,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { AsyncPipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MonthTask, TaskDialogResult } from '../interfaces/task';

const getObservable = (collection: AngularFirestoreCollection<MonthTask>) => {
  const subject = new BehaviorSubject<MonthTask[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: MonthTask[]) => {
    subject.next(val);
  });
  return subject;
};

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    TaskComponent,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    AsyncPipe,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS,
    },
  ],
})
export class AppComponent {
  actualDate: Date = new Date().firstDayOfMonth();

  todo = getObservable(
    this.db.collection('todo', (ref) =>
      ref.where('month', '==', this.actualDate)
    )
  ) as Observable<MonthTask[]>;
  inProgress = getObservable(
    this.db.collection('inProgress', (ref) =>
      ref.where('month', '==', this.actualDate)
    )
  ) as Observable<MonthTask[]>;
  done = getObservable(
    this.db.collection('done', (ref) =>
      ref.where('month', '==', this.actualDate)
    )
  ) as Observable<MonthTask[]>;

  constructor(private dialog: MatDialog, private db: AngularFirestore) {}

  setMonthAndYear(eventData: any, dp?: any) {
    dp.close();
    this.actualDate = eventData.value._d;
    this.loadData();
  }

  newTask() {
    let inputTask: MonthTask = {
      month: this.actualDate,
      taskInfo: { title: '', description: '' },
    };
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '350px',
      data: {
        task: inputTask,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        this.db.collection('todo').add(result.task);
      });
  }

  editTask(list: 'done' | 'todo' | 'inProgress', inputTask: any): void {
    const task: MonthTask = structuredClone(inputTask);
    task.month = this.actualDate;
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '350px',
      data: {
        task,
        toEdit: true,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }

        if (result.delete) {
          this.db.collection(list).doc(task.id).delete();
        } else {
          this.db.collection(list).doc(task.id).update(task);
        }
      });
  }

  deleteTask(list: 'done' | 'todo' | 'inProgress', task: any): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '350px',
      data: {
        task: {},
        enableDelete: true,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) return;

        if (result.delete) this.db.collection(list).doc(task.id).delete();
      });
  }

  private loadData(): void {
    this.todo = getObservable(
      this.db.collection('todo', (ref) =>
        ref.where('month', '==', new Date(this.actualDate))
      )
    );
    this.inProgress = getObservable(
      this.db.collection('inProgress', (ref) =>
        ref.where('month', '==', new Date(this.actualDate))
      )
    );
    this.done = getObservable(
      this.db.collection('done', (ref) =>
        ref.where('month', '==', new Date(this.actualDate))
      )
    );
  }

  drop(event: CdkDragDrop<MonthTask[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex] as any;
    this.db.firestore.runTransaction(() => {
      const promise = Promise.all([
        this.db.collection(event.previousContainer.id).doc(item.id).delete(),
        this.db.collection(event.container.id).add(item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}

export interface Task {
    id?: string;
    title: string;
    description: string;
  }

export interface MonthTask {
    id?: string;
    month: Date;
    taskInfo: Task;
  }
    

export interface EditDialogData {
    task: MonthTask;
  }
  
  export interface TaskDialogResult {
    task: Task;
    delete?: boolean;
  }
  
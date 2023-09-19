import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private apiUrl = 'http://localhost:5265/api/Task';
  private tasksSubject = new BehaviorSubject<[]>([]);

  constructor() { }
}

import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { OrderListModule } from 'primeng/orderlist';
import { HttpClient } from '@angular/common/http';
import { NgFor } from '@angular/common'; 
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule,ButtonModule, OrderListModule, NgFor, DialogModule],
  providers: [DatePipe],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent implements OnInit {
  apiUrl = 'https://backend-five-bay-57.vercel.app/logs';
  events: { _id: string; status: string; date: Date }[] = [];
  displayDialog = false;
  selectedEventIndex: number | null = null;
  actionType: 'Morning' | 'FullDay' | 'Delete' |null = null; 

  constructor(private datePipe: DatePipe, private http: HttpClient) {}

  ngOnInit() {
    this.fetchLogs();

  }

  fetchLogs() {
    this.http.get<{ _id: string; status: string; date: string }[]>(this.apiUrl).subscribe((data) => {
      this.events = data.map(event => ({
        _id: event._id,
        status: event.status,
        date: new Date(event.date)
      }));
    });
  }

  addRecord() {
    const now = new Date();
    const formattedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentHour = now.getHours();
    const timeLabel = currentHour >= 7 && currentHour < 13 ? 'Morning' : 'Evening';

    const existingEventIndex = this.events.findIndex(event =>
      new Date(event.date).getTime() === formattedDate.getTime()
    );

    if (existingEventIndex !== -1) {
      if (!this.events[existingEventIndex].status.includes(timeLabel)) {
        this.events[existingEventIndex].status += ` and in ${timeLabel}`;
        
        this.http.put(`${this.apiUrl}/${this.events[existingEventIndex]._id}`, { 
          status: this.events[existingEventIndex].status 
        }).subscribe(() => this.fetchLogs());
      } else {
        alert(`Cook has already been logged for ${timeLabel} today!`);
      }
    } else {
      const status = `Cook did not check-in on ${this.datePipe.transform(formattedDate, 'MM/dd/yyyy')} in ${timeLabel}`;

      this.http.post<{ _id: string }>(this.apiUrl, { status, date: formattedDate }).subscribe(response => {
        this.fetchLogs();
      });
    }
  }

  confirmChange(action: 'Morning' | 'Evening' | 'FullDay' | 'Delete') {
    if (this.selectedEventIndex !== null) {
      const selectedEvent = this.events[this.selectedEventIndex];
  
      if (action === 'Delete') {
        // 🗑️ Delete the entry
        this.http.delete(`${this.apiUrl}/${selectedEvent._id}`).subscribe(() => {
          this.fetchLogs(); 
        });
      } else {
        let updatedStatus = selectedEvent.status;
  
        if (action === 'Morning') {
          updatedStatus = `Cook did not check-in on ${selectedEvent.date.toLocaleDateString()} in Morning`;
        } else if (action === 'Evening') {
          updatedStatus = `Cook did not check-in on ${selectedEvent.date.toLocaleDateString()} in Evening`;
        } else if (action === 'FullDay') {
          updatedStatus = `Cook was absent for the full day on ${selectedEvent.date.toLocaleDateString()}`;
        }
  
        this.http.put(`${this.apiUrl}/${selectedEvent._id}`, { status: updatedStatus }).subscribe(() => {
          this.fetchLogs();
        });
      }
    }
  
    this.displayDialog = false;
    this.selectedEventIndex = null;
  }
  

  edit(index: number) {
    this.selectedEventIndex = index;
    this.displayDialog = true;
  }
}

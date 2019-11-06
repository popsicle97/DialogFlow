import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './../services/firebase.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  _tasks :any = [];

  constructor(private firebaseService : FirebaseService) { }

  ngOnInit() {
    this.firebaseService.viewTask().subscribe(result => {
      this._tasks = result.map( e => {
        return {
          id:e.payload.doc.id,
          isEdit : false,
          title: e.payload.doc.data()['title'],
          startTime: e.payload.doc.data()['startTime'],
          endTime : e.payload.doc.data()['endTime'],          
          taskConfirm: e.payload.doc.data()['taskConfirm']
        };
      })
     
    });
  }
  delete(i){
    this.firebaseService.deleteTask(i.id)
    console.log("Delete ID : " + i.d + " Title : " + i.title)
 
   }
   
   confirm(i){
     let task = {};
     task['taskConfirm'] = true;
     this.firebaseService.updateTask(i.id, task);
     console.log(i.taskConfirm)
   }
 
}

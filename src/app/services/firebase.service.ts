import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
    taN:string;
    taNN:string;
    eaB:any;
    meB:any;
    haB:any;
    daT:any;

    constructor(public db: AngularFirestore) {

    }
    
    createTask(tasks){
        return this.db.collection('task').add(tasks);
      /*  return this.db.collection('task').add({
            name:value.name
            butt1:eaB.butt1,
            butt2:meB.butt2,s
            butt3:haB.butt3,
            dat:daT.dat
        });*/
    }
    createSideTask(tasks){
      return this.db.collection('side_task').add(tasks);
    }
    
    trys(username,id,tasks){
      return this.db.doc(username + "/" + id).set({task : tasks},{merge:true});
    }
    getUser(){
      return this.db.collection('user').snapshotChanges();

    }
    addUser(username , id){
      return this.db.doc("user/"+  id).set(username,{merge:true});

    }
    viewTask(){
      return this.db.collection('task').snapshotChanges();
    }
    viewSideTask(){
      var now = moment().format()
      return this.db.collection('side_task').snapshotChanges();

    }

    updateTask(tasksID,tasks){
       return  this.db.doc('task/' + tasksID).update(tasks);
    }
    updateSideTask(tasksID, tasks){
      return this.db.doc('side_task/' + tasksID).update(tasks);

    }
    
    deleteTask(tasksID){
      this.db.doc('task/' + tasksID).delete();
    }
}


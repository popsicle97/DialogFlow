import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

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

    updateTask(tasksID,tasks){
        this.db.doc('task/' + tasksID).update(tasks);
    }
    
    deleteTask(tasksID){
      this.db.doc('task/' + tasksID).delete();
    }
}


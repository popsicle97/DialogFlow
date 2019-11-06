import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './../services/firebase.service';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { ModalController, NavController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  _tasks : any = [];
  t_Name : any = [];
  t_Date: any = [];
  taskN : any;
  taskD: any;
  eventButton : boolean = false;
  getSelectedTime = Date();

  public press: number = 0;

  event= {
    title : "",
    notes : "",
    tasktype : {},
    startTime: new Date().toISOString(),
    endTime : new Date().toISOString(),
    taskConfirm : false,
  };


 
  
  minDate = new Date().toISOString();

 
  ngOnInit() 
  {
    console.log("Modal Start")
    this.firebaseService.viewTask().subscribe(result => {
      this._tasks = result.map( e => {
        return {
          title: e.payload.doc.data()['title'],
          startTime: e.payload.doc.data()['startTime'],
          endTime: e.payload.doc.data()['endTime'],
          notes: e.payload.doc.data()['notes'],
          taskConfirm : e.payload.doc.data()['taskConfirm']
        };
        
      })
      console.log(this._tasks.length);
      if ( this._tasks.length > 0){
        let events = this.eventSource;
        for( let a of this._tasks){
          let p = {};
          p['title'] = a['title'];
          p['startTime'] = new Date(a['startTime']);
          p['endTime'] = new Date (a['endTime']);
          p['notes'] = a['notes'];
          p['taskConfirm'] = a['taskConfirm']
          console.log(p)
          let eventData = p;
        /*
          console.log("eventData")
          console.log(eventData)*/
          eventData['startTime'] = p['startTime'];
          eventData['endTime'] =p['endTime'];
          eventData['notes'] = p['notes']
          console.log(eventData['startTime']);
          events.push(eventData);
          console.log(events + "events")
        }
        this.eventSource = [];
        this.eventButton = false;
          console.log(events + "eventSource[]")
          setTimeout(() => {
            this.eventSource = events;
             console.log(events + "eventSourceTimeOut")
          });
      console.log('This part worked_1');
      console.log('This part worked_2');
      }
    });
  
  }
  
  selectedDay = new Date()
  sd : any;
  selectedObject
  eventSource = []
  viewTitle;
  isToday: boolean;
  calendarModes = [
    { key: 'month', value: 'Month' },
    { key: 'week', value: 'Week' },
    { key: 'day', value: 'Day' },
  ]
  calendar = {
    mode: this.calendarModes[0].key,
    currentDate: new Date()
  }; // these are the variable used by the calendar.

  taskType: { id: number, name: string }[] = [
    { "id": 0, "name": "Routine" },
    { "id": 1, "name": "Normal" },
    { "id": 2, "name": "Important" }
];
  constructor(private alrtCtrl : AlertController, private actionSheetCtrl: ActionSheetController, public firebaseService: FirebaseService,public modalController: ModalController,private navController:NavController) {  }

  
  blockDay($event) {
    console.log($event)
  }


  optionSelected($event) {
    console.log($event)
    this.event.tasktype = $event
  }


  loadEvents() {
    //this.eventSource = this.createRandomEvents();
  }


  onViewTitleChanged(title) {
    this.viewTitle = title;
  }


  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }


  changeMode(mode) {
    this.calendar.mode = mode;
  }


  today() {
    this.calendar.currentDate = new Date();
  }
  
  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();

    this.selectedDay = event

  }

  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }


  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return (date < current);
  };

 
  blockDayEvent(date) {
    let startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    let endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    let events = this.eventSource;
    events.push({
      title: 'All Day ',
      startTime: startTime,
      endTime: endTime,
      allDay: true
    });
    this.eventSource = [];
    setTimeout(() => {
      this.eventSource = events;
    });
  }


  onTimeSelected(ev) {


    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
    console.log(ev.events.length)
    ev.events.forEach(object =>
       console.log("----------------------------------" + object.titles
         
       ));
    
    // this.openActionSheet(ev)
  }


  addTask(){
    let data = this.event;
    console.log(data);
    this.firebaseService.createTask(data)
    .then(
      res=>{
        if(data){
          let events = this.eventSource;
          for( let a of this._tasks){
            let p = {};
            p['title'] = a['title'];
            p['startTime'] = new Date(a['startTime']);
            p['endTime'] = new Date (a['endTime']);
            p['taskConfirm'] = a['taskConfirm']
            console.log(p)
            let eventData = p;
          /*
            console.log("eventData")
            console.log(eventData)*/
            eventData['startTime'] = p['startTime'];
            eventData['endTime'] =p['endTime'];
            console.log(eventData['startTime']);
            events.push(eventData);
            console.log(events + "events")
          }
          this.eventSource = [];
          this.eventButton = false;
            console.log(events + "eventSource[]")
            setTimeout(() => {
              this.eventSource = events;
               console.log(events + "eventSourceTimeOut")
            });
        console.log('This part worked_1');
        console.log('This part worked_2');
        console.log(res);
       }
      }
    )
  }


  addEvent() {
    
    for( let a of this._tasks){
      let p = {};
      let date = a['startTime'];
      console.log("Date");
      
      p['title'] = a['title'];
      p['startTime'] = new Date(a['startTime']).toISOString();
      let newDate = new Date(a['startTime']);
      console.log(newDate.toISOString());
      let b = p['startTime'];
      console.log("p")
      console.log(p)
    }
      if(this.eventButton == false){
        this.eventButton = true;
      }else{
        this.eventButton = false;
      }
    let sTime :any ;
    let eTime : any;
    console.log(this.selectedDay)
    console.log(this.selectedDay);
     sTime = moment(this.selectedDay).format();
     eTime = moment(this.selectedDay).format();
     this.event.startTime = sTime;
     this.event.endTime = eTime;
      console.log(this.event.startTime)
      console.log(this.event.endTime)

  }

  onOptionSelected($event: any) {
    console.log($event)
    //this.calendar.mode = $event
  }

  async presentAlertPrompt() {
    const alert = await this.alrtCtrl.create({
      header: 'Prompt!',
      inputs: [
        {
          name: 'name1',
          type: 'text',
          placeholder: 'Placeholder 1'
        },
        {
          name: 'name2',
          type: 'text',
          id: 'name2-id',
          value: 'hello',
          placeholder: 'Placeholder 2'
        },
        {
          name: 'name3',
          value: 'http://ionicframework.com',
          type: 'url',
          placeholder: 'Favorite site ever'
        },
        // input date with min & max
        {
          name: 'name4',
          type: 'date',
          min: '2017-03-01',
          max: '2018-01-12'
        },
        // input date without min nor max
        {
          name: 'name5',
          type: 'date'
        },
        {
          name: 'name6',
          type: 'number',
          min: -5,
          max: 10
        },
        {
          name: 'name7',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  dismiss(events) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    console.log(events.selectedTime);
    this.modalController.dismiss({
      'dismissed': true
    });
  }
 

}

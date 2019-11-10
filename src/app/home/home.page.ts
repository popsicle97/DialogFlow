import { Component, ViewChild, OnInit } from '@angular/core';
import { Platform,  IonContent, PopoverController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient'
import { VERSION } from '@angular/core';
import { FormControl, FormBuilder} from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from './../services/firebase.service';
import { ModalComponent } from '../modal/modal.component'; 
import { Message, BotMessage} from '../chat/models/messages';
import { NotificationsComponent } from '../notifications/notifications.component';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { analytics } from 'firebase';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { match } from 'minimatch';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
 

  @ViewChild(IonContent , { static: true }) content: IonContent;

  accessToken: string = '7f91910c151e4fd8b57afac1dfedf2f4';
  client;
  messages: Message[] = [];
  botF : BotMessage[] = [];
  messageForm: any;
  taskForm : any;
  chatBox: any;
  taskN : any;
  dateT: any;
_tasks : any = [];
  s : boolean = false;
  isLoading: boolean;
  showButton: boolean = false;
  hiddenButton : boolean = true;
task:any;
ta_length:any = [];
// Random ID to maintain session with server
sessionId = Math.random().toString(36).slice(-5);
uc_counthtml: any= [];
imp_counthtml : any = [];
todays_task : any = [];
voice : string = ' '
  event= {
    title : "",
    notes : "",
    tasktype : { },
    startTime: new Date().toISOString(),
    endTime : new Date().toISOString(),
    taskConfirm : false,
  };

  taskType: { id: number, name: string }[] = [
    { "id": 0, "name": "Routine" },
    { "id": 1, "name": "Normal" },
    { "id": 2, "name": "Important" }
];

  constructor(public backgroundMode: BackgroundMode,private localNotifications: LocalNotifications,
    public popoverController: PopoverController, 
    public modalController: ModalController, 
    public platform: Platform, 
    public formBuilder: FormBuilder,   
    private router: Router, 
    public firebaseService: FirebaseService,
    private speechRecognition: SpeechRecognition
    ) 
  
    { 
    
   // Check feature available
this.speechRecognition.isRecognitionAvailable()
.then((available: boolean) => console.log(available))

    this.chatBox = '';
    console.log(VERSION.full); 
    console.log(VERSION.full); 
   
    this.messageForm = formBuilder.group({
      message: new FormControl('')
    });
  
    this.client = new ApiAiClient({
      accessToken: this.accessToken
    });
    
  }

  ngOnInit() {

    this.backgroundMode.enable();

    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {

      if (!hasPermission) {
      this.speechRecognition.requestPermission()
        .then(
          () => console.log('Granted'),
          () => console.log('Denied')
        )
      }

   });


    this.firebaseService.viewTask().subscribe(result => {
      this._tasks = result.map( e => {
        return {
          id:e.payload.doc.id,
          isEdit : false,
          title: e.payload.doc.data() ['title'],
          notes : e.payload.doc.data()['notes'],
          taskType : e.payload.doc.data()['taskType'],
          startTime: e.payload.doc.data()['startTime'],
          endTime : e.payload.doc.data()['endTime'],          
          taskConfirm: e.payload.doc.data()['taskConfirm']
        };
      })

     
      let uc_count = [];
      let imp_count = [];
      let todays_count =[];
      let rout_task = [];

      for(let t of this._tasks){
        let getDate_fb = new Date(moment(t.startTime).format()),
            month = getDate_fb.getMonth() + 1,
            day = getDate_fb.getDate(),
            year = getDate_fb.getFullYear(),
            hour = getDate_fb.getHours(),
            minute = getDate_fb.getMinutes()


        let getDate_fb_et = new Date(moment(t.endTime).format()),
                month_et = getDate_fb_et.getMonth() + 1,
                day_et = getDate_fb_et.getDate(),
                  year_et = getDate_fb_et.getFullYear(),
                  hour_et = getDate_fb_et.getHours(),
                  minute_et= getDate_fb.getMinutes()

  
        let now = new Date()
        let getDate_now = new Date(moment(now).format()),
              month_nw = getDate_now.getMonth() + 1,
              day_nw = getDate_now.getDate(),
              year_nw = getDate_now.getFullYear(),
              hour_nw = getDate_now.getHours(),
              minute_nw = getDate_fb.getMinutes()


        console.log("get todays date")
        console.log(day_nw + "/"+ month_nw + "/" + year_nw);

        let combined_date = day+"/"+month+"/"+year;
        let combined_date_now = day_nw + "/"+ month_nw + "/" + year_nw
        let combined_date_et = day_et + "/" + month_et + "/" + year_et
        let combined_hour_now  =  hour_nw
        let combined_hour_et = hour_et

        var date_fb = moment(combined_date,"DD/MM/YYYY");
        var date_today= moment(combined_date_now,"DD/MM/YYYY");
        var date_et = moment(combined_date_et, "DD/MM/YYYY");
        var hour_now = moment(combined_hour_now, "HH");
        var hour_ets = moment(combined_hour_et, "HH")
        let date_diff = date_fb.diff(date_today,'days')
        let date_diff_delete = date_et.diff(date_today,'days')
        let hour_diff = hour_ets.diff(hour_now,'hour');
        console.log("DATE_DIFF_DELETE")
        console.log(date_diff_delete)
        console.log(hour_diff)
        let task = {}
        if(t.taskType === "routine" && date_diff_delete === 0 && hour_diff <= 0){
          rout_task.push(t)
          for(let r_task of rout_task){
            if(r_task.id === t.id){
                console.log("TESTINGGG")
                console.log(moment(r_task.startTime).add(7,'days').format())
                console.log(moment(r_task.endTime).add(7,'days').format())
                task['startTime'] = moment(r_task.startTime).add(7,'days').format()
                task['endTime'] = moment(r_task.endTime).add(7,'days').format()
                console.log(task)
                this.firebaseService.updateTask(r_task.id, task);
            }
          }
      }
        if(date_diff_delete < 0){
          console.log(date_diff_delete)
          console.log("Auto Deleting expired task")
          this.firebaseService.deleteTask(t.id)
        }
        if(combined_date == combined_date_now){
          todays_count.push(t)
      }
      console.log("todays task")
   
        if(date_diff <=7 &&date_diff >=0){
          if(t.taskType == "important"){
            console.log("-------Important Task---------")
            imp_count.push(t)
          }
        }
        if(t.taskConfirm == false){
          uc_count.push(t)
        }else{
          console.log("No unconfirmed task to push")
        }
      }
      this.uc_counthtml = uc_count
      this.imp_counthtml = imp_count
   
 

      for(let imp of imp_count){
        let timeStart = new Date(moment(imp.startTime).format()),
            month = timeStart.getDate(),
            day = timeStart.getMonth() + 1,
            year = timeStart.getFullYear(),
            time = timeStart.toLocaleTimeString();
        let datesEnd= new Date(imp.endTime).toLocaleTimeString();
        this.addBotMessage(" An important task " + " '" + imp.title + "' "+ " at " + time  + " on " + day + "/" + month + "/" + year) ;
      }
    
      let id = 0;

       
      todays_count.forEach(task => {
        id++

        console.log(todays_count)
        if(id <= todays_count.length){
          if(task.taskType == "important" ){
            this.backgroundMode.moveToForeground()
            console.log("TODAY IMPORTANT")
            this.localNotify(
              id,
              "!IMPORTANT task to tend to today.",
              "Task " + "'" + task.title + "'" + " at " + task.startTime,
              1
              )
            console.log(task)
            
          }
          if(task.taskType == "normal"){
            this.localNotify(
              id,
              "You have a task to tend to today Amery.",
              "Task " + "'" + task.title + "'" + " at " + task.startTime,
              -2
              )
          }
        
          if(task.taskType =="routine"){
            this.localNotify(
              id,
              "There is a routine task today.",
              "Task " + "'" + task.title + "'" + " at " + task.startTime,
              -1
              )
          }
        }
        console.log(id)
        console.log(task)

        });
        this.addBotMessage("Boss, you have "+ uc_count.length + " unconfirmed task and " + imp_count.length + " important task");

    });
     
   

  }

  localNotify(id,title,text, priority) {
    this.localNotifications.schedule({
      id : id,
      title: title ,
      text:  text,
      led: 'FF0000',
      icon: 'assets/icon/bot.jpg',
      lockscreen: true,
      foreground: true,
      vibrate: true,
      priority : priority
    });
  }

  addBotMessage(text) {
    this.messages.push({
      avatar: "assets/icon/bot.jpg",
      from: 'bot',
      when: new Date(),
      text: text,
     
    });
  }

  addUserMessage(text) {
    this.messages.push({
      avatar: "assets/icon/bot.jpg",
      from: 'user',
      when: new Date(),
      text: text,
     
    });
  }
  
  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: NotificationsComponent,
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalComponent
    });
    return await modal.present();
  }


  taskAdd(req: string = "Add Task"){
    this.client.textRequest(req).then(response=>{
          const {task_titles, date } = response.result.parameters;
          console.log(task_titles)
    })
    if (!req || req === '') {
      return;
    }
    this.messages.push({avatar: "assets/icon/bot.jpg", from: 'user', when: new Date(), text: req});
    console.log(this.showButton);
    this.isLoading = true;

    this.client
      .textRequest(req)
      .then(response => {
        /* do something */
        if (req ==='Add Task'){
        this.hiddenButton = false;
         this.showButton = true;
             this.addBotMessage('Opening task adding form below... ');
          console.log(this.showButton);

        }else{
        console.log('res');
        console.log(response);
        this.messages.push({
          avatar: "assets/icon/bot.jpg",
          from: 'bot',
          when: new Date(),
          text: response.result.fulfillment.speech,
        });
            console.log(this.showButton);

        this.scrollToBottom();
        this.isLoading = false;
        }
       
      })
      .catch(error => {
        /* do something here too */
        console.log('error');
        console.log(error);
      });

    this.chatBox = '';
  }


  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

  talk( ){
    this.speechRecognition.startListening()
    .subscribe(
      (matches: Array<string>) => {
      //  this.sendMessage(matches[0])
        console.log(matches[0])
        this.voice = matches[0]
        this.sendMessage(this.voice.toString())

      },
      
      (onerror) => console.log('error:', onerror)
      
      )
      

  }


  sendMessage(req: string) 
  {
   
    let task_same_date : any = [ ];
    if (!req || req === '') {
      return;
    }
    this.messages.push({avatar: "assets/icon/bot.jpg", from: 'user', when: new Date(), text: req});
    console.log(this.showButton);
    this.isLoading = true;

    this.client
      .textRequest(req)
      .then(async response => {
        /* do something */
        let function_opener = response.result.parameters.function_opener;
        let function_content = response.result.parameters.function_content;
        if(function_opener != ""){
          console.log("FUNCTION OPENER DETECTED!")
          console.log(function_opener)
          console.log(function_content)
          if(function_opener == "open"&&function_content == "calender"){
              this.presentModal();
          }else if(function_opener == "open"&&function_content == "unconfirmed task"){
              this.presentPopover(null);
          }
        }
        if(response.result.metadata.intentName == "task.add.update"){
           console.log("update intent")
           console.log(response);

           const start_date = response.result.parameters.update_date_start;
           const end_date = response.result.parameters.update_date_end;
           const start_time = response.result.parameters.update_time_start;
           const end_time = response.result.parameters.update_time_end;
           var sd = start_date;
           var st = start_time;
           var ed = end_date
           var et = end_time;
           var edet = end_date + ' ' + end_time;
           let sdst = start_date + "T"+start_time+"+"+"08:00"
           var sd_moment = moment(sd, "YYYY-MM-DD");
           var st_moment = moment(st, "HH:mm");
           var ed_moment = moment(ed, "YYYY-MM-DD");
           var edet_moment = moment(edet, "YYYY-MM-DD HH:mm" )
           var sd_format = sd_moment.format();
           var st_format = st_moment.format();
           var ed_format = ed_moment.format();
           var edet_format = edet_moment.format();
           console.log(edet_format)
           let task_arr = []
          let task_arr_disp = [ ];
          let task_arr_with_id = []
          let id_no= -0;

          for(let task of this._tasks){
         
            if(sdst == task.startTime){
              let datesStart = new Date(task.startTime).toLocaleTimeString();
              let datesEnd= new Date(task.endTime).toLocaleTimeString();
              id_no++

              task_arr_disp.push("[ID] : "+ id_no+" [Title] : " +  task.title + " [Start Time] "+ datesStart + " [End Time] "+ datesEnd );

              task_arr.push(task);
              console.log(task.id)
              console.log(task_arr_disp)
              console.log(task_arr)
            }
          
          }
          console.log(task_arr.length)
              if(task_arr.length == 0){
                this.addBotMessage(response.result.fulfillment.speech)
                this.addBotMessage("I've been trying to find the task to move..... but there seems to be none")
                console.log(response)
                this.sendMessage("cancel");
                task_arr = [ ];
                console.log('Nothing found')
              } 
              else if(task_arr.length > 0) {
           /*     if(ed == "" && et != ""){
                  let ed_temporary: any;
                  ed_temporary = sd;
                  console.log("Didnt specify date, so i took date from start")
               let endDateTime = (ed_temporary);
                   var dts = moment(endDateTime, "YYYY-MM-DD");
                  console.log(dts.format());
                  var dts_true = dts.format();
                  
                }*/if(ed == "" && et ==""){
                        if(task_arr.length > 1){
                            console.log("There is more than one task at that time. Please choose a task with their ID")
                            this.addBotMessage(response.result.fulfillment.speech)
                            this.addBotMessage(task_arr_disp.join("<div>++</div>"))
                            this.addBotMessage(task_arr.length +" Task found, select which task id you wanna change?")
                        
                        }else{
                          this.addBotMessage(response.result.fulfillment.speech)
                          this.addBotMessage(task_arr_disp.join("<div>++</div>") )
                          this.addBotMessage("Task found,when do you wanna change it to?")
                        }

                }else if(ed != "" && et != "" ){
                  for(let tobj of task_arr){
                    let id = tobj.id;
                    
                    let task = {
                      title: tobj.title,
                      notes: tobj.notes,
                      taskType: tobj.taskType,
                      startTime: edet_format,
                      endTime: edet_format,
                      taskConfirm: tobj.taskConfirm,
                    }
                    if(task.notes == "no notes" ){
                      task.notes = "no notes"
                      console.log(task.startTime)
                      console.log(task.endTime)
                      
                      this.firebaseService.updateTask(id, task);
                      console.log(task.startTime)
                      console.log(task.endTime)
                      this.addBotMessage("Successfully updated")
                    }else{
                      console.log(task.startTime)
                      console.log(task.endTime)
                      this.firebaseService.updateTask(id, task);
                      console.log(task.startTime)
                      console.log(task.endTime)
                      this.addBotMessage("Successfully updated")
                    }
                  }
                }
              
                console.log(response)
                console.log("empty COND")
                task_arr = [ ];
              }
              
          }
          else if(response.result.metadata.intentName == "task.add.delete"){
            console.log(response)
            this.addBotMessage(response.result.fulfillment.speech)
            const start_date = response.result.parameters.start_date;
            const start_time = response.result.parameters.start_time;
            let sdst = start_date + "T"+start_time+"+"+"08:00"
            let temp_arr : any = [];
            let temp_arr_disp :any =  [];
            let id_no = 0;
            for(let task of this._tasks){
              if(sdst == task.startTime){
                id_no++
                task['id_no'] = id_no
                temp_arr.push(task)
                temp_arr_disp.push("ID : " + id_no +" Title : " + task.title + " Start Time: " + task.startTime +" End Time : " + task.endTime)
               }
            }
            if(temp_arr.length > 1){
              console.log("There is more than one task at that time. Please choose a task with their ID")
              this.addBotMessage(temp_arr_disp.join("<div>++</div>"))
              this.addBotMessage(temp_arr.length +" Task found, select which task id you wanna delete?")
            }else if(temp_arr.length >0 && temp_arr.length < 2){
              console.log(temp_arr_disp)
              this.addBotMessage(temp_arr_disp.join("<div>++</div>") )
              this.addBotMessage("Task found,do you want to delete??")
            }else if(temp_arr.length == 0){
              this.addBotMessage("No task found on that date")

            }

          }
      
          else if(response.result.metadata.intentName == "task.add.delete-id"){
            console.log(response)
            this.addBotMessage(response.result.fulfillment.speech)
            const task_id = response.result.parameters.task_id;
            const start_date = response.result.parameters.start_date;
            const start_time = response.result.parameters.start_time;
            let sdst = start_date + "T"+start_time+"+"+"08:00"
                
            console.log(response)
            let temp_arr_new= []
            let temp_arr_old= []
            let temp_arr = []
            let id = 0;
  
            for(let task of this._tasks){
              //Check wether new date is empty
          
              if(sdst == task.startTime){
                id++
                temp_arr_old.push(task);
                task['id_no'] = id;
                temp_arr.push(task);
                console.log(temp_arr_old)
                console.log(temp_arr)
              }
            }
            if(temp_arr_new.length == 0){
              for(let ta of temp_arr){
                if(ta.id_no == parseInt(task_id)){  
                  this.firebaseService.deleteTask(ta.id)
                }
              }
            }
             
          }
          else if(response.result.metadata.intentName == "task.add.delete-yes"){
            this.addBotMessage(response.result.fulfillment.speech)
            console.log(response)
            const start_date = response.result.parameters.start_date;
            const start_time = response.result.parameters.start_time;
            var sdst = start_date +"T"+start_time + "+"+"08:00"
            for(let task of this._tasks){
              if( sdst ==task.startTime){
                let id; 
                id = task.id
                this.firebaseService.deleteTask(id);
                this.addBotMessage("Title : " + task.title + " Start Time: " + task.startTime +" End Time : " + task.endTime)
               }
            }
          }
        else if(response.result.metadata.intentName == "task.add.update-pick-id"){
          const user_choice = response.result.parameters.original_start_date;
          console.log(response)
          console.log("DO CODE HERE")

          this.addBotMessage(response.result.fulfillment.speech)
       
        }
        else if(response.result.metadata.intentName == "task.add.update.pick-id-confirm"){
          const ori_start_date = response.result.parameters.ori_start_date;
          const ori_start_time = response.result.parameters.ori_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;
          const task_id =  response.result.parameters.task_id;
          console.log("pick-id-confirm")
          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"          
          console.log(response)
          let temp_arr_new= []
          let temp_arr_old= []
          let temp_arr = []
          let id = 0;

          for(let task of this._tasks){
            //Check wether new date is empty
            if(sdst == task.startTime){
              temp_arr_new.push(task)
            }

            if(ori_sdst == task.startTime){
              id++
              temp_arr_old.push(task);
              task['id_no'] = id;
              temp_arr.push(task);
              console.log(temp_arr_old)
              console.log(temp_arr)
            }
          }
          let task = {}
          if(temp_arr_new.length == 0){
            this.addBotMessage(response.result.fulfillment.speech)
            //update
            console.log("DO")
            for(let ta of temp_arr){
              if(ta.id_no == parseInt(task_id)){
                console.log(ta.id_no)
                console.log(parseInt(task_id))
                console.log(ta.title)
                let id = ta.id
                console.log(id)
                task['title'] = ta.title
                task['startTime'] = sdst
                task['endTime'] = edet
                task['notes'] = ta.notes
                task['taskConfirm'] = ta.taskConfirm
                task['taskType'] = ta.taskType
                console.log(task)
                if(end_time !== ""){
                  console.log("DATE IS NOT EMPTY SO UPDATED")
                  this.firebaseService.updateTask(id,task)
                }else{
                  console.log("DATE EMPTY NOT UPDATING")
                }
              }
            }
          }else{
            this.addBotMessage(response.result.fulfillment.speech)
            this.addBotMessage("The updated time given has already been occupied by task. Continue?")
            console.log("will initiate intent task.add.update.pick-id-confirm-yes and edit-confirm")
          }
        }

        else if(response.result.metadata.intentName == "task.add.update.pick-id-confirm-yes"){
          const ori_start_date = response.result.parameters.ori_start_date;
          const ori_start_time = response.result.parameters.ori_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;
          const task_id =  response.result.parameters.task_id;
          console.log("pick-id-confirm-yes")
          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"          
          console.log(response)
          let temp_arr_new= []
          let temp_arr_old= []
          let temp_arr = []
          let id = 0;

          for(let task of this._tasks){
            //Check wether new date is empty
            if(sdst == task.startTime){
              temp_arr_new.push(task)
            }

            if(ori_sdst == task.startTime){
              id++
              temp_arr_old.push(task);
              task['id_no'] = id;
              temp_arr.push(task);
              console.log(temp_arr_old)
              console.log(temp_arr)
            }
          }
          let task = {}
          if(temp_arr_new.length == 0){
           // this.addBotMessage(response.result.fulfillment.speech)
            //update
            console.log("DO")
            for(let ta of temp_arr){
              if(ta.id_no == parseInt(task_id)){
                console.log(ta.id_no)
                console.log(parseInt(task_id))
                console.log(ta.title)
                let id = ta.id
                console.log(id)
                task['title'] = ta.title
                task['startTime'] = sdst
                task['endTime'] = edet
                task['notes'] = ta.notes
                task['taskConfirm'] = ta.taskConfirm
                task['taskType'] = ta.taskType
                console.log(task)
                if(end_time !== ""){
                  console.log("DATE IS NOT EMPTY SO UPDATED")
                  this.firebaseService.updateTask(id,task)
                 }
              }
          }
        this.addBotMessage(response.result.fulfillment.speech)
      }else{
        if(end_time !== ""){
          console.log("DO1")
          console.log("DATE IS NOT EMPTY SO UPDATED")
          for(let ta of temp_arr){
            if(ta.id_no == parseInt(task_id)){
              console.log(ta.id_no)
              console.log(parseInt(task_id))
              console.log(ta.title)
              let id = ta.id
              console.log(id)
              task['title'] = ta.title
              task['startTime'] = sdst
              task['endTime'] = edet
              task['notes'] = ta.notes
              task['taskConfirm'] = ta.taskConfirm
              task['taskType'] = ta.taskType
              console.log(task)
              if(end_time !== ""){
                console.log("DATE IS NOT EMPTY SO UPDATED")
                this.firebaseService.updateTask(id,task)
               }
            }
        }       
           this.addBotMessage(response.result.fulfillment.speech)
         }
      }
    }
        
        
        else if(response.result.metadata.intentName == "task.add.update.pick-id-confirm-edit-confirm"){
          const ori_start_date = response.result.parameters.ori_start_date;
          const ori_start_time = response.result.parameters.ori_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;
          const task_id =  response.result.parameters.task_id;
          console.log(response)
          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"          
          console.log(response)
          let temp_arr_new= []
          let temp_arr_old= []
          let temp_arr = []
          let id = 0;

          for(let task of this._tasks){
            //Check wether new date is empty
            if(sdst == task.startTime){
              temp_arr_new.push(task)
            }

            if(ori_sdst == task.startTime){
              id++
              temp_arr_old.push(task);
              task['id_no'] = id;
              temp_arr.push(task);
              console.log(temp_arr_old)
              console.log(temp_arr)
            }
          }
          let task = {}
          if(temp_arr_new.length == 0){
           // this.addBotMessage(response.result.fulfillment.speech)
            //update
            console.log("DO")
            for(let ta of temp_arr){
              if(ta.id_no == parseInt(task_id)){
                console.log(ta.id_no)
                console.log(parseInt(task_id))
                console.log(ta.title)
                let id = ta.id
                console.log(id)
                task['title'] = ta.title
                task['startTime'] = sdst
                task['endTime'] = edet
                task['notes'] = ta.notes
                task['taskConfirm'] = ta.taskConfirm
                task['taskType'] = ta.taskType
                console.log(task)
                if(end_time !== "" && end_date !==""){
                  console.log("DATE IS NOT EMPTY SO UPDATED")
                  this.firebaseService.updateTask(id,task)
                   }
                }
            }
        this.addBotMessage(response.result.fulfillment.speech)
        }
      }

        else if(response.result.metadata.intentName == "task.add.update-confirm"){
          console.log(response)
          this.addBotMessage(response.result.fulfillment.speech)
          const ori_start_date = response.result.parameters.original_start_date;
          const ori_start_time = response.result.parameters.original_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;

          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"

          let temp_arr_task = []
          let temp_task_id;
          //This for loop is to extract the task we need from database
          for(let task of this._tasks){
              if(ori_sdst== task.startTime){
                  console.log("FOUND THE TASK DATE")
                  temp_task_id = task.id
                  temp_arr_task['title'] = task.title
                  temp_arr_task['notes'] = task.notes
                  temp_arr_task['startTime'] = task.startTime
                  temp_arr_task['endTime'] = task.endTime
                  temp_arr_task['taskConfirm'] = task.taskConfirm
                  temp_arr_task['taskType'] = task.taskType
                  console.log(temp_arr_task)
              }
       
          }
            let task_new_date = {
              title : temp_arr_task['title'],
              notes : temp_arr_task['notes'],
              taskType :  temp_arr_task['taskType'] ,
              taskConfirm : temp_arr_task['taskConfirm'],
              startTime : start_date + "T"+start_time+"+"+"08:00",
              endTime: end_date +"T" + end_time+"+"+"08:00"
          }
          //This for loop is to find wether the new updated startTime is the same as any date in database
          for(let task of this._tasks){
            if(task_new_date.startTime == task.startTime){
              this.addBotMessage("The time you are updating to is already occupied. Continue? No, to stop")

            }
          }
    
               
        }else if(response.result.metadata.intentName == "task.add.update-confirm-confirm"){
          console.log(response)
          const ori_start_date = response.result.parameters.ori_start_date;
          const ori_start_time = response.result.parameters.ori_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;
          console.log("Reached last intent of update with yes")
          
          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"

          let temp_arr_task = []
          let temp_task_id;
          //This for loop is to extract the task we need from database
          for(let task of this._tasks){
              if(ori_sdst== task.startTime){
                  console.log("FOUND THE TASK DATE")
                  temp_task_id = task.id
                  temp_arr_task['title'] = task.title
                  temp_arr_task['notes'] = task.notes
                  temp_arr_task['startTime'] = task.startTime
                  temp_arr_task['endTime'] = task.endTime
                  temp_arr_task['taskConfirm'] = task.taskConfirm
                  temp_arr_task['taskType'] = task.taskType
                  console.log(temp_arr_task)
              }
       
          }
            let task_new_date = {
              title : temp_arr_task['title'],
              notes : temp_arr_task['notes'],
              taskType :  temp_arr_task['taskType'] ,
              taskConfirm : temp_arr_task['taskConfirm'],
              startTime : start_date + "T"+start_time+"+"+"08:00",
              endTime: end_date +"T" + end_time+"+"+"08:00"
          }
          //This for loop is to find wether the new updated startTime is the same as any date in database
         /* for(let task of this._tasks){
            if(task_new_date.startTime == task.startTime){
              this.addBotMessage("The time you are updating to is already occupied. Continue? No, to stop")

            }
          }*/
          this.addBotMessage(response.result.fulfillment.speech)
          this.firebaseService.updateTask(temp_task_id,task_new_date)


        }else if(response.result.metadata.intentName == "task.add.update-no-confirm"){
          console.log(response)
          console.log("Reached last intent of update with edit")
          const ori_start_date = response.result.parameters.ori_start_date;
          const ori_start_time = response.result.parameters.ori_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;

          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"

          let temp_arr_task = []
          let temp_task_id;
          for(let task of this._tasks){
              if(sdst == task.startTime){
                  console.log("FOUND THE TASK DATE")
                  temp_task_id = task.id
                  temp_arr_task['title'] = task.title
                  temp_arr_task['notes'] = task.notes
                  temp_arr_task['startTime'] = task.startTime
                  temp_arr_task['endTime'] = task.endTime
                  temp_arr_task['taskConfirm'] = task.taskConfirm
                  temp_arr_task['taskType'] = task.taskType
                  console.log(temp_arr_task)
              }
       
          }
            let task_new_date = {
              title : temp_arr_task['title'],
              notes : temp_arr_task['notes'],
              taskType :  temp_arr_task['taskType'] ,
              taskConfirm : temp_arr_task['taskConfirm'],
              startTime : start_date + "T"+start_time+"+"+"08:00",
              endTime: end_date +"T" + end_time+"+"+"08:00"
          }
     if(temp_arr_task['startTime'] == temp_arr_task['startTime']){
            this.addBotMessage("Updated but the time you are updating to is still occupied. Continue? No, to stop")
              }else{
           this.firebaseService.updateTask(temp_task_id, task_new_date);

               }
        }else if(response.result.metadata.intentName == "task.add.update-no-confirm-yes-confirm"){
          console.log(response)
          const ori_start_date = response.result.parameters.ori_start_date;
          const ori_start_time = response.result.parameters.ori_start_time;
          const start_date = response.result.parameters.start_date;
          const end_date = response.result.parameters.end_date;
          const start_time = response.result.parameters.start_time;
          const end_time = response.result.parameters.end_time;
          let ori_sdst = ori_start_date + "T"+ori_start_time +"+"+"08:00"
          let sdst = start_date + "T"+start_time+"+"+"08:00"
          let edet = end_date +"T" + end_time+"+"+"08:00"

          let temp_arr_task = []
          let temp_task_id;
          for(let task of this._tasks){
              if(ori_sdst == task.startTime){
                  console.log("FOUND THE TASK DATE")
                  temp_task_id = task.id
                  temp_arr_task['title'] = task.title
                  temp_arr_task['notes'] = task.notes
                  temp_arr_task['startTime'] = task.startTime
                  temp_arr_task['endTime'] = task.endTime
                  temp_arr_task['taskConfirm'] = task.taskConfirm
                  temp_arr_task['taskType'] = task.taskType
                  console.log(temp_arr_task)
              }
       
          }
            let task_new_date = {
              title : temp_arr_task['title'],
              notes : temp_arr_task['notes'],
              taskType :  temp_arr_task['taskType'] ,
              taskConfirm : temp_arr_task['taskConfirm'],
              startTime : start_date + "T"+start_time+"+"+"08:00",
              endTime: end_date +"T" + end_time+"+"+"08:00"
          }
          console.log(task_new_date)
          this.firebaseService.updateTask(temp_task_id, task_new_date);

           this.addBotMessage(response.result.fulfillment.speech)

               

        }

       else if(response.result.metadata.intentName == "task.add.view"){
          this.addBotMessage(response.result.fulfillment.speech)
            console.log("view intent")
            //Getting data from dialogflow 
            const start_date = response.result.parameters.view_date_start;
            const end_date = response.result.parameters.view_date_end;
            const start_time = response.result.parameters.view_time_start;
            const end_time = response.result.parameters.view_time_end;

            //Storing data from dialogflow into a variable
            var sd = start_date;
            var st = start_time;
            var et = end_time;
            var ed = end_date;

            console.log("----Start Time/Date----")
            console.log(sd)
            console.log(st)
            //Combining both time and date to convert it to a proper date later
            let sdst = (sd+' '+ st);

            //Converting combined date and time into a proper date format using moment.js
            var sdst_moment = moment(sdst, "YYYY-MM-DD HH:mm");
            var sd_moment = moment(sd, "YYYY-MM-DD");
            var st_moment = moment(st, "HH:mm");
          
            var sdst_format = sdst_moment.format();
            var sd_format = sd_moment.format();
            var st_format = st_moment.format();
            console.log(sdst_format)

            let task_arr =[]
           
          for(let task_st of this._tasks){
             let getDate_fb = new Date(moment(task_st.startTime).format()),
                  month = '-'+ getDate_fb.getDate(),
                  day = '-' + getDate_fb.getMonth(),
                  year = '' + getDate_fb.getFullYear(),
                  hour = '' + getDate_fb.toLocaleTimeString(),
                  minute = ':'  +  getDate_fb.getMinutes();             

             let getDate_us = new Date(moment(sd_format).format()),
                  month_u = '-'+ getDate_us.getDate(),
                  day_u = '-' + getDate_us.getMonth(),
                  year_u = '' + getDate_us.getFullYear(),
                  hour_u = ''+ getDate_us.toLocaleTimeString(),
                  minute_u = ':' + getDate_us.getMinutes();

             let getTime_us = new Date(moment(st_format).format()),
                  hour_us = '' + getTime_us.toLocaleTimeString();

             let a_getDate = year + day + month;
             let b_getDate = year_u + day_u + month_u
         
             let a_time = hour ;
             let b_time = hour_u ;
             let c_time = hour_us;
              console.log("<--------2---->")

              if(a_getDate == b_getDate && a_time == c_time){
                console.log(task_st.title);
                console.log("First Cond")
                let datesStart = new Date(task_st.startTime).toLocaleTimeString();
                let datesEnd= new Date(task_st.endTime).toLocaleTimeString();

                task_arr.push("\n</br>[Title] : " +  task_st.title + " [Start Time] "+ datesStart + " [End Time] "+ datesEnd )
              } 
              if(a_getDate == b_getDate && c_time == "Invalid Date"){
                console.log(task_st.title)
                console.log("Second Cond")
                let datesStart = new Date(task_st.startTime).toLocaleTimeString();
                let datesEnd= new Date(task_st.endTime).toLocaleTimeString();
                task_arr.push("\n</br>[Title] : " +  task_st.title + " [Start Time] "+ datesStart + " [End Time] "+ datesEnd )
              }
            }
            if(task_arr.length==0){
              this.addBotMessage("There is no task around that time")
              task_arr = [ ];

            }else{
              this.addBotMessage(task_arr.join("<div>-------------------------------------------------</div>"))
              task_arr = [ ];

              console.log(task_arr)
            }
            console.log(task_arr.length)
          
            var sd_format = sd_moment.format();
            var st_format = st_moment.format();


        }
      else if(response.result.metadata.intentName == "task.add.create"){
        let agentTask : any;
       
        console.log(response)
        const task_name = response.result.parameters.task_name;
        let task_status ;
        const start_date = response.result.parameters.start_date.toString();
        const start_time = response.result.parameters.time_start.toString();
        const end_date =  response.result.parameters.end_date.toString();
        const end_time =  response.result.parameters.time_end.toString();
        console.log("add intent")
        var sdst = (start_date + ' ' + start_time)
        var sd = start_date;
        var st = start_time;
        console.log("----e----")
        console.log(sd)
        console.log(st)
        var edet = (end_date + ' ' + end_time).toString()
        var ed = end_date;
        var et = end_time;
        console.log("----b----")
        console.log(ed)
        console.log(et)
        console.log(sdst);
        var dateTime_start = moment(sdst, "YYYY-MM-DD HH:mm");
        var dateTime_end = moment(edet, "YYYY-MM-DD HH:mm");
        var time_user = moment(st,"HH:mm")
        console.log(dateTime_start.format())
        console.log(dateTime_end.format())
        var dt_start = dateTime_start.format();
        var dt_end = dateTime_end.format();
        var date_now = moment(new Date());
        console.log("DATE NOW")
        console.log(date_now.format())
        console.log(dateTime_start.format())
        console.log(moment(dateTime_start, "YYYY-MM-DD").diff(moment(date_now,"YYYY-MM-DD"),'days'))
        var date_start_now_difference = moment(dateTime_start, "YYYY-MM-DD").diff(moment(date_now,"YYYY-MM-DD"),'days')
        var timeH_start_now_difference = moment(dateTime_start, "HH-mm").diff(moment(date_now,"HH-mm"),'hours')
        var timeM_start_now_different = moment(dateTime_start, "HH-mm").diff(moment(date_now,"HH-mm"),'minutes')
        console.log(date_start_now_difference)
        console.log(timeH_start_now_difference)
        console.log(timeM_start_now_different)
        console.log(this._tasks);
        let task = {
          title:response.result.parameters.task_name,
          notes: response.result.parameters.task_notes,
          taskType: response.result.parameters.task_type,
          startTime: dt_start,
          endTime: dt_end,
          taskConfirm: response.result.parameters.task_status,
      }

        console.log(dt_start)
      
      for(let tasks of this._tasks){

        if(dt_start == tasks.startTime){
          console.log("COMPARED")
          console.log(tasks.startTime)
          console.log(dt_start)
          console.log("Its the same time & date")
          task_same_date.push(tasks)
        }
     }
      console.log("got time");
      if(ed == ""){
        let ed_temporary: any;
        ed_temporary = sd;
        console.log("Didnt specify date, so i took date from start")
         let endDateTime = (ed_temporary+' '+ end_time);
         var dts = moment(endDateTime, "YYYY-MM-DD HH:mm");
        console.log(dts.format());
        var dts_true = dts.format();
        task.endTime= dts_true.toString();
        console.log(task.endTime);
      }
      if((et && ed) == ""){
        console.log("Didnt specify time &date , so i took time from both")
        task.endTime = dt_start;
      }
      agentTask = task;
    if(date_start_now_difference === 0 && !(timeH_start_now_difference < 0)  && !(timeM_start_now_different  < 0)){
      if(task_same_date.length <= 0){
        task_status = response.result.parameters.task_status;
        //task_status = true;
       if(task_status != "" && task_name != ""){
        if(task.taskConfirm == "true" ){
              task.taskConfirm = true;
          
              this.addtoDB(agentTask)
              this.addBotMessage(response.result.fulfillment.speech)
              }else{
            task.taskConfirm = false;
            this.addtoDB(agentTask);
            this.addBotMessage(response.result.fulfillment.speech)

            }
       }
    }else{
      task_status = "";
      this.addBotMessage("There is already a task occupying that time and date. Would you still want to add it?")
    }
  }else if(date_start_now_difference <= 0 && (timeH_start_now_difference < 0)  && (timeM_start_now_different  < 0)){
    this.addBotMessage("You cannot go back to time and add a class. Try again.")
  }
        console.log(task);
      }
      else if (response.result.metadata.intentName =="task.add.yes-confirm"){
        let agentTask : any;
        const start_date = response.result.parameters.start_date.toString();
        const start_time = response.result.parameters.start_time.toString();
        const end_date =  response.result.parameters.end_date.toString();
        const end_time =  response.result.parameters.end_time.toString();
        console.log("last add intent")
        var sdst = (start_date + ' ' + start_time)
        var sd = start_date;
        var st = start_time;
        console.log("----start time----")
        console.log(sd)
        console.log(st)
        var edet = (end_date + ' ' + end_time).toString()
        var ed = end_date;
        var et = end_time;
        console.log("----end time----")
        console.log(ed)
        console.log(et)
        console.log(sdst);
        var dateTime_start = moment(sdst, "YYYY-MM-DD HH:mm");
        var dateTime_end = moment(edet, "YYYY-MM-DD HH:mm");
        var time_user = moment(st,"HH:mm")
        console.log(dateTime_start.format())
        console.log(dateTime_end.format())
        var dt_start = dateTime_start.format();
        var dt_end = dateTime_end.format();
        
        let task = {
          title:response.result.parameters.task_name,
          notes: response.result.parameters.task_notes,
          taskType: response.result.parameters.task_type,
          startTime: dt_start,
          endTime: dt_end,
          taskConfirm: response.result.parameters.task_status,
      }

        agentTask = task;
        console.log("you have reached the last intent of add");

        if(task.taskConfirm == "true"){
          task.taskConfirm = true;
          console.log("its true")
          console.log("Its true and added to FB")
          this.addtoDB(agentTask)
          }else{
        task.taskConfirm = false;
        console.log("its false")
        console.log("Its false and added to FB")
        this.addtoDB(agentTask);
        }
        
      }else{
              console.log('res');
              console.log('taskname');
              console.log(response);
              this.messages.push({
                avatar: "assets/icon/bot.jpg",
                from: 'bot',
                when: new Date(),
                text: response.result.fulfillment.speech,
              });
       }
        console.log(this.showButton);
        this.scrollToBottom();
        this.isLoading = false;
        
       
      })
      .catch(error => {
        /* do something here too */
        console.log('error');
        console.log(error);
      });

    this.chatBox = '';
  }

  scrollToBottom() 
  {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 100);
  }

  logScrollStart()
  {
    console.log('logScrollStart');
    document.getElementById('chat-parent');
  
  }

  logScrolling(event)
  {
    console.log('event',event)
  }
  
  disableSomething()
  {
    console.log(this.showButton);
    if(this.showButton === true){
      this.disable();
      this.showButton = false;
      console.log(this.showButton);

    }
  }

    disable()
   {
      this.showButton = false;
      this.hiddenButton = true;
      this.messages.push({
        avatar: "assets/icon/bot.jpg",
        from: 'bot',
        when: new Date(),
        text: "Closing Form....",
      });
      this.showButton = false;
    }

    addTask(){
      let tasks = { };
      let data = this.event;
     
      this.firebaseService.createTask(data)
        .then(
          res=>{
            console.log('This part worked_1');
            console.log('This part worked_2');
            this.taskN = "";
          
            this.messages.push({
              avatar: "assets/icon/bot.jpg",
              from: 'bot',
              when: new Date(),
              text: "Task Added",
             
            });
            console.log(res);

          }
        )
    }
    objectKeys(obj) {
      return Object.keys(obj);
  }
    showTask(){
     this.sendMessage("view task today")
  }
    addtoDB (data){
      this.firebaseService.createTask(data)
      .then(
        res=>{
          console.log('Agent----->FB');
          console.log('This part worked_2');
          this.taskN = "";
          console.log(res);

        }
      )
    }
    try(){
      console.log("clicked")
    }




 
}



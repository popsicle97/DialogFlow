import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FirebaseService } from './../services/firebase.service';
import { Router, RouterEvent } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  //userForm : FormGroup;
  username_input : any;
  useremail_input : any;
  empty : boolean = true;
  validated : boolean = false;
  username : any ;  
  users : any = [];
  submitted = false;
  database_emails : any = [];
  exist : boolean = false;
  emailRegx: any;

  constructor(public alertController: AlertController,private storage : Storage,    public firebaseService: FirebaseService ,private router : Router  )
  {
    

  }




  ngOnInit() {

/*    this.userForm = this.formBuilder.group({
    username: new FormControl(), 
 		email: new FormControl(),

    });
*/
  

    this.storage.get('user').then((val) => {
      this.firebaseService.getUser().subscribe(result => {
        this.users = result.map( e => {
          return {
            id:e.payload.doc.id,
            username : e.payload.doc.data()['name'],
            email : e.payload.doc.data()['email']
          };
        })
        console.log("DATABASE")
        console.log(this.users)
        console.log(val)
          if(val == null){
            console.log("Not registered")
          }else{
            for(let user of this.users ){
              this.database_emails.push(user.email)
            if(val.id == user.id){
              console.log("exist")
              console.log(val.email)
             // this.router.navigate(['/home'])

            }else{
              console.log("You are not registered in the database. Please provide username and email")
             }
           }
          }
        

      }
      )  
   
    });

   
  }
/*  ionViewDidLoad() {
    this.emailRegx = this.validator.emailRegx;
    this.userForm = this.formBuilder.group({
          email: ['', Validators.compose([Validators.required, this.validator.emailValidator.bind(this)])],
             });  

  get f() { return this.userForm.controls; }

*/
async presentAlert() {
  let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  const alert = await this.alertController.create({
    header: 'Sync Account',
    message: 'Please provide email to sync existing account....',
    inputs : [{name: 'email',placeholder:'email'}],
    buttons: [{text: "OK",  handler: data => {
      console.log(JSON.stringify(data)); //to see the object
      console.log(data.email);
      console.log(regexp.test(data.email));
  }}]
  });

  await alert.present();
}
syncAcc(){
  this.presentAlert()
  console.log("Syncing account")
  
}
  getName(username,email){
   // this.submitted = true;
   var randomId = Math.random().toString(36).slice(-5);

   console.log(username)
    console.log(email)
   //var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
   this.validated = regexp.test(email);
    console.log(this.validated)
    if(this.validated == true){
        console.log("Correct email") 
    }else{
        console.log("False email")
    }
    if(username == ""){
      this.empty = true;
      console.log("username is empty")
    }else{
      this.empty = false;
      console.log("username is not empty")
    }
    for(let emails of this.database_emails){
      console.log("EMAILS")
      console.log(emails)
      if(email == emails){
        this.exist = true;
        console.log("Email already exist")

      }else{
        this.exist = false;
      }
    }
    if(this.validated == true && this.empty == false && this.exist == false){
      
      let data = {name : username,email : email, id:randomId}
      console.log("DATA TAKEN")
      console.log(data)
      this.storage.set('user', data)
    this.firebaseService.addUser(data,randomId).then(res =>{
      this.router.navigate(['/home'])

    }

    )
  }
    /*let data = {
        name : value.username,
        email : value.email,
      }*/
     /* if (this.userForm.invalid) {
        return;
    }*/

   // this.storage.set('user',data);
    //this.firebaseService.addUser(data.name,randomId)
   
    //this.firebaseService.addUser(name,randomId)
    console.log(name)
     // Or to get a key/value pair
 
  }

}

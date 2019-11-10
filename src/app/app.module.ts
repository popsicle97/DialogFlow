import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule,FirestoreSettingsToken} from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { NotificationsComponent } from './notifications/notifications.component';
import { ModalComponent } from './modal/modal.component';  // <-- don't forget to import the AddEventModule class
import { NgCalendarModule } from 'ionic2-calendar';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';


@NgModule({
  declarations: [AppComponent,NotificationsComponent,ModalComponent],
  entryComponents: [NotificationsComponent,ModalComponent],
  imports: [BrowserModule, IonicModule.forRoot(), 
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgCalendarModule ,
    HttpClientModule,
  ],
  exports: [

  ],
  providers: [
    BackgroundMode,
    StatusBar,
    SplashScreen,
    SpeechRecognition,

    LocalNotifications ,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: FirestoreSettingsToken,useValue:{}}

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

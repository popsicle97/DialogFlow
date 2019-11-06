import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgCalendarModule  } from 'ionic2-calendar';

import { IonicModule } from '@ionic/angular';

import { ModalComponent } from './modal.component';

const routes: Routes = [
  {
    path: '',
    component: ModalComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgCalendarModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)],
    schemas:[
      NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA
    ],
  declarations: [ModalComponent ],
  exports: [
    ModalComponent
  ]
})

export class ModalComponentModule {}

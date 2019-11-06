import { Component } from '@angular/core';
export interface Message {
    
    avatar: any;
    from: 'bot' | 'user';
    when: Date;
    text: any  ;
  


  }

export interface BotMessage {
  avatar: any;
  from: 'bot' | 'user';
  when: Date;
  text: string;

}
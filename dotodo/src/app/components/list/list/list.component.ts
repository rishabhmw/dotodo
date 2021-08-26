import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Constants } from 'src/app/constants';
import { Item } from 'src/app/item';
import { LocalstoreService } from 'src/app/services/localstore.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  todos: Map<string, Item>;
  doneItems: Map<string, Item>;
  private localstoreService: LocalstoreService;
  
  constructor(service: LocalstoreService) {
    this.localstoreService = service;
    this.todos = this.localstoreService.getKey(Constants.LOCAL_STORAGE_PENDING_KEY, true) as (Map<string, Item> | null)
     || new Map<string, Item>();
    this.doneItems = this.localstoreService.getKey(Constants.LOCAL_STORAGE_DONE_KEY, true) as (Map<string, Item> | null)
     || new Map<string, Item>();
  }

  addToDo(event: any) {
    console.log(event.target.dueby.value);
    let newItem: Item = new Item(
      event.target.task.value,
      event.target.dueby.value
    );
    let key: number = this.localstoreService.addItem(newItem);
    console.log(key);
    if (key >= 0) {
      this.todos.set(key.toString(), newItem);
      event.target.task.value = "";
      event.target.dueby.value = "";
    } else {
      // throw error
    }
  }

  markDone(key: string) {
    let doneDate: string = moment().format('MMMM Do YYYY, h:mm:ss a');
    if (this.localstoreService.markPendingDone(key, doneDate)) {
      let item: Item | undefined = this.todos.get(key);
      if (item) {
        item.dueby = doneDate;
        this.doneItems.set(key, item);
        this.todos.delete(key);
      }
    } else {
      // throw error
    }
  }

}

import { Constants } from '../constants';
import { Injectable } from '@angular/core';
import { Item } from '../item';

@Injectable({
  providedIn: 'root'
})
export class LocalstoreService {
  private localstorage: Storage;
  private lastKey: number;
  
  constructor() { 
    this.localstorage = window.localStorage;
    let keyInStore: string | null = this.getKey(Constants.LOCAL_STORAGE_LAST_KEY) as (string | null);
    if (keyInStore) {
      this.lastKey = parseInt(keyInStore);
    } else {
      this.lastKey = -1;
    }
  }

  getKey(key: string, parseToMap: boolean = false): Map<string, Item> | string | null {
    if (this.isLocalStorageAvailable()) {
      let data: string | null = this.localstorage.getItem(key);
      if (data) {
        if (parseToMap) return new Map(JSON.parse(data))
        return JSON.parse(data)
      }
    }
    return null;
  }

  saveKey(key: string, value: Map<string, Item> | number | string): boolean {
    if (this.isLocalStorageAvailable()) {
      console.log(value);
      if (value instanceof Map) {
        value = JSON.stringify(Array.from(value.entries()));
      }
      else {
        value = JSON.stringify(value);
      }
      this.localstorage.setItem(
        key,
        value
      );
      return true;
    }
    return false;
  }

  markPendingDone(key: string, doneDate: string): boolean {
    if (this.isLocalStorageAvailable()) {
      let pending: Map<string, Item> | null = this.getKey(Constants.LOCAL_STORAGE_PENDING_KEY, true) as (Map<string, Item> | null);
      let done: Map<string, Item> = this.getKey(Constants.LOCAL_STORAGE_DONE_KEY, true) as (Map<string, Item> | null) 
        || new Map<string, Item>();
      if (pending) {
        if (pending!.get(key)) {
          let doneItem: Item = pending!.get(key) as Item;
          doneItem.dueby = doneDate;
          done.set(key, doneItem);
          pending.delete(key);
          if(!this.saveKey(Constants.LOCAL_STORAGE_DONE_KEY, done)
            || !this.saveKey(Constants.LOCAL_STORAGE_PENDING_KEY, pending)) {
              return false;
            }
          return true;
        }
      }
    }
    return false;
  }

  addItem(item: Item): number {
    let key = this.lastKey+1;
    let data: Map<string, Item> | null = this.getKey(Constants.LOCAL_STORAGE_PENDING_KEY, true) as (Map<string, Item> | null);
    if (!data) data = new Map<string, Item>();
    data.set(key.toString(), item);
    console.log(data);
    if(this.saveKey(Constants.LOCAL_STORAGE_PENDING_KEY, data)
        && this.saveKey(Constants.LOCAL_STORAGE_LAST_KEY, key)) {
      this.lastKey++;
      return key;
    }
    return -1;
  }

  private isLocalStorageAvailable(): boolean {
    if (!this.localstorage) return false;

    try {
      let x: string = '__storage_test__';
      this.localstorage.setItem(x, x);
      this.localstorage.removeItem(x);
      return true;
    }
    catch(e) {
      return false;
    }
  }

  

}
